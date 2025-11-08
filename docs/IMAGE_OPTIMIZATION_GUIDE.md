# Image Optimization Guide for WakeUpNPC

## Overview

This guide addresses the Lighthouse performance issues related to images, which are the primary bottleneck for the site's performance score.

## Current Issues (from Lighthouse Report)

- **8+ MB** potential savings from converting JPEGs to WebP/AVIF
- **3.5 MB** savings from properly deferring offscreen images
- High CLS (0.507) from layout shifts when images load
- Thousands of JPEGs loading upfront without optimization

## Quick Start - Image Conversion Workflow

### Step 1: Install Dependencies

```bash
pnpm add -D sharp
```

### Step 2: Convert Images to WebP

```bash
# Preview what will be converted
node scripts/convert-images-to-webp.js --dry-run

# Convert images (keeps originals)
node scripts/convert-images-to-webp.js

# Optional: Custom quality (default is 80)
node scripts/convert-images-to-webp.js --quality=85
```

### Step 3: Update Markdown References

```bash
# Preview what will be changed
node scripts/update-markdown-image-refs.js --dry-run

# Update all markdown files
node scripts/update-markdown-image-refs.js
```

### Step 4: Test and Verify

```bash
# Start dev server and test
pnpm dev

# Check that images load correctly
# Run Lighthouse to verify improvements
```

### Step 5: Optional - Remove Original JPEGs

```bash
# Only after verifying WebP works!
node scripts/convert-images-to-webp.js --replace
```

## What the Scripts Do

### convert-images-to-webp.js

- Scans `public/memes/` and `public/profiles/` directories
- Converts all `.jpg` and `.jpeg` files to `.webp` format
- Creates `.webp` files alongside originals (by default)
- Reports file size savings
- **Does NOT modify markdown files**

### update-markdown-image-refs.js

- Scans all markdown files in `content/` directories
- Updates image references from `.jpg`/`.jpeg` to `.webp`
- Handles multiple formats:
  - Markdown syntax: `![alt](image.jpg)` → `![alt](image.webp)`
  - YAML frontmatter: `image: /path/image.jpg` → `image: /path/image.webp`
  - HTML tags: `<img src="image.jpg">` → `<img src="image.webp">`
- Only updates references where `.webp` file exists

## Expected Results

After completing the conversion:

- **File size reduction:** 25-35% smaller images
- **Total savings:** 8-10 MB
- **Performance score:** 34 → 65-75 (estimated)
- **CLS improvement:** 0.507 → <0.1 (with dimension fixes)

## Additional Optimizations

### 1. Add Explicit Image Dimensions

To prevent layout shifts (CLS), add width/height to images:

```vue
<img
  src="/memes/image.webp"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
  alt="Description"
/>
```

Or use CSS aspect-ratio:

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

### 2. Preload LCP Image

Identify your Largest Contentful Paint image and preload it in `nuxt.config.ts`:

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

### 3. Implement Responsive Images

For even better optimization, use srcset:

```vue
<img
  :src="image.webp"
  :srcset="`
    ${image.webp}?w=320 320w,
    ${image.webp}?w=640 640w,
    ${image.webp}?w=1024 1024w
  `"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  decoding="async"
/>
```

## Alternative: Use @nuxt/image Module

For automatic optimization, consider installing `@nuxt/image`:

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

Then use in components:

```vue
<NuxtImg
  src="/memes/image.jpg"
  width="800"
  height="600"
  loading="lazy"
  format="webp"
/>
```

## Troubleshooting

### Images not loading after conversion

1. Check browser console for errors
2. Verify `.webp` files exist in the same location as originals
3. Check that markdown references were updated correctly
4. Clear browser cache and hard refresh

### Script errors

If you get "Cannot find module 'sharp'":

```bash
pnpm add -D sharp
```

If you get permission errors:

```bash
chmod +x scripts/convert-images-to-webp.js
chmod +x scripts/update-markdown-image-refs.js
```

## Testing Performance

After optimization, test with:

1. **Chrome DevTools Lighthouse**
   - Open DevTools (F12)
   - Go to Lighthouse tab
   - Run audit in incognito mode

2. **PageSpeed Insights**
   - Visit https://pagespeed.web.dev/
   - Enter your URL
   - Compare before/after scores

3. **WebPageTest**
   - Visit https://www.webpagetest.org/
   - Run detailed performance test
   - Check waterfall for image loading

## Resources

- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Nuxt Image Documentation](https://image.nuxt.com/)
- [WebP Conversion Guide](https://developers.google.com/speed/webp)
- [Core Web Vitals](https://web.dev/vitals/)
