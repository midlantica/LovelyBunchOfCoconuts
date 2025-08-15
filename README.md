# WakeUpNPC2

A Nuxt 3 content wall that renders three content types (Claims, Quotes, Memes) in a strict repeating visual pattern.

```
Pattern (core Wall Pattern):
[ claim | claim ] → [ quote ] → [ meme | meme ] → [ quote ] → (repeat)
```

Only the layout item types produced by the Pattern Engine are rendered:

- `claimPair` (two claims side‑by‑side)
- `quote` (full width)
- `memeRow` (two memes side‑by‑side)

The pattern must not break, even when available content is unbalanced. Fallback logic substitutes remaining types while preserving rhythm.

---

## 1. Quick Start

```
pnpm install
pnpm dev
# Visit http://localhost:3000
```

Optional (first time / when adding memes):

```
pnpm process-images --dry-run      # Preview image + markdown actions (all subdirs)
pnpm process-images npc            # Real run for a single meme subfolder
```

---

## 2. Content Types

| Type  | Location Folder                             | Minimal Frontmatter                      | Body Usage                                                  |
| ----- | ------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Claim | `content/claims/`                           | `title`, `claim`, `translation`          | Optional explanatory paragraphs after `---`                 |
| Quote | `content/quotes/`                           | (optional `title`)                       | First H2 (`##`) = quote text; first paragraph = attribution |
| Meme  | `content/memes/` + image in `public/memes/` | `title` (auto-generated if using script) | Image markdown line + optional caption                      |

Files (Markdown) or folders beginning with `_` are ignored by Nuxt Content.

Naming rules:

- Lowercase, hyphen-separated (no spaces, avoid underscores)
- Descriptive but concise (≈ 3–8 words)
- Duplicate variants using underscores should be removed (keep the hyphen version)

---

## 3. Wall Pattern & Engine

Single source of layout truth: `app/composables/interleaveContent.js`.
Do not create alternate pattern functions. Output items may only be: `claimPair`, `quote`, `memeRow`.

Fallbacks: If one content type runs low, the engine substitutes from the remaining pools but preserves the alternating cadence (pair → quote → pair → quote ...).

Search results still use the same pattern (filtered pools feed into the same interleaving logic).

---

## 4. Search & Filters

- Search normalizes dashes/underscores to spaces.
- Filters (Claims / Quotes / Memes) cannot all be off; toggling logic enforces at least one active.
- ESC or clicking the masthead (while already on `/`) clears the in‑memory search term and removes `?q=` from the URL.
- The URL query `?q=` is read once on page load; live typing intentionally does not continuously update the URL.

---

## 5. Image & Markdown Pipeline (Memes)

Location: scripts in `scripts/` directory.

Key script: `pnpm process-images [subdir] [--dry-run] [--force]`.

Capabilities:

1. Pre-pass filename normalization (lowercase, hyphens, `.jpeg` → `.jpg`, remove trailing hashes / random long numbers).
2. Dry-run structured report sections:
   - LIST OF NEW IMAGES
   - IMAGE NAMES SANITIZED → jpg
   - IMAGES SCALED / COMPRESSED (dimensions + est change)
   - MATCHING PAIRED MARKDOWN FILES
3. Optional resizing (target long side 800px, max width 1080px) + conversion to JPEG + profile stripping.
4. Auto-create paired markdown for images lacking one (title/alt/caption heuristics: acronym uppercasing, standalone `i` → `I`, `maybe`/`should` leading adds `?`).
5. Manifest `_meme-manifest.json` updated with hash, dimensions, action.
6. Orphan markdown (no existing image reference) moved to `_orphaned` on real runs.

Safety & workflow:

```
pnpm process-images npc --dry-run   # Inspect actions
pnpm process-images npc             # Apply
git diff                            # Review changes
```

Do not manually rename generated meme markdown; re-run the pipeline if source image changes.

---

## 6. Directory Overview

```
app/
   components/ (layout, wall panels, search bar, modals, UI)
   composables/ (pattern, cache, infinite scroll, wall seed, social/meta)
content/
   claims/  (claim markdown)
   quotes/  (quote markdown)
   memes/   (meme markdown)
public/memes/ (meme image assets, processed)
scripts/   (image + markdown automation, audit utilities)
```

Important composables actually present:
`interleaveContent.js`, `useContentCache.js`, `useContentUrls.js`, `useInfiniteScroll.js`, `useLazyImages.js`, `useShareImageGenerator.js`, `useShareShelf.ts`, `useSocialMeta.js`, `useWallSeed.js`.

---

## 7. Conventions & Anti‑Patterns

Do:

- Keep one Pattern Engine (`interleaveContent.js`).
- Use hyphenated lowercase filenames.
- Add content via proper folders; prefix experimental or ignored items with `_`.
- Use dry-run before running image processing.

Avoid:

1. Creating additional interleaving utilities.
2. Emitting raw `claim` or `meme` item types in templates (must be `claimPair` / `memeRow`).
3. Mixing underscore & hyphen variants of the same slug (clean up duplicates).
4. Overwriting auto-generated meme markdown manually (regenerate instead).

---

## 8. Scripts Cheat Sheet

```
pnpm dev                 # Start dev server
pnpm process-images      # Process all meme subfolders
pnpm process-images npc  # Process single subfolder
pnpm process-images npc --dry-run  # Safe preview
pnpm format              # Prettier formatting (if configured)
```

Additional (custom) scripts may exist in `scripts/` (retrofix, audits).

---

## 9. Search / URL Behavior Recap

- `?q=` accepted on first load to seed search.
- Clearing search removes `?q=` (ESC, clear button, or masthead click on root).
- No live URL updates while typing (explicit design choice).

---

## 10. Contribution Guidelines

1. Run a dry-run before committing pipeline changes.
2. Keep documentation in sync (update root README if patterns or scripts change).
3. Prefer small focused PRs.
4. Ensure pattern integrity—never ship a change that breaks layout rhythm.

---

## 11. License / Attribution

Copyright © 2025. All rights reserved (add a LICENSE file if distribution changes).

---

## 12. Appendix: Claim / Quote / Meme Minimal Examples

### Claim

```
---
title: "Living wage"
claim: "Living wage"
translation: "Mandated higher base wage"
---

Optional explanatory paragraph.
```

### Quote

```
---
# (frontmatter optional)
---
## “Government is best which governs least.”
Henry David Thoreau
```

### Meme

```
---
title: "Maybe I am an NPC?"
---
![Maybe I am an NPC?](/memes/npc/maybe-i-am-an-npc.jpg)

Optional caption.
```

---

For implementation details see `.github/copilot-instructions.md` (AI / automation guidance).
