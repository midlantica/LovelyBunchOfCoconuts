<!-- Dynamic route for individual memes -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`meme-${route.path}`">
    <!-- Background Wall -->
    <section
      class="gap-3 grid grid-rows-[auto_1fr] px-0 h-full overflow-hidden"
    >
      <div
        class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
      >
        <div class="mx-auto md:px-0 pr-3 pl-2 w-full max-w-screen-md">
          <main class="pb-8">
            <WallTheWall :hide-no-content="true" />
          </main>
        </div>
      </div>
    </section>

    <!-- Local modal overlay -->
    <ModalsModalMeme
      v-if="meme"
      :show="modalVisible"
      :modal-data="meme"
      @close="navigateHome"
    />
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
      // Don't redirect - just stay on the meme URL even if not found
      if (!meme.value) {
        console.log('❌ Meme not found in watcher, but staying on URL')
      }
    }
  })

  function navigateHome() {
    modalVisible.value = false
    modalGuardUntil.value = Date.now() + 150
    requestAnimationFrame(() => router.push('/'))
  }

  const loadingTimeout = ref(null)

  onMounted(async () => {
    console.log('🔍 Meme page mounted, looking for:', slugPath.value)

    // Ensure content is loaded first
    if (!memes?.value?.length || !contentReady.value) {
      console.log('📥 loading content...')

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

    console.log('🗺️ Slug maps memes size:', slugMaps.memes.size)
    console.log('🔍 Looking for slug:', slugPath.value)
    console.log('✅ Found meme:', !!slugMaps.memes.get(slugPath.value))

    // Debug: show all available meme slugs
    if (import.meta.dev) {
      console.log('Available meme slugs:', Array.from(slugMaps.memes.keys()))
    }

    // Restore wall scroll if available
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer && wallScrollTop.value > 0) {
      scrollContainer.scrollTo({ top: wallScrollTop.value })
    }

    // Don't redirect - just stay on the meme URL even if not found
    if (contentReady.value && !meme.value) {
      console.log('❌ Meme not found, but staying on URL')
    }
  })

  onBeforeUnmount(() => {
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value)
    }
  })

  const slugify = (str = '') =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80)

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
