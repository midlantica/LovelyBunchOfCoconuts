<template>
  <div class="p-8">
    <h1 class="mb-4 font-bold text-2xl">Ad System Test Page</h1>

    <div class="mb-8">
      <h2 class="mb-2 font-semibold text-xl">Ad Status</h2>
      <div class="bg-gray-800 p-4 rounded">
        <p>Ads Loaded: {{ adsLoaded ? 'Yes' : 'No' }}</p>
        <p>Small Ads Count: {{ smallAdsCount }}</p>
        <p>Large Ads Count: {{ largeAdsCount }}</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 font-semibold text-xl">Sample Small Ad</h2>
      <div class="max-w-md">
        <WallPanelAd v-if="sampleSmallAd" :ad="sampleSmallAd" size="small" />
        <p v-else class="text-red-500">No small ads available</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 font-semibold text-xl">Sample Large Ad</h2>
      <div class="max-w-2xl">
        <WallPanelAd v-if="sampleLargeAd" :ad="sampleLargeAd" size="large" />
        <p v-else class="text-red-500">No large ads available</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 font-semibold text-xl">Instructions</h2>
      <div class="bg-gray-800 p-4 rounded">
        <p class="mb-2">To see ads on the main page:</p>
        <ol class="space-y-1 list-decimal list-inside">
          <li>
            Go to the <a href="/" class="text-slate-600 underline">home page</a>
          </li>
          <li>Scroll down through the content</li>
          <li>Ads should appear every 10 content items</li>
          <li>Small ads appear in claim slots (blue border)</li>
          <li>Large ads appear in quote slots (yellow border)</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
  const adsLoaded = ref(false)
  const smallAdsCount = ref(0)
  const largeAdsCount = ref(0)
  const sampleSmallAd = ref(null)
  const sampleLargeAd = ref(null)
  const allAds = ref([])

  onMounted(async () => {
    try {
      // Query ads directly using Nuxt Content
      const adContent = await queryContent('ads').find()

      console.log('Test page - Loading ads, found:', adContent?.length || 0)

      if (adContent && adContent.length > 0) {
        allAds.value = adContent
        adsLoaded.value = true

        // Separate ads by size
        const smallAds = adContent.filter(
          (ad) => ad.size === 'small' && ad.active !== false
        )
        const largeAds = adContent.filter(
          (ad) => ad.size === 'large' && ad.active !== false
        )

        smallAdsCount.value = smallAds.length
        largeAdsCount.value = largeAds.length

        console.log(
          'Test page - Small ads:',
          smallAds.length,
          'Large ads:',
          largeAds.length
        )

        // Get sample ads for display
        if (smallAds.length > 0) {
          const randomSmall = Math.floor(Math.random() * smallAds.length)
          sampleSmallAd.value = {
            ...smallAds[randomSmall],
            isAd: true,
          }
        }

        if (largeAds.length > 0) {
          const randomLarge = Math.floor(Math.random() * largeAds.length)
          sampleLargeAd.value = {
            ...largeAds[randomLarge],
            isAd: true,
          }
        }
      }
    } catch (error) {
      console.error('Test page - Error loading ads:', error)
    }
  })
</script>
