# Scripts Index

Central reference for maintenance & content pipeline scripts. Keep this succinct; implementation details live in code comments.

Location: Placed inside `scripts/` to keep script docs co-located with the code.

## Image & Meme Pipeline

- `run-image-processing.js`
  - CLI entrypoint that loads configuration & calls `imageProcessing.js`.
  - Supports dry run vs apply; orchestrates scanning `/public/memes` and creating markdown.
- `imageProcessing.js`
  - Core pipeline: discover images, normalize filenames, sanitize, scale/optimize, generate markdown via template, create manifest, report.
  - Structured dry-run sections: NEW IMAGES, SANITIZED, SCALED, MARKDOWN MAPPING.
- `utils/filename-sanitizer.js`
  - Normalizes: lowercase, trims, replaces spaces & invalid chars with hyphens, collapses repeats, strips trailing hash-y tokens while preserving meaningful years.
- `utils/create-matching-markdown.js`
  - Builds per-image markdown using heuristics: acronym uppercasing, smart capitalization, inferred question marks.
- `retrofix-npc-markdown.js`
  - Retroactively updates existing meme markdown (NPC set) to improved title/alt/caption heuristics.

## Content Maintenance

- `cleanup-duplicate-claim-slugs.js`
  - Detects dash vs underscore duplicate claim slugs; dry-run report; optional `--apply` moves duplicate losers into timestamped backup dir.
- `cleanup-orphaned-markdown.js`
  - Detects markdown without corresponding images (orphaned) and can relocate/report.

## Utility / Housekeeping

- `utils/*` Shared helpers used across image processing & maintenance tasks.

## Planned / Proposed

- Open Graph share image generator (canvas/SSR based) for claims/quotes/memes.
- `pnpm audit-images` alias (added) for a read-only integrity & naming audit (subset of imageProcessing dry-run).
- `docs/STYLE.md` (coding + content styling guidelines) centralizing naming, punctuation, front-matter conventions.

## Conventions

- Prefer DRY reporting: each script prints one structured summary per run.
- Dry-run first principle: destructive actions require explicit `--apply`.
- Backup instead of deletion when removing or consolidating content.

---

Update this index when adding new scripts.
