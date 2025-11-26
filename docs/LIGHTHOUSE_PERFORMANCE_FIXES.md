# Lighthouse Performance Fixes

**Report Date:** November 25, 2025
**Test URL:** https://692500547bb93b0008cfc25b--wakeupnpc.netlify.app/
**Current Performance Score:** 66/100

## Executive Summary

The Lighthouse audit reveals critical performance issues that need immediate attention:

- **LCP (Largest Contentful Paint):** 5.5s → Target: <2.5s (CRITICAL)
- **CLS (Cumulative Layout Shift):** 0.228 → Target: <0.1 (HIGH PRIORITY)
- **DOM Size:** 20,554 elements → Target: <1,500 (CRITICAL)
- **Server Response Time:** 737ms → Target: <600ms (HIGH PRIORITY)
- **Render-blocking Resources:** 648ms potential savings (HIGH PRIORITY)

---

## Priority 1: CRITICAL FIXES (Immediate Action Required)

### 1.1 Reduce DOM Size (20,554 → <1,500 elements)

**Current Issue:** Excessive DOM elements causing memory issues and slow rendering
**Impact:** High - Affects all performance metrics
**Potential Savings:** Massive performance improvement

**Root Causes:**

- Virtual scrolling implementation may be rendering too many items
- Wall component likely rendering all content at once
- Possible memory leaks or duplicate elements

**Action Items:**

1. **Audit TheWall.vue virtualization:**

   ```bash
   # Check current implementation
   grep -n "virtualScroll\|renderBuffer\|itemHeight" app/components/wall/TheWall.vue
   ```

2. **Reduce render buffer:**
   - Current buffer may be too large
   - Reduce to render only visible items + 5-10 buffer items
   - Implement aggressive cleanup of off-screen elements

3. **Implement DOM recycling:**
   - Reuse DOM nodes instead of creating new ones
   - Use `v-show` instead of `v-if` where appropriate for frequently toggled elements

4. **Lazy load modal content:**
   - Don't render modal content until opened
   - Destroy modal DOM when closed

**Files to Modify:**

- `app/components/wall/TheWall.vue`
- `app/composables/useWallVirtualization.js`
- `app/components/modals/ModalFrame.vue`

**Expected Result:** DOM size reduced to <2,000 elements

---

### 1.2 Optimize Largest Contentful Paint (5.5s → <2.5s)

**Current Issue:** LCP element taking 5.5 seconds to render
**Impact:** Critical - Primary performance metric
**Potential Savings:** 3+ seconds

**Root Causes:**

- Large images loading without optimization
- Render-blocking resources delaying paint
- Server response time delays
- Excessive DOM size blocking rendering

**Action Items:**

1. **Identify LCP element:**
   - Likely the hero image or first wall content item
   - Use Chrome DevTools Performance tab to confirm

2. **Preload critical images:**

   ```vue
   <!-- In app.vue or nuxt.config.ts -->
   <link
     rel="preload"
     as="image"
     href="/hero-image.webp"
     fetchpriority="high"
   />
   ```

3. **Optimize image delivery:**
   - Ensure WebP format with fallbacks
   - Use responsive images with `srcset`
   - Implement proper `width` and `height` attributes
   - Add `fetchpriority="high"` to LCP image

4. **Inline critical CSS:**
   - Extract above-the-fold CSS
   - Inline in `<head>` to avoid render-blocking

5. **Defer non-critical resources:**
   - Move non-critical JS to bottom or use `defer`
   - Lazy load below-the-fold content

**Files to Modify:**

- `nuxt.config.ts` (add preload links)
- `app/app.vue` (critical CSS)
- `app/components/wall/TheWall.vue` (image optimization)
- `app/pages/index.vue` (hero optimization)

**Expected Result:** LCP reduced to <2.5s

---

### 1.3 Reduce Server Response Time (737ms → <600ms)

**Current Issue:** Initial server response taking 737ms
**Impact:** High - Delays everything
**Potential Savings:** 638ms

**Root Causes:**

- Cold start delays on Netlify
- Inefficient server-side rendering
- Large data fetching on initial load
- No edge caching

**Action Items:**

1. **Enable Netlify Edge Functions:**
   - Move critical API routes to edge functions
   - Reduce latency by serving from nearest edge location

2. **Implement aggressive caching:**

   ```typescript
   // In nuxt.config.ts
   nitro: {
     compressPublicAssets: true,
     prerender: {
       crawlLinks: true,
       routes: ['/']
     }
   }
   ```

3. **Optimize data fetching:**
   - Reduce initial data payload
   - Implement incremental loading
   - Cache static content JSON files

4. **Add Cache-Control headers:**

   ```toml
   # In netlify.toml
   [[headers]]
     for = "/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"

   [[headers]]
     for = "/*.html"
     [headers.values]
       Cache-Control = "public, max-age=0, must-revalidate"
   ```

**Files to Modify:**

- `netlify.toml`
- `nuxt.config.ts`
- `server/middleware/cache.ts` (create)

**Expected Result:** Server response time <600ms

---

## Priority 2: HIGH PRIORITY FIXES

### 2.1 Eliminate Render-Blocking Resources (648ms savings)

**Current Issue:** Google Fonts CSS blocking render
**Impact:** High - Delays FCP and LCP
**Potential Savings:** 648ms

**Action Items:**

1. **Self-host Google Fonts:**

   ```bash
   # Download fonts and add to public/fonts/
   # Update CSS to use local fonts
   ```

2. **Use font-display: swap:**

   ```css
   @font-face {
     font-family: 'Your Font';
     font-display: swap;
     src: url('/fonts/your-font.woff2') format('woff2');
   }
   ```

3. **Preload critical fonts:**

   ```vue
   <link
     rel="preload"
     href="/fonts/main-font.woff2"
     as="font"
     type="font/woff2"
     crossorigin
   />
   ```

4. **Remove unused font weights:**
   - Audit which font weights are actually used
   - Only load necessary weights

**Files to Modify:**

- `app/app.vue` or `nuxt.config.ts`
- `app/assets/css/main.css`
- `public/fonts/` (add font files)

**Expected Result:** Eliminate 648ms render-blocking time

---

### 2.2 Reduce Cumulative Layout Shift (0.228 → <0.1)

**Current Issue:** Elements shifting during page load
**Impact:** High - Poor user experience
**Potential Savings:** Better UX and performance score

**Root Causes:**

- Images loading without dimensions
- Dynamic content insertion
- Web fonts causing text reflow
- Ads or dynamic components

**Action Items:**

1. **Add explicit dimensions to all images:**

   ```vue
   <img src="image.webp" width="800" height="600" alt="Description" />
   ```

2. **Reserve space for dynamic content:**

   ```css
   .wall-item {
     min-height: 400px; /* Reserve space before content loads */
   }
   ```

3. **Use font-display: swap with fallback metrics:**

   ```css
   @font-face {
     font-family: 'Main Font';
     font-display: swap;
     size-adjust: 100%; /* Match fallback font metrics */
   }
   ```

4. **Preload critical images:**
   - Add dimensions to all wall item images
   - Use aspect-ratio CSS property

**Files to Modify:**

- `app/components/wall/WallItem.vue`
- `app/components/ProfileImage.vue`
- `app/assets/css/main.css`

**Expected Result:** CLS reduced to <0.1

---

## Priority 3: MEDIUM PRIORITY FIXES

### 3.1 Remove Unused JavaScript (60KB in BsV056DK.js)

**Current Issue:** 39% of JavaScript unused
**Impact:** Medium - Increases bundle size
**Potential Savings:** 60KB

**Action Items:**

1. **Analyze bundle composition:**

   ```bash
   pnpm run analyze-bundle-size
   ```

2. **Implement code splitting:**

   ```typescript
   // Use dynamic imports for large components
   const HeavyComponent = defineAsyncComponent(
     () => import('./components/HeavyComponent.vue')
   )
   ```

3. **Tree-shake unused dependencies:**
   - Audit package.json for unused packages
   - Use named imports instead of default imports
   - Enable tree-shaking in build config

4. **Lazy load non-critical features:**
   - Modal components
   - Share functionality
   - Admin features

**Files to Modify:**

- `nuxt.config.ts` (build optimization)
- Various component files (dynamic imports)

**Expected Result:** 60KB reduction in JavaScript

---

### 3.2 Remove Unused CSS (11KB in entry.MLIZCXKN.css)

**Current Issue:** 76% of CSS unused
**Impact:** Medium - Increases bundle size
**Potential Savings:** 11KB

**Action Items:**

1. **Audit Tailwind usage:**

   ```bash
   # Check which Tailwind classes are actually used
   pnpm dlx tailwindcss-analyzer
   ```

2. **Configure PurgeCSS properly:**

   ```javascript
   // In tailwind.config.js
   content: [
     './app/**/*.{vue,js,ts}',
     './content/**/*.md'
   ],
   safelist: [
     // Only safelist truly dynamic classes
   ]
   ```

3. **Remove unused component styles:**
   - Audit scoped styles in components
   - Remove dead CSS code

4. **Optimize Tailwind config:**
   - Disable unused plugins
   - Reduce color palette if not needed
   - Remove unused utilities

**Files to Modify:**

- `tailwind.config.js`
- Various component files

**Expected Result:** 11KB reduction in CSS

---

### 3.3 Fix Accessibility Issues

**Current Issues:**

- Button without accessible name (1 element)
- Color contrast issues (6 elements)

**Action Items:**

1. **Add accessible name to header button:**

   ```vue
   <button aria-label="Menu" class="header-button">
     <IconMenu />
   </button>
   ```

2. **Fix color contrast issues:**
   - Search input: Increase contrast ratio to 4.5:1
   - Filter buttons: Adjust text/background colors
   - Test with Chrome DevTools Accessibility panel

**Files to Modify:**

- `app/components/layout/Header.vue`
- `app/components/searchbar/SearchBar.vue`
- `app/components/wall/FilterButtons.vue`

**Expected Result:** Accessibility score 100/100

---

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)

1. Reduce DOM size (TheWall virtualization)
2. Optimize LCP (image preloading, critical CSS)
3. Reduce server response time (caching, edge functions)

**Expected Impact:** Performance score 66 → 80+

### Phase 2: High Priority (Week 2)

1. Eliminate render-blocking resources (self-host fonts)
2. Reduce CLS (image dimensions, space reservation)

**Expected Impact:** Performance score 80 → 90+

### Phase 3: Medium Priority (Week 3)

1. Remove unused JavaScript (code splitting)
2. Remove unused CSS (Tailwind optimization)
3. Fix accessibility issues

**Expected Impact:** Performance score 90 → 95+

---

## Testing & Validation

After each phase:

1. **Run Lighthouse audit:**

   ```bash
   # Local testing
   pnpm run build
   pnpm run preview
   # Then run Lighthouse in Chrome DevTools
   ```

2. **Test on Netlify preview:**
   - Deploy to preview branch
   - Run Lighthouse on preview URL
   - Compare metrics

3. **Monitor Core Web Vitals:**
   - Use Chrome User Experience Report
   - Monitor real user metrics
   - Track improvements over time

---

## Success Metrics

**Target Scores:**

- Performance: 95+ (currently 66)
- Accessibility: 100 (currently 91)
- Best Practices: 100 (currently 100)
- SEO: 100 (currently 100)
- PWA: 80+ (currently 40)

**Target Core Web Vitals:**

- LCP: <2.5s (currently 5.5s)
- FID: <100ms
- CLS: <0.1 (currently 0.228)
- FCP: <1.8s (currently 2.8s)
- TBT: <200ms (currently 0ms - good)

---

## Notes

- All fixes should be tested individually before combining
- Monitor bundle size after each change
- Use feature flags for gradual rollout if needed
- Document any breaking changes
- Update this document as fixes are implemented

**Last Updated:** November 25, 2025
