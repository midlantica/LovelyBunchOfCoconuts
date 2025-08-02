# Scripts Directory

This directory contains utility scripts for managing content and images in the WakeUpNPC2 project.

## Image Processing Scripts

### Main Image Processing System

The primary image processing is handled by two main scripts:

#### `imageProcessing.js`

Core image processing library that handles:

- **JPEG Conversion**: Converts PNG/other formats to progressive JPEG with 85% quality
- **Image Optimization**: Resizes images (upscales small images to 600px, downscales large images to max 1080px)
- **File Naming**: Sanitizes filenames to be URL-friendly
- **Markdown Integration**: Only processes images that don't already have markdown pairs
- **Quality Control**: Uses ImageMagick for professional-grade image processing

#### `run-image-processing.js`

Command-line interface for the image processing system:

```bash
# Process all meme subdirectories
node scripts/run-image-processing.js

# Process a specific subdirectory
node scripts/run-image-processing.js capitalism
```

**Features:**

- Automatically converts images to optimized progressive JPEGs
- Maintains aspect ratios while ensuring consistent sizing
- Creates markdown files for newly processed images
- Tracks processing with extended attributes (macOS)
- Provides detailed processing summaries

## Content Organization Scripts

### File Naming Standardization

#### `rename-content-files.js`

Standardizes all content filenames to use consistent dash-separated naming:

- **Converts underscores to dashes**: `file_name.md` → `file-name.md`
- **Ensures lowercase**: `File_Name.md` → `file-name.md`
- **Removes special characters**: Keeps only letters, numbers, and dashes
- **Updates paired images**: Renames corresponding image files automatically
- **Prevents conflicts**: Adds counters if filename conflicts exist

```bash
# Rename all content files to use dash format
pnpm run rename-content-files
```

**Features:**

- Recursively processes all content directories
- Maintains markdown-image file relationships
- Shows preview before making changes
- Provides detailed progress reporting
- Safe conflict resolution with numbered suffixes

### Quote Organization

#### `organize_quotes.js`

Organizes quote files into thematic categories:

- **Categories**: liberty, economics, government, socialism, tyranny, constitution, wisdom
- **Smart Classification**: Uses keyword matching on content and filenames
- **Auto-categorization**: Moves quotes into appropriate subdirectories

```bash
node scripts/organize_quotes.js
```

#### `organize_quotes_by_author.js`

Organizes quotes by specific authors:

- **Target Authors**: Thomas Sowell, Milton Friedman, Margaret Thatcher, Ronald Reagan, Friedrich Hayek
- **Author Detection**: Extracts author names from quote content
- **Folder Structure**: Creates author-specific directories

```bash
node scripts/organize_quotes_by_author.js
```

## Utilities Directory

The `utils/` subdirectory contains helper modules used by the main scripts.

## How the Image Processing Works

1. **Detection**: Scans for images without corresponding markdown files
2. **Optimization**:
   - Small images (< 400px): Upscaled to 600px using Lanczos filter
   - Large images (> 1080px): Downscaled to max 1080px
   - Medium images: Quality optimized without resizing
3. **Conversion**: All images converted to progressive JPEG format (85% quality)
4. **Markdown Creation**: Generates corresponding .md files for new images
5. **Tracking**: Uses macOS extended attributes to prevent reprocessing

## Notes

- **JPEG Conversion**: The old separate JPEG conversion scripts have been consolidated into the main image processing system
- **Progressive JPEGs**: All images are converted to progressive JPEG format for better web performance
- **Markdown Pairing**: Images with existing markdown files are automatically skipped
- **Quality Preservation**: Uses professional ImageMagick filters for high-quality results
- **Batch Processing**: Can process entire directory trees efficiently

## Legacy

Previous individual scripts for JPEG conversion, compression testing, and title fixing have been consolidated into the unified image processing system for better maintainability and consistency.
