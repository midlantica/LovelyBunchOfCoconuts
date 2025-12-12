// Server API endpoint for ads
// Returns ad data directly (embedded in the API)
// This ensures it works in all environments including Netlify Functions

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Loading ads data...')

    // Hardcoded ads data (matches content-ads.json)
    // This is the most reliable approach for serverless environments
    const adsData = [
      {
        id: 'ad-horizontal-1',
        title: 'Advertisement',
        type: 'quote',
        size: 'horizontal',
        advertiser: 'Premium Advertiser 1',
        campaign: 'Big Campaign',
        link: 'https://example.com/premium1',
        image: '/ads/768x90-ad-1b.png',
        frequency: 50,
        active: true,
        body: '\n# Horizontal Ad Space 1\n\nThis is a placeholder for a large advertisement that would appear in the Quotes panel size - perfect for premium advertisers who want maximum visibility.\n',
      },
      {
        id: 'ad-horizontal-2',
        title: 'Advertisement',
        type: 'quote',
        size: 'horizontal',
        advertiser: 'Premium Advertiser 2',
        campaign: 'Big Campaign',
        link: 'https://example.com/premium2',
        image: '/ads/768x90-ad-2b.png',
        frequency: 50,
        active: true,
        body: '\n# Horizontal Ad Space 2\n\nThis is a placeholder for a large advertisement that would appear in the Quotes panel size - perfect for premium advertisers who want maximum visibility.\n',
      },
      {
        id: 'ad-square-1',
        title: 'Advertisement',
        type: 'claim',
        size: 'square',
        advertiser: 'Demo Advertiser 1',
        campaign: 'Test Campaign',
        link: 'https://example.com/ad1',
        image: '/ads/378x378-ad-1.png',
        frequency: 50,
        active: true,
        body: '\n# Square Ad Space 1\n\nThis is a placeholder for a square advertisement that would appear in the Claims panel size.\n',
      },
      {
        id: 'ad-square-2',
        title: 'Advertisement',
        type: 'claim',
        size: 'square',
        advertiser: 'Demo Advertiser 2',
        campaign: 'Test Campaign',
        link: 'https://example.com/ad2',
        image: '/ads/378x378-ad-2.png',
        frequency: 50,
        active: true,
        body: '\n# Square Ad Space 2\n\nThis is a placeholder for a square advertisement that would appear in the Claims panel size.\n',
      },
    ]

    if (adsData && Array.isArray(adsData)) {
      // Filter only active ads
      const activeAds = adsData.filter((ad) => ad.active !== false)

      console.log(`✅ Loaded ${activeAds.length} active ads`)
      console.log(
        'Ad IDs:',
        activeAds.map((ad) => ad.id)
      )

      return {
        data: activeAds,
      }
    }

    // Fallback: return empty array if data is invalid
    console.warn('⚠️ Invalid ads data')
    return {
      data: [],
    }
  } catch (error) {
    console.error('❌ Error loading ads:', error.message)
    console.error('Error details:', error)
    // Return empty array instead of failing
    return {
      data: [],
    }
  }
})
