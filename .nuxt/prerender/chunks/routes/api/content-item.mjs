import { defineEventHandler, getQuery } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs';
import { promises } from 'node:fs';
import path from 'node:path';
import matter from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js';

const contentItem = defineEventHandler(async (event) => {
  const { type, slug } = getQuery(event);
  if (!type || !slug) {
    return { error: true, message: "Type and slug are required" };
  }
  try {
    const contentDir = path.join(process.cwd(), "content");
    const filePath = path.join(contentDir, type, `${slug}.md`);
    try {
      await promises.access(filePath);
    } catch (err) {
      return { error: true, message: "Content not found", status: 404 };
    }
    const content = await promises.readFile(filePath, "utf-8");
    const { data, content: bodyContent } = matter(content);
    const lines = bodyContent.split("\n");
    const headings = lines.filter((line) => line.startsWith("##") || line.startsWith("# ")).map((line) => line.replace(/^#+\s+/, "").replace(/"/g, "").trim());
    const relativePath = filePath.replace(process.cwd(), "").replace("/content", "").replace(".md", "");
    let claim = data.claim || "";
    let translation = data.translation || "";
    let quoteText = "";
    let attribution = "";
    if (type === "quotes" && headings.length > 0) {
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
    if (!image && type === "memes") {
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
    console.error("Error fetching content item:", error);
    return { error: true, message: error.message };
  }
});

export { contentItem as default };
//# sourceMappingURL=content-item.mjs.map
