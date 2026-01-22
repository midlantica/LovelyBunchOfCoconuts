# Server Response Time Analysis & Optimization Strategy

**Date:** January 21, 2026
**Issue:** Server response time of 1,013ms identified as primary performance bottleneck
**Status:** Edge Functions not viable - Alternative strategies documented

---

## 🎯 The Problem

Lighthouse analysis after Nuxt 4.2.2 optimizations revealed:

- **Performance Score:** 68/100
- **Total Blocking Time (TBT):** 0ms ✅ (Excellent - Nuxt optimizations working)
- **Largest Contentful Paint (LCP):** 5.4s ❌ (Poor)
- **Server Response Time:** 1,013ms ❌ (Critical bottleneck)

**Root Cause:** Netlify Functions cold starts (300-500ms+) combined with SSR overhead.

---

## ❌ Why Netlify Edge Functions Aren't Viable

### The Incompatibility

WakeUpNPC uses **three share image generation API routes** that depend on `@nuxt/content`:

```
server/api/share/
├── claim/[slug].png.ts
├── meme/[slug].png.ts
└── quote/[slug].png.ts
```

All three routes import `#content/server` from `@nuxt/content`:

```typescript
// @ts-ignore dynamic import
const { serverQueryContent } = await import('#content/server')
```

**The Problem:**

- `#content/server` is a **virtual module** that only exists in Node.js runtime
- Netlify Edge Functions use **Deno runtime** (not Node.js)
- This virtual module **cannot be resolved** in the edge environment
- Nitro's bundler fails when trying to compile these routes for edge

### Attempted Solutions That Failed

1. **Route Rules Approach:**

   ```typescript
   routeRules: {
     '/api/share/**': { runtime: 'nodejs' }
   }
   ```

   - Nitro still tries to bundle these routes for edge during build
   - Build fails before runtime selection can take effect

2. **Hybrid Deployment:**
   - Not possible with current Nuxt/Nitro architecture
   - Can't mix edge and Node.js runtimes in single deployment

### The Verdict

**Netlify Edge Functions are incompatible with @nuxt/content server APIs.**

To use Edge Functions, you would need to:

- Remove all share image generation routes, OR
- Rewrite them to not use `@nuxt/content` (fetch from static JSON instead), OR
- Move to a different content management solution

None of these are practical for WakeUpNPC.

---

## ✅ Alternative Optimization Strategies

Since Edge Functions aren't viable, here are proven strategies to reduce server response time:

### 1. **Optimize Netlify Functions (Current Approach)**

**What's Already Working:**

- Nuxt 4.2.2 experimental features reducing bundle size by 39%
- Aggressive caching headers for static assets
- Brotli/Gzip compression enabled
- Prerendering of static routes

**Additional Optimizations:**

#### A. Reduce Function Bundle Size

```typescript
// nuxt.config.ts - Already implemented
experimental: {
  extractAsyncDataHandlers: true, // 39% bundle reduction
}
```

#### B. Increase Function Memory (Faster Cold Starts)

```toml
# netlify.toml
[functions]
  node_bundler = "esbuild"
  # Increase memory allocation (faster cold starts)
  # Default is 1024MB, max is 3008MB on Pro plan
  memory = 2048
```

#### C. Keep Functions Warm

- Use Netlify's scheduled functions to ping every 5 minutes
- Prevents cold starts during low-traffic periods
- Only works on Pro/Business plans

### 2. **Static Site Generation (SSG) for Key Pages**

**Current State:**

- Only homepage is prerendered
- All content pages are SSR (server-side rendered)

**Opportunity:**

```typescript
// nuxt.config.ts
nitro: {
  prerender: {
    routes: [
      '/',
      '/about',
      '/advertising',
      // Prerender top 50 most popular memes/quotes
      ...getTopContentRoutes()
    ],
    crawlLinks: true,
  }
}
```

**Benefits:**

- Zero server response time for prerendered pages
- Instant page loads
- Reduced function invocations

**Trade-offs:**

- Longer build times
- Content updates require rebuild
- Not suitable for dynamic content (likes, etc.)

### 3. **Incremental Static Regeneration (ISR)**

**What It Is:**

- Prerender pages at build time
- Regenerate in background when stale
- Serve stale content while regenerating

**Implementation:**

```typescript
// nuxt.config.ts
nitro: {
  routeRules: {
    '/meme/**': {
      isr: 3600, // Regenerate every hour
      cache: {
        maxAge: 3600,
        staleMaxAge: 86400
      }
    },
    '/quote/**': {
      isr: 3600
    },
  }
}
```

**Benefits:**

- Fast response times (serve from cache)
- Content stays relatively fresh
- Reduced function invocations

### 4. **Client-Side Rendering (CSR) for Non-Critical Content**

**Current State:**

- Everything is SSR (server-side rendered)

**Opportunity:**

```typescript
// For components that don't need SEO
<ClientOnly>
  <AdCard />
</ClientOnly>

// Or disable SSR for specific routes
routeRules: {
  '/admin/**': { ssr: false }
}
```

**Benefits:**

- Reduces server processing time
- Faster initial HTML response
- Better for authenticated/dynamic content

**Trade-offs:**

- No SEO for CSR content
- Requires JavaScript to render

### 5. **Content Caching Strategy**

**Current Implementation:**

- Content loaded from JSON files in `public/`
- Already pretty fast

**Enhancement:**

```typescript
// Add stale-while-revalidate for API routes
routeRules: {
  '/api/content/**': {
    cache: {
      maxAge: 300, // 5 minutes
      staleMaxAge: 3600, // Serve stale for 1 hour while revalidating
    }
  }
}
```

### 6. **Database/Storage Optimization**

**Current State:**

- Likes stored in Netlify Blobs
- Content in static JSON files

**Consideration:**

- Netlify Blobs are already fast
- Static JSON is optimal for read-heavy content
- No changes needed here

---

## 📊 Recommended Action Plan

### Phase 1: Quick Wins (Immediate)

1. **Increase Function Memory**

   ```toml
   [functions]
     memory = 2048
   ```

   - Expected improvement: 10-15% faster cold starts

2. **Expand Prerendering**
   - Prerender `/about` and `/advertising`
   - Expected improvement: Zero server time for these pages

### Phase 2: Medium Effort (This Week)

3. **Implement ISR for Content Pages**
   - Add ISR rules for meme/quote/grift pages
   - Expected improvement: 50-70% reduction in server response time

4. **Optimize Share Image Generation**
   - Cache generated images more aggressively
   - Consider pre-generating for popular content

### Phase 3: Long Term (Future)

5. **Selective SSG**
   - Identify top 100 most-viewed pages
   - Prerender at build time
   - Expected improvement: Zero server time for top content

6. **Consider CDN-Level Caching**
   - Netlify Pro plan includes better edge caching
   - Can cache HTML at edge for configured duration

---

## 🎯 Realistic Expectations

### With Current Netlify Functions

| Optimization       | Expected Server Response Time | Effort |
| ------------------ | ----------------------------- | ------ |
| **Baseline**       | 1,013ms                       | -      |
| + Increased Memory | 850-900ms                     | Low    |
| + ISR for Content  | 200-400ms (cached)            | Medium |
| + Expanded SSG     | 0ms (prerendered pages)       | Medium |
| **Best Case**      | 200-400ms average             | -      |

### Why Not < 600ms Consistently?

- Netlify Functions will always have some cold start overhead
- First request after idle period will be slower
- Subsequent requests benefit from warm functions
- ISR provides best balance of speed and freshness

---

## 🚀 Next Steps

1. **Deploy current Nuxt 4.2.2 optimizations** (already done)
2. **Add function memory configuration** to netlify.toml
3. **Implement ISR** for content pages
4. **Measure results** with Lighthouse
5. **Iterate** based on data

---

## 📚 References

- [Netlify Functions Configuration](https://docs.netlify.com/functions/configure-and-deploy/)
- [Nuxt ISR Documentation](https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering)
- [Nitro Route Rules](https://nitro.unjs.io/config#routerules)

---

**Related Documentation:**

- [NUXT_4.2_PERFORMANCE_OPTIMIZATIONS.md](./NUXT_4.2_PERFORMANCE_OPTIMIZATIONS.md)
- [LIGHTHOUSE_PERFORMANCE_AFTER_NUXT_4.2_OPTIMIZATIONS.md](./LIGHTHOUSE_PERFORMANCE_AFTER_NUXT_4.2_OPTIMIZATIONS.md)
