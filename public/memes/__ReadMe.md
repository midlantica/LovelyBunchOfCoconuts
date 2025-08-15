# Meme Images (Assets)

Place raw or new meme images in appropriate subfolders.

Recommended flow:
1. Add image(s) here.
2. Run dry-run to preview normalization & markdown generation:
	```
	pnpm process-images <subdir> --dry-run
	```
3. Run without `--dry-run` to apply.

Guidelines:
- Prefer `.jpg` (script will convert/normalize `.jpeg`).
- Use lowercase hyphenated descriptive names.
- Keep width ≤ 1080px target (script can resize / convert).

Do not manually create markdown if you plan to use the script; it will generate and keep titles consistent.

See root `README.md` (Image & Markdown Pipeline) and `content/memes/_ReadMe.md` for details.
