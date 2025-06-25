import { defineEventHandler, getQuery, createError } from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs';
import { promises } from 'node:fs';
import path from 'node:path';
import matter from 'file:///Users/drew/Documents/_work/WakeUpNPC2/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js';

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
