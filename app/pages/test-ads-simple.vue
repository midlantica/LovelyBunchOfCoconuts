<template>
  <div class="p-8">
    <h1 class="mb-4 font-bold text-2xl">Ad System Test Page (Simple)</h1>

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
        <WallAdPanel v-if="sampleSmallAd" :ad="sampleSmallAd" size="small" />
        <p v-else class="text-red-500">No small ads available</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 font-semibold text-xl">Sample Large Ad</h2>
      <div class="max-w-2xl">
        <WallAdPanel v-if="sampleLargeAd" :ad="sampleLargeAd" size="large" />
        <p v-else class="text-red-500">No large ads available</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 font-semibold text-xl">Raw Ad Data</h2>
      <div class="bg-gray-800 p-4 rounded overflow-auto">
        <pre class="text-xs">{{ JSON.stringify(allAds, null, 2) }}</pre>
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
      const { data: adContent } = await useAsyncData('ads', () =>
        queryContent('ads').find()
      )

      console.log(
        'Test page - Loading ads, found:',
        adContent.value?.length || 0
      )

      if (adContent.value && adContent.value.length > 0) {
        allAds.value = adContent.value
        adsLoaded.value = true

        // Separate ads by size
        const smallAds = adContent.value.filter(
          (ad) => ad.size === 'small' && ad.active !== false
        )
        const largeAds = adContent.value.filter(
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
