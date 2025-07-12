<!-- pages/debug.vue -->
<template>
  <div class="mx-auto p-8 max-w-4xl">
    <h1 class="mb-6 font-bold text-3xl">Debug Content</h1>

    <div class="mb-6">
      <h2 class="mb-4 font-bold text-xl">Cache Status</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p>Claims: {{ cache.claims.length }}</p>
        <p>Quotes: {{ cache.quotes.length }}</p>
        <p>Memes: {{ cache.memes.length }}</p>
        <p>Is Loading: {{ cache.isLoading }}</p>
        <p>Error: {{ cache.error }}</p>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="mb-4 font-bold text-xl">Displayed Items</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p>Total displayed: {{ displayedItems.length }}</p>
        <div
          v-for="(item, index) in displayedItems.slice(0, 5)"
          :key="index"
          class="bg-white mb-2 p-2 rounded"
        >
          <p><strong>Type:</strong> {{ item.type }}</p>
          <p>
            <strong>Data length:</strong>
            {{ Array.isArray(item.data) ? item.data.length : 1 }}
          </p>
          <p v-if="item.type === 'quote'">
            <strong>Quote:</strong> {{ item.data?.title || 'No title' }}
          </p>
          <p v-if="item.type === 'claimPair'">
            <strong>Claims:</strong>
            {{ item.data?.map((c) => c.title).join(', ') || 'No titles' }}
          </p>
          <p v-if="item.type === 'memeRow'">
            <strong>Memes:</strong>
            {{ item.data?.map((m) => m.title).join(', ') || 'No titles' }}
          </p>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="mb-4 font-bold text-xl">Actions</h2>
      <button
        @click="loadContent"
        class="bg-blue-500 mr-2 px-4 py-2 rounded text-white"
      >
        Load Content
      </button>
      <button
        @click="loadMore"
        class="bg-green-500 px-4 py-2 rounded text-white"
      >
        Load More
      </button>
    </div>

    <!-- Sample content display -->
    <div class="mb-6">
      <h2 class="mb-4 font-bold text-xl">Sample Rendered Content</h2>
      <div v-if="displayedItems.length > 0" class="space-y-4">
        <div v-for="(item, index) in displayedItems.slice(0, 3)" :key="index">
          <QuotePanel
            v-if="item.type === 'quote'"
            :quote="item.data"
            :slug="item.data?.path || item.data?._path || ''"
          />
          <div
            v-else-if="item.type === 'claimPair'"
            class="gap-3 grid grid-cols-1 md:grid-cols-2"
          >
            <ClaimTranslationPanel
              v-for="(claimItem, idx) in item.data"
              :key="idx"
              :claim="claimItem"
              :slug="claimItem?.path || claimItem?._path || ''"
            />
          </div>
          <div
            v-else-if="item.type === 'memeRow'"
            class="gap-3 grid grid-cols-1 md:grid-cols-2"
          >
            <MemePanel
              v-for="(memeItem, idx) in item.data"
              :key="idx"
              :meme="memeItem"
              :slug="memeItem?.path || memeItem?._path || ''"
            />
          </div>
        </div>
      </div>
      <div v-else class="bg-gray-100 p-4 rounded text-gray-500 text-center">
        No content to display
      </div>
    </div>
  </div>
</template>

<script setup>
  import { inject, ref, onMounted } from 'vue'
  import { useContentCache } from '~/composables/useContentCache'

  definePageMeta({
    layout: 'default',
  })

  // Get from layout if available, otherwise create our own
  const displayedItems = inject('displayedItems', ref([]))
  const loadMoreFromLayout = inject('loadMoreContent')

  const { cache, loadInitialContent, getFilteredContent } = useContentCache()

  const loadContent = async () => {
    console.log('🔍 Debug: Loading content...')
    await loadInitialContent(20)

    const filtered = getFilteredContent('', {
      claims: true,
      quotes: true,
      memes: true,
    })
    console.log('🔍 Debug: Filtered content:', filtered)

    if (!inject('displayedItems', null)) {
      displayedItems.value = filtered.slice(0, 10)
    }
  }

  const loadMore = async () => {
    if (loadMoreFromLayout) {
      await loadMoreFromLayout(10)
    }
  }

  // Load content on mount
  onMounted(() => {
    loadContent()
  })
</script>
