<!-- components/wall/TheWall.vue -->
<template>
  <div>
    <!-- Error state -->
    <div v-if="error" class="py-8 text-red-500 text-center">
      <strong>Error loading content:</strong>
      <span>{{ error.message || error }}</span>
    </div>

    <!-- Loading state -->
    <div
      v-else-if="!isLoaded"
      class="flex flex-col justify-center items-center gap-4 min-h-[60vh]"
    >
      <div class="flex flex-col items-center gap-4">
        <Icon name="svg-spinners:ring-resize" size="2rem" class="text-white" />
        <h1 class="font-light text-white text-xl text-center">
          Loading content...
        </h1>
      </div>
    </div>

    <!-- Content wall -->
    <section v-else class="flex flex-col gap-3 xs:px-2 sm:px-2 md:px-0">
      <div
        v-for="(item, index) in interleavedContent"
        :key="index"
        class="content-item"
      >
        <!-- Quotes (full width) -->
        <QuotePanel
          v-if="item.type === 'quote'"
          :quote="item.data"
          :slug="item.data?.path || item.data?._path || ''"
          @click="openModal(item.data, 'quote')"
        />

        <!-- Claim pairs (2 columns on md+, stacked on smaller) -->
        <div
          v-else-if="item.type === 'claimPair'"
          class="gap-3 grid grid-cols-1 md:grid-cols-2"
        >
          <ClaimPanel
            v-for="(claimItem, idx) in item.data"
            :key="idx"
            :claim="claimItem"
            :slug="claimItem?.path || claimItem?._path || ''"
            @click="openModal(claimItem, 'claim')"
          />
        </div>

        <!-- Meme pairs (2 columns on md+, stacked on smaller) -->
        <div
          v-else-if="item.type === 'memeRow'"
          class="gap-3 grid grid-cols-1 md:grid-cols-2"
        >
          <MemePanel
            v-for="(memeItem, idx) in item.data"
            :key="memeItem._path || memeItem.path || idx"
            :meme="memeItem"
            :slug="memeItem?.path || memeItem?._path || ''"
            @click="openModal(memeItem, 'meme')"
          />
        </div>
      </div>

      <!-- No content message -->
      <div
        v-if="interleavedContent.length === 0"
        class="flex flex-col justify-center items-center gap-4 min-h-[40vh]"
      >
        <h1 class="font-light text-white text-xl text-center">
          No content available
        </h1>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { interleaveContent } from '~/composables/interleaveContent'
  import { useContentCache } from '~/composables/useContentCache'

  // Use the proven content cache system instead of direct queryContent
  const { cache, loadAllContent } = useContentCache()

  // Props for search/filters from parent
  const props = defineProps({
    search: { type: String, default: '' },
    filters: {
      type: Object,
      default: () => ({ claims: true, quotes: true, memes: true }),
    },
  })

  // State
  const isLoaded = ref(false)
  const error = ref(null)

  // Computed content arrays from cache
  const allClaims = computed(() => cache.claims || [])
  const allQuotes = computed(() => cache.quotes || [])
  const allMemes = computed(() => cache.memes || [])

  // Simple content filtering
  const filteredContent = computed(() => {
    // Early return if cache isn't ready yet
    if (!cache.claims && !cache.quotes && !cache.memes) {
      return { claims: [], quotes: [], memes: [] }
    }

    let filteredClaims = props.filters.claims ? allClaims.value : []
    let filteredQuotes = props.filters.quotes ? allQuotes.value : []
    let filteredMemes = props.filters.memes ? allMemes.value : []

    // Apply search filter using searchableText from useContentCache
    if (props.search?.trim()) {
      const searchLower = props.search.toLowerCase()

      filteredClaims = filteredClaims.filter((item) =>
        item.searchableText?.toLowerCase().includes(searchLower)
      )

      filteredQuotes = filteredQuotes.filter((item) =>
        item.searchableText?.toLowerCase().includes(searchLower)
      )

      filteredMemes = filteredMemes.filter((item) =>
        item.searchableText?.toLowerCase().includes(searchLower)
      )
    }

    return {
      claims: filteredClaims,
      quotes: filteredQuotes,
      memes: filteredMemes,
    }
  })

  // Simple interleaving using the established pattern
  const interleavedContent = computed(() => {
    const { claims, quotes, memes } = filteredContent.value
    console.log('Interleaving content:', {
      claims: claims.length,
      quotes: quotes.length,
      memes: memes.length,
    })
    const result = interleaveContent(claims, quotes, memes)
    console.log('Interleaved result:', result.length, 'items')
    return result
  })

  // Update displayed items when content changes
  watch(
    interleavedContent,
    (newContent) => {
      console.log('Content updated:', newContent?.length || 0, 'items')
    },
    { immediate: true }
  )

  // Emit counts for search bar
  const emit = defineEmits(['counts', 'modal'])

  // Modal handler
  const openModal = (data, type) => {
    console.log('Opening modal:', { type, data })
    console.log('Modal slug would be:', data?.slug || data?._path || data?.path)
    emit('modal', { type, data })
  }

  watch(
    filteredContent,
    (content) => {
      emit('counts', {
        wallCounts: {
          claims: content.claims.length,
          quotes: content.quotes.length,
          memes: content.memes.length,
          total:
            content.claims.length +
            content.quotes.length +
            content.memes.length,
        },
        totalCounts: {
          claims: allClaims.value.length,
          quotes: allQuotes.value.length,
          memes: allMemes.value.length,
          total:
            allClaims.value.length +
            allQuotes.value.length +
            allMemes.value.length,
        },
      })
    },
    { immediate: true }
  )

  onMounted(async () => {
    try {
      // Ensure cache is initialized first
      console.log('TheWall mounting, cache state:', cache)

      // Load content using the proven cache system
      await loadAllContent()

      console.log('TheWall loaded with cache:', {
        claims: cache.claims?.length,
        quotes: cache.quotes?.length,
        memes: cache.memes?.length,
      })
      console.log('Computed arrays:', {
        allClaims: allClaims.value?.length,
        allQuotes: allQuotes.value?.length,
        allMemes: allMemes.value?.length,
      })
    } catch (err) {
      console.error('Error loading content:', err)
      error.value = err
    } finally {
      isLoaded.value = true
    }
  })
</script>

<style scoped>
  .content-item {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }
</style>
