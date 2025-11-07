# Lighthouse Performance Fixes - WakeUpNPC

## Executive Summary

This document summarizes the performance optimizations implemented to address the Lighthouse audit issues reported for wakeupnpc.com.

**Initial Lighthouse Scores:**

- Performance: 34
- Accessibility: 90
- Best Practices: 96
- SEO: 100

**Target Scores:**

- Performance: 70+ (realistic target given image-heavy content)
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

## Issues Addressed

### 1. ✅ Accessibility - HTML Lang Attribute

**Issue:** Missing `lang` attribute on `<html>` element

**Fix:** Added `htmlAttrs: { lang: 'en' }` to `nuxt.config.ts`

```typescript
app: {
  head: {
    htmlAttrs: {
      lang: 'en',
    },
    // ...
  }
}
```

**Impact:** Improves accessibility for screen readers and search engines.

---

### 2. ✅ Security Headers

**Issues:**

- CSP uses `unsafe-inline`
- Missing HSTS with `preload` and `includeSubDomains`
- No COOP (Cross-Origin-Opener-Policy)

**Fixes in `netlify.toml`:**

```toml
Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
Cross-Origin-Opener-Policy = "same-origin-allow-popups"
Content-Security-Policy = "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gc.zgo.at; connect-src 'self' https: https://wakeupnpc.goatcounter.com https://gc.zgo.at; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self';"
```

**Impact:**

- HSTS protects against protocol downgrade attacks
- COOP provides better isolation for security
- Enhanced CSP with frame-ancestors

**Note:** CSP still uses `unsafe-inline` due to Nuxt's inline styles. Future improvement: implement nonce-based CSP.

---

### 3. ✅ JavaScript Bundle Optimization

**Issue:** Large Nuxt bundle (CTqzRMei.js) causing 14.2s main thread blocking and 3.9s Total Blocking Time

**Fixes in `nuxt.config.ts`:**

```typescript
vite: {
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'content-vendor': ['@nuxt/content'],
        },
      },
    },
  },
}
```

**Impact:**

- Splits vendor code into separate chunks for better caching
- Enables CSS code splitting
- Reduces initial bundle size
- Improves Time to Interactive (TTI)

---

### 4. ✅ Lazy Loading Optimization

**Issue:** Images loading with 200px rootMargin causing unnecessary preloading

**Fix in `app/composables/useLazyImages.js`:**

```javascript
{
  rootMargin: '50px', // Reduced from 200px
  threshold: 0.01,
}

// Added async decoding hint
imageLoader.decoding = 'async'
```

**Impact:**

- Reduces unnecessary image preloading
- Improves initial page load performance
- Better resource prioritization

---

### 5. 📋 Image Optimization (Action Required)

**Issues:**

- 8+ MB potential savings from WebP/AVIF conversion
- 3.5 MB from deferring offscreen images
- High CLS (0.507) from layout shifts

**Solutions Provided:**

#### A. Image Conversion Script

Created `scripts/convert-images-to-webp.js` to batch convert JPEGs to WebP.

**Usage:**

```bash
# Install sharp (if not already installed)
pnpm add -D sharp

# Dry run to see what would be converted
node scripts/convert-images-to-webp.js --dry-run

# Convert images (keeps originals)
node scripts/convert-images-to-webp.js

# Convert and replace originals
node scripts/convert-images-to-webp.js --replace
```

**Expected Results:**

- 25-35% file size reduction
- 8-10 MB total savings
- Faster image loading

#### B. Comprehensive Guide

Created `docs/IMAGE_OPTIMIZATION_GUIDE.md` with:

- Step-by-step conversion instructions
- Responsive image implementation
- CLS prevention techniques
- LCP image preloading
- Alternative solutions (@nuxt/image module)

---

## Implementation Status

### ✅ Completed (Immediate Impact)

1. Added HTML lang attribute
2. Enhanced security headers (HSTS, COOP)
3. Optimized JavaScript bundle splitting
4. Improved lazy loading configuration
5. Created image optimization tools and documentation

### 📋 Recommended Next Steps

#### Phase 1: Image Optimization (High Priority)

**Estimated Time:** 2-4 hours
**Expected Performance Gain:** +30-40 points

1. Run image conversion script:

   ```bash
   pnpm add -D sharp
   node scripts/convert-images-to-webp.js --dry-run
   node scripts/convert-images-to-webp.js
   ```

2. Update image references in markdown files to use `.webp` extensions

3. Add explicit dimensions to prevent CLS:

   ```vue
   <img
     src="image.webp"
     width="800"
     height="600"
     loading="lazy"
     decoding="async"
   />
   ```

4. Identify and preload LCP image in `nuxt.config.ts`

#### Phase 2: Advanced Optimizations (Optional)

**Estimated Time:** 4-8 hours
**Expected Performance Gain:** +5-10 points

1. Install and configure `@nuxt/image` module for automatic optimization
2. Implement responsive `srcset` for all images
3. Consider AVIF format for even better compression
4. Implement nonce-based CSP to remove `unsafe-inline`

#### Phase 3: DOM & Animation Optimization (Optional)

**Estimated Time:** 2-4 hours
**Expected Performance Gain:** +5-10 points

1. Audit and reduce DOM complexity (currently ~19,000 elements)
2. Convert non-composited animations to use `transform` and `opacity`
3. Implement virtual scrolling for long lists if applicable

---

## Expected Results

### After Phase 1 (Image Optimization)

- **Performance Score:** 34 → 65-75
- **CLS:** 0.507 → <0.1
- **Image Payload:** Reduce by 8-10 MB
- **LCP:** Maintain or improve from 1.6s

### After All Phases

- **Performance Score:** 70-85
- **Accessibility:** 95+
- **Best Practices:** 100
- **SEO:** 100

---

## Testing & Validation

### Tools to Use

1. **Chrome DevTools Lighthouse**
   - Run in incognito mode
   - Use "Mobile" device simulation
   - Test multiple times for consistency

2. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Tests real-world performance
   - Provides field data from actual users

3. **WebPageTest**
   - https://www.webpagetest.org/
   - Detailed waterfall analysis
   - Multiple location testing

### Key Metrics to Monitor

- **FCP (First Contentful Paint):** Currently 1.0s (good)
- **LCP (Largest Contentful Paint):** Currently 1.6s (good)
- **TBT (Total Blocking Time):** Currently 3.9s (needs improvement)
- **CLS (Cumulative Layout Shift):** Currently 0.507 (needs improvement)

---

## Additional Recommendations

### 1. Consider CDN with Image Optimization

Services like Cloudflare, Cloudinary, or Imgix can automatically:

- Convert images to optimal formats
- Resize images based on device
- Serve from edge locations
- Implement lazy loading

### 2. Monitor Performance Over Time

- Set up performance budgets
- Use Lighthouse CI in your deployment pipeline
- Track Core Web Vitals in Google Search Console

### 3. Progressive Enhancement

- Ensure site works without JavaScript
- Implement service worker for offline support
- Consider AMP or similar for critical pages

---

## Resources

- [Web.dev Performance Guide](https://web.dev/fast/)
- [Nuxt Performance Best Practices](https://nuxt.com/docs/guide/going-further/performance)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Core Web Vitals](https://web.dev/vitals/)

---

## Conclusion

The immediate fixes implemented address critical accessibility and security issues while laying the groundwork for significant performance improvements. The primary bottleneck remains image optimization, which can be addressed using the provided tools and documentation.

**Priority Actions:**

1. ✅ Deploy current changes (accessibility, security, JS optimization)
2. 🔄 Run image conversion script
3. 🔄 Update image references to WebP
4. 🔄 Add explicit image dimensions
5. 🔄 Test and validate improvements

With these changes, the site should achieve a Performance score of 65-75, with potential to reach 80+ with additional optimizations.
