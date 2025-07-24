<!-- Dynamic route for individual quotes -->
<template>
  <div :key="`quote-${route.path}`">
    <!-- If we have a matching quote, show it in modal -->
    <ModalQuote
      v-if="quote"
      :show="true"
      :modal-data="quote"
      @close="navigateHome"
    />

    <!-- Otherwise show error -->
    <div v-else>
      <div class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <h1 class="mb-4 font-bold text-white text-2xl">Quote Not Found</h1>
          <p class="mb-4 text-gray-400">
            The quote you're looking for doesn't exist.
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
  import ModalQuote from '~/components/modals/ModalQuote.vue'

  const route = useRoute()
  const router = useRouter()

  const { quotes, ensureContentLoaded, cache } = useContentCache()

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
      console.log('🔄 QUOTE ROUTE: Route slug changed:', {
        from: oldSlug,
        to: newSlug,
        path: route.path,
        timestamp: new Date().toISOString(),
      })
      await ensureContentLoaded()
      // Force a nextTick to ensure reactivity
      await nextTick()
    },
    { immediate: false }
  )

  // Find the quote that matches this path - make it reactive to route changes
  const quote = computed(() => {
    // Force reactivity to route params
    const currentSlug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug

    console.log('🔍 QUOTE ROUTE: Raw route debugging:', {
      'route.params': route.params,
      'route.params.slug': route.params.slug,
      'route.path': route.path,
      'route.fullPath': route.fullPath,
      'computed currentSlug': currentSlug,
      timestamp: new Date().toISOString(),
    })

    // Use both the reactive ref and the global cache for reliability
    const quotesArray = quotes.value?.length > 0 ? quotes.value : cache.quotes

    console.log('🔍 QUOTE ROUTE: Computing quote for slug:', {
      fullSlug: currentSlug,
      quotesReactiveLoaded: !!quotes.value,
      quotesReactiveCount: quotes.value?.length || 0,
      quotesGlobalLoaded: !!cache.quotes,
      quotesGlobalCount: cache.quotes?.length || 0,
      usingSource: quotesArray === quotes.value ? 'reactive' : 'global',
      routePath: route.path,
      routeParams: route.params,
      timestamp: new Date().toISOString(),
    })

    if (!quotesArray || quotesArray.length === 0) {
      console.log('❌ QUOTE ROUTE: No quotes loaded yet for slug:', currentSlug)
      return null
    }

    console.log('🔍 Looking for quote with slug:', currentSlug)
    console.log('📊 Available quotes:', quotesArray.length)

    // Try multiple matching strategies
    const foundQuote = quotesArray.find((quote) => {
      console.log('🧪 Testing quote:', {
        title: quote.title,
        id: quote.id,
        path: quote.path,
        _path: quote._path,
        attribution: quote.attribution,
        quoteText: quote.quoteText?.substring(0, 50) + '...',
        targetSlug: currentSlug,
      })

      // Strategy 1: Direct _path match (if it exists)
      if (quote._path) {
        const targetPath = `/quotes/${currentSlug}`
        const match1 = quote._path === targetPath
        if (match1) {
          console.log('✅ Found quote via _path:', quote._path)
          return true
        }
      }

      // Strategy 2: Match by exact path comparison
      if (quote.path) {
        const match2 = quote.path === `/quotes/${currentSlug}`
        if (match2) {
          console.log('✅ Found quote via path:', quote.path)
          return true
        }
      }

      // Strategy 2: Generate slug from quote content and compare
      const author = (quote.attribution || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      // Try both short quote (3 words) and longer quote (8+ words)
      const quoteTextFull = quote.quoteText || quote.title || ''
      const quoteStart3 = quoteTextFull.split(' ').slice(0, 3).join(' ')
      const quoteStart8 = quoteTextFull.split(' ').slice(0, 8).join(' ')

      const quoteSlug3 = quoteStart3
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      const quoteSlug8 = quoteStart8
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      const fullSlug3 = `${author}-${quoteSlug3}`.substring(0, 80)
      const fullSlug8 = `${author}-${quoteSlug8}`.substring(0, 80)

      // Try matching against different slug variations - be more precise
      const match2 =
        fullSlug3 === currentSlug ||
        fullSlug8 === currentSlug ||
        currentSlug === fullSlug3 ||
        currentSlug === fullSlug8 ||
        // Only allow partial matches if they're substantial (more than just author name)
        (currentSlug.length > author.length + 5 &&
          currentSlug.includes(fullSlug3)) ||
        (fullSlug3.length > author.length + 5 &&
          fullSlug3.includes(currentSlug)) ||
        (currentSlug.length > author.length + 5 &&
          currentSlug.includes(fullSlug8)) ||
        (fullSlug8.length > author.length + 5 &&
          fullSlug8.includes(currentSlug))

      if (match2) {
        console.log('✅ Found quote via generated slug:', {
          generated3: fullSlug3,
          generated8: fullSlug8,
          target: currentSlug,
          quoteText: quote.quoteText || quote.title,
          attribution: quote.attribution,
        })
        return true
      }

      // Strategy 3: Match by filename from id
      if (quote.id) {
        const filename = quote.id.split('/').pop()?.replace(/\.md$/, '') || ''
        const idPath = quote.id.replace(/\.md$/, '')
        const idWithoutExtension = idPath.replace(/^quotes\//, '') // Remove first quotes/ prefix
        const idWithoutDuplicateQuotes = idWithoutExtension.replace(
          /^quotes\//,
          ''
        ) // Remove second quotes/ if present

        // Make case-insensitive comparisons
        const filenameLower = filename.toLowerCase()
        const idWithoutExtensionLower = idWithoutExtension.toLowerCase()
        const idWithoutDuplicateQuotesLower =
          idWithoutDuplicateQuotes.toLowerCase()
        const currentSlugLower = currentSlug.toLowerCase()

        console.log('🧪 Testing ID matching (case-insensitive):', {
          filename,
          filenameLower,
          idPath,
          idWithoutExtension,
          idWithoutExtensionLower,
          idWithoutDuplicateQuotes,
          idWithoutDuplicateQuotesLower,
          currentSlug,
          currentSlugLower,
          quoteId: quote.id,
        })

        const match3 =
          filenameLower === currentSlugLower ||
          currentSlugLower.includes(filenameLower) ||
          filenameLower.includes(currentSlugLower) ||
          idWithoutExtensionLower === currentSlugLower ||
          currentSlugLower.includes(idWithoutExtensionLower) ||
          idWithoutExtensionLower.includes(currentSlugLower) ||
          idWithoutDuplicateQuotesLower === currentSlugLower ||
          currentSlugLower.includes(idWithoutDuplicateQuotesLower) ||
          idWithoutDuplicateQuotesLower.includes(currentSlugLower)

        if (match3) {
          console.log('✅ Found quote via id/filename:', {
            filename,
            idPath,
            idWithoutExtension,
            currentSlug,
            quoteId: quote.id,
          })
          return true
        }
      }

      return false
    })

    if (!foundQuote) {
      console.log('❌ No quote found for slug:', currentSlug)
      console.log('📋 Sample quote data:', quotesArray[0])
    } else {
      console.log('✅ Successfully found quote:', {
        title: foundQuote.title,
        attribution: foundQuote.attribution,
        slug: currentSlug,
        timestamp: new Date().toISOString(),
      })
    }

    return foundQuote
  })

  const navigateHome = () => {
    router.push('/')
  }

  // Set page meta for social sharing
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
    const attribution = quote.value.attribution
    const currentUrl = `https://wakeupnpc.com${route.path}`

    // Use a simple branded image for Open Graph (much more reliable than dynamic generation)
    const ogImageUrl = `https://wakeupnpc.com/grainy-background-aqua.jpg`

    return {
      title: `${quoteText} - ${attribution}`,
      meta: [
        {
          name: 'description',
          content: `"${quoteText}" — ${attribution}`,
        },
        // Open Graph tags for Facebook
        {
          property: 'og:title',
          content: `"${quoteText}"`,
        },
        {
          property: 'og:description',
          content: `— ${attribution}`,
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
          content: `"${quoteText}"`,
        },
        {
          property: 'twitter:description',
          content: `— ${attribution}`,
        },
        {
          property: 'twitter:image',
          content: ogImageUrl,
        },
      ],
    }
  })
</script>
