<!-- pages/quotes/[...slug].vue -->
<template>
  <div class="mx-auto px-0 pb-3 max-w-3xl">
    <div
      v-if="quote"
      class="bg-slate-900 shadow-[inset_0_0_12px_0_#0f1e24] p-6 rounded-lg text-slate-100"
    >
      <!-- Main quote content -->

      <h1 class="font-light text-2xl tracking-wide">
        {{
          cleanHeading(
            quote.headings && quote.headings.length > 0
              ? quote.headings[0]
              : quote.title
          )
        }}
      </h1>
      <p
        class="mt-2 font-light text-slate-200 text-xl tracking-wide"
        v-if="quote.attribution"
      >
        — {{ quote.attribution }}
      </p>

      <!-- Full markdown content -->
      <div v-if="markdownContent" class="mt-6 pt-4 border-slate-700 border-t">
        <div
          class="prose-invert max-w-none prose prose-sm"
          v-html="markdownContent"
        ></div>
      </div>
    </div>

    <!-- Only show loading state on initial page load, not during navigation -->
    <div
      v-else-if="initialLoad"
      class="flex flex-col flex-wrap gap-1 bg-slate-800 shadow-lg p-6 rounded-lg text-slate-100"
    >
      <p>Loading quote...</p>
      <div v-if="error" class="mt-4 text-red-500">Error: {{ error }}</div>
    </div>

    <!-- Placeholder during navigation to prevent layout shift -->
    <div
      v-else
      class="flex flex-col flex-wrap justify-center items-center gap-1 bg-slate-800 shadow-lg p-6 rounded-lg min-h-[100px] text-slate-100"
    >
      <div class="flex flex-col items-center">
        <Icon name="svg-spinners:90-ring-with-bg" size="2rem" class="mb-2" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useNavigation } from '~/composables/useNavigation'
  import { useContentCache } from '~/composables/useContentCache'
  import MarkdownIt from 'markdown-it'

  // Initialize markdown parser
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  })

  // Define page transition with dynamic direction and layout
  definePageMeta({
    layout: 'content-detail',
    pageTransition: {
      name: 'slide-right',
      mode: 'out-in',
    },
    middleware(to, from) {
      // Default to slide-right
      let transitionName = 'slide-right'

      // If we have navigation info in localStorage, use it to determine direction
      if (typeof window !== 'undefined') {
        const navDirection = localStorage.getItem('navDirection')
        if (navDirection === 'next') {
          transitionName = 'slide-left'
        } else if (navDirection === 'prev') {
          transitionName = 'slide-right'
        }
        // Clear the stored direction
        localStorage.removeItem('navDirection')
      }

      // Apply the transition
      if (
        to.meta.pageTransition &&
        typeof to.meta.pageTransition !== 'boolean'
      ) {
        to.meta.pageTransition.name = transitionName
      }
    },
  })

  const route = useRoute()
  const router = useRouter()
  const quote = ref(null)
  const error = ref(null)
  const allQuotes = ref([])
  const initialLoad = ref(true)
  const markdownContent = ref(null)

  // Get content cache
  const { getAllContent, getContentItem, prefetchContentItem } =
    useContentCache()

  // Clean heading text by removing markdown syntax
  const cleanHeading = (text) => {
    if (!text) return ''
    // Remove markdown heading markers (# or ##)
    return text.replace(/^#+\s+/, '').replace(/^["'](.*)["']$/, '$1')
  }

  // Extract markdown content from the body
  const extractMarkdownContent = (body) => {
    if (!body) return null

    // Remove the frontmatter section
    const contentWithoutFrontmatter = body.replace(/^---[\s\S]*?---/, '').trim()

    // Find the "## Explained:" section
    const explainedMatch = contentWithoutFrontmatter.match(
      /##\s+Explained:[\s\S]*/i
    )

    if (explainedMatch) {
      // Get the content starting from "## Explained:"
      const explainedContent = explainedMatch[0]

      // Remove the "## Explained:" heading
      const contentWithoutHeading = explainedContent.replace(
        /##\s+Explained:\s*/i,
        ''
      )

      // Convert markdown to HTML
      return md.render(contentWithoutHeading)
    }

    return null
  }

  // Get the current slug from the route
  const currentSlug = computed(() => {
    const slugParts = Array.isArray(route.params.slug)
      ? route.params.slug
      : [route.params.slug]
    return slugParts.join('/')
  })

  // Format quotes for navigation
  const formattedQuotes = computed(() => {
    return allQuotes.value.map((item) => ({
      path: item._path,
    }))
  })

  // Use the navigation composable
  const navigation = computed(() => {
    // Only call useNavigation when we have quotes loaded
    if (allQuotes.value.length > 0) {
      return useNavigation(formattedQuotes, currentSlug.value, '/quotes').value
    }
    return { prevSlug: '/', nextSlug: '/' }
  })

  // Update navigation data for the layout
  watch(
    navigation,
    (newNavigation) => {
      if (newNavigation) {
        route.meta.navigation = {
          prevSlug: newNavigation.prevSlug,
          nextSlug: newNavigation.nextSlug,
          contentType: 'quotes',
        }
      }
    },
    { immediate: true, deep: true }
  )

  // Load quote content
  const loadQuote = async () => {
    try {
      // Reset markdown content
      markdownContent.value = null

      // Get the slug from the route - handle nested paths
      const slugParts = Array.isArray(route.params.slug)
        ? route.params.slug
        : [route.params.slug]
      const slug = slugParts.join('/')
      const fullPath = `/quotes/${slug}`

      console.log('Fetching quote with path:', fullPath)

      // First, ensure we have all quotes for navigation
      if (allQuotes.value.length === 0) {
        const data = await getAllContent('quotes')
        allQuotes.value = data || []
      }

      // Get the specific quote
      const foundQuote = await getContentItem('quotes', slug)

      if (foundQuote && !foundQuote.error) {
        quote.value = foundQuote
        console.log('Found quote:', foundQuote)

        // Extract markdown content
        if (foundQuote.body) {
          markdownContent.value = extractMarkdownContent(foundQuote.body)
          console.log('Extracted markdown content:', !!markdownContent.value)
        }

        // Prefetch adjacent quotes for smoother navigation
        if (navigation.value.prevSlug) {
          prefetchContentItem(navigation.value.prevSlug)
        }
        if (navigation.value.nextSlug) {
          prefetchContentItem(navigation.value.nextSlug)
        }
      } else {
        console.error('Quote not found with path:', fullPath)
        error.value = 'Quote not found'
      }
    } catch (err) {
      console.error('Error fetching quote:', err)
      error.value = err.message
    } finally {
      // After first load, set initialLoad to false
      initialLoad.value = false
    }
  }

  // Watch for route changes to load new content without showing loading state
  watch(
    () => route.params.slug,
    () => {
      // Clear current quote to show placeholder during navigation
      quote.value = null
      error.value = null

      // Load the new quote
      loadQuote()
    }
  )

  // Initial load
  onMounted(() => {
    loadQuote()
  })
</script>

<style>
  /* Basic styling for the markdown content */
  .prose p {
    margin-bottom: 1rem;
  }
  .prose h2 {
    font-size: 1.5rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-weight: 300;
  }
  .prose h3 {
    font-size: 1.25rem;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    font-weight: 300;
  }
  .prose img {
    margin: 1.5rem auto;
    border-radius: 0.375rem;
    max-width: 100%;
  }
</style>
