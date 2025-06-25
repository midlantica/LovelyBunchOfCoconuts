import { d as defineEventHandler, g as getQuery } from '../../nitro/nitro.mjs';
import { promises } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';

async function readDir(dir) {
  const entries = await promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith("_")) {
          return [];
        }
        return readDir(fullPath);
      } else if (entry.name.endsWith(".md") && !entry.name.toLowerCase().includes("readme")) {
        return fullPath;
      } else {
        return [];
      }
    })
  );
  return files.flat();
}
async function parseMarkdownFile(filePath) {
  try {
    const content = await promises.readFile(filePath, "utf-8");
    const { data, content: bodyContent } = matter(content);
    const relativePath = filePath.replace(process.cwd(), "").replace("/content", "").replace(".md", "");
    const lines = bodyContent.split("\n");
    const headings = lines.filter((line) => line.startsWith("##") || line.startsWith("# ")).map((line) => line.replace(/^#+\s+/, "").replace(/"/g, "").trim());
    let claim = data.claim || "";
    let translation = data.translation || "";
    let quoteText = "";
    let attribution = "";
    if (relativePath.startsWith("/quotes/") && headings.length > 0) {
      quoteText = headings[0];
      const headingIndex = lines.findIndex(
        (line) => line.startsWith("##") || line.startsWith("# ")
      );
      if (headingIndex !== -1 && headingIndex + 1 < lines.length) {
        for (let i = headingIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.startsWith("#")) {
            attribution = line;
            break;
          }
        }
      }
    }
    let image = data.image || "";
    if (!image && relativePath.startsWith("/memes/")) {
      const imgMatch = bodyContent.match(/!\[.*?\]\((.*?)\)/);
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1];
      }
    }
    return {
      _path: relativePath,
      ...data,
      body: bodyContent,
      headings,
      claim,
      translation,
      quoteText,
      attribution,
      image
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}
const content = defineEventHandler(async (event) => {
  const { type = "all" } = getQuery(event);
  try {
    const contentDir = path.join(process.cwd(), "content");
    const dirsToRead = [];
    if (type === "all" || type === "claims") {
      dirsToRead.push(path.join(contentDir, "claims"));
    }
    if (type === "all" || type === "quotes") {
      dirsToRead.push(path.join(contentDir, "quotes"));
    }
    if (type === "all" || type === "memes") {
      dirsToRead.push(path.join(contentDir, "memes"));
    }
    const filePathsArrays = await Promise.all(dirsToRead.map((dir) => readDir(dir)));
    const filePaths = filePathsArrays.flat();
    const contentItems = await Promise.all(
      filePaths.map((filePath) => parseMarkdownFile(filePath))
    );
    const validItems = contentItems.filter(Boolean).sort((a, b) => a._path.localeCompare(b._path));
    return validItems;
  } catch (error) {
    console.error("Error fetching content:", error);
    return { error: true, message: error.message };
  }
});

export { content as default };
//# sourceMappingURL=content.mjs.map
