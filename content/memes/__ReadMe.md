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
---

![alt tag usually same as title?](/memes/path-to/meme-image-name.png)

Any caption or description of the meme can go here (optional).
```

## Example

```md
---
title: "cnn-npc-woke-dystopia"
---

![Meme](/memes/cnn-npc-woke-dystopia.png)

cnn-npc-woke-dystopia
```
