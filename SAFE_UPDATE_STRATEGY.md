# Safe Package Update Strategy for WakeUpNPC2

## ✅ Last Updated: 2026-02-23

**14 packages updated** on branch `package-updates-20260223` — lint ✓, build ✓

---

## 📊 Current State (post Feb 23 update)

### ✅ Recently Updated (Feb 23, 2026)

| Package                                | From    | To      | Type      |
| -------------------------------------- | ------- | ------- | --------- |
| `@typescript-eslint/parser`            | 8.55.0  | 8.56.1  | patch/dev |
| `eslint-plugin-vue`                    | 10.7.0  | 10.8.0  | patch/dev |
| `baseline-browser-mapping`             | 2.9.19  | 2.10.0  | minor/dev |
| `@napi-rs/canvas`                      | 0.1.92  | 0.1.94  | patch     |
| `@netlify/blobs`                       | 10.6.0  | 10.7.0  | patch     |
| `@netlify/nuxt`                        | 0.2.21  | 0.2.24  | patch     |
| `tailwindcss`                          | 4.1.18  | 4.2.1   | minor/dev |
| `@tailwindcss/cli`                     | 4.1.18  | 4.2.1   | minor/dev |
| `@tailwindcss/postcss`                 | 4.1.18  | 4.2.1   | minor/dev |
| `@tailwindcss/vite`                    | 4.1.18  | 4.2.1   | minor/dev |
| `@oxc-minify/binding-linux-x64-gnu`    | 0.110.0 | 0.115.0 | patch/dev |
| `@oxc-parser/binding-linux-x64-gnu`    | 0.110.0 | 0.115.0 | patch/dev |
| `@oxc-transform/binding-linux-x64-gnu` | 0.110.0 | 0.115.0 | patch/dev |

---

## 🚨 Skipped — Major Version Bumps (Breaking Changes)

These require dedicated migration work — **do NOT update with `pnpm update`**:

| Package        | Current | Latest | Risk                                              |
| -------------- | ------- | ------ | ------------------------------------------------- |
| `eslint`       | 9.39.2  | 10.x   | 🔴 Major — new flat config changes, plugin compat |
| `vue-router`   | 4.6.4   | 5.x    | 🔴 Major — API changes, Nuxt router integration   |
| `@eslint/json` | 0.14.0  | 1.x    | 🔴 Major — API changes                            |

### Migration Notes

**eslint 9 → 10**: Review [ESLint v10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0). Check `@nuxt/eslint` compatibility first — it must support eslint 10 before upgrading.

**vue-router 4 → 5**: This is a significant migration. Nuxt 4 currently ships with vue-router 4. Wait for official Nuxt support before upgrading.

**@eslint/json 0.14 → 1.0**: Minor impact (dev-only), but check `eslint.config.js` for any API changes before updating.

---

## 🔧 Pinning Notes

These packages are intentionally pinned (no `^`) because they are Linux-specific build binaries that must match exactly:

```json
"@oxc-minify/binding-linux-x64-gnu": "0.115.0",
"@oxc-parser/binding-linux-x64-gnu": "0.115.0",
"@oxc-transform/binding-linux-x64-gnu": "0.115.0"
```

Also pinned (Nuxt ecosystem — update together):

```json
"nuxt": "4.3.1",
"@nuxt/kit": "4.3.1",
"@nuxt/content": "3.11.2",
"@nuxtjs/sitemap": "7.6.0",
"@tailwindcss/cli": "4.2.1",
"tailwindcss": "4.2.1",
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
- `@nuxt/content@3.11.2` — expects `better-sqlite3@^12.5.0`, found `12.4.1`

These are upstream issues in the respective packages, not caused by our dependency choices.
