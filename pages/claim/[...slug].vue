<!-- Dynamic route for individual claims -->
<template>
  <div :key="`claim-${route.path}`">
    <!-- If we have a matching claim, show it in modal -->
    <ModalsModalClaim
      v-if="claim"
      :show="true"
      :modal-data="claim"
      @close="navigateHome"
    />

    <!-- Otherwise show the main wall with this claim highlighted -->
    <div v-else>
      <div class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <h1 class="mb-4 font-bold text-white text-2xl">Claim Not Found</h1>
          <p class="mb-4 text-gray-400">
            The claim you're looking for doesn't exist.
          </p>
          <button
            @click="navigateHome"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, watch, nextTick } from 'vue'

  const route = useRoute()
  const router = useRouter()

  const { claims, ensureContentLoaded, cache } = useContentCache()

  // Ensure content is loaded immediately for SSR and client-side
  await ensureContentLoaded()

  // Also ensure content is loaded on mount as fallback
  onMounted(async () => {
    await ensureContentLoaded()
  })

  // Watch route changes and re-ensure content is available
  watch(
    () => route.params.slug,
    async (newSlug, oldSlug) => {
      console.log('🔄 CLAIM ROUTE: Route slug changed:', {
        from: oldSlug,
        to: newSlug,
        path: route.path,
        timestamp: new Date().toISOString(),
      })
      await ensureContentLoaded()
      await nextTick()
    },
    { immediate: false }
  )

  // Find the claim that matches this path - make it reactive to route changes
  const claim = computed(() => {
    const currentSlug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug

    console.log('🔍 CLAIM ROUTE: Computing claim for slug:', currentSlug)

    const claimsArray = claims.value?.length > 0 ? claims.value : cache.claims

    if (!claimsArray || claimsArray.length === 0) {
      return null
    }

    const foundClaim = claimsArray.find((claim) => {
      if (claim.id) {
        const filename = claim.id.split('/').pop()?.replace(/\.md$/, '') || ''
        const currentSlugLower = currentSlug.toLowerCase()
        const filenameLower = filename.toLowerCase()

        return (
          filenameLower.includes(currentSlugLower) ||
          currentSlugLower.includes(filenameLower)
        )
      }
      return false
    })

    return foundClaim
  })

  const navigateHome = () => {
    router.push('/')
  }

  // Set page meta for social sharing
  useHead(() => {
    if (!claim.value) {
      return {
        title: 'Claim Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The claim you are looking for could not be found.',
          },
        ],
      }
    }

    const claimText = claim.value.claim || claim.value.title
    const translation = claim.value.translation || ''
    const currentUrl = `https://wakeupnpc.com${route.path}`

    // Use a simple branded image for Open Graph (much more reliable than dynamic generation)
    const ogImageUrl = `https://wakeupnpc.com/grainy-background-aqua.jpg`

    return {
      title: `${claimText} | WakeUpNPC`,
      meta: [
        {
          name: 'description',
          content: translation || claimText,
        },
        // Open Graph tags for Facebook
        {
          property: 'og:title',
          content: claimText,
        },
        {
          property: 'og:description',
          content: translation || claimText,
        },
        {
          property: 'og:type',
          content: 'article',
        },
        {
          property: 'og:url',
          content: currentUrl,
        },
        {
          property: 'og:image',
          content: ogImageUrl,
        },
        {
          property: 'og:image:width',
          content: '1200',
        },
        {
          property: 'og:image:height',
          content: '630',
        },
        {
          property: 'og:site_name',
          content: 'WakeUpNPC',
        },
        // Twitter Card tags
        {
          property: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          property: 'twitter:site',
          content: '@WakeUpNPC',
        },
        {
          property: 'twitter:title',
          content: claimText,
        },
        {
          property: 'twitter:description',
          content: translation || claimText,
        },
        {
          property: 'twitter:image',
          content: ogImageUrl,
        },
      ],
    }
  })
</script>
