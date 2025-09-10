// Utility to dynamically obtain queryContent in both dev and production.
// Tries built path first (production), then falls back to dev alias.
let _queryContentCached: any

export async function getQueryContent(): Promise<any | null> {
  if (_queryContentCached !== undefined) return _queryContentCached
  // Attempt production built path
  try {
    const builtPath = process.cwd() + '/.nuxt/content/server/index.mjs'
    // @vite-ignore
    const mod: any = await import(builtPath).catch(() => null)
    if (mod && mod.queryContent) {
      _queryContentCached = mod.queryContent
      return _queryContentCached
    }
  } catch {}
  // Dev fallback alias
  try {
    // @ts-ignore - provided by Nuxt during dev
    const devMod: any = await import('#content/server')
    _queryContentCached = devMod.queryContent
  } catch {
    _queryContentCached = null
  }
  return _queryContentCached
}
