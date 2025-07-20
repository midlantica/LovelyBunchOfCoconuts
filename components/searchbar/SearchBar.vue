<!-- components/SearchBar.vue -->
<template>
  <div class="flex flex-col items-center gap-2 w-full h-auto text-seagull-950">
    <div class="relative flex flex-row gap-2 w-full">
      <Icon
        name="mdi:magnify"
        size="2rem"
        class="top-[.3rem] left-[.65rem] absolute text-slate-200/60"
      />
      <input
        type="text"
        v-model="searchTerm"
        class="bg-transparent focus:bg-transparent ps-12 pt-[.3rem] pr-12 pb-[.5rem] border-[#6dd3ff73] border-[1.5px] focus:border-seagull-400/50 rounded-lg outline-none w-full text-[1.5rem] text-slate-200 sm:text-[1.275rem] placeholder:text-seagull-200/50 leading-tight tracking-wide"
        placeholder="Search..."
        @keydown.esc="handleInputEscape"
        ref="searchInputRef"
      />
      <!-- Custom clear button -->
      <button
        v-if="searchTerm"
        @click="clearSearch"
        class="top-[.5rem] right-[.75rem] absolute flex justify-center items-center gap-1 bg-transparent pl-4 rounded-full w-auto transition-colors cursor-pointer"
        type="button"
        aria-label="Clear search"
      >
        <Icon
          name="mdi:keyboard-esc"
          class="hidden sm:block text-white/50 hover:text-white"
          style="font-size: 1.5rem"
        />
        <Icon
          name="mdi:close"
          class="block text-white/80 hover:text-white"
          style="font-size: 1.5rem"
        />
      </button>
    </div>
    <div class="flex flex-row items-center gap-3 px-0 w-full">
      <div class="flex flex-row gap-2">
        <PillButton
          v-for="pill in pills"
          :key="pill.key"
          :label="pill.label"
          :count="pill.count.value"
          :on="filters[pill.key]"
          @click="toggleFilter(pill.key)"
        />
      </div>
      <client-only>
        <span
          class="font-light text-slate-400 uppercase tracking-wider"
          style="font-size: 1.155rem"
        >
          {{ props.totalItemCount }}
        </span>
      </client-only>
    </div>
    <div
      v-if="searchTerm && props.totalCount === 0"
      class="flex flex-col flex-1 justify-center items-center w-full min-h-[60vh]"
    >
      <h1 class="m-auto mt-16 font-light text-white text-2xl text-center">
        No results found, Pinko! 🤣 😜
      </h1>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
  import { debounce } from 'lodash-es'

  const props = defineProps({
    search: String,
    claimCount: { type: Number, default: 0 },
    quoteCount: { type: Number, default: 0 },
    memeCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    filters: {
      type: Object,
      default: () => ({ claims: true, quotes: true, memes: true }),
    },
    totalClaimCount: { type: Number, default: 0 },
    totalQuoteCount: { type: Number, default: 0 },
    totalMemeCount: { type: Number, default: 0 },
    totalItemCount: { type: Number, default: 0 },
  })
  const emit = defineEmits(['update:search', 'update:filters'])

  const searchTerm = ref(props.search || '')
  const searchInputRef = ref(null)

  const debouncedEmitSearch = debounce((val) => {
    emit('update:search', val)
  }, 300)

  const pillClaimCount = computed(() => props.claimCount ?? 0)
  const pillQuoteCount = computed(() => props.quoteCount ?? 0)
  const pillMemeCount = computed(() => props.memeCount ?? 0)

  const pills = [
    { key: 'claims', label: 'CLAIMS', count: pillClaimCount },
    { key: 'quotes', label: 'QUOTES', count: pillQuoteCount },
    { key: 'memes', label: 'MEMES', count: pillMemeCount },
  ]

  function ensureFilterKeys(obj) {
    obj = obj && typeof obj === 'object' ? obj : {}
    return {
      claims: typeof obj.claims === 'boolean' ? obj.claims : true,
      quotes: typeof obj.quotes === 'boolean' ? obj.quotes : true,
      memes: typeof obj.memes === 'boolean' ? obj.memes : true,
    }
  }

  function toggleFilter(key) {
    const filters = ensureFilterKeys(props.filters)
    const keys = Object.keys(filters)
    const onCount = keys.filter((k) => filters[k]).length

    if (onCount === keys.length) {
      // All selected: select only this pill
      keys.forEach((k) => (filters[k] = false))
      filters[key] = true
    } else if (onCount === 1 && filters[key]) {
      // Only this pill is selected: re-select all
      keys.forEach((k) => (filters[k] = true))
    } else {
      // Toggle this pill, but never allow all off
      filters[key] = !filters[key]
      if (Object.values(filters).every((v) => !v)) {
        filters[key] = true
      }
    }
    emit('update:filters', { ...filters })
  }

  function resetFilters() {
    emit('update:filters', { claims: true, quotes: true, memes: true })
  }

  function clearSearch() {
    console.log('🔍 SearchBar clearSearch called')
    searchTerm.value = ''
    resetFilters()
    // Immediately emit the search change instead of waiting for debounce
    console.log('🔍 SearchBar emitting clear search')
    emit('update:search', '')
    // nextTick(() => searchInputRef.value?.focus()) // optional
  }

  function handleInputEscape() {
    // When escape is pressed within the input, always clear if there's text
    if (searchTerm.value.trim() !== '') {
      console.log('🔍 Input escape pressed - clearing search')
      clearSearch()
    } else {
      console.log(
        '🔍 Input escape pressed - no search to clear, blurring input'
      )
      // If no text, just blur the input
      searchInputRef.value?.blur()
    }
  }

  function onGlobalKeydown(e) {
    if (e.key === 'Escape') {
      // Only clear search if there's actually something in the search input
      if (searchTerm.value.trim() !== '') {
        console.log('🔍 Escape key pressed - clearing search')
        clearSearch()
      } else {
        console.log('🔍 Escape key pressed - no search to clear')
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onGlobalKeydown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKeydown)
  })

  watch(searchTerm, (newValue) => {
    console.log('🔍 SearchBar internal searchTerm changed:', newValue)
    debouncedEmitSearch(newValue)
    if (newValue === '') resetFilters()
  })
  watch(
    () => props.search,
    (newValue) => (searchTerm.value = newValue)
  )
</script>

<style scoped>
  /* Hide the default search input clear button since we have a custom one */
  input[type='text']::-webkit-search-cancel-button {
    display: none;
  }
</style>
