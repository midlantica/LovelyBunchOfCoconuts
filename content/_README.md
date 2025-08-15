# Content Overview (Unified)

This directory houses all wall content: Claims, Quotes, Memes. The wall renders them using a strict repeating visual pattern:

```
[ claim | claim ] → [ quote ] → [ meme | meme ] → [ quote ] → (repeat)
```

Layout item types produced by the pattern engine (`app/composables/interleaveContent.js`):

- `claimPair` (two claims)
- `quote` (single quote)
- `memeRow` (two memes)

Files or folders starting with `_` are ignored by the content loader.

## 1. Type Summaries

| Type  | Folder                | Frontmatter (min)               | Body Rules                                       |
| ----- | --------------------- | ------------------------------- | ------------------------------------------------ |
| Claim | `claims/`             | `title`, `claim`, `translation` | Optional explanatory text after frontmatter      |
| Quote | `quotes/`             | (optional `title`)              | First `##` line = quote; next line = attribution |
| Meme  | `memes/` + image file | `title` (auto if scripted)      | Image markdown + optional caption                |

## 2. Naming Rules

- Lowercase, hyphen-separated (no spaces / avoid underscores)
- Remove underscore duplicates when found
- Concise (≈ 3–8 words) and descriptive

## 3. Minimal Examples

Claim:

```
---
title: "Living wage"
claim: "Living wage"
translation: "Mandated higher base wage"
---

Optional details.
```

Quote:

```
---
# frontmatter optional
---
## “Government is best which governs least.”
Henry David Thoreau
```

Meme:

```
---
title: "Maybe I am an NPC?"
---
![Maybe I am an NPC?](/memes/npc/maybe-i-am-an-npc.jpg)

Optional caption.
```

## 4. Adding Content

1. Claims: create file with required frontmatter; body optional.
2. Quotes: one quote per file; H2 then attribution.
3. Memes: add image to `public/memes/<subdir>/`, run:
   - `pnpm process-images <subdir> --dry-run` (preview)
   - `pnpm process-images <subdir>` (apply)

## 5. Meme Automation Pipeline (Summary)

Script: `pnpm process-images [subdir] [--dry-run] [--force]`
Steps:

1. Normalize filenames (`.jpeg`→`.jpg`, hyphens, lowercase).
2. Report (dry-run) sections: NEW IMAGES / SANITIZED / SCALED / MARKDOWN.
3. Resize/convert to JPEG (target long side 800px, max width 1080px).
4. Generate markdown for missing pairs (title/alt heuristic: acronyms to upper case, `i` → `I`, leading `maybe` or `should` adds `?`).
5. Update `_meme-manifest.json` (hash, size, action).
6. Move orphan markdown to `_orphaned/` (real run only).

## 6. Search & Filters (Behavior Reference)

- Normalizes dashes/underscores in queries.
- ESC or masthead click (on `/`) clears search & removes `?q=`.
- URL `?q=` read once at load; not updated on each keystroke.

## 7. Anti-Patterns

Avoid multiple pattern engines, raw `claim`/`meme` layout types, breaking pattern with leftovers, underscore/hyphen duplicates.

## 8. Cleanup & Maintenance

Run (to preview filename + markdown actions):

```
pnpm process-images --dry-run
```

Consider periodic duplicate slug audit (dash vs underscore) using the cleanup script (see `_SCRIPTS.md`).

## 9. Related Docs

- `claims/_ReadMe.md`
- `memes/_ReadMe.md`
- `quotes/_ReadMe.md`
- `.github/copilot-instructions.md` (developer/AI specifics)
