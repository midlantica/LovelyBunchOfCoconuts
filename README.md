# WakeUpNPC2

[![Netlify Status](https://api.netlify.com/api/v1/badges/cbd5cc6d-699c-403c-bd9c-b81c372c06fd/deploy-status)](https://app.netlify.com/projects/wakeupnpc/deploys)

Nuxt 3 content wall (Claims · Quotes · Memes) rendered in a strict repeating pattern:

`[ claim | claim ] → [ quote ] → [ meme | meme ] → [ quote ] → (repeat)`

Authoritative docs have moved to reduce root clutter:

| Area                                            | Doc                               |
| ----------------------------------------------- | --------------------------------- |
| Content model, pattern engine, pipeline details | `content/_ReadMe.md`              |
| Maintenance & automation scripts                | `scripts/_SCRIPTS.md`             |
| AI / contributor automation guidance            | `.github/copilot-instructions.md` |

## Quick Start

```
pnpm install
pnpm dev
```

## Common Scripts

```
pnpm process-images --dry-run
pnpm process-images npc
```

## Where to Look

- Pattern logic: `app/composables/interleaveContent.js`
- Infinite scroll + cache: `app/composables/useContentCache.js`, `useInfiniteScroll.js`
- Meme pipeline: `scripts/run-image-processing.js`

## License

See `LICENSE`.

---

For full details open `content/_ReadMe.md`.
