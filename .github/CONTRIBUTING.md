# Contributing to WakeUpNPC2

Thank you for your interest in contributing to this project! This guide will help you add new content to the site without requiring any coding knowledge.

## Types of Content

The site displays three types of content:

1. **Claims** - Translations of claims
2. **Quotes** - Notable quotes
3. **Memes** - Images with captions

## How to Add Content

### Step 1: Fork the Repository

1. Click the "Fork" button at the top right of the GitHub repository
2. This creates your own copy of the project

### Step 2: Add Your Content

#### Adding a Quote

1. Navigate to the `content/quotes/` folder
2. Click "Add file" > "Create new file"
3. Name your file with a descriptive name ending in `.md` (e.g., `inspiring-quote.md`)
4. Copy and paste the template below:

```md
---
title: "Quote Title"
author: "Author Name"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
---

The full text of the quote goes here.
```

5. Fill in your quote details and content

#### Adding a Claim Translation

1. Navigate to the `content/claims/` folder
2. Click "Add file" > "Create new file"
3. Name your file with a descriptive name ending in `.md` (e.g., `climate-claim.md`)
4. Copy and paste the template below:

```md
---
title: "Claim Title"
original: "Original claim text"
translation: "Translated claim text"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
---

Any additional context or notes about the claim can go here.
```

5. Fill in your claim details

#### Adding a Meme

1. First, upload your image:
   - Navigate to the `public/memes/` folder
   - Click "Add file" > "Upload files"
   - Select your image file (PNG or JPG recommended)
   - Use a descriptive filename (e.g., `funny-cat-meme.png`)

2. Then, create the meme metadata:
   - Navigate to the `content/memes/` folder
   - Click "Add file" > "Create new file"
   - Name your file with the SAME name as your image but with `.md` extension (e.g., `funny-cat-meme.md`)
   - Copy and paste the template below:

```md
---
title: "Meme Title"
image: "/memes/funny-cat-meme.png"
alt: "Brief description of the meme for accessibility"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
---

Any caption or description of the meme can go here.
```

3. Make sure to update the `image:` path to match your uploaded image filename

### Step 3: Submit Your Changes

1. Scroll down and click "Commit new file"
2. Navigate back to the main repository page
3. Click "Pull request"
4. Click "Create pull request"
5. Add a title and description explaining what you've added
6. Click "Create pull request"

## Content Guidelines

- Keep content appropriate and relevant
- Use descriptive filenames
- Include all required fields in the templates
- For images, use PNG or JPG format, ideally sized around 1080px wide

## Need Help?

If you have any questions or run into issues, please reach out to the repository owner.
