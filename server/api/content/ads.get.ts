// Server API endpoint for ads
// Returns ad data from generated JSON (/content-ads.json)
// This keeps ads in sync with content/ads/*.md and avoids having to hardcode paths.

export default defineEventHandler(async (event) => {
  // Netlify serverless is proving unreliable for internal $fetch and filesystem.
  // So we fall back to the most deterministic approach: embedded ads.
  //
  // NOTE: The image URLs below are intentionally neutral (h1/h2) to avoid adblock rules.
  const adsData = [
    {
      id: 'ad-horizontal-1',
      title: 'Banner',
      type: 'quote',
      size: 'horizontal',
      advertiser: 'First Co',
      campaign: 'first-123',
      link: 'https://wakeupnpc.com/advertising',
      image: '/banners/h1.webp',
      frequency: 50,
      active: true,
      body: '\n# Horizontal Ad Space 1\n\nThis is a placeholder for a large advertisement that would appear in the Quotes panel size - perfect for premium advertisers who want maximum visibility.\n',
    },
    {
      id: 'ad-horizontal-2',
      title: 'Banner',
      type: 'quote',
      size: 'horizontal',
      advertiser: 'Second Co',
      campaign: 'second-123',
      link: 'https://wakeupnpc.com/advertising',
      image: '/banners/h2.webp',
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
      link: 'https://wakeupnpc.com/advertising',
      image: '/banners/378x378-tile-1.webp',
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
      link: 'https://wakeupnpc.com/advertising',
      image: '/banners/378x378-tile-2.webp',
      frequency: 50,
      active: true,
      body: '\n# Square Ad Space 2\n\nThis is a placeholder for a square advertisement that would appear in the Claims panel size.\n',
    },
  ]

  const activeAds = adsData.filter((ad) => ad.active !== false)

  return {
    data: activeAds,
    // One-shot debug so we can confirm production is running this handler
    _debug: {
      source: 'embedded',
      count: activeAds.length,
      images: activeAds.map((a) => a.image),
    },
  }
})
