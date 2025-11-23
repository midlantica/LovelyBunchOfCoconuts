# Posts Guide

Posts are flexible, prose-styled content pieces for longer-form text, lists, compilations, or essays that don't fit the strict quote format.

## Structure

```markdown
---
title: 'Your Post Title'
---

## Header H1 Your main heading here

Body content with multiple paragraphs, lists, or any markdown content.

More paragraphs as needed...
```

## Rules

- **Title**: Required in frontmatter - used for SEO and as H1 in modal
- **First H2 (`##`)**: Becomes the preview header shown on wall panels
- **Body**: Full markdown support with Tailwind prose styling in modals
- **Filenames**: Lowercase, hyphen-separated (e.g., `mainstream-media-hoaxes.md`)
- **Prefix with `_`** to exclude from build

## Display Behavior

### Wall Panels

- Two-column layout on desktop (like quotes)
- Single column on mobile
- Navy background (`#101625`) with cyan header (`#68D2FF`)
- Content truncated with ellipsis if too long
- Click to open full modal

### Modals

- Full content display with scrolling
- Prose styling for readable typography
- Like button and close button
- Responsive sizing (desktop/tablet/mobile)

## Adding a Post

1. Create a new `.md` file in `content/posts/`
2. Add frontmatter with `title`
3. Add H2 heading for panel preview
4. Write your content using markdown
5. Save and the post will appear in the wall pattern

## Pattern Integration

Posts appear in the wall pattern similar to quotes (single column items). They alternate with quotes in the pattern:

```
[ grift | grift ] → [ quote/post ] → [ meme | meme ] → [ quote/post ]
```

## See Also

- Root `content/_ReadMe.md` (content type summary)
- Quotes: `../quotes/ReadMe.md`
- Grifts: `../grifts/__readme.md`
- Memes: `../memes/_ReadMe.md`
