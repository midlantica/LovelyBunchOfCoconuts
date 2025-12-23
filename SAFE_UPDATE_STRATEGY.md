# Safe Package Update Strategy for WakeUpNPC2

## 🎯 Overview

You have 23 packages with available updates. Here's a strategic, phased approach to update them safely without breaking Netlify production.

## ⚠️ Key Issues Identified

1. **Node Version Mismatch**:
   - `package.json` specifies: `>=20.18.0 <23`
   - `.nvmrc` and `netlify.toml` use: `22.11.0`
   - ✅ This is compatible, but be aware

2. **Version Pinning Issue**:
   - `@nuxt/content` is pinned to `3.8.0` (no caret `^`)
   - Current installed: `3.8.2` (newer than pinned!)
   - Latest available: `3.9.0`

## 📊 Update Categories

### 🟢 LOW RISK - Safe to update (patch/minor versions)

These are mostly patch updates and dev dependencies:

```bash
# Linting & Formatting (dev only - won't affect production)
@typescript-eslint/parser: 8.48.0 → 8.50.1
eslint: 9.39.1 → 9.39.2
eslint-plugin-vue: 10.6.0 → 10.6.2
prettier: 3.6.2 → 3.7.4
prettier-plugin-tailwindcss: 0.7.1 → 0.7.2

# Tailwind (minor patch)
@tailwindcss/cli: 4.1.17 → 4.1.18
@tailwindcss/postcss: 4.1.17 → 4.1.18
@tailwindcss/vite: 4.1.17 → 4.1.18
tailwindcss: 4.1.17 → 4.1.18

# Vue ecosystem (patch updates)
vue: 3.5.25 → 3.5.26
vue-router: 4.6.3 → 4.6.4
```

### 🟡 MEDIUM RISK - Test carefully

These affect core functionality:

```bash
# Nuxt core (patch update)
nuxt: 4.2.1 → 4.2.2
@nuxt/kit: 4.2.1 → 4.2.2

# Nuxt plugins (minor updates)
@nuxt/icon: 2.1.0 → 2.1.1
@nuxtjs/sitemap: 7.4.7 → 7.5.0

# Netlify integration
@netlify/blobs: 10.4.1 → 10.5.0

# Canvas (for image generation)
@napi-rs/canvas: 0.1.82 → 0.1.86
```

### 🔴 HIGH RISK - Requires careful testing

These have larger version jumps or affect content:

```bash
# Content system (minor version jump + pinning issue)
@nuxt/content: 3.8.0 → 3.9.0 (pinned, but 3.8.2 installed!)
@nuxtjs/mdc: 0.18.2 → 0.19.1 (minor version bump)

# ESLint (larger jump)
@nuxt/eslint: 1.10.0 → 1.12.1

# OXC bindings (large version jump - Linux build tools)
@oxc-minify/binding-linux-x64-gnu: 0.97.0 → 0.105.0
@oxc-parser/binding-linux-x64-gnu: 0.97.0 → 0.105.0
@oxc-transform/binding-linux-x64-gnu: 0.97.0 → 0.105.0
```

## 🚀 Recommended Phased Approach

### Phase 1: Dev Dependencies Only (Safest)

Update linting/formatting tools that don't affect production:

```bash
pnpm update @typescript-eslint/parser eslint eslint-plugin-vue prettier prettier-plugin-tailwindcss
```

**Test**: Run `pnpm lint` and `pnpm dev` locally

---

### Phase 2: Tailwind & Vue Patches

Minor patches to styling and Vue:

```bash
pnpm update @tailwindcss/cli @tailwindcss/postcss @tailwindcss/vite tailwindcss vue vue-router
```

**Test**:

- Run `pnpm dev` and check all pages
- Verify Tailwind styles render correctly
- Test responsive design

---

### Phase 3: Nuxt Core & Plugins

Update Nuxt framework and related plugins:

```bash
pnpm update nuxt @nuxt/kit @nuxt/icon @nuxtjs/sitemap
```

**Test**:

- Run `pnpm dev` - check all routes
- Test sitemap generation
- Verify icons display correctly
- Run `pnpm build` locally

---

### Phase 4: Content System (CAREFUL!)

This is where breaks often happen:

```bash
# First, fix the pinning issue in package.json
# Change: "@nuxt/content": "3.8.0"
# To:     "@nuxt/content": "^3.8.0"

pnpm update @nuxt/content @nuxtjs/mdc
```

**Test**:

- Verify all content types load (posts, memes, quotes, grifts)
- Check markdown rendering
- Test content queries
- Verify frontmatter parsing
- Run `pnpm validate-frontmatter:strict`

---

### Phase 5: Infrastructure

Update Netlify and canvas dependencies:

```bash
pnpm update @netlify/blobs @napi-rs/canvas
```

**Test**:

- Test image generation features
- Verify share image generation works
- Check any Netlify Blobs functionality

---

### Phase 6: Build Tools (Optional)

OXC bindings - only if needed:

```bash
pnpm update @oxc-minify/binding-linux-x64-gnu @oxc-parser/binding-linux-x64-gnu @oxc-transform/binding-linux-x64-gnu
```

**Test**: Full build and deploy to Netlify preview

---

## 🛡️ Safety Measures

### Before ANY Updates:

1. **Create a Git Branch**:

   ```bash
   git checkout -b package-updates-$(date +%Y%m%d)
   git push -u origin package-updates-$(date +%Y%m%d)
   ```

2. **Backup Current State**:

   ```bash
   cp package.json package.json.backup
   cp pnpm-lock.yaml pnpm-lock.yaml.backup
   ```

3. **Document Current Working State**:
   ```bash
   git add -A
   git commit -m "Pre-update checkpoint: All working"
   ```

### After Each Phase:

1. **Local Testing**:

   ```bash
   pnpm dev
   # Test all major features
   pnpm build
   # Verify build succeeds
   ```

2. **Commit Changes**:

   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "Phase X: Updated [package names]"
   ```

3. **Deploy to Netlify Preview**:

   ```bash
   git push
   # Wait for Netlify preview deploy
   # Test preview site thoroughly
   ```

4. **If Something Breaks**:
   ```bash
   git revert HEAD
   # Or restore from backup:
   cp package.json.backup package.json
   cp pnpm-lock.yaml.backup pnpm-lock.yaml
   pnpm install
   ```

---

## 🎯 Quick Win Option (Conservative)

If you want to be VERY safe, just update dev dependencies:

```bash
# One-liner for safest updates
pnpm update @typescript-eslint/parser eslint eslint-plugin-vue prettier prettier-plugin-tailwindcss @tailwindcss/cli @tailwindcss/postcss @tailwindcss/vite tailwindcss
```

This updates 9 packages with zero production risk.

---

## 🚨 Rollback Procedure

If Netlify deploy fails:

1. **Immediate Rollback**:

   ```bash
   git revert HEAD
   git push
   ```

2. **Or restore from backup**:

   ```bash
   cp package.json.backup package.json
   cp pnpm-lock.yaml.backup pnpm-lock.yaml
   pnpm install
   git add package.json pnpm-lock.yaml
   git commit -m "Rollback: Restored working versions"
   git push
   ```

3. **Netlify will auto-deploy the rollback**

---

## 📝 Specific Issues to Watch For

### @nuxt/content Update

- **Risk**: Content queries might break
- **Test**: All content types load correctly
- **Fallback**: Pin to current working version

### @nuxtjs/mdc Update (0.18 → 0.19)

- **Risk**: Markdown rendering changes
- **Test**: Check all markdown content displays correctly
- **Watch**: Code blocks, tables, custom components

### Nuxt 4.2.1 → 4.2.2

- **Risk**: Low (patch update)
- **Test**: Full site functionality
- **Note**: Should be safe, but test thoroughly

### OXC Bindings

- **Risk**: Build failures on Netlify
- **Why**: These are Linux-specific build tools
- **Recommendation**: Update LAST, or skip if not needed

---

## 🎬 Recommended Action Plan

**My Suggestion**: Start with Phase 1 + 2 combined:

```bash
# Create safety branch
git checkout -b safe-package-updates
git push -u origin safe-package-updates

# Backup
cp package.json package.json.backup
cp pnpm-lock.yaml pnpm-lock.yaml.backup

# Update safest packages (14 packages)
pnpm update @typescript-eslint/parser eslint eslint-plugin-vue prettier prettier-plugin-tailwindcss @tailwindcss/cli @tailwindcss/postcss @tailwindcss/vite tailwindcss vue vue-router

# Test locally
pnpm dev
# Browse site, test features
pnpm build
# Verify build works

# Commit and test on Netlify
git add package.json pnpm-lock.yaml
git commit -m "Update: Dev dependencies, Tailwind, and Vue (14 packages)"
git push

# Wait for Netlify preview, test thoroughly
# If good, continue with Phase 3
```

---

## 📊 Summary

- **Total packages to update**: 23
- **Low risk**: 14 packages (dev deps, Tailwind, Vue patches)
- **Medium risk**: 6 packages (Nuxt core, plugins, Netlify)
- **High risk**: 3 packages (Content system, ESLint, OXC)

**Recommendation**: Update in phases, test each phase on Netlify preview before proceeding.

---

## 🔧 Fix the @nuxt/content Pinning Issue

Your `package.json` has:

```json
"@nuxt/content": "3.8.0"
```

But `3.8.2` is installed (newer!). This suggests the pin was added after installation.

**Fix**: Add the caret to allow patch updates:

```json
"@nuxt/content": "^3.8.0"
```

Or if you want to stay on 3.8.x:

```json
"@nuxt/content": "~3.8.0"
```

This prevents confusion and allows safe patch updates.
