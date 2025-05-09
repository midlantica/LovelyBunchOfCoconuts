# Memes

This folder contains metadata for meme images displayed on the website.

## How to Add a New Meme

Adding a meme is a two-step process:

### Step 1: Upload the Image

1. Upload your image file to the `public/memes/` folder
2. Use a descriptive filename (e.g., `funny-cat-meme.png`)
3. Recommended image formats: PNG or JPG
4. Recommended image size: around 1080px wide

### Step 2: Create the Metadata File

1. Create a new file in this folder with a `.md` extension
2. Use the SAME filename as your image but with `.md` extension (e.g., `funny-cat-meme.md`)
3. Copy the template below and fill in your meme details

## Template

```md
---
title: "Short Title for the Meme"
image: "/memes/your-filename.png"
alt: "Brief description of what's in the image for accessibility"
date: "YYYY-MM-DD"
tags: ["relevant", "tags", "here"]
---

Any caption or description of the meme can go here (optional).
```

## Required Fields

- `title`: A short, descriptive title for the meme
- `image`: The path to your image file (must start with `/memes/`)
- `alt`: A brief description of the image for accessibility
- `date`: The date you're adding this meme (format: YYYY-MM-DD)

## Optional Fields

- `tags`: Keywords related to the meme (helps with searching)
- `source`: Where you found the meme (if applicable)

## Example

```md
---
title: "Confused Math Lady Meme"
image: "/memes/confused-math-lady.png"
alt: "Woman looking confused with mathematical equations floating around her head"
date: "2023-04-30"
tags: ["funny", "confusion", "math"]
---

When someone tries to explain cryptocurrency to me for the fifth time.
```
