# Nuxtr Extension Update Count - Explanation

**Date:** January 20, 2026
**Status:** ✅ RESOLVED - Nuxtr now showing correct count!

## Timeline

1. **Initial State:** Nuxtr showed 104 updates (misleading - included transitive dependencies)
2. **After Reload:** Nuxtr now shows 12 updates (correct - matches `pnpm outdated`)

## What Happened

After running "Developer: Reload Window" in VS Code, the Nuxtr extension refreshed its dependency analysis and now correctly shows **12 updates** - the actual number of direct dependencies that have updates available.

### The 12 Real Updates

According to `pnpm outdated`, here are the **actual** updates you can control:

```
┌────────────────────────────────────────────┬─────────┬─────────┐
│ Package                                    │ Current │ Latest  │
├────────────────────────────────────────────┼─────────┼─────────┤
│ @nuxt/kit (dev)                            │ 4.2.1   │ 4.2.2   │
│ @tailwindcss/cli (dev)                     │ 4.1.17  │ 4.1.18  │
│ nuxt                                       │ 4.2.1   │ 4.2.2   │
│ tailwindcss (dev)                          │ 4.1.17  │ 4.1.18  │
│ @nuxt/content                              │ 3.9.0   │ 3.11.0  │
│ @nuxt/eslint                               │ 1.10.0  │ 1.12.1  │
│ @nuxtjs/sitemap (dev)                      │ 7.4.7   │ 7.5.2   │
│ globals (dev)                              │ 16.5.0  │ 17.0.0  │
│ @nuxtjs/mdc                                │ 0.19.2  │ 0.20.0  │
│ @oxc-minify/binding-linux-x64-gnu (dev)    │ 0.97.0  │ 0.110.0 │
│ @oxc-parser/binding-linux-x64-gnu (dev)    │ 0.97.0  │ 0.110.0 │
│ @oxc-transform/binding-linux-x64-gnu (dev) │ 0.97.0  │ 0.110.0 │
└────────────────────────────────────────────┴─────────┴─────────┘
```

## Why the Count Changed

The initial 104 count likely included:

1. **Transitive dependencies** - packages that your dependencies depend on
2. **Peer dependencies** with available updates
3. **Nested dependency tree** updates

After the reload, Nuxtr correctly filtered to show only **direct dependencies** from your `package.json`.

## Update Strategy

### ❌ Known Issues - DO NOT UPDATE

- **`nuxt 4.2.2`** - Has OXC transform bug (stay on 4.2.1)
- **`@nuxt/kit 4.2.2`** - Same issue as nuxt
- **`@nuxtjs/mdc 0.20.0`** - May require new dependencies (0.19.2 just worked)

### ✅ Safe to Update (Low Risk)

- **`@tailwindcss/cli 4.1.17 → 4.1.18`** - Patch update
- **`tailwindcss 4.1.17 → 4.1.18`** - Patch update
- **`@nuxt/content 3.9.0 → 3.11.0`** - 2 minor versions (test carefully)
- **`@nuxt/eslint 1.10.0 → 1.12.1`** - Minor updates
- **`@nuxtjs/sitemap 7.4.7 → 7.5.2`** - Minor updates

### ⚠️ Risky Updates (Proceed with Caution)

- **`globals 16.5.0 → 17.0.0`** - Major version (breaking changes possible)
- **`@oxc-* packages 0.97.0 → 0.110.0`** - 13 minor versions (significant jump)

## Recommended Action Plan

### Phase 1: Tailwind Updates (Safest)

```bash
pnpm update @tailwindcss/cli tailwindcss
```

### Phase 2: Nuxt Ecosystem (Medium Risk)

```bash
pnpm update @nuxt/content @nuxt/eslint @nuxtjs/sitemap
```

### Phase 3: Wait for Nuxt 4.2.3

- Monitor for Nuxt 4.2.3 release (should fix OXC bug)
- Then update `nuxt` and `@nuxt/kit`

### Phase 4: Evaluate Risky Updates

- Research `globals@17` breaking changes
- Test OXC packages in isolation
- Consider if updates are necessary

## Summary

✅ **Nuxtr is now accurate!**

- Shows 12 updates (correct)
- Matches `pnpm outdated` output
- No longer counting transitive dependencies

📊 **Update Breakdown:**

- **Safe to update now:** 5 packages
- **Blocked by bugs:** 3 packages (Nuxt 4.2.2, @nuxt/kit 4.2.2, @nuxtjs/mdc 0.20.0)
- **Risky updates:** 4 packages (major versions or big jumps)

🎯 **Your project is in excellent shape!** The 12 updates are manageable, and you already know which ones to avoid.
