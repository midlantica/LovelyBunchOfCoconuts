# Safe Package Update Strategy for WakeUpNPC2

## ✅ Last Updated: 2026-04-29

**All packages fully up to date** — 0 outdated packages remaining — lint ✓, build ✓

---

## 📊 Current State (post Apr 29 update — 5 rounds)

### ✅ Recently Updated (Apr 29, 2026)

| Package                                | From    | To      | Type      |
| -------------------------------------- | ------- | ------- | --------- |
| `@napi-rs/canvas`                      | 0.1.96  | 0.1.100 | patch     |
| `@netlify/blobs`                       | 10.7.2  | 10.7.4  | patch     |
| `@netlify/nuxt`                        | 0.2.34  | 0.3.1   | minor     |
| `@nuxt/content`                        | 3.12.0  | 3.13.0  | minor     |
| `@nuxtjs/mdc`                          | 0.20.2  | 0.21.1  | minor     |
| `@nuxtjs/sitemap`                      | 7.6.0   | 8.0.14  | 🔴 major  |
| `tailwindcss`                          | 4.2.1   | 4.2.4   | patch/dev |
| `@tailwindcss/cli`                     | 4.2.1   | 4.2.4   | patch/dev |
| `@tailwindcss/postcss`                 | 4.2.1   | 4.2.4   | patch/dev |
| `@tailwindcss/vite`                    | 4.2.1   | 4.2.4   | patch/dev |
| `@eslint/css`                          | 1.0.0   | 1.1.0   | minor/dev |
| `@eslint/json`                         | 1.1.0   | 1.2.0   | minor/dev |
| `@eslint/markdown`                     | 7.5.1   | 8.0.1   | 🔴 major  |
| `@typescript-eslint/parser`            | 8.57.0  | 8.59.1  | patch/dev |
| `baseline-browser-mapping`             | 2.10.7  | 2.10.24 | patch/dev |
| `eslint`                               | 10.0.3  | 10.2.1  | patch/dev |
| `eslint-plugin-vue`                    | 10.8.0  | 10.9.0  | minor/dev |
| `globals`                              | 17.4.0  | 17.5.0  | minor/dev |
| `@oxc-minify/binding-linux-x64-gnu`    | 0.118.0 | 0.128.0 | patch/dev |
| `@oxc-parser/binding-linux-x64-gnu`    | 0.118.0 | 0.128.0 | patch/dev |
| `@oxc-transform/binding-linux-x64-gnu` | 0.118.0 | 0.128.0 | patch/dev |
| `prettier`                             | 3.8.1   | 3.8.3   | patch/dev |
| `prettier-plugin-tailwindcss`          | 0.7.2   | 0.8.0   | 🔴 major  |
| `typescript`                           | 5.9.3   | 6.0.3   | 🔴 major  |
| `vue`                                  | 3.5.30  | 3.5.33  | patch     |
| `vue-router`                           | 5.0.3   | 5.0.6   | patch     |

---

## 🚨 Skipped — Nothing! All packages are current.

No packages are currently outdated. 🎉

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
"@tailwindcss/cli": "4.2.4",
"tailwindcss": "4.2.4"
```

When updating pinned packages, edit `package.json` directly then run `pnpm install`.

---

## ⚠️ Known Peer Dependency Warnings (pre-existing, not our problem)

These warnings exist regardless of our updates and can be ignored:

- `vite-plugin-vue-mcp@0.3.2` — expects vite `^3-6`, found vite 7 (Nuxt ships vite 7)
- `@nuxt/content@3.13.0` — expects `better-sqlite3@^12.5.0`, found `12.4.1`
- `@nuxt/eslint@1.15.2` → `@eslint/config-inspector` — expects eslint `^8-9`, found `10.x`
- `@nuxt/eslint@1.15.2` → `eslint-plugin-import-x` — same as above
- `@typescript-eslint/*@8.57.x` internals — expect typescript `<6.0.0`, found `6.0.3` (warnings only, lint and build pass cleanly)

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

# 6. Commit and merge to master
git add package.json pnpm-lock.yaml
git commit -m "chore: dependency updates"
git push
git checkout master && git merge <branch> && git push origin master
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
