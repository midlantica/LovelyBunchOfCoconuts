<!-- pages/index.vue -->
<template>
  <div class="gap-3 grid grid-rows-[auto_1fr] h-full overflow-hidden">
    <!-- Search Bar -->
    <div class="flex justify-center">
      <div class="mx-auto px-4 md:px-0 w-full max-w-screen-md">
        <SearchBar
          v-model:search="searchTerm"
          v-model:filters="contentFilters"
          :claim-count="wallCounts.claims"
          :quote-count="wallCounts.quotes"
          :meme-count="wallCounts.memes"
          :total-count="wallCounts.total"
          :total-claim-count="totalCounts.claims"
          :total-quote-count="totalCounts.quotes"
          :total-meme-count="totalCounts.memes"
          :total-item-count="totalCounts.total"
          class="top-0 z-10 sticky w-full"
        />
      </div>
    </div>

    <!-- Content Wall -->
    <div
      class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
    >
      <div class="mx-auto md:px-0 pr-3 pl-2 w-full max-w-screen-md">
        <main class="pb-8">
          <TheWall
            :search="searchTerm"
            :filters="contentFilters"
            @counts="handleCounts"
            @modal="handleModal"
            @content-updated="handleContentUpdated"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
  // Explicit imports to ensure components resolve
  import SearchBar from '~/components/searchbar/SearchBar.vue'
  import TheWall from '~/components/wall/TheWall.vue'

  // Simple SSR-safe search/filter state
  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    claims: true,
    quotes: true,
    memes: true,
  }))

  // Count tracking
  const wallCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ claims: 0, quotes: 0, memes: 0, total: 0 })

  // Get modal handlers from layout
  const handleModal = inject('openModal')

  // Handle hash URLs for backward compatibility (Twitter shares, bookmarks, etc.)
  onMounted(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      console.log('🔗 Hash changed:', hash)
      if (hash) {
        // Parse hash like #meme-socialism-revolutions
        const match = hash.match(/^#(claim|quote|meme)-(.+)$/)
        console.log('🔍 Hash match result:', match)
        if (match) {
          const [, contentType, slug] = match
          console.log('🎯 Opening content:', contentType, slug)

          // Clear the hash to prevent router scroll warnings
          window.history.replaceState(
            {},
            '',
            window.location.pathname + window.location.search
          )

          openContentFromSlug(contentType, slug)
        }
      }
    }

    // Handle initial hash and hash changes
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)

    onUnmounted(() => {
      window.removeEventListener('hashchange', handleHashChange)
    })
  })

  const openContentFromSlug = async (contentType, slug) => {
    console.log('🔍 Looking for content:', { contentType, slug })

    try {
      // Import content cache to find the item
      const { useContentCache } = await import('~/composables/useContentCache')
      const { claims, quotes, memes, loadAllContent } = useContentCache()

      // Wait for content to load if it's not ready yet
      await nextTick()

      console.log('📊 Raw content state:', {
        claimsExists: !!claims,
        quotesExists: !!quotes,
        memesExists: !!memes,
        claimsValue: claims?.value,
        quotesValue: quotes?.value,
        memesValue: memes?.value,
      })

      // Check if content is still loading and wait longer
      if (
        !claims?.value ||
        !quotes?.value ||
        !memes?.value ||
        claims.value.length === 0 ||
        quotes.value.length === 0 ||
        memes.value.length === 0
      ) {
        console.log('⏳ Content still loading, forcing load...')

        // Force load all content if not loaded
        await loadAllContent()

        // Wait another moment for reactivity to update
        await nextTick()

        // If still no content after forced load, retry in a moment
        if (
          !claims?.value ||
          !quotes?.value ||
          !memes?.value ||
          claims.value.length === 0 ||
          quotes.value.length === 0 ||
          memes.value.length === 0
        ) {
          console.log('⏳ Still loading after forced load, retrying in 1s...')
          setTimeout(() => openContentFromSlug(contentType, slug), 1000)
          return
        }
      }

      console.log('📊 Content counts:', {
        claims: claims.value?.length || 0,
        quotes: quotes.value?.length || 0,
        memes: memes.value?.length || 0,
      })

      let item = null

      if (contentType === 'claim') {
        item = claims.value.find((claim) => {
          const claimSlug = (claim.claim || claim.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50)
          return claimSlug === slug
        })
      } else if (contentType === 'quote') {
        item = quotes.value.find((quote) => {
          const author = (quote.attribution || 'unknown')
            .toLowerCase()
            .replace(/\s+/g, '-')
          const quoteStart = (quote.quoteText || quote.title || '')
            .split(' ')
            .slice(0, 3)
            .join(' ')
          const quoteSlug = quoteStart
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
          const fullSlug = `${author}-${quoteSlug}`.substring(0, 50)
          return fullSlug === slug
        })
      } else if (contentType === 'meme') {
        item = memes.value.find((meme) => {
          const memeSlug = (meme.title || meme.description || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50)
          console.log('🧪 Testing meme slug:', {
            title: meme.title,
            generated: memeSlug,
            target: slug,
            matches: memeSlug === slug,
          })
          return memeSlug === slug
        })
      }

      console.log(
        '🎯 Found item:',
        !!item,
        item?.title || item?.claim || item?.quoteText
      )

      if (item && handleModal) {
        console.log('✅ Opening modal for:', contentType)
        handleModal(contentType, item)
      } else {
        console.log('❌ Could not open modal:', {
          hasItem: !!item,
          hasHandler: !!handleModal,
        })
      }
    } catch (error) {
      console.error('💥 Error in openContentFromSlug:', error)
    }
  }

  // Handle content updates and scroll to top for search results
  function handleContentUpdated({ hasContent, isSearchResult }) {
    if (isSearchResult && hasContent) {
      console.log(
        '🔍 Search results loaded via content-updated event, scrolling to top'
      )
      nextTick(() => {
        // Find the scroll container and scroll it to top
        const scrollContainer = document.querySelector(
          '.scroll-container-stable'
        )
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
    }
  }

  // Also watch search term directly for immediate scroll (backup)
  watch(searchTerm, (newTerm, oldTerm) => {
    if (newTerm && newTerm.trim() !== '' && newTerm !== oldTerm) {
      console.log(
        '🔍 Search term changed to:',
        newTerm,
        '- scrolling to top immediately'
      )
      // Small delay to let the search start processing
      setTimeout(() => {
        const scrollContainer = document.querySelector(
          '.scroll-container-stable'
        )
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 100)
    }
  })

  // Count handlers
  function handleCounts({ wallCounts: wc, totalCounts: tc }) {
    wallCounts.value = wc
    totalCounts.value = tc
  }

  // Provide search state for child components
  provide('searchTerm', searchTerm)
  provide('contentFilters', contentFilters)
</script>
