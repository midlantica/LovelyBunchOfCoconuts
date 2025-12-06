# Performance Quick Wins - Phase 1 Implementation

**Date**: December 5, 2025
**Status**: ✅ Implemented, Testing Pending

## Summary

Implemented critical performance optimizations to address site clunkiness and improve initial load times. These "quick wins" target the most impactful bottlenecks with minimal risk.

---

## Changes Implemented

### 1. ✅ Lazy Load Modal Components

**File**: `app/layouts/default.vue`

**Change**: Converted all modal imports from static to dynamic (lazy loading)

```javascript
// BEFORE: Static imports (loaded on every page load)
import ModalsModalMeme from '~/components/modals/ModalMeme.vue'
import ModalsModalGrift from '~/components/modals/ModalGrift.vue'
// ... etc

// AFTER: Dynamic imports (loaded only when modal is opened)
const ModalsModalMeme = defineAsyncComponent(
  () => import('~/components/modals/ModalMeme.vue')
)
const ModalsModalGrift = defineAsyncComponent(
  () => import('~/components/modals/ModalGrift.vue')
)
// ... etc
```

**Impact**:

- **Estimated savings**: ~80-100KB on initial bundle
- **User benefit**: Faster initial page load, modals load on-demand
- **Trade-off**: Slight delay on first modal open (acceptable)

---

### 2. ✅ Reduce Initial Virtualization Count

**File**: `app/components/wall/TheWall.vue`

**Changes**:

- Initial render: **70 items → 25 items** (64% reduction)
- Growth chunk size: **40 items → 30 items** (25% reduction)
- Scroll boost: **120 items → 80 items** (33% reduction)

```javascript
// BEFORE
const initial = 70
const chunk = 40
wallDisplayCount.value + 120

// AFTER
const initial = 25 // Reduced from 70
const chunk = 30 // Reduced from 40
wallDisplayCount.value + 80 // Reduced from 120
```

**Impact**:

- **Estimated savings**: 50-60% faster initial render
- **User benefit**: Page becomes interactive much faster
- **Trade-off**: More progressive loading as user scrolls (smooth)

---

### 3. ✅ Increase Search Debouncing

**File**: `app/components/searchbar/SearchBar.vue`

**Changes**:

- Search emit debounce: **250ms → 350ms** (40% increase)
- Added debouncing to suggestion generation: **200ms**

```javascript
// BEFORE
const debouncedEmitSearch = debounce((val) => {
  // ...
}, 250)

watch(inputText, (newVal) => {
  generateSuggestions(newVal) // No debouncing
})

// AFTER
const debouncedEmitSearch = debounce((val) => {
  // ...
}, 350) // Increased from 250ms

const debouncedGenerateSuggestions = debounce((val) => {
  generateSuggestions(val)
}, 200) // Added debouncing

watch(inputText, (newVal) => {
  debouncedGenerateSuggestions(newVal)
})
```

**Impact**:

- **Estimated savings**: 30-40% fewer re-renders during typing
- **User benefit**: Smoother typing experience, less CPU usage
- **Trade-off**: Slightly delayed search results (imperceptible)

---

### 4. ✅ Improved Code Splitting & SQLite Deferral

**File**: `nuxt.config.ts`

**Changes**:

- Split SQLite into separate lazy-loaded chunk
- Split Vue and Nuxt vendors into separate chunks
- Split modal components into separate chunk
- Externalized SQLite to prevent bundling

```javascript
// BEFORE
manualChunks(id) {
  if (id.includes('node_modules')) {
    return 'vendor'  // Everything in one chunk
  }
}

// AFTER
manualChunks(id) {
  if (id.includes('node_modules')) {
    // Defer SQLite loading
    if (id.includes('better-sqlite3') || id.includes('sqlite')) {
      return 'sqlite-lazy'
    }
    // Split large vendor libraries
    if (id.includes('vue') || id.includes('@vue')) {
      return 'vue-vendor'
    }
    if (id.includes('@nuxt')) {
      return 'nuxt-vendor'
    }
    return 'vendor'
  }
  // Split modal components
  if (id.includes('/components/modals/')) {
    return 'modals'
  }
}

// Also externalized SQLite
externals: {
  external: [
    // ... other externals
    'better-sqlite3',  // Added
  ],
}
```

**Impact**:

- **Estimated savings**: ~150-200KB on initial load (SQLite deferred)
- **User benefit**: Faster Speed Index, better caching granularity
- **Trade-off**: None (SQLite only needed for content queries)

---

## Expected Performance Improvements

### Bundle Size Reduction

| Chunk Type             | Before     | After          | Savings                 |
| ---------------------- | ---------- | -------------- | ----------------------- |
| Main bundle            | ~479KB     | ~300-350KB     | ~130-180KB              |
| Modals                 | Included   | Lazy loaded    | ~80-100KB               |
| SQLite                 | ~193KB     | Deferred       | ~193KB                  |
| **Total Initial Load** | **~672KB** | **~300-350KB** | **~320-370KB (48-55%)** |

### Performance Metrics (Estimated)

| Metric                | Before   | After    | Improvement       |
| --------------------- | -------- | -------- | ----------------- |
| **Initial Render**    | 70 items | 25 items | **64% faster**    |
| **Speed Index**       | 3.8s     | 2.5-2.8s | **26-34% faster** |
| **LCP**               | 3.6s     | 2.5-2.8s | **22-31% faster** |
| **TBT**               | 0ms      | 0ms      | Maintained        |
| **Performance Score** | 78-82    | 85-88    | **+7-10 points**  |

### User Experience Improvements

1. **Faster Initial Load**: Page becomes interactive 1-1.5s faster
2. **Smoother Scrolling**: Progressive loading feels more responsive
3. **Better Typing**: Search input doesn't lag during typing
4. **Smaller Downloads**: 48-55% less JavaScript on initial load

---

## Testing Checklist

### Before Deployment

- [x] Build completes without errors
- [ ] Check bundle sizes with `ls -lh .output/public/_nuxt/*.js | sort -rh | head -20`
- [ ] Test modal opening (should have slight delay on first open)
- [ ] Test search functionality (should feel smoother)
- [ ] Test wall scrolling (should load progressively)
- [ ] Verify no console errors
- [ ] Test on slow 3G connection

### After Deployment

- [ ] Run Lighthouse on production URL
- [ ] Verify Performance Score improvement (target: 85+)
- [ ] Check Speed Index (target: <2.8s)
- [ ] Check LCP (target: <2.8s)
- [ ] Verify modal lazy loading in Network tab
- [ ] Test user experience on mobile device

---

## Rollback Plan

If issues arise, revert these commits:

1. **Modal lazy loading**: Revert `app/layouts/default.vue` to static imports
2. **Virtualization**: Change initial count back to 70 in `app/components/wall/TheWall.vue`
3. **Debouncing**: Change debounce back to 250ms in `app/components/searchbar/SearchBar.vue`
4. **Code splitting**: Revert `nuxt.config.ts` manualChunks to simple vendor split

---

## Next Steps (Phase 2)

After verifying Phase 1 improvements:

1. **Memoize interleave computation** - Cache pattern results
2. **Optimize watchers** - Combine multiple watchers in TheWall.vue
3. **Progressive image loading** - Load images in viewport first
4. **Web Worker for interleaving** - Move heavy computation off main thread

---

## Notes

- All changes are backward compatible
- No breaking changes to user-facing features
- Performance improvements should be immediately noticeable
- Build time may increase slightly due to code splitting (acceptable trade-off)

---

## Verification Commands

```bash
# Build the project
pnpm build

# Check bundle sizes
ls -lh .output/public/_nuxt/*.js | awk '{print $5, $9}' | sort -rh | head -20

# Preview production build
pnpm preview

# Run Lighthouse (after deployment)
lighthouse https://wakeupnpc.com --view
```

---

**Status**: ✅ Implementation Complete
**Next Action**: Build, test, and deploy to verify improvements
