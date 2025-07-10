# Memes

This folder contains markdown files for memes displayed on the site.

## How to Add a Meme

1. Place your image in `public/memes/` or a subfolder (PNG or JPG recommended).
2. Create a `.md` file in this folder with the same name as your image (but with `.md` extension).

**Frontmatter and structure:**

```
---
title: "Short Meme Title"
---

![alt text](/memes/subfolder/your-meme.png)

Optional caption or description.
```

- The `title` should be a short, descriptive name for the meme.
- The image path in the markdown must match the location in `public/memes/*/*.{png|jpg}`.
- You can add an optional caption or description below the image.
