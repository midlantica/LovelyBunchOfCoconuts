# Memes: Quick Guide

Use this when adding or editing memes.

## How to add a meme

1. Place your image under `/public/memes/...` (safe names, no spaces).
2. Run the image processing script to generate the markdown:
   - In Terminal: pnpm process-images
   - Or for a specific folder: pnpm process-subdir <name>
3. Review the generated `.md` under this folder; tweak the title/description if needed.

## Tips

- Large images are fine; the script optimizes and creates markdown entries.
- Keep titles short; they’re used as descriptions.
- Filenames use dashes/underscores; avoid spaces.
- Anything starting with `_` is ignored.

## See also

- Main guide: ../ReadMe.md
- Claims guide: ../claims/ReadMe.md
- Quotes guide: ../quotes/ReadMe.md
