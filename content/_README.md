title: 'Example Title'
# Content Overview

Folders here map directly to the three content types rendered on the wall:

- `claims/` – Claim markdown (frontmatter: `title`, `claim`, `translation`)
- `quotes/` – Quote markdown (H2 line = quote, next line = attribution)
- `memes/` – Meme markdown (paired with an image in `public/memes/`)

Files or folders beginning with `_` are ignored.

## Format
All items are Markdown with optional YAML frontmatter delimited by `---`.

Minimal examples are in the root `README.md` (see section: Appendix). Use that as the authoritative template.

## Naming
- Lowercase, hyphen-delimited filenames
- Avoid underscore variants; remove duplicates gradually
- Keep names concise and descriptive

## Adding Items
1. Claims: create a file in `claims/` with required frontmatter.
2. Quotes: copy the quote template, one quote per file.
3. Memes: add image to `public/memes/<subdir>/`, run `pnpm process-images <subdir> --dry-run`, then run without `--dry-run`.

## Automation Notes
The image processing script can auto-generate meme markdown with a title / alt / caption heuristic. Orphan meme markdown (no image) is moved into `_orphaned` during real runs.

## See Also
- Root `README.md` (pattern, pipeline, examples)
- `content/claims/_ReadMe.md`
- `content/memes/_ReadMe.md`
- `content/quotes/_ReadMe.md`
