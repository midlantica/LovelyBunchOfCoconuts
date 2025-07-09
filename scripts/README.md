# Meme Processing Scripts

This directory contains scripts to help manage meme images and their markdown files.

## Quick Start

To process a subdirectory of memes (e.g., thomas-sowell):

```bash
pnpm run process-subdir thomas-sowell
```

This will:

1. Rename all image files in public/memes/thomas-sowell/ to be server-friendly
2. Create matching markdown files in content/memes/ for each image

## Available Scripts

### 1. Process Subdirectory (`process-meme-subdirectory.js`)

Process all images in a subdirectory of public/memes/:

```bash
# Process a specific subdirectory
node scripts/process-meme-subdirectory.js thomas-sowell

# Force processing even for files that already have markdown files
node scripts/process-meme-subdirectory.js thomas-sowell --force
```

### 2. Rename Meme Images (`rename-meme-images.js`)

Renames image files to be server-friendly (lowercase, hyphens instead of spaces, no special characters):

```bash
# Process images in the default directory (public/memes)
node scripts/rename-meme-images.js

# Process images in a specific directory
node scripts/rename-meme-images.js /Users/drewtwo/Documents/_work/wake-up-npc/public/memes/thomas-sowell

# Force processing even for files that already have markdown files
node scripts/rename-meme-images.js /path/to/directory --force
```

### 3. Create Matching Markdown Files (`create-matching-markdown.js`)

Creates markdown files in content/memes/ for image files:

```bash
# Create markdown files for images in the default directory (public/memes)
node scripts/create-matching-markdown.js

# Create markdown files for images in a specific directory
node scripts/create-matching-markdown.js /Users/drewtwo/Documents/_work/wake-up-npc/public/memes/thomas-sowell

# Force update of existing markdown files
node scripts/create-matching-markdown.js /path/to/directory --force
```

## PNPM Commands

You can also use these pnpm commands:

```bash
# Rename meme images
pnpm run rename-memes

# Create matching markdown files
pnpm run create-markdown

# Process a subdirectory (both rename and create markdown files)
pnpm run process-subdir thomas-sowell
```

To pass arguments with pnpm commands, use the -- separator:

```bash
pnpm run rename-memes -- /path/to/your/folder --force
pnpm run create-markdown -- /path/to/your/folder --force
pnpm run process-subdir -- thomas-sowell --force
```

## How It Works

1. **Tracking**: The scripts check for existing markdown files to avoid reprocessing images
2. **Naming**: Files are renamed to be lowercase with hyphens instead of spaces
3. **Markdown**: Each image gets a corresponding .md file with title, alt text, and tags
4. **Logging**: Each script creates a detailed log file in the scripts directory

## Notes

- Files starting with "\_\_" are skipped
- The scripts won't overwrite existing markdown files unless --force is used
- Image paths in markdown files are correctly set based on the subdirectory structure
