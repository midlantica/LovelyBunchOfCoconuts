# Package Updates - January 21, 2026

## Summary

Successfully updated 9 outdated packages from the dependency tree.

## Updates Completed

### Core Framework Updates

- **nuxt**: 4.2.1 → 4.2.2 (patch)
- **@nuxt/kit**: 4.2.1 → 4.2.2 (patch)

### Content & Markdown

- **@nuxtjs/mdc**: 0.19.2 → 0.20.0 (minor)
  - Added new Shiki engine dependencies for syntax highlighting

### Development Tools

- **prettier**: 3.8.0 → 3.8.1 (patch)
- **baseline-browser-mapping**: 2.9.16 → 2.9.17 (patch)
- **globals**: 16.5.0 → 17.0.0 (major - dev dependency, low risk)

### Build Tooling (OXC Bindings)

- **@oxc-minify/binding-linux-x64-gnu**: 0.97.0 → 0.110.0
- **@oxc-parser/binding-linux-x64-gnu**: 0.97.0 → 0.110.0
- **@oxc-transform/binding-linux-x64-gnu**: 0.97.0 → 0.110.0

## Update Process

1. **Safe Patches First**: Updated Nuxt core, Prettier, and baseline-browser-mapping
2. **Minor Version**: Updated @nuxtjs/mdc with new Shiki engines
3. **Major Version**: Updated globals (dev dependency only)
4. **Platform Bindings**: Updated OXC bindings via package.json edit + install

## Verification

- ✅ All packages now up to date (`pnpm outdated` returns empty)
- ✅ Build process started successfully
- ✅ Nuxt 4.2.2 confirmed in build output
- ✅ All frontmatter validation passed
- ✅ Content JSON regeneration successful (1,681 items)

## Known Warnings (Pre-existing)

These warnings existed before the updates and are not related to the package updates:

1. **vite-plugin-vue-mcp peer dependency**: Expects Vite 6.x but we have 7.3.1 (newer)
2. **@nuxt/content better-sqlite3**: Expects 12.5.0 but we have 12.4.1
3. **Deprecated subdependencies**: @types/parse-path@7.1.0, node-domexception@1.0.0

## Next Steps

- Monitor build completion
- Test dev server functionality
- Deploy to staging/production when ready

## Notes

- OXC bindings were pinned in package.json (not using semver ranges), required manual version update
- All updates are backward compatible or low-risk dev dependencies
- No breaking changes expected in production
