# Performance Optimization Guide

This document outlines the performance optimizations implemented to improve Lighthouse scores and overall site performance.

## Overview

Initial Lighthouse Performance Score: **31/100** (Very Poor)
Target: **90+/100** (Good)

## Critical Issues Addressed

### 1. Production Build Optimizations ✅

**Problem**: No minification or compression enabled

- Text compression potential: ~10.2 MiB savings
- JS minification potential: ~9.6 MiB savings

**Solution**: Enabled in `nuxt.config.ts`

```typescript
vite: {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
      format: { comments: false },
    },
  },
}

nitro: {
  compressPublicAssets: {
    gzip: true,
    brotli: true,
  },
  minify: true,
}
```

**Expected Impact**:

- Reduce bundle size by ~60-70%
- Improve TBT (Total Blocking Time) significantly
- Faster initial load and parse times

### 2. Code Splitting ✅

**Problem**: Entire app loaded upfront (17.8 MiB total)

- Vue runtime-dom: ~12.1s execution time
- sqlite3 modules: 3.68 MiB (not needed client-side)
- Unused JS: ~620 KiB

**Solution**: Manual chunk splitting

```typescript
rollupOptions: {
  output: {
    manualChunks: {
      'vue-core': ['vue', 'vue-router'],
      'content-runtime': ['@nuxt/content'],
      'ui-components': [
        './app/components/wall/TheWall.vue',
        './app/components/modals/ModalProfile.vue',
      ],
    },
  },
}
```

**Expected Impact**:

- Reduce initial bundle by ~40%
- Improve FCP (First Contentful Paint)
- Better caching strategy

### 3. Dependency Optimization ✅

**Problem**: Heavy dependencies bloating bundle

- better-sqlite3: 3.68 MiB (only needed for build scripts)
- lodash-es: 300 KiB (used only for debounce)

**Solution**:

- Removed better-sqlite3 from runtime dependencies
- Replaced lodash-es with native debounce implementation (8 lines)

**Expected Impact**:

- Save ~4 MiB from bundle
- Reduce parse/compile time by ~2-3 seconds

### 4. Image Lazy Loading ✅

**Problem**: All images loaded upfront

- Offscreen images: 1.24 MiB wasted
- LCP image lazily loaded (should be preloaded)

**Solution**: Created `useImageLazyLoad.js` composable

- Intersection Observer with 50px rootMargin
- Automatic cleanup on unmount
- Fade-in effect for better UX

**Usage**:

```vue
<img
  data-src="/path/to/image.webp"
  class="lazy-image"
  loading="lazy"
  decoding="async"
/>
```

**Expected Impact**:

- Save 1.24 MiB on initial load
- Improve LCP by 2-3 seconds
- Better perceived performance

### 5. Font Loading Optimization ✅

**Problem**: Web fonts causing CLS (0.244)

- Fonts loaded asynchronously causing layout shift
- No font-display strategy

**Solution**: Changed font loading strategy

```html
<!-- Before: async preload -->
<link rel="preload" href="..." as="style" onload="..." />

<!-- After: direct stylesheet with font-display -->
<link rel="stylesheet" href="...?display=swap" />
```

**Expected Impact**:

- Reduce CLS from 0.244 to <0.1
- Eliminate font-related layout shifts
- Faster text rendering

### 6. Security Headers ✅

**Problem**: Missing critical security headers

- No Content Security Policy
- No HSTS
- No X-Frame-Options
- No COOP/CORP

**Solution**: Created `server/middleware/security-headers.ts`

- Comprehensive CSP
- HSTS with preload
- Clickjacking protection
- MIME sniffing prevention
- Restrictive Permissions Policy

**Expected Impact**:

- Improved security score
- Better protection against XSS, clickjacking
- Compliance with security best practices

### 7. Accessibility Fixes ✅

**Problem**: Missing accessibility attributes

- No `html[lang]` attribute
- Some buttons lack accessible names

**Solution**:

- Added `htmlAttrs: { lang: 'en' }` to nuxt.config.ts
- Audit buttons for aria-labels (ongoing)

**Expected Impact**:

- Accessibility score: 90 → 95+
- Better screen reader support

## Remaining Optimizations

### High Priority

1. **LCP Optimization** (Target: <2.5s)
   - Current: 13.0s (H1 element, 99% render delay)
   - Actions needed:
     - Preload critical fonts
     - Optimize critical CSS
     - Reduce render-blocking resources
     - Consider SSR improvements

2. **TBT Reduction** (Target: <200ms)
   - Current: 13,420ms (severely high)
   - Actions needed:
     - Further code splitting
     - Defer non-critical JS
     - Optimize Vue runtime usage
     - Consider web workers for heavy tasks

3. **DOM Size Optimization**
   - Current: 19,052 elements (max depth: 21)
   - One container: 1,034 children
   - Actions needed:
     - Improve virtualization in TheWall.vue
     - Reduce initial render count
     - Implement progressive loading

### Medium Priority

4. **Animation Optimization**
   - 884 non-composited animations
   - Use CSS transforms and opacity only
   - Add `will-change` hints sparingly

5. **Resource Hints**
   - Add `dns-prefetch` for external domains
   - Add `preconnect` for critical origins
   - Consider `modulepreload` for critical chunks

### Low Priority

6. **Service Worker**
   - Implement for offline support
   - Cache static assets
   - Background sync for likes

7. **Image Optimization**
   - Implement responsive images with srcset
   - Consider AVIF format for better compression
   - Optimize image dimensions

## Testing & Validation

### Before Deployment

1. Run Lighthouse in production mode
2. Test on slow 3G connection
3. Verify all security headers
4. Check bundle sizes with `nuxt build --analyze`

### Commands

```bash
# Build with analysis
pnpm build
pnpm preview

# Run Lighthouse
lighthouse http://localhost:3000 --view

# Check bundle sizes
du -sh .output/public/_nuxt/*
```

## Expected Results

After implementing all optimizations:

| Metric      | Before   | Target | Expected    |
| ----------- | -------- | ------ | ----------- |
| Performance | 31       | 90+    | 85-92       |
| LCP         | 13.0s    | <2.5s  | 2.0-2.5s    |
| TBT         | 13,420ms | <200ms | 300-500ms   |
| CLS         | 0.244    | <0.1   | 0.05-0.08   |
| FCP         | 0.9s     | <1.8s  | 0.8-1.0s    |
| Bundle Size | 17.8 MiB | <2 MiB | 1.5-2.5 MiB |

## Monitoring

### Key Metrics to Track

- Core Web Vitals (LCP, FID, CLS)
- Bundle size over time
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

### Tools

- Lighthouse CI
- WebPageTest
- Chrome DevTools Performance panel
- Bundle analyzer

## Notes

- All optimizations are production-only (dev mode unaffected)
- Console logs removed in production builds
- Security headers may need adjustment for specific features
- Monitor for any breaking changes after deployment

## References

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [Nuxt Performance](https://nuxt.com/docs/guide/concepts/rendering#performance)
- [Vue Performance](https://vuejs.org/guide/best-practices/performance.html)
