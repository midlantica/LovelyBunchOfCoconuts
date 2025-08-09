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
            <WallTheWall />
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

  const route = useRoute()
  const router = useRouter()

  // Local modal visibility
  const modalVisible = ref(true)

  // Persisted wall scroll position
  const wallScrollTop = useState('wallScrollTop', () => 0)

  const { useContentCache } = await import('~/composables/useContentCache')
  const { quotes, ensureContentLoaded, cache, loadAllContent, slugMaps } =
    useContentCache()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)

  // Ensure content is loaded immediately for SSR and client-side
  await ensureContentLoaded()
  contentReady.value = true

  onMounted(async () => {
    await ensureContentLoaded()
    contentReady.value = true
    // Restore background wall scroll position
    const scroller = document.querySelector('.scroll-container-stable')
    if (scroller && wallScrollTop.value > 0) {
      scroller.scrollTop = wallScrollTop.value
    }
  })

  const routeSlug = computed(() =>
    Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug
  )

  // Find the quote that matches this path - make it reactive to route changes
  const quote = computed(() => {
    const currentSlug = routeSlug.value

    const quotesArray = quotes.value?.length > 0 ? quotes.value : cache.quotes

    if (!quotesArray || quotesArray.length === 0) {
      return null
    }

    const foundQuote = quotesArray.find((quote) => {
      if (quote.id) {
        const filename = quote.id.split('/').pop()?.replace(/\.md$/, '') || ''
        const currentSlugLower = currentSlug.toLowerCase()
        const filenameLower = filename.toLowerCase()

        return (
          filenameLower.includes(currentSlugLower) ||
          currentSlugLower.includes(filenameLower)
        )
      }
      return false
    })

    return foundQuote
  })

  // Redirect to home with prefilled search if not found
  watch(
    quote,
    (val) => {
      if (!contentReady.value) return
      if (!val && routeSlug.value) {
        const q = routeSlug.value
        navigateTo({ path: '/', query: { nf: '1', q } })
      }
    },
    { immediate: true }
  )

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
    modalGuardUntil.value = Date.now() + 450
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
