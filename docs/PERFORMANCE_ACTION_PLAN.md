# Performance Action Plan - Based on Real Lighthouse Results

**Date**: 2025-11-08
**Current Performance Score**: ~40-50 (estimated)
**Target**: 85+

## Current Metrics (Netlify Lighthouse)

| Metric      | Current | Target | Status        |
| ----------- | ------- | ------ | ------------- |
| LCP         | 3.6s    | <2.5s  | ❌ Needs work |
| CLS         | 0.27    | <0.1   | ❌ Got worse! |
| Speed Index | 3.8s    | <3.4s  | ⚠️ Close      |
| TTI         | 2.6s    | <3.8s  | ✅ Good       |
| TBT         | 0ms     | <200ms | ✅ Excellent  |

## ✅ What's Working

1. **TTI (2.6s)** - Main thread not blocked ✅
2. **TBT (0ms)** - No blocking tasks ✅
3. **Site loads** - No JavaScript errors ✅

## ❌ Critical Issues

### 1. CLS Increased (0.09 → 0.27) 🚨

**Why it got worse**: Font optimization may have introduced new shifts

**Fixes needed**:

- Reserve space for all images (width/height attributes)
- Use `aspect-ratio` CSS for dynamic content
- Avoid late-loading fonts causing shifts
- Set fixed dimensions for buttons, chips, counters
- Prevent late-injected content (ads, banners)

### 2. LCP Still Slow (3.6s)

**Root causes**:

- Hero content not optimized
- Large JS bundle blocking render
- No resource prioritization

**Fixes needed**:

- Add `fetchpriority="high"` to hero image
- Preload critical hero image
- Inline critical CSS
- Defer non-critical JS
- Code splitting for route-level chunks

## 🎯 Priority Action Items

### Phase 1: Quick Wins (1-2 hours)

#### 1.1 Fix CLS Issues

```vue
<!-- Add to all images -->
<img
  src="image.webp"
  width="800"
  height="600"
  style="aspect-ratio: 800/600"
  loading="lazy"
/>

<!-- Reserve space for dynamic content -->
<div style="min-height: 200px">
  <!-- Content loads here -->
</div>
```

#### 1.2 Optimize Hero Content

```vue
<!-- In main page component -->
<img
  src="/hero-image.webp"
  fetchpriority="high"
  loading="eager"
  width="1200"
  height="630"
/>

<!-- In nuxt.config.ts -->
link: [ { rel: 'preload', as: 'image', href: '/hero-image.webp', type:
'image/webp' } ]
```

#### 1.3 Font Optimization

```typescript
// nuxt.config.ts - Add font preload
link: [
  {
    rel: 'preload',
    href: 'https://fonts.gstatic.com/s/barlowcondensed/...',
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous',
  },
]
```

### Phase 2: Medium Wins (2-4 hours)

#### 2.1 Critical CSS Inlining

- Extract above-the-fold CSS
- Inline in `<head>`
- Defer remaining CSS

#### 2.2 Code Splitting (Safe Approach)

```typescript
// Use Nuxt's built-in lazy loading
const TheWall = defineAsyncComponent(
  () => import('~/components/wall/TheWall.vue')
)

// Route-level splitting
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true,
  },
})
```

#### 2.3 Resource Hints

```typescript
// nuxt.config.ts
link: [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
  { rel: 'dns-prefetch', href: 'https://gc.zgo.at' },
]
```

### Phase 3: Bigger Changes (4-8 hours)

#### 3.1 Image Lazy Loading Integration

- Apply `useImageLazyLoad` composable to ProfileImage
- Add to meme components
- Set proper dimensions on all images

#### 3.2 Bundle Optimization

- Remove SQLite3 from client bundle
- Tree-shake unused code
- Analyze bundle with `nuxt build --analyze`

#### 3.3 Service Worker

- Cache static assets
- Offline support
- Background sync for likes

## 🔧 Implementation Order

### Week 1: Fix CLS (Priority #1)

1. Add width/height to all images
2. Use aspect-ratio CSS
3. Fix font loading strategy
4. Reserve space for dynamic content
5. **Target**: CLS < 0.1

### Week 2: Improve LCP

1. Optimize hero image
2. Add fetchpriority and preload
3. Inline critical CSS
4. Defer non-critical JS
5. **Target**: LCP < 2.5s

### Week 3: Polish

1. Implement lazy loading
2. Add service worker
3. Optimize caching headers
4. Final bundle optimization
5. **Target**: Performance score 85+

## 📊 Expected Results After Each Phase

### After Phase 1 (Quick Wins)

- CLS: 0.27 → 0.08 ✅
- LCP: 3.6s → 2.8s ⚠️
- Performance: 40 → 60

### After Phase 2 (Medium Wins)

- CLS: 0.08 → 0.05 ✅
- LCP: 2.8s → 2.2s ✅
- Performance: 60 → 75

### After Phase 3 (Bigger Changes)

- CLS: 0.05 → 0.03 ✅
- LCP: 2.2s → 1.8s ✅
- Performance: 75 → 85+

## 🚫 What NOT to Do (Lessons Learned)

1. ❌ Don't use Terser minification - breaks Vue
2. ❌ Don't use manual code splitting - causes circular deps
3. ❌ Don't deploy all changes at once - test incrementally
4. ❌ Don't rely on preview mode - test in production
5. ❌ Don't optimize without measuring - use real Lighthouse data

## ✅ What DOES Work

1. ✅ Nitro compression (Brotli/Gzip)
2. ✅ Security headers
3. ✅ Dependency cleanup
4. ✅ Native implementations (debounce)
5. ✅ Incremental deployment

## 📝 Testing Checklist

Before each deployment:

- [ ] Run `pnpm build` locally
- [ ] Check for console errors
- [ ] Test on slow 3G
- [ ] Run Lighthouse locally
- [ ] Deploy to staging first
- [ ] Run Netlify Lighthouse
- [ ] Verify no regressions

## 🎯 Success Criteria

**Minimum Viable Performance**:

- Performance: 70+
- LCP: <2.5s
- CLS: <0.1
- No JavaScript errors

**Target Performance**:

- Performance: 85+
- LCP: <2.0s
- CLS: <0.05
- All metrics green

---

**Current Status**: Site functional, baseline established
**Next Action**: Implement Phase 1 (Fix CLS)
**Timeline**: 3 weeks to target performance
