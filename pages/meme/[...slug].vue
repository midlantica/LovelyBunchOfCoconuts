<!-- Dynamic route for individual memes -->
<template>
  <div :key="`meme-${route.path}`">
    <!-- If we have a matching meme, show it in modal -->
    <ModalMeme
      v-if="meme"
      :show="true"
      :modal-data="meme"
      @close="navigateHome"
    />

    <!-- Otherwise show error -->
    <div v-else>
      <div class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <h1 class="mb-4 font-bold text-white text-2xl">Meme Not Found</h1>
          <p class="mb-4 text-gray-400">
            The meme you're looking for doesn't exist.
          </p>
          <p class="mb-4 text-gray-500 text-sm">
            Slug: {{ route.params.slug }}
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
  import { useContentCache } from '~/composables/useContentCache'
  import ModalMeme from '~/components/modals/ModalMeme.vue'

  const route = useRoute()
  const router = useRouter()

  const { memes, ensureContentLoaded, cache } = useContentCache()

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
      console.log('🔄 MEME ROUTE: Route slug changed:', {
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

  // Find the meme that matches this path - make it reactive to route changes
  const meme = computed(() => {
    const currentSlug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug

    console.log('🔍 MEME ROUTE: Computing meme for slug:', currentSlug)

    const memesArray = memes.value?.length > 0 ? memes.value : cache.memes

    if (!memesArray || memesArray.length === 0) {
      return null
    }

    const foundMeme = memesArray.find((meme) => {
      if (meme.id) {
        const filename = meme.id.split('/').pop()?.replace(/\.md$/, '') || ''
        const currentSlugLower = currentSlug.toLowerCase()
        const filenameLower = filename.toLowerCase()

        return (
          filenameLower.includes(currentSlugLower) ||
          currentSlugLower.includes(filenameLower)
        )
      }
      return false
    })

    return foundMeme
  })

  const navigateHome = () => {
    router.push('/')
  }

  // Set page meta for social sharing
  useHead(() => {
    if (!meme.value) {
      return {
        title: 'Meme Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The meme you are looking for could not be found.',
          },
        ],
      }
    }

    const title = meme.value.title
    const imageUrl = meme.value.images?.[0] || ''
    const currentUrl = `https://wakeupnpc.com${route.path}`
    
    // For memes, use the actual meme image if available, otherwise use branded image
    const ogImageUrl = imageUrl 
      ? `https://wakeupnpc.com${imageUrl}`
      : `https://wakeupnpc.com/grainy-background-aqua.jpg`

    return {
      title: `${title} | WakeUpNPC`,
      meta: [
        {
          name: 'description',
          content: title,
        },
        // Open Graph tags for Facebook
        {
          property: 'og:title',
          content: title,
        },
        { 
          property: 'og:description', 
          content: `Check out this political meme: ${title}` 
        },
        { 
          property: 'og:type', 
          content: 'article' 
        },
        { 
          property: 'og:url', 
          content: currentUrl 
        },
        {
          property: 'og:image',
          content: ogImageUrl
        },
        {
          property: 'og:image:width',
          content: '1200'
        },
        {
          property: 'og:image:height',
          content: '630'
        },
        {
          property: 'og:site_name',
          content: 'WakeUpNPC'
        },
        // Twitter Card tags
        { 
          property: 'twitter:card', 
          content: 'summary_large_image' 
        },
        {
          property: 'twitter:site',
          content: '@WakeUpNPC'
        },
        {
          property: 'twitter:title',
          content: title,
        },
        {
          property: 'twitter:description',
          content: `Check out this political meme: ${title}`,
        },
        {
          property: 'twitter:image',
          content: ogImageUrl
        },
      ],
    }
  })
</script>
