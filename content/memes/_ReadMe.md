# Memes Guide

Each meme consists of:
1. An image in `public/memes/<subdir>/`
2. A markdown file here (or in matching subfolder) with a `title` and image reference.

## Preferred Workflow (Automated)
1. Add image(s) to a subfolder under `public/memes/` (use descriptive, hyphen, lowercase names; `.jpg` preferred).
2. Preview actions:
	```
	pnpm process-images <subdir> --dry-run
	```
3. Apply:
	```
	pnpm process-images <subdir>
	```
4. Review changes (`git diff`) then commit.

The script will:
- Normalize filenames (lowercase, hyphens, `.jpeg` → `.jpg`).
- Optionally resize / convert to JPEG.
- Generate markdown (if missing) with heuristic title/alt/caption.
- Move orphan markdown (no image) into `_orphaned/`.

## Manual Structure (if needed)
```
---
title: "Concise Meme Title"
---
![Concise Meme Title](/memes/<subdir>/filename.jpg)

Optional caption.
```

Rules:
- `title` should reflect visible text or concept.
- Image path must match actual location.
- Optional caption goes after a blank line.

## Titles (Heuristic Notes)
Automation capitalizes acronyms (NPC, GDP, USA) and adjusts leading "i" → "I". Leading “maybe” / “should” may receive a trailing `?` if missing.

## Maintenance
- Remove unused images and associated markdown together.
- Keep subfolder names thematic (e.g. `npc/`, `economics/`).
- Avoid underscore filename variants.

See root `README.md` for full pipeline details.
