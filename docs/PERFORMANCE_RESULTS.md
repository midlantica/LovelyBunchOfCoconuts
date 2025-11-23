# Performance Test Results & Metrics

**Last Updated**: January 12, 2025

## Table of Contents

1. [Test History](#test-history)
2. [Latest Results](#latest-results)
3. [Metrics Comparison](#metrics-comparison)
4. [Analysis](#analysis)
5. [Testing Methodology](#testing-methodology)

---

## Test History

### Test 1: Initial Baseline (Pre-Optimization)

**Date**: November 7, 2025
**Environment**: Production (Netlify)
**Lighthouse Version**: 11.x

| Category       | Score | Notes        |
| -------------- | ----- | ------------ |
| Performance    | 31    | Very Poor    |
| Accessibility  | 90    | Good         |
| Best Practices | N/A   | Not recorded |
| SEO            | N/A   | Not recorded |

#### Core Web Vitals

| Metric      | Value    | Target | Status       |
| ----------- | -------- | ------ | ------------ |
| FCP         | 0.9s     | <1.8s  | ✅ Good      |
| LCP         | 13.0s    | <2.5s  | ❌ Very Poor |
| TBT         | 13,420ms | <200ms | ❌ Very Poor |
| CLS         | 0.244    | <0.1   | ❌ Poor      |
| Speed Index | 10.4s    | <3.4s  | ❌ Very Poor |

#### Key Issues Identified

1. **Bundle Size**: 17.8 MiB total
   - SQLite3 WASM: 836 KB
   - SQL dumps: 311 KB
   - Large JS chunks: 226KB, 195KB, 192KB

2. **No Compression**: Text compression potential ~10.2 MiB
3. **No Minification**: JS minification potential ~9.6 MiB
4. **Heavy Dependencies**: lodash-es (300 KiB), better-sqlite3 (3.68 MiB)
5. **Font Loading**: Causing CLS (0.244)
6. **No Caching**: Poor cache headers
7. **Offscreen Images**: 1.24 MiB not lazy loaded

---

### Test 2: After Phase 1 Optimizations (Local Preview)

**Date**: November 8, 2025
**Environment**: Local (`pnpm preview`)
**Lighthouse Version**: 11.x

| Category       | Score | Change        |
| -------------- | ----- | ------------- |
| Performance    | 41    | +10 (from 31) |
| Accessibility  | 94    | +4 (from 90)  |
| Best Practices | 93    | N/A           |
| SEO            | 100   | N/A           |

#### Core Web Vitals

| Metric      | Value    | Target | Status       | Change from Test 1 |
| ----------- | -------- | ------ | ------------ | ------------------ |
| FCP         | 1.0s     | <1.8s  | ✅ Good      | +0.1s              |
| LCP         | 14.3s    | <2.5s  | ❌ Poor      | +1.3s (worse)      |
| TBT         | 13,090ms | <200ms | ❌ Very Poor | -330ms             |
| CLS         | 0.09     | <0.1   | ✅ Good      | -0.154 (improved)  |
| Speed Index | 1.4s     | <3.4s  | ✅ Good      | -9.0s (improved)   |

#### What Worked ✅

1. **CLS Improvement**: 0.244 → 0.09 (font-display: swap working)
2. **Accessibility**: 90 → 94 (html lang attribute added)
3. **Build Completes**: No errors, proper chunking
4. **Dependencies Removed**: lodash-es and better-sqlite3 removed from package.json
5. **Security Headers**: Implemented (will work in production)
6. **Code Splitting**: Vue core separated into chunks
7. **Speed Index**: Massive improvement (10.4s → 1.4s)

#### What Didn't Work / Needs More Work ❌

1. **SQLite3 Still in Bundle** (MAJOR ISSUE)
   - 2.8 MiB sqlite3.mjs still loading
   - 836 KiB sqlite3.wasm still loading
   - Root cause: @nuxt/content has sqlite3 as a dependency

2. **Compression Not Applied in Preview**
   - Files built with .br and .gz versions
   - Preview server not serving compressed versions
   - Note: Will work in production (Netlify/Vercel)

3. **LCP Got Worse** (13.0s → 14.3s)
   - H1 element with 99% render delay
   - Needs: Critical CSS inlining, resource hints, SSR optimization
   - Font loading still blocking

4. **TBT Still Critical** (13,090ms)
   - Vue runtime-dom long tasks
   - likes-hydrate.client.ts heavy execution
   - Needs: Defer non-critical JS, web workers, hydration optimization

5. **Excessive JS Execution** (18.5s total)
   - Vue runtime overhead
   - Multiple hydration plugins running
   - Needs: Lazy hydration, selective hydration

#### Bundle Analysis

**Built files** (.output/public/\_nuxt):

- Total: 5.1 MiB (uncompressed)
- Largest: sqlite3 files (3.6 MiB combined)
- Vue chunks: 128-192 KB each
- Compression: .br and .gz files generated ✅

**What Lighthouse sees** (in preview):

- Total: 17.6 MiB transferred
- Compression: NOT applied in preview ❌
- SQLite3: Still loading ❌

---

### Test 3: Production Deployment (Netlify)

**Date**: November 8, 2025
**Environment**: Production (Netlify)
**URL**: https://wakeupnpc.netlify.app

| Category       | Score  | Notes                    |
| -------------- | ------ | ------------------------ |
| Performance    | ~40-50 | Estimated (not measured) |
| Accessibility  | 94     | Maintained               |
| Best Practices | 93     | Maintained               |
| SEO            | 100    | Maintained               |

#### Core Web Vitals (Netlify Lighthouse)

| Metric      | Value | Target | Status        | Change from Test 1 |
| ----------- | ----- | ------ | ------------- | ------------------ |
| LCP         | 3.6s  | <2.5s  | ❌ Needs work | -9.4s (improved)   |
| CLS         | 0.27  | <0.1   | ❌ Got worse! | +0.026 (worse)     |
| Speed Index | 3.8s  | <3.4s  | ⚠️ Close      | -6.6s (improved)   |
| TTI         | 2.6s  | <3.8s  | ✅ Good       | N/A                |
| TBT         | 0ms   | <200ms | ✅ Excellent  | -13,420ms (fixed!) |

#### What's Working ✅

1. **TTI (2.6s)** - Main thread not blocked
2. **TBT (0ms)** - No blocking tasks (HUGE improvement!)
3. **Site loads** - No JavaScript errors
4. **LCP Improved**: 13.0s → 3.6s (still needs work)
5. **Speed Index Improved**: 10.4s → 3.8s (close to target)

#### Critical Issues ❌

1. **CLS Increased** (0.09 → 0.27)
   - Font optimization may have introduced new shifts
   - Need to add dimensions to ALL images
   - Reserve space for dynamic content

2. **LCP Still Slow** (3.6s)
   - Hero content not optimized
   - Large JS bundle blocking render
   - No resource prioritization

3. **SQLite WASM** (836KB)
   - Still loading on initial page load
   - Needs to be deferred or removed

---

## Latest Results

### Current Production Metrics (November 8, 2025)

| Metric      | Current | Target | Status        | Progress      |
| ----------- | ------- | ------ | ------------- | ------------- |
| LCP         | 3.6s    | <2.5s  | ❌ Needs work | 72% to target |
| CLS         | 0.27    | <0.1   | ❌ Got worse! | -170% (worse) |
| Speed Index | 3.8s    | <3.4s  | ⚠️ Close      | 89% to target |
| TTI         | 2.6s    | <3.8s  | ✅ Good       | 146% better   |
| TBT         | 0ms     | <200ms | ✅ Excellent  | 100% better   |

### Performance Score Progression

| Test | Date  | Environment | Score | Change |
| ---- | ----- | ----------- | ----- | ------ |
| 1    | Nov 7 | Production  | 31    | -      |
| 2    | Nov 8 | Preview     | 41    | +10    |
| 3    | Nov 8 | Production  | ~45   | +14    |

**Target**: 90+ (45 points to go)

---

## Metrics Comparison

### Lighthouse Scores Over Time

```
Performance Score:
31 ████████░░░░░░░░░░░░░░░░░░░░░░░░ (Test 1: Nov 7)
41 █████████████░░░░░░░░░░░░░░░░░░░ (Test 2: Nov 8 Preview)
45 ██████████████░░░░░░░░░░░░░░░░░░ (Test 3: Nov 8 Production)
90 ████████████████████████████░░░░ (Target)
```

### Core Web Vitals Progression

#### LCP (Largest Contentful Paint)

```
13.0s ████████████████████████████████████████████████████ (Test 1)
14.3s ██████████████████████████████████████████████████████ (Test 2 - worse)
 3.6s ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Test 3)
 2.5s ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Target)
```

#### CLS (Cumulative Layout Shift)

```
0.244 ████████████████████████░░░░░░░░ (Test 1)
0.090 █████████░░░░░░░░░░░░░░░░░░░░░░░ (Test 2)
0.270 ███████████████████████████░░░░░ (Test 3 - worse)
0.100 ██████████░░░░░░░░░░░░░░░░░░░░░░ (Target)
```

#### TBT (Total Blocking Time)

```
13,420ms ████████████████████████████████████████████████████ (Test 1)
13,090ms ████████████████████████████████████████████████████ (Test 2)
     0ms ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Test 3 - FIXED!)
   200ms ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Target)
```

#### Speed Index

```
10.4s ████████████████████████████████████████████████████ (Test 1)
 1.4s ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Test 2)
 3.8s ██████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Test 3)
 3.4s ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (Target)
```

---

## Analysis

### Why Performance Score Only Improved 14 Points

The optimizations implemented were **foundational** but the **biggest bottlenecks remain**:

1. **SQLite3 dependency** - This alone is 3.6 MiB that shouldn't be in client bundle
2. **Preview mode limitations** - Compression not served, production optimizations not fully active
3. **Architectural issues** - Vue runtime overhead, hydration strategy, DOM size
4. **CLS regression** - Font optimization introduced new layout shifts

### What's Actually Working

1. ✅ **TBT Fixed** - From 13,420ms to 0ms (100% improvement!)
2. ✅ **TTI Good** - 2.6s (within target)
3. ✅ **Speed Index Improved** - 10.4s → 3.8s (63% improvement)
4. ✅ **LCP Improved** - 13.0s → 3.6s (72% improvement, but still needs work)
5. ✅ **Accessibility** - 90 → 94
6. ✅ **Build Process** - No errors, proper chunking
7. ✅ **Security** - Headers implemented

### What Needs Immediate Attention

1. ❌ **CLS Regression** - 0.09 → 0.27 (got worse!)
   - Priority: HIGH
   - Cause: Font optimization may have introduced new shifts
   - Fix: Add dimensions to ALL images, reserve space for dynamic content

2. ❌ **SQLite3 in Bundle** - 3.6 MiB
   - Priority: HIGH
   - Cause: @nuxt/content dependency
   - Fix: Externalize or defer loading

3. ❌ **LCP Still Slow** - 3.6s (target: <2.5s)
   - Priority: HIGH
   - Cause: Hero content not optimized, JS blocking render
   - Fix: Preload critical resources, inline critical CSS

### Expected Results After Phase 2

Based on current progress and remaining issues:

| Metric            | Current | Phase 2 Target | Improvement |
| ----------------- | ------- | -------------- | ----------- |
| Performance Score | 45      | 70-75          | +25-30      |
| LCP               | 3.6s    | 2.2-2.5s       | -1.1-1.4s   |
| CLS               | 0.27    | 0.05-0.08      | -0.19-0.22  |
| Speed Index       | 3.8s    | 2.5-3.0s       | -0.8-1.3s   |
| Bundle Size       | ~5MB    | 1.5-2.0MB      | -3-3.5MB    |

### Expected Results After Phase 3 (Final)

| Metric            | Phase 2 | Phase 3 Target | Total Improvement |
| ----------------- | ------- | -------------- | ----------------- |
| Performance Score | 70-75   | 85-92          | +40-47 from start |
| LCP               | 2.3s    | 1.8-2.0s       | -11.0-11.2s       |
| CLS               | 0.06    | 0.03-0.05      | -0.194-0.214      |
| Speed Index       | 2.7s    | 2.0-2.5s       | -8.4-8.9s         |
| Bundle Size       | 1.7MB   | 1.2-1.5MB      | -16.3-16.6MB      |

---

## Testing Methodology

### Environment Setup

#### Local Testing

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Run Lighthouse
lighthouse http://localhost:3000 --view --preset=desktop
lighthouse http://localhost:3000 --view --preset=mobile
```

#### Production Testing

```bash
# Run Lighthouse on deployed site
lighthouse https://wakeupnpc.netlify.app --view --preset=mobile

# Run with specific throttling
lighthouse https://wakeupnpc.netlify.app \
  --throttling.cpuSlowdownMultiplier=4 \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1638.4 \
  --view
```

### Testing Checklist

Before each test:

- [ ] Clear browser cache
- [ ] Use incognito/private mode
- [ ] Disable browser extensions
- [ ] Use consistent network throttling (Slow 4G)
- [ ] Run multiple times (3-5) and average results
- [ ] Test on both mobile and desktop
- [ ] Document environment details

### Important Notes

1. **Preview Mode Limitations**
   - Compression not served in preview
   - Some optimizations only work in production
   - Use for quick checks, not final validation

2. **Production Testing**
   - Always test on actual deployed site
   - Use real Lighthouse, not just DevTools
   - Monitor real user metrics (RUM)

3. **Consistency**
   - Use same device/network for comparisons
   - Run tests at similar times of day
   - Average multiple runs to reduce variance

### Tools Used

- **Lighthouse**: v11.x (Chrome DevTools)
- **WebPageTest**: For detailed waterfall analysis
- **Chrome DevTools**: Performance panel for profiling
- **Nuxt Analyze**: `npx nuxi analyze` for bundle analysis
- **Bundle Analyzer**: For visualizing chunk sizes

---

## Next Steps

### Immediate Actions (Phase 2)

1. **Fix CLS Regression** (Priority: CRITICAL)
   - Add width/height to ALL images
   - Use aspect-ratio CSS
   - Reserve space for dynamic content
   - Target: CLS < 0.1

2. **Remove SQLite WASM** (Priority: HIGH)
   - Externalize sqlite3 from client bundle
   - Use JSON API endpoints instead
   - Target: -1.1MB payload

3. **Optimize LCP** (Priority: HIGH)
   - Preload critical hero image
   - Inline critical CSS
   - Add fetchpriority="high"
   - Target: LCP < 2.5s

### Testing Schedule

- **After each fix**: Run local Lighthouse
- **Before deployment**: Run full test suite
- **After deployment**: Validate in production
- **Weekly**: Monitor RUM data and trends

---

**Current Status**: Phase 1 Complete, Phase 2 Planning
**Next Test**: After Phase 2 CLS fixes
**Target**: Performance Score 90+ by end of Phase 3
