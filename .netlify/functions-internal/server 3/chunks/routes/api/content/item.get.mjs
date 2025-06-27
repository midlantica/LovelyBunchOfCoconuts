import { d as defineEventHandler, g as getQuery, c as createError } from '../../../nitro/nitro.mjs';
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

const item_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const contentPath = query.path;
    if (!contentPath) {
      return createError({
        statusCode: 400,
        message: "Path parameter is required"
      });
    }
    const normalizedPath = contentPath.startsWith("/") ? contentPath.substring(1) : contentPath;
    const filePath = path.join(process.cwd(), "content", `${normalizedPath}.md`);
    try {
      await promises.access(filePath);
      const content = await promises.readFile(filePath, "utf-8");
      const { data, content: bodyContent } = matter(content);
      const lines = bodyContent.split("\n");
      const headings = lines.filter((line) => line.startsWith("##") || line.startsWith("# ")).map((line) => line.replace(/^#+\\s+/, "").replace(/"/g, "").trim());
      let claim = data.claim || "";
      let translation = data.translation || "";
      let quoteText = "";
      let attribution = "";
      if (normalizedPath.startsWith("quotes/") && headings.length > 0) {
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
      if (!image && normalizedPath.startsWith("memes/")) {
        const imgMatch = bodyContent.match(/!\\[.*?\\]\\((.*?)\\)/);
        if (imgMatch && imgMatch[1]) {
          image = imgMatch[1];
        }
      }
      return {
        _path: `/${normalizedPath}`,
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
      console.error(`Error reading file ${filePath}:`, error);
      return createError({
        statusCode: 404,
        message: `Content not found: ${contentPath}`
      });
    }
  } catch (error) {
    console.error("Error fetching content item:", error);
    return createError({
      statusCode: 500,
      message: "Error fetching content item"
    });
  }
});

export { item_get as default };
//# sourceMappingURL=item.get.mjs.map
