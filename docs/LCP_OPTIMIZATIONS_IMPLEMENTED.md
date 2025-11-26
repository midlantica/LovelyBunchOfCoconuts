# LCP (Largest Contentful Paint) Optimizations Implemented

**Date:** November 25, 2025
**Target:** Reduce LCP from 5.5s to <2.5s
**Status:** Phase 1 Complete - Easy Wins Implemented

## Summary of Changes

I've implemented several critical optimizations to improve the Largest Contentful Paint (LCP) metric. These are "easy wins" that don't require major code refactoring but provide significant performance improvements.

---

## 1. Resource Hints & Preloading

### DNS Prefetch

Added DNS prefetch hints for external font resources to resolve DNS lookups early:

```typescript
{
  rel: 'dns-prefetch',
  href: 'https://fonts.googleapis.com',
},
{
  rel: 'dns-prefetch',
  href: 'https://fonts.gstatic.com',
}
```

**Impact:** Reduces DNS lookup time by ~50-100ms

### Preconnect

Maintained preconnect for critical font resources:

```typescript
{
  rel: 'preconnect',
  href: 'https://fonts.googleapis.com',
},
{
  rel: 'preconnect',
  href: 'https://fonts.gstatic.com',
  crossorigin: '',
}
```

**Impact:** Establishes early connections, saving ~200-300ms

### Critical Image Preloading with fetchpriority

Added high-priority preloading for LCP images:

```typescript
// Welcome modal image (likely LCP element)
{
  rel: 'preload',
  href: '/welcome-modal-image.svg',
  as: 'image',
  type: 'image/svg+xml',
  fetchpriority: 'high',
},
// Logo image
{
  rel: 'preload',
  href: '/WakeUpNPC-logo.svg',
  as: 'image',
  type: 'image/svg+xml',
  fetchpriority: 'high',
}
```

**Impact:** Prioritizes LCP image loading, potentially saving 500-1000ms

---

## 2. Font Loading Optimization

### Async Font Loading

Implemented the "media print" trick to load fonts asynchronously without blocking render:

```typescript
{
  rel: 'stylesheet',
  href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,300;0,500;1,100;1,300;1,500&display=swap',
  media: 'print',
  onload: "this.media='all'",
}
```

**How it works:**

1. Browser loads stylesheet with `media="print"` (non-blocking)
2. Once loaded, JavaScript changes media to `"all"` to apply styles
3. Font already includes `display=swap` for graceful fallback

**Impact:** Eliminates 648ms of render-blocking time from Google Fonts

### Noscript Fallback

Added fallback for users without JavaScript:

```typescript
noscript: [
  {
    children:
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,300;0,500;1,100;1,300;1,500&display=swap">',
  },
]
```

**Impact:** Ensures fonts load even without JavaScript

---

## 3. Existing Optimizations (Already in Place)

The following optimizations were already configured and remain active:

### Critical CSS Inlining

Inline critical styles prevent white flash and ensure instant rendering:

- Background colors (#020617)
- Text colors (#e2e8f0)
- Dark mode color scheme
- System font fallbacks
- Box-sizing reset
- Modal root positioning

### Compression

```typescript
compressPublicAssets: {
  gzip: true,
  brotli: true,
}
```

### Aggressive Caching

- Static assets: `max-age=31536000, immutable`
- Images: `max-age=31536000, immutable`
- HTML: `max-age=3600, must-revalidate`

### Build Optimizations

- Minification: `esbuild`
- Code splitting: Vendor chunks
- CSS code splitting: Enabled
- Target: `es2020` (modern browsers)
- Chunk size limit: 500KB

---

## Expected Impact

### Before Optimizations

- **LCP:** 5.5s
- **Render-blocking resources:** 648ms (Google Fonts)
- **Performance Score:** 66/100

### After Optimizations (Estimated)

- **LCP:** ~3.0-3.5s (improvement of 2.0-2.5s)
- **Render-blocking resources:** 0ms (eliminated)
- **Performance Score:** ~80-85/100

### Breakdown of Improvements

1. **Font async loading:** -648ms (render-blocking eliminated)
2. **DNS prefetch:** -50-100ms (early DNS resolution)
3. **Image preloading with fetchpriority:** -500-1000ms (LCP image priority)
4. **Preconnect:** -200-300ms (early connection establishment)

**Total estimated improvement:** 1.4-2.0 seconds

---

## Next Steps for Further LCP Optimization

To reach the target of <2.5s LCP, consider these additional optimizations:

### 1. Server Response Time Optimization

**Current:** 737ms → **Target:** <600ms

- Enable Netlify Edge Functions
- Implement edge caching
- Optimize initial data payload
- Consider static site generation (SSG) for homepage

### 2. Image Optimization

- Convert remaining images to WebP format
- Implement responsive images with `srcset`
- Add explicit `width` and `height` attributes to all images
- Consider using Nuxt Image module for automatic optimization

### 3. DOM Size Reduction

**Current:** 20,554 elements → **Target:** <2,000

- Optimize TheWall.vue virtualization
- Reduce render buffer size
- Implement DOM recycling
- Lazy load modal content

### 4. Critical Path CSS

- Extract and inline above-the-fold CSS
- Defer non-critical CSS
- Consider using Critters for automatic critical CSS extraction

### 5. JavaScript Optimization

- Implement more aggressive code splitting
- Lazy load non-critical components
- Remove unused JavaScript (currently 60KB unused)
- Consider using dynamic imports for heavy components

---

## Testing & Validation

### How to Test

1. **Build for production:**

   ```bash
   pnpm run build
   pnpm run preview
   ```

2. **Run Lighthouse:**
   - Open Chrome DevTools
   - Navigate to Lighthouse tab
   - Run audit in "Navigation" mode
   - Check LCP metric in "Performance" section

3. **Deploy to Netlify preview:**
   ```bash
   git push origin feature/lcp-optimizations
   ```

   - Wait for preview deployment
   - Run Lighthouse on preview URL
   - Compare metrics

### Key Metrics to Monitor

- **LCP (Largest Contentful Paint):** Target <2.5s
- **FCP (First Contentful Paint):** Target <1.8s
- **TBT (Total Blocking Time):** Target <200ms
- **CLS (Cumulative Layout Shift):** Target <0.1
- **Performance Score:** Target 90+

---

## Files Modified

1. **nuxt.config.ts**
   - Added DNS prefetch hints
   - Added image preloading with fetchpriority
   - Implemented async font loading
   - Added noscript font fallback

---

## Rollback Instructions

If these changes cause issues, you can rollback by:

1. **Revert font loading to blocking:**

   ```typescript
   {
     rel: 'stylesheet',
     href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,300;0,500;1,100;1,300;1,500&display=swap',
     // Remove media and onload attributes
   }
   ```

2. **Remove preload hints:**
   - Remove the preload entries for images
   - Keep preconnect for fonts

3. **Git revert:**
   ```bash
   git revert HEAD
   ```

---

## Notes

- All changes are non-breaking and backward compatible
- Changes focus on resource loading optimization, not functionality
- No changes to component logic or user-facing features
- Optimizations are progressive enhancements

**Last Updated:** November 25, 2025
