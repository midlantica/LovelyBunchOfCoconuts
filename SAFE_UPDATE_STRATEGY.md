# Safe Package Update Strategy for WakeUpNPC2

## ✅ Last Updated: 2026-04-29

**20 packages updated** on branch `package-updates-20260429` — lint ✓, build ✓

---

## 📊 Current State (post Apr 29 update)

### ✅ Recently Updated (Apr 29, 2026)

| Package                                | From    | To      | Type      |
| -------------------------------------- | ------- | ------- | --------- |
| `@napi-rs/canvas`                      | 0.1.96  | 0.1.100 | patch     |
| `@netlify/blobs`                       | 10.7.2  | 10.7.4  | patch     |
| `@nuxt/content`                        | 3.12.0  | 3.13.0  | minor     |
| `tailwindcss`                          | 4.2.1   | 4.2.4   | patch/dev |
| `@tailwindcss/cli`                     | 4.2.1   | 4.2.4   | patch/dev |
| `@tailwindcss/postcss`                 | 4.2.1   | 4.2.4   | patch/dev |
| `@tailwindcss/vite`                    | 4.2.1   | 4.2.4   | patch/dev |
| `@eslint/css`                          | 1.0.0   | 1.1.0   | minor/dev |
| `@eslint/json`                         | 1.1.0   | 1.2.0   | minor/dev |
| `@typescript-eslint/parser`            | 8.57.0  | 8.59.1  | patch/dev |
| `baseline-browser-mapping`             | 2.10.7  | 2.10.24 | patch/dev |
| `eslint`                               | 10.0.3  | 10.2.1  | patch/dev |
| `eslint-plugin-vue`                    | 10.8.0  | 10.9.0  | minor/dev |
| `globals`                              | 17.4.0  | 17.5.0  | minor/dev |
| `@oxc-minify/binding-linux-x64-gnu`    | 0.118.0 | 0.128.0 | patch/dev |
| `@oxc-parser/binding-linux-x64-gnu`    | 0.118.0 | 0.128.0 | patch/dev |
| `@oxc-transform/binding-linux-x64-gnu` | 0.118.0 | 0.128.0 | patch/dev |
| `prettier`                             | 3.8.1   | 3.8.3   | patch/dev |
| `vue`                                  | 3.5.30  | 3.5.33  | patch     |
| `vue-router`                           | 5.0.3   | 5.0.6   | patch     |

---

## 🚨 Skipped — Major Version Bumps (Breaking Changes)

These require dedicated migration work — **do NOT update with `pnpm update`**:

| Package                       | Current | Latest | Risk                                                      |
| ----------------------------- | ------- | ------ | --------------------------------------------------------- |
| `@eslint/markdown`            | 7.5.1   | 8.0.1  | 🔴 Major — API changes, check eslint.config.js            |
| `@nuxtjs/sitemap`             | 7.6.0   | 8.0.14 | 🔴 Major — significant config changes                     |
| `typescript`                  | 5.9.3   | 6.0.3  | 🔴 Major — type system changes, broad impact              |
| `@netlify/nuxt`               | 0.2.34  | 0.3.1  | 🟡 Minor bump but significant — test Netlify deploy first |
| `prettier-plugin-tailwindcss` | 0.7.2   | 0.8.0  | 🔴 Major — may change formatting, review diffs carefully  |

### Migration Notes

**typescript 5 → 6**: Significant type system changes. Wait for Nuxt ecosystem (nuxt, @nuxt/kit, etc.) to officially support TS 6 before upgrading. Check `nuxt` release notes.

**@nuxtjs/sitemap 7 → 8**: Major config overhaul. Review the [v8 migration guide](https://nuxtseo.com/sitemap/getting-started/migration) before upgrading.

**@eslint/markdown 7 → 8**: Dev-only, but check `eslint.config.js` for any API changes before updating.

**prettier-plugin-tailwindcss 0.7 → 0.8**: May reformat many files. Run on a branch and review the diff carefully.

**@netlify/nuxt 0.2 → 0.3**: Test a Netlify preview deploy before merging to main.

---

## 🔧 Pinning Notes

These packages are intentionally pinned (no `^`) because they are Linux-specific build binaries that must match exactly:

```json
"@oxc-minify/binding-linux-x64-gnu": "0.128.0",
"@oxc-parser/binding-linux-x64-gnu": "0.128.0",
"@oxc-transform/binding-linux-x64-gnu": "0.128.0"
```

Also pinned (Nuxt ecosystem — update together):

```json
"nuxt": "4.4.2",
"@nuxt/kit": "4.4.2",
"@nuxt/content": "3.13.0",
"@nuxtjs/sitemap": "7.6.0",
"@tailwindcss/cli": "4.2.4",
"tailwindcss": "4.2.4",
"typescript": "5.9.3"
```

When updating pinned packages, edit `package.json` directly then run `pnpm install`.

---

## 🚀 Next Update Checklist

When running future updates, follow this process:

```bash
# 1. Create a safety branch
git checkout -b package-updates-$(date +%Y%m%d)
git push -u origin package-updates-$(date +%Y%m%d)

# 2. Check what's outdated
pnpm outdated

# 3. Update safe packages (patch/minor, non-major)
pnpm update <package-list>

# 4. For pinned packages, edit package.json manually, then:
pnpm install

# 5. Verify
pnpm lint
pnpm build:quiet

# 6. Commit
git add package.json pnpm-lock.yaml
git commit -m "chore: dependency updates"
git push
```

---

## 🛡️ Rollback Procedure

If Netlify deploy fails after merging:

```bash
git revert HEAD
git push
# Netlify auto-deploys the revert
```

Or revert to a specific commit:

```bash
git log --oneline -5
git revert <commit-hash>
git push
```

---

## ⚠️ Pre-existing Peer Dependency Warnings (not our problem)

These warnings exist regardless of our updates and can be ignored:

- `vite-plugin-vue-mcp@0.3.2` — expects vite `^3-6`, found vite 7 (Nuxt ships vite 7)
- `@nuxt/cli` → `@bomb.sh/tab` — expects `citty@^0.1.6`, found `0.2.0`
- `@nuxt/content@3.13.0` — expects `better-sqlite3@^12.5.0`, found `12.4.1`
- `@nuxt/eslint@1.15.2` → `@eslint/config-inspector` — expects eslint `^8-9`, found `10.x` (upstream hasn't caught up to eslint 10 yet)
- `@nuxt/eslint@1.15.2` → `eslint-plugin-import-x` — same as above
