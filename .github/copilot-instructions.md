# WakeUpNPC2 - AI Coding Agent Instructions

## Project Overview

WakeUpNPC2 is a Nuxt 3 content wall displaying political claims, quotes, and memes in a strict visual pattern. The core challenge is maintaining **strict visual layout patterns** while handling **unbalanced content** and **randomization**.

## Critical Architecture Patterns

### Content Wall Pattern System

**Core Pattern**: `[ claim | claim ] → [ ---quote--- ] → [ meme | meme ] → [ ---quote--- ]` (repeating)

- **Pattern Engine**: `composables/interleaveContent.js` - single source of truth for layout
- **Fallback Logic**: When content types are exhausted, gracefully substitutes alternatives while maintaining visual rhythm
- **Template Compatibility**: Only creates `claimPair`, `quote`, `memeRow` types (NOT individual `claim`/`meme` types)

```javascript
// Example: Template can only render these types
item.type === 'claimPair' // → 2-column ClaimTranslationPanel grid
item.type === 'quote' // → full-width QuotePanel
item.type === 'memeRow' // → 2-column MemePanel grid
```

### Content Loading & Caching

- **Progressive Loading**: `loadInitialContent(20)` → `loadRemainingContent()` → infinite scroll
- **Content Cache**: `useContentCache.js` - reactive cache with transformation pipeline
- **Search Enhancement**: Converts dashes/underscores to spaces for filename matching

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

### File Structure Patterns

```
composables/
├── interleaveContent.js    # Core pattern logic (NEVER create multiple versions)
├── useContentCache.js      # Content loading/transformation
└── useContentFeed.js       # Layout state management

layouts/home.vue            # Main layout with SearchBar, infinite scroll
pages/index.vue             # Content wall rendering
components/                 # ClaimTranslationPanel, QuotePanel, MemePanel
```

### Content Type Transformations

- **Claims**: `item.meta.claim` → `transformed.claim`, `item.meta.translation` → `transformed.translation`
- **Quotes**: Extract headings from AST, first paragraph as attribution
- **Memes**: Extract image paths from markdown AST, title as description

### Critical Anti-Patterns to Avoid

1. **Multiple Interleaving Functions**: Always use single `composables/interleaveContent.js`
2. **Template Type Mismatches**: Never create `claim`/`meme` types - only `claimPair`/`memeRow`
3. **Pattern Breaking**: Don't dump remainder items individually - use fallback system
4. **Import Path Confusion**: Use `~/composables/interleaveContent` not `~/utils/`

## Search & Filtering

- **Enhanced Search**: Searches titles with dash/underscore normalization
- **Real-time Filtering**: Reactive content type toggles (claims/quotes/memes)
- **Consistent Patterns**: Search results maintain same visual pattern

## SSR & State Management

- **SSR Hydration**: `useState()` for server/client state preservation
- **Reactive Cache**: Content loaded once, accessed via reactive cache
- **Infinite Scroll**: Lazy loading with visual fade-in animations

## Debugging Patterns

- **Pattern Verification**: Console logs show pattern creation step-by-step
- **Content Counts**: Input/output item tracking for balance debugging
- **Fallback Tracking**: Logs when pattern adaptations occur

Key insight: This project prioritizes **visual consistency** over content randomness - the pattern must never break, even with unbalanced content distributions.
