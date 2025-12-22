// Server API endpoint for ads
// Returns ad data from generated JSON (/content-ads.json)
// This keeps ads in sync with content/ads/*.md and avoids having to hardcode paths.

export default defineEventHandler(async () => {
  try {
    // In Netlify/Nitro runtimes, reading from the filesystem is not reliable.
    // Fetch the deployed JSON asset over HTTP instead.
    const raw = await $fetch<string>('/content-ads.json')
    const adsData = JSON.parse(raw)

    if (!Array.isArray(adsData)) {
      console.warn('⚠️ Invalid ads data (not an array)')
      return { data: [] }
    }

    // Filter only active ads
    const activeAds = adsData.filter((ad) => ad && ad.active !== false)

    if (import.meta.dev) {
      console.log(`✅ Loaded ${activeAds.length} active ads`)
      console.log(
        'Ad IDs:',
        activeAds.map((ad) => ad.id)
      )
    }

    return { data: activeAds }
  } catch (error) {
    console.error('❌ Error loading ads:', error)
    // Return empty array instead of failing
    return { data: [] }
  }
})
