# Scripts Directory

This directory contains utility scripts for managing content and images in the WakeUpNPC2 project.

## Image Processing Scripts

### Main Image Processing System

The system is driven by a single CLI entry and a shared scaler:

- `run-image-processing.js` — the unified CLI for audit and full processing

#### `imageProcessing.js`

Core image processing library that handles:

- Format conversion: Converts images to JPEG at 85% quality and strips profiles (no progressive requirement)
- Image sizing: Upscales small images to a target long side and downscales overly large images
- File naming: Sanitizes filenames to be URL-friendly
- Markdown integration: Only processes images that don't already have markdown pairs (unless forced)
- Quality control: Uses ImageMagick for professional-grade processing

Sizing policy:

- Fixed target long side: 800px. Files below this are upscaled.
- Maximum width: 1080px (downscale if wider).

#### `run-image-processing.js`

Command-line interface for the image processing system:

```bash
# Process all meme subdirectories (defaults to public/memes/*)
pnpm process-images

# Process a specific subdirectory (e.g., public/memes/capitalism)
pnpm process-images capitalism

# Run read-only audit of a subdirectory
pnpm process-images capitalism --audit

# Process a single subdirectory (fixed target: 800px long side)
pnpm process-images quotes
```

Flags:

- `--dry-run` Show what would happen without modifying files
- `--force` Reprocess even if marked optimized in manifest
- `--audit` Read-only inspection (dimensions, orientation, format, interlace, profiles)
- `--reload-browser` (macOS) Reload matching Chrome/Safari tabs after processing; combine with `--reload-match=substr` and `--browser=chrome|safari|all`
- `--open-created` Open newly created markdown files in VS Code after processing (aliases: `--open`, `--open-md`)

Tip: In global mode, all newly created markdown files across subfolders will be opened. In single-subdir mode, only that subfolder's new files are opened.

Auto workflow: pair with the watcher below to trigger processing and open files as they are created.

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

Key module:

- `utils/imageScaler.js`
  - `scaleImage(filePath, targetLongSide=800, dryRun=false)`
  - `scaleAllImagesInDir(dir, targetLongSide=800, dryRun=false)`
  - Prints per-file actions and a summary; used internally by the full pipeline.

## How the Image Processing Works

1. Detection: Scans for images and checks for existing markdown pairs
2. Sizing and optimization:

- Tiny images (even below 500px): Upscaled to reach 800px on the long side
- Below target (long side < 800px): Upscaled to 800px long side (Lanczos)
- Above max width (> 1080px): Downscaled so width <= 1080px
- Otherwise: Quality optimized without resizing

3. Conversion: Images converted to JPEG at ~85% quality and stripped of profiles
4. Markdown: Generates corresponding .md files for new images (no-op in scale-only)
5. Tracking: Uses a manifest and macOS extended attributes to avoid unnecessary work

## Notes

- Unified entry point: All scaling now goes through `run-image-processing.js` (no duplicate scaler scripts)
- No progressive requirement: We convert to standard JPEG and strip profiles; browsers progressively decode either way
- Markdown pairing: Images with existing markdown files are automatically skipped unless `--force`
- Batch friendly: Can process entire directory trees efficiently; dry-run first recommended

## Legacy

Previous individual scripts for JPEG conversion, compression testing, and title fixing have been consolidated into the unified image processing system for better maintainability and consistency.
