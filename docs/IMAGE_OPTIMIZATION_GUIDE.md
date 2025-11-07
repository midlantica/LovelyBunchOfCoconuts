# Image Optimization Guide for WakeUpNPC

## Overview

This guide addresses the Lighthouse performance issues related to images, which are the primary bottleneck for the site's performance score.

## Current Issues (from Lighthouse Report)

- **8+ MB** potential savings from converting JPEGs to WebP/AVIF
- **3.5 MB** savings from properly deferring offscreen images
- High CLS (0.507) from layout shifts when images load
- Thousands of JPEGs loading upfront without optimization

## Recommended Solutions

### 1. Convert Images to Modern Formats

#### Option A: Automated Conversion Script (Recommended)

Create a script to batch convert all JPEG images to WebP format:

```bash
# Install sharp for image processing
pnpm add -D sharp

# Create conversion script
node scripts/convert-images-to-webp.js
```

**Benefits:**

- WebP provides 25-35% better compression than JPEG
- Maintains visual quality
- Broad browser support (95%+ of users)

#### Option B: Use Nuxt Image Module

Install `@nuxt/image` for automatic optimization:

```bash
pnpm add @nuxt/image
```

Add to `nuxt.config.ts`:

```typescript
modules: [
  '@nuxt/image',
  // ... other modules
],
image: {
  formats: ['webp', 'avif', 'jpeg'],
  quality: 80,
  screens: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
}
```

### 2. Implement Responsive Images with srcset

Update image components to use responsive srcset:

```vue
<img
  :src="image.src"
  :srcset="`
    ${image.src}?w=320 320w,
    ${image.src}?w=640 640w,
    ${image.src}?w=1024 1024w
  `"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  :alt="image.alt"
  loading="lazy"
  decoding="async"
/>
```

### 3. Reserve Space for Images (Fix CLS)

Add explicit width/height or aspect-ratio to prevent layout shifts:

```vue
<img
  :src="image.src"
  :alt="image.alt"
  width="800"
  height="600"
  style="aspect-ratio: 4/3;"
  loading="lazy"
/>
```

Or use CSS:

```css
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 4. Preload LCP Image

Identify and preload the Largest Contentful Paint image in `nuxt.config.ts`:

```typescript
link: [
  {
    rel: 'preload',
    as: 'image',
    href: '/path-to-lcp-image.webp',
    type: 'image/webp',
  },
]
```

### 5. Optimize Lazy Loading

The current `useLazyImages.js` composable is good but can be enhanced:

```javascript
// Improved intersection observer settings
{
  rootMargin: '50px', // Reduce from 200px for better performance
  threshold: 0.01,
}
```

### 6. Use Native Lazy Loading

For simpler cases, use native browser lazy loading:

```vue
<img :src="image.src" :alt="image.alt" loading="lazy" decoding="async" />
```

## Implementation Priority

### Phase 1: Quick Wins (Immediate)

1. ✅ Add `loading="lazy"` to all offscreen images
2. ✅ Add explicit dimensions or aspect-ratios to prevent CLS
3. ✅ Preload the LCP image
4. ✅ Reduce lazy loading rootMargin from 200px to 50px

### Phase 2: Format Conversion (1-2 days)

1. Convert all meme JPEGs to WebP format
2. Update image references in markdown files
3. Implement fallback for older browsers if needed

### Phase 3: Advanced Optimization (Optional)

1. Install and configure @nuxt/image module
2. Implement responsive srcset for all images
3. Consider AVIF format for even better compression
4. Set up CDN with automatic image optimization

## Measuring Success

After implementing optimizations, expect:

- **Performance score**: 34 → 70+ (target)
- **CLS**: 0.507 → <0.1 (target)
- **Image payload**: Reduce by 8-10 MB
- **LCP**: Maintain current 1.6s or improve

## Tools for Testing

1. **Lighthouse**: Run in Chrome DevTools
2. **WebPageTest**: https://www.webpagetest.org/
3. **PageSpeed Insights**: https://pagespeed.web.dev/

## Additional Resources

- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Nuxt Image Documentation](https://image.nuxt.com/)
- [WebP Conversion Guide](https://developers.google.com/speed/webp)
