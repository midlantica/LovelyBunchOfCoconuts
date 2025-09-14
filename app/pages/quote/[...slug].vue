<!-- Dynamic route for individual quotes -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`quote-${route.path}`">
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
    <ModalsModalQuote
      v-if="quote"
      :show="modalVisible"
      :modal-data="quote"
      @close="navigateHome"
    />
  </div>
</template>

<script setup>
  // Nuxt auto-imports: onMounted, watch, ref, computed

  import { useContentCache } from '~/composables/useContentCache'
  const route = useRoute()
  const router = useRouter()

  // Local modal visibility
  const modalVisible = ref(true)

  // Persisted wall scroll position
  const wallScrollTop = useState('wallScrollTop', () => 0)
  const { quotes, loadAllContent, slugMaps } = useContentCache()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)
  const loadingTimeout = ref(null)

  onServerPrefetch(async () => {
    try {
      await loadAllContent()
      contentReady.value = true
    } catch (e) {
      console.error('Server prefetch failed:', e)
    }
  })

  onMounted(async () => {
    console.log('🔍 Quote page mounted, looking for:', routeSlug.value)

    // Ensure content is loaded first
    if (!quotes?.value?.length || !contentReady.value) {
      console.log('📥 Loading content...')

      // Set a timeout to prevent infinite loading
      loadingTimeout.value = setTimeout(() => {
        console.warn('Content loading timeout - redirecting to home')
        const q = routeSlug.value?.split('/').pop() || ''
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
        const q = routeSlug.value?.split('/').pop() || ''
        navigateTo({ path: '/', query: { nf: '1', q } }, { replace: true })
        return
      }
    }

    // Wait for next tick to ensure reactive updates have processed
    await nextTick()

    console.log('🗺️ Slug maps quotes size:', slugMaps.quotes.size)
    console.log('🔍 Looking for slug:', routeSlug.value)
    console.log('✅ Found quote:', !!slugMaps.quotes.get(routeSlug.value))

    // Debug: show all available quote slugs
    if (import.meta.dev) {
      console.log('Available quote slugs:', Array.from(slugMaps.quotes.keys()))
    }

    // Restore wall scroll if available
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer && wallScrollTop.value > 0) {
      scrollContainer.scrollTo({ top: wallScrollTop.value })
    }

    // Don't redirect - just stay on the quote URL even if not found
    if (contentReady.value && !quote.value) {
      console.log('❌ Quote not found, but staying on URL')
    }
  })

  onBeforeUnmount(() => {
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value)
    }
  })

  const routeSlug = computed(() => {
    const slug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug || ''

    // Handle different slug formats
    // Remove 'economics/' prefix if present to get just the quote slug
    const parts = slug.split('/')
    if (parts.length > 1) {
      // For URLs like "economics/the-power-to-tax-involves-the-power-to-destroy"
      // We want just "the-power-to-tax-involves-the-power-to-destroy"
      return parts[parts.length - 1]
    }
    return slug
  })

  // Quote referenced in template - only look in slug maps after content is loaded
  const quote = computed(() => {
    if (!contentReady.value) return null

    // First try slug map lookup with the processed slug
    let foundQuote = slugMaps.quotes.get(routeSlug.value)

    // If not found, try with full path
    if (!foundQuote && route.params.slug) {
      const fullSlug = Array.isArray(route.params.slug)
        ? route.params.slug.join('/')
        : route.params.slug
      foundQuote = slugMaps.quotes.get(fullSlug)
    }

    // If not found, try fallback search through quotes array
    if (!foundQuote && quotes.value?.length) {
      const slug = routeSlug.value.toLowerCase()
      foundQuote = quotes.value.find((quote) => {
        const filename = (quote.id || quote._path || '')
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

    return foundQuote
  })

  // Watch for content loading completion and check quote availability
  watch(contentReady, async (ready) => {
    if (ready) {
      await nextTick()
      // Don't redirect - just stay on the quote URL even if not found
      if (!quote.value) {
        console.log('❌ Quote not found in watcher, but staying on URL')
      }
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

  const navigateHome = () => {
    const modalGuardUntil = useState('modalGuardUntil', () => 0)
    modalGuardUntil.value = Date.now() + 150
    modalVisible.value = false
    requestAnimationFrame(() => router.push('/'))
  }

  useHead(() => {
    if (!quote.value) {
      return {
        title: 'Quote Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The quote you are looking for could not be found.',
          },
        ],
      }
    }

    const quoteText = quote.value.quoteText || quote.value.title
    const attribution = quote.value.attribution || ''
    const currentUrl = `${siteUrl}${route.path}`
    const ogImageUrl = `${siteUrl}/api/share/quote/${slugify(quoteText)}.png`

    return {
      title: `${quoteText} — ${attribution} | WakeUpNPC`,
      meta: [
        { name: 'description', content: `${quoteText} — ${attribution}` },
        { property: 'og:title', content: `${quoteText} — ${attribution}` },
        {
          property: 'og:description',
          content: `${quoteText} — ${attribution}`,
        },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:image', content: ogImageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${quoteText} — ${attribution}` },
        {
          name: 'twitter:description',
          content: `${quoteText} — ${attribution}`,
        },
        { name: 'twitter:image', content: ogImageUrl },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
