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

### 3. ✅ Lazy Loading Optimization

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

### 4. 📋 Image Optimization (Action Required)

**Issues:**

- 8+ MB potential savings from WebP/AVIF conversion
- 3.5 MB from deferring offscreen images
- High CLS (0.507) from layout shifts

**Solutions Provided:**

#### Two Scripts Created

**1. `scripts/convert-images-to-webp.js`** - Converts images to WebP

```bash
# Install dependency
pnpm add -D sharp

# Preview conversion
node scripts/convert-images-to-webp.js --dry-run

# Convert images (keeps originals)
node scripts/convert-images-to-webp.js
```

**2. `scripts/update-markdown-image-refs.js`** - Updates markdown files

```bash
# Preview changes
node scripts/update-markdown-image-refs.js --dry-run

# Update references
node scripts/update-markdown-image-refs.js
```

**What happens:**

1. First script converts `.jpg` → `.webp` (creates new files, keeps originals)
2. Second script updates markdown files to reference `.webp` instead of `.jpg`
3. You test to verify everything works
4. Optionally remove original JPEGs with `--replace` flag

**Expected Results:**

- 25-35% file size reduction
- 8-10 MB total savings
- Faster image loading
- All markdown references automatically updated

#### Comprehensive Guide

See `docs/IMAGE_OPTIMIZATION_GUIDE.md` for:

- Step-by-step conversion instructions
- Troubleshooting tips
- Additional optimization techniques
- Alternative solutions (@nuxt/image module)

---

## Implementation Status

### ✅ Completed (Ready to Deploy)

1. Added HTML lang attribute
2. Enhanced security headers (HSTS, COOP)
3. Improved lazy loading configuration
4. Created image optimization scripts
5. Created comprehensive documentation

### 📋 Next Steps for Image Optimization

**Phase 1: Image Conversion (High Priority)**

**Estimated Time:** 2-4 hours
**Expected Performance Gain:** +30-40 points

```bash
# Step 1: Install sharp
pnpm add -D sharp

# Step 2: Convert images
node scripts/convert-images-to-webp.js --dry-run
node scripts/convert-images-to-webp.js

# Step 3: Update markdown
node scripts/update-markdown-image-refs.js --dry-run
node scripts/update-markdown-image-refs.js

# Step 4: Test
pnpm dev
# Verify images load correctly

# Step 5: Optional - remove originals
node scripts/convert-images-to-webp.js --replace
```

**Phase 2: Additional Optimizations (Optional)**

- Add explicit image dimensions to prevent CLS
- Preload LCP image in nuxt.config.ts
- Implement responsive srcset
- Consider @nuxt/image module

---

## Expected Results

### After Current Changes (Deployed)

- Accessibility: 90 → 95+
- Best Practices: 96 → 100
- Performance: Minor improvement from lazy loading

### After Image Optimization (Phase 1)

- Performance: 34 → 65-75
- CLS: 0.507 → <0.1 (with dimension fixes)
- Image Payload: -8-10 MB
- LCP: Maintain or improve from 1.6s

### After All Optimizations

- Performance: 70-85
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

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

## Files Created

### Scripts

- `scripts/convert-images-to-webp.js` - Image conversion utility
- `scripts/update-markdown-image-refs.js` - Markdown reference updater

### Documentation

- `docs/IMAGE_OPTIMIZATION_GUIDE.md` - Comprehensive optimization guide
- `docs/LIGHTHOUSE_PERFORMANCE_FIXES.md` - This file

### Modified Files

- `nuxt.config.ts` - Added HTML lang attribute
- `netlify.toml` - Enhanced security headers
- `app/composables/useLazyImages.js` - Optimized lazy loading

---

## Conclusion

The immediate fixes are ready to deploy and will improve accessibility and security scores. The primary performance bottleneck is image optimization, which can now be addressed using the provided scripts.

**Quick Start:**

```bash
# Deploy current changes first
git add .
git commit -m "Add Lighthouse performance fixes"
git push

# Then run image optimization when ready
pnpm add -D sharp
node scripts/convert-images-to-webp.js --dry-run
node scripts/convert-images-to-webp.js
node scripts/update-markdown-image-refs.js --dry-run
node scripts/update-markdown-image-refs.js
```

With these changes, the site should achieve a Performance score of 65-75, with potential to reach 80+ with additional optimizations.
