<!-- Dynamic route for individual memes -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    :key="`meme-${route.path}`"
    class="grid h-full grid-rows-[auto_1fr] gap-3 overflow-hidden px-0"
  >
    <!-- Search Bar (fixed at top) -->
    <div class="flex justify-center">
      <div class="mx-auto w-full max-w-3xl px-4 md:px-0">
        <SearchbarSearchBar
          v-model:search="searchTerm"
          v-model:filters="contentFilters"
          :counts="liveCounts"
          class="sticky top-0 z-5 w-full"
        />
      </div>
    </div>

    <!-- Content Wall (scrollable) -->
    <div
      class="scroll-container-stable h-full min-h-0 overflow-y-auto rounded-xl"
      style="min-height: 600px"
    >
      <div class="mx-auto mb-16 w-full max-w-3xl pr-3 pb-16 pl-2 md:px-0">
        <main class="pb-8">
          <WallTheWall
            :hide-no-content="true"
            :search="searchTerm"
            :filters="contentFilters"
            @counts="handleCounts"
          />
        </main>
      </div>
    </div>

    <!-- Local modal overlay -->
    <ClientOnly>
      <ModalsModalMeme
        v-if="meme"
        :show="modalVisible"
        :modal-data="meme"
        @close="navigateHome"
      />
    </ClientOnly>
  </div>
</template>

<script setup>
  // Nuxt auto-imports: onMounted, watch, ref, computed, nextTick

  import { useContentCache } from '~/composables/useContentCache'
  const route = useRoute()
  const router = useRouter()
  const modalVisible = ref(true)

  const wallScrollTop = useState('wallScrollTop', () => 0)
  const modalGuardUntil = useState('modalGuardUntil', () => 0)
  const { memes, loadAllContent, slugMaps } = useContentCache()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)

  // Search and filter state
  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    grifts: true,
    quotes: true,
    memes: true,
  }))

  // Count tracking
  const wallCounts = ref({ grifts: 0, quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ grifts: 0, quotes: 0, memes: 0 })
  const liveCounts = computed(() => ({
    wall: wallCounts.value,
    total: totalCounts.value,
  }))

  function handleCounts({ wallCounts: wc, totalCounts: tc }) {
    wallCounts.value = wc
    totalCounts.value = tc
  }
  onServerPrefetch(async () => {
    try {
      await loadAllContent()
      contentReady.value = true
    } catch (e) {
      console.error('Server prefetch failed:', e)
    }
  })

  const slugPath = computed(() =>
    Array.isArray(route.params.slug) ? route.params.slug.join('/') : ''
  )

  // Meme referenced in template - only look in slug maps after content is loaded
  const meme = computed(() => {
    if (!contentReady.value) return null

    // First try slug map lookup
    let foundMeme = slugMaps.memes.get(slugPath.value)

    // If not found, try fallback search through memes array
    if (!foundMeme && memes.value?.length) {
      const slug = slugPath.value.toLowerCase()
      foundMeme = memes.value.find((meme) => {
        const filename = (meme.id || meme._path || '')
          .split('/')
          .pop()
          ?.replace(/\.md$/, '')
          .toLowerCase()
        return (
          filename === slug ||
          filename?.includes(slug) ||
          slug.includes(filename || '')
        )
      })
    }

    return foundMeme
  })

  // Watch for content loading completion and check meme availability
  watch(contentReady, async (ready) => {
    if (ready) {
      await nextTick()
    }
  })

  function navigateHome() {
    modalVisible.value = false
    modalGuardUntil.value = Date.now() + 150
    requestAnimationFrame(() => router.push('/'))
  }

  const loadingTimeout = ref(null)

  onMounted(async () => {
    // Ensure content is loaded first
    if (!memes?.value?.length || !contentReady.value) {
      // Set a timeout to prevent infinite loading
      loadingTimeout.value = setTimeout(() => {
        console.warn('Content loading timeout - redirecting to home')
        const q = slugPath.value?.split('/').pop() || ''
        navigateTo({ path: '/', query: { nf: '1', q } }, { replace: true })
      }, 5000) // 5 second timeout

      try {
        await loadAllContent()
        contentReady.value = true

        // Clear timeout if loading succeeded
        if (loadingTimeout.value) {
          clearTimeout(loadingTimeout.value)
          loadingTimeout.value = null
        }
      } catch (e) {
        console.error('Failed to load content:', e)
        // Redirect on error
        const q = slugPath.value?.split('/').pop() || ''
        navigateTo({ path: '/', query: { nf: '1', q } }, { replace: true })
        return
      }
    }

    // Wait for next tick to ensure reactive updates have processed
    await nextTick()

    // Restore wall scroll if available
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer && wallScrollTop.value > 0) {
      scrollContainer.scrollTo({ top: wallScrollTop.value })
    }
  })

  onBeforeUnmount(() => {
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value)
    }
  })

  // slugify is auto-imported from ~/utils/slugify.ts

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
    const memeTitle = meme.value.title || meme.value.description || 'Meme'
    const currentUrl = `${siteUrl}${route.path}`
    const ogImageUrl = meme.value.image
      ? meme.value.image.startsWith('http')
        ? meme.value.image
        : `${siteUrl}${meme.value.image}`
      : `${siteUrl}/npc_icon.svg`
    return {
      title: `${memeTitle} | WakeUpNPC`,
      meta: [
        { name: 'description', content: memeTitle },
        { property: 'og:title', content: memeTitle },
        { property: 'og:description', content: memeTitle },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:image', content: ogImageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: memeTitle },
        { name: 'twitter:description', content: memeTitle },
        { name: 'twitter:image', content: ogImageUrl },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
