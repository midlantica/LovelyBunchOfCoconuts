# Share Image Generation Plan

Status: Draft (initial consolidation of design + implementation steps)
Last Updated: 2025-08-18
Owner: (you)

## Goal
Provide consistent, branded, high‑quality, cacheable social share images (PNG) for all content types (claim, quote, meme) with minimal client work and strong performance.

## Core Requirements
1. Unified server rendering (node/@napi-rs/canvas) for deterministic output.
2. Single abstraction for all types: quote | claim | meme.
3. Support aspect presets: square (1200x1200) default, wide (1200x630) via query (?ratio=wide).
4. Deterministic layout + adaptive font sizing (shrink-to-fit, ellipsis if necessary).
5. Common visual frame + brand bar.
6. Robust wrapping & line balancing; max lines per type.
7. Image letterboxing for memes with fallback gradient if missing.
8. Content hash for cache busting; long-lived HTTP caching.
9. Client composable returns canonical image URL (prefer server; fall back to client-side canvas only offline).
10. OG/Twitter meta tags integrate generated URL per page.
11. Graceful error fallback PNG.

## Design Tokens
| Token | Value |
|-------|-------|
| Canvas (square) | 1200 x 1200 |
| Canvas (wide) | 1200 x 630 |
| Outer frame bg | #020b17 |
| Inner gradient | #0f172a → #1e293b (top→bottom) |
| Primary text | #ffffff |
| Accent (attribution / translation / brand) | #68D2FF |
| Secondary text | #94a3b8 |
| Meme caption overlay | rgba(0,0,0,0.55) |

Safe content areas:
- Square: inset 60px (content box 1080x1080)
- Wide: inset 40px horizontally, 40px top/bottom (1120x550 approx)

## Typography & Sizing Logic
| Type | Primary Start | Min | Line Height | Max Lines (Square / Wide) |
|------|---------------|-----|-------------|---------------------------|
| Quote text | 54px italic | 36px | +10px over font size | 8 / 6 |
| Quote attribution | 32px | 24px | 40px | 1 |
| Claim main | 60px bold | 46px | +12px | 6 / 5 |
| Claim translation | 42px | 30px | +10px | 4 / 3 |
| Meme title/caption | 40px bold | 28px | +8px | 2 |
| Brand bar text | 28px | 24px | 34px | 1 |

Adaptive algorithm:
1. Start at configured size.
2. Wrap words greedily; if lines > max, reduce font size by step (2–4px) and retry.
3. If at min and still over limit, truncate last line with ellipsis.

## Server Architecture
```
server/utils/shareImage.ts
  ├─ generateShareImage({ type, payload, ratio }) => Buffer
  ├─ resolveDimensions(ratio)
  ├─ drawBackground(ctx, W, H)
  ├─ drawFrame(ctx)
  ├─ fitAndDrawText(ctx, text, config)
  ├─ drawQuoteTemplate(ctx, payload)
  ├─ drawClaimTemplate(ctx, payload)
  ├─ drawMemeTemplate(ctx, payload)
  └─ hashContent(payload) -> short hash

server/api/share/[type]/[slug].png.ts
  - Resolve content with #content/server
  - Build payload { text/quoteText, attribution, translation, imageUrl, title }
  - Determine ratio from query
  - Generate + set cache headers

(Optional) server/api/share/item/[slug].png.ts (auto-detect type)
```

## Caching Strategy
- In-memory LRU (size ~200) keyed: `${type}|${slug}|${ratio}|${version}|${hash}`
- HTTP headers: `Cache-Control: public, max-age=31536000, immutable` (hash ensures bust) or with SWR: `max-age=86400, stale-while-revalidate=604800`.
- Hash: first 8 chars of SHA1(JSON.stringify(core payload fields)).

## URL Pattern
```
/ api / share / quote / <attribution>-<quoteTextHash>.png?ratio=wide&v=1
/ api / share / claim / <claimHash>.png
/ api / share / meme / <memeSlug>.png
```
Where `<quoteTextHash>` etc. are short hashes; canonical slug for memes to keep readability.

## Client Composable (Planned)
`useShareImageUrl(item, { ratio?: 'square'|'wide' })`:
1. Derive type.
2. Build slug (existing logic / slugify).
3. Compute expected hash locally if needed (optional) or rely on server to redirect.
4. Return fully qualified URL.
5. Provide `prefetch()` method to warm browser cache.

Fallback: if fetch fails AND browser has Canvas, call legacy client `useShareImageGenerator` for immediate user copy action.

## Error Handling
- On generation exception: return fallback static PNG `/text-bg-1200x630.png` or minimal branded error image produced once at startup.
- Set `Cache-Control: no-store` for error responses.

## SEO / OG Integration
Update per content page head meta:
```
const shareUrl = useShareImageUrl(item, { ratio: 'wide' })
meta.push({ property: 'og:image', content: shareUrl })
```
Add width/height meta for determinism (1200/630 or 1200/1200).

## Incremental Implementation Plan
Phase 1 (A):
- Implement `shareImage.ts` with quote + claim + meme templates.
- Replace existing three endpoints by calling shared util (keep routes stable).

Phase 2 (B):
- Add auto-detect endpoint + content hash parameter & caching.
- Introduce LRU cache.

Phase 3 (C):
- Client composable + OG meta integration.
- Deprecate direct client canvas usage (retain fallback path).

Phase 4 (D):
- Add square variant & ratio param; finalize brand bar polish.
- Add tests (snapshot of PNG byte length + simple pixel probe for brand bar strip).

## Testing Outline
- Unit: fitAndDrawText (simulate width/height, assert lines, truncation).
- Integration: call each endpoint with fixture content -> expect 200, image/png, size within range, hash stable.
- Visual (optional): golden master PNG diff (tolerate minor differences).

## Open Questions
- Do we need localization or RTL support? (Not now.)
- Should memes include full text overlay if tall portrait? (Later enhancement.)
- Add watermark? (Optional toggle.)

## Changelog
- 2025-08-18: Initial consolidated plan written.

---
Edit this file as decisions evolve. Once Phase 1 starts, mark sections DONE and record any deviations.
