# WakeUpNPC2 - AI Coding Agent Instructions

## Project Overview

WakeUpNPC2 is a Nuxt 3 content wall (Claims, Quotes, Memes) rendered through a strict repeating pattern. Priority: **visual consistency over randomness**.

## Critical Architecture Patterns

### Content Wall Pattern System

**Core Pattern**: `[ claim | claim ] → [ quote ] → [ meme | meme ] → [ quote ]` (repeating)

- **Pattern Engine**: `composables/interleaveContent.js` (single source of truth)
- **Fallback Logic**: When content types are exhausted, gracefully substitutes alternatives while maintaining visual rhythm
- **Template Compatibility**: Only creates `claimPair`, `quote`, `memeRow` types (NOT individual `claim`/`meme` types)

```javascript
// Example: Template can only render these types
item.type === 'claimPair' // → 2-column ClaimPanel grid
item.type === 'quote' // → full-width QuotePanel
item.type === 'memeRow' // → 2-column MemePanel grid
```

### Content Loading & Caching

- Progressive: initial slice then infinite scroll via `useInfiniteScroll.js`.
- Cache: `useContentCache.js` centralizes load + transform + shuffle before patterning.
- Search: normalizes dashes / underscores.

### Content Ignore Configuration

- **File Exclusion**: Files/directories starting with underscores are automatically ignored
- **Nitro Configuration**: Uses `nitro.ignore` patterns for content exclusion
- **Pattern Matching**: `**/_*` and `**/__*` exclude single and multiple underscore prefixes

### Nuxt Content v3 Integration

- **Content Types**: `/content/{claims,quotes,memes}/` with `.md` files
- **Minimark Format**: Body content as AST arrays `[tag, attrs, content]`
- **Transformation Pipeline**: Raw content → filtered → transformed → shuffled → patterned

## Development Workflows

### Essential Commands

```bash
pnpm dev                    # Development server
pnpm process-images         # Process meme images & create markdown
pnpm process-subdir <name>  # Process specific meme subdirectory
pnpm format                 # Prettier formatting
```

### Content Processing Scripts

- **Meme Processing**: `scripts/` - Auto-generates markdown files from `/public/memes/` images
- **Image Optimization**: Server-friendly naming, automated content creation

## Project-Specific Conventions

### File Structure (Key Parts)

```
app/composables/
	interleaveContent.js   # Pattern engine (only one)
	useContentCache.js     # Load + transform + cache
	useInfiniteScroll.js   # Infinite scroll logic
	useWallSeed.js         # Seed for randomized ordering
	useLazyImages.js       # Progressive image loading
	useSocialMeta.js       # Social sharing meta
```

UI + layout components live under `app/components/` (search bar, wall panels, modals, header/footer).

### Content Type Transformations

- **Claims**: `item.meta.claim` → `transformed.claim`, `item.meta.translation` → `transformed.translation`
- **Quotes**: Extract headings from AST, first paragraph as attribution
- **Memes**: Extract image paths from markdown AST, title as description

### Critical Anti-Patterns to Avoid

1. Multiple pattern engines.
2. Emitting raw `claim` or `meme` item types in templates.
3. Breaking sequence with leftover singles.
4. Mixing underscore + hyphen slug variants instead of cleaning.

## Search & Filtering

- **Enhanced Search**: Searches titles with dash/underscore normalization
- **Real-time Filtering**: Reactive content type toggles (claims/quotes/memes)
- **Consistent Patterns**: Search results maintain same visual pattern

## SSR & State Management

- **SSR Hydration**: `useState()` for server/client state preservation
- **Reactive Cache**: Content loaded once, accessed via reactive cache
- **Infinite Scroll**: Lazy loading with visual fade-in animations

### Image Pipeline (Reference Only)

See root `README.md` section 5 for detailed workflow. Scripts perform filename normalization, dry-run reporting, optimization, markdown generation, and orphan handling.

## Debugging Pattern

- Console logs in `interleaveContent.js` trace pattern steps and fallbacks.
- Verify only `claimPair`, `quote`, `memeRow` instances reach the wall.

Key insight: **Visual consistency over randomness**—never break layout cadence.
