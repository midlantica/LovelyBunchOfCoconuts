# Quotes Guide

Each file contains exactly one quote.

## Minimal Structure

```
---
# frontmatter optional
---
## “Government is best which governs least.”
Henry David Thoreau
```

Rules:

- H2 (`##`) line = quote text.
- First non-empty line after the H2 = attribution (author, source, etc.).
- Optional extra paragraphs may follow.

Filenames:

- Lowercase, hyphen-separated (e.g. `thomas-sowell.md`)
- Avoid underscore variants; prefer hyphens.
- Prefix with `_` to exclude from the build.

Frontmatter:

- Optional; you may add `title:` if needed for future metadata.

## Adding a Quote

1. Copy template from `templates/quote.md` or use the minimal example.
2. Save in this folder (or a subfolder like `liberty/`, `economics/`).
3. Keep one quote per file.

## See Also

- Root `README.md` (content type summary)
- Claims: `../claims/_ReadMe.md`
- Memes: `../memes/_ReadMe.md`
