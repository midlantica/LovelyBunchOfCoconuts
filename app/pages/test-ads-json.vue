<template>
  <div class="p-8">
    <h1 class="mb-4 text-2xl font-bold">Ad System Test Page (Direct JSON)</h1>

    <div class="mb-8">
      <h2 class="mb-2 text-xl font-semibold">Ad Status</h2>
      <div class="rounded bg-gray-800 p-4">
        <p>Ads Loaded: {{ adsLoaded ? 'Yes' : 'No' }}</p>
        <p>Small Ads Count: {{ smallAdsCount }}</p>
        <p>Large Ads Count: {{ largeAdsCount }}</p>
        <p>Total Ads in JSON: {{ allAds.length }}</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 text-xl font-semibold">Sample Small Ad</h2>
      <div class="max-w-md">
        <WallPanelAd v-if="sampleSmallAd" :ad="sampleSmallAd" size="small" />
        <p v-else class="text-red-500">No small ads available</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 text-xl font-semibold">Sample Large Ad</h2>
      <div class="max-w-2xl">
        <WallPanelAd v-if="sampleLargeAd" :ad="sampleLargeAd" size="large" />
        <p v-else class="text-red-500">No large ads available</p>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-2 text-xl font-semibold">Raw Ad Data (First 2)</h2>
      <div class="overflow-auto rounded bg-gray-800 p-4">
        <pre class="text-xs">{{
          JSON.stringify(allAds.slice(0, 2), null, 2)
        }}</pre>
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
      // Load ads directly from the JSON file
      const response = await fetch('/content-ads.json')
      const adData = await response.json()

      console.log(
        'Test page - Loading ads from JSON, found:',
        adData?.length || 0
      )

      if (adData && adData.length > 0) {
        // Ads are now properly structured from the JSON
        allAds.value = adData
        adsLoaded.value = true

        // Separate ads by size
        const smallAds = adData.filter(
          (ad) => ad.size === 'small' && ad.active !== false
        )
        const largeAds = adData.filter(
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
          sampleSmallAd.value = {
            ...smallAds[0],
            isAd: true,
          }
        }

        if (largeAds.length > 0) {
          sampleLargeAd.value = {
            ...largeAds[0],
            isAd: true,
          }
        }
      }
    } catch (error) {
      console.error('Test page - Error loading ads from JSON:', error)
    }
  })
</script>
