<!-- components/wall/TheWall.vue -->
<template>
  <div>
    <!-- Error state -->
    <WallErrorMessage v-if="error" :error="error" />

    <!-- Loading state -->
    <WallLoadingMessage v-else-if="!isLoaded" />

    <!-- Content wall (no transitions) -->
    <section v-else class="xs:px-2 sm:px-2 md:px-0">
      <div class="flex flex-col gap-3">
        <div
          v-for="(item, index) in interleavedContent"
          :key="itemKey(item, index)"
        >
          <!-- Quotes (full width) -->
          <div
            v-if="item.type === 'quote'"
            class="cursor-pointer"
            role="button"
            tabindex="0"
            @click.capture="openModal(item.data, 'quote', true)"
            @keydown.enter.prevent="openModal(item.data, 'quote', true)"
            @keydown.space.prevent="openModal(item.data, 'quote', true)"
          >
            <WallQuotePanel
              :quote="item.data"
              :slug="item.data?.path || item.data?._path || ''"
            />
          </div>

          <!-- Claim pairs (2 columns on md+, stacked on smaller) -->
          <div
            v-else-if="item.type === 'claimPair'"
            class="gap-3 grid grid-cols-1 md:grid-cols-2"
          >
            <div
              v-for="(claimItem, idx) in item.data"
              :key="claimItem?._path || claimItem?.path || claimItem?.id || idx"
              class="cursor-pointer"
              role="button"
              tabindex="0"
              @click.capture="openModal(claimItem, 'claim', true)"
              @keydown.enter.prevent="openModal(claimItem, 'claim', true)"
              @keydown.space.prevent="openModal(claimItem, 'claim', true)"
            >
              <WallClaimPanel
                :claim="claimItem"
                :slug="claimItem?.path || claimItem?._path || ''"
              />
            </div>
          </div>

          <!-- Meme pairs (2 columns on >=460px using custom 'meme2' breakpoint, stacked below) -->
          <div
            v-else-if="item.type === 'memeRow'"
            class="gap-3 grid grid-cols-1 meme2:grid-cols-2"
          >
            <div
              v-for="(memeItem, idx) in item.data"
              :key="memeItem._path || memeItem.path || memeItem.id || idx"
              class="cursor-pointer"
              role="button"
              tabindex="0"
              @click.capture="openModal(memeItem, 'meme', true)"
              @keydown.enter.prevent="openModal(memeItem, 'meme', true)"
              @keydown.space.prevent="openModal(memeItem, 'meme', true)"
            >
              <WallMemePanel
                :meme="memeItem"
                :slug="memeItem?.path || memeItem?._path || ''"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- No content message -->
      <WallNoContent
        v-if="interleavedContent.length === 0"
        message="No content available"
        @clear-search="onClearSearch"
      />
    </section>
  </div>
</template>

<script setup>
  // Auto-impoorts components/wall/...
  import { useWallFiltering } from '~/composables/useWallFiltering'
  import { useWallModalOpener } from '~/composables/useWallModalOpener'

  // Global guard to avoid click-through reopen after closing a modal
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  // Use the proven content cache system instead of direct queryContent
  const {
    cache,
    loadAllContent, // kept in case we need full reload
    loadInitialContent,
    loadRemainingContent,
  } = useContentCache()

  // Props for search/filters from parent
  const props = defineProps({
    search: { type: String, default: '' },
    filters: {
      type: Object,
      default: () => ({ claims: true, quotes: true, memes: true }),
    },
  })

  // Inject global state (provided by index.vue) and fallback to useState so it persists across routes
  const injectedSearch = inject('searchTerm', null)
  const injectedFilters = inject('contentFilters', null)
  const globalSearch = useState('searchTerm', () => '')
  const globalFilters = useState('contentFilters', () => ({
    claims: true,
    quotes: true,
    memes: true,
  }))

  // Also get global modal opener so we can emit in a stable way through parent
  const openGlobalModal = inject('openModal', null)

  // Effective values: prefer injected (shared) state; fallback to global; finally props
  const effectiveSearch = computed(
    () =>
      (injectedSearch ? injectedSearch.value : globalSearch.value) ??
      props.search
  )
  const effectiveFilters = computed(() => {
    const base = injectedFilters ? injectedFilters.value : globalFilters.value
    // Ensure keys exist
    return {
      claims:
        typeof base?.claims === 'boolean' ? base.claims : props.filters.claims,
      quotes:
        typeof base?.quotes === 'boolean' ? base.quotes : props.filters.quotes,
      memes:
        typeof base?.memes === 'boolean' ? base.memes : props.filters.memes,
    }
  })

  // State
  const isLoaded = ref(false)
  const error = ref(null)

  // Emit counts for search bar
  const emit = defineEmits(['counts', 'modal', 'content-updated'])

  // Clear search and reset filters (triggered from WallNoContent button)
  function onClearSearch() {
    const defaults = { claims: true, quotes: true, memes: true }
    if (injectedSearch) injectedSearch.value = ''
    else globalSearch.value = ''
    if (injectedFilters) injectedFilters.value = { ...defaults }
    else globalFilters.value = { ...defaults }
  }
  // Centralized filtering & counts (DRY extraction)
  const { filteredContent, searchFilteredContent, counts } = useWallFiltering(
    cache,
    effectiveSearch,
    effectiveFilters
  )

  // Stable key generator for top-level pattern items
  function itemKey(item, idx) {
    if (!item) return idx
    if (item.type === 'quote') {
      const q = item.data || {}
      return `q-${q._path || q.path || q.id || idx}`
    }
    const joinIds = (arr = []) =>
      (arr || [])
        .map((d) => d?._path || d?.path || d?.id || '')
        .filter(Boolean)
        .join('|') || idx

    if (item.type === 'claimPair') return `cp-${joinIds(item.data)}`
    if (item.type === 'memeRow') return `mr-${joinIds(item.data)}`
    return idx
  }

  // Use global wall seed for deterministic shuffle per reload/reseed
  const { wallSeed } = useWallSeed()

  // Interleave using seeded shuffle so a reload or explicit reseed changes order,
  // while search/filters just constrain the pools.
  const interleavedContent = computed(() => {
    const { claims, quotes, memes } = filteredContent.value
    const result = interleaveContent(claims, quotes, memes, {
      seed: wallSeed.value,
      enableShuffle: true,
    })
    return result
  })

  // Update displayed items when content changes
  watch(
    interleavedContent,
    (newContent) => {
      if (import.meta.dev && import.meta.env?.VITE_CONTENT_DEBUG === '1')
        console.log('Content updated:', newContent?.length || 0, 'items')
      // Emit that content has been updated (for scroll-to-top)
      emit('content-updated', {
        hasContent: newContent?.length > 0,
        isSearchResult: !!effectiveSearch.value?.trim(),
      })
    },
    { immediate: true }
  )

  // Modal opener composable handles slug, history, popularity tracking
  const { openModal } = useWallModalOpener({
    modalGuardUntil,
    effectiveSearch,
    openGlobalModal,
    emit,
  })

  // Emit counts reactively
  watch(
    counts,
    (c) => {
      emit('counts', c)
    },
    { immediate: true }
  )

  const wallHasLoadedOnce = useState('wallHasLoadedOnce', () => false)

  // If cache already populated (e.g. SPA nav), skip spinner entirely
  if (
    (cache.claims?.length || cache.quotes?.length || cache.memes?.length) &&
    wallHasLoadedOnce.value
  ) {
    isLoaded.value = true
  }

  onMounted(async () => {
    if (isLoaded.value) return // already ready
    try {
      if (import.meta.dev)
        console.log('TheWall mount (progressive load start)', {
          hasLoadedOnce: wallHasLoadedOnce.value,
        })

      if (
        cache.claims.length === 0 &&
        cache.quotes.length === 0 &&
        cache.memes.length === 0
      ) {
        // Progressive: show something fast
        await loadInitialContent(24)
        isLoaded.value = true
        wallHasLoadedOnce.value = true
        // Background full load (don't await; no spinner)
        loadRemainingContent().catch((e) =>
          console.error('Error loading remaining content:', e)
        )
      } else {
        // Cache had content but first visit this session
        isLoaded.value = true
        wallHasLoadedOnce.value = true
      }
    } catch (err) {
      console.error('Error loading content:', err)
      error.value = err
      isLoaded.value = true // fail open so UI still renders
    }
  })
</script>

<style scoped>
  /* Row transitions */
  .wall-row-enter-active,
  .wall-row-leave-active {
    transition: opacity 220ms ease,
      transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  /* Keep layout stable while an item fades out */
  .wall-row-leave-active {
    position: absolute;
    width: 100%;
  }
  .wall-row-enter-from,
  .wall-row-leave-to {
    opacity: 0;
    transform: translateY(4px);
  }
  .wall-row-move {
    transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Inner grid items */
  .wall-col-enter-active,
  .wall-col-leave-active {
    transition: opacity 200ms ease,
      transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .wall-col-leave-active {
    position: absolute;
    width: 100%;
  }
  .wall-col-enter-from,
  .wall-col-leave-to {
    opacity: 0;
    transform: translateY(3px);
  }
  .wall-col-move {
    transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .wall-row-move,
    .wall-col-move {
      transition-duration: 1ms !important;
    }
  }
</style>
