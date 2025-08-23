<!-- components/SearchBar.vue -->
<template>
  <div class="flex flex-col items-center gap-2 w-full h-auto text-seagull-950">
    <div class="relative flex flex-row gap-2 w-full">
      <Icon
        name="mdi:magnify"
        size="1.7rem"
        class="top-1/2 left-[.74rem] absolute text-slate-200/60 -translate-y-1/2"
      />
      <input
        type="text"
        v-model="searchTerm"
        class="[&::-webkit-search-cancel-button]:hidden bg-transparent focus:bg-transparent ps-[2.5rem] pt-[.35rem] pr-[7rem] pb-[.5rem] border-[#6dd3fe7a] border-[thin] focus:border-seagull-400 rounded-[20px] outline-none w-full font-light text-[1.2rem] text-slate-200 sm:text-[1.1rem] placeholder:text-seagull-200/50 leading-tight tracking-wider"
        placeholder="Search..."
        @keydown.esc="handleInputEscape"
        @input="handleSearchInput"
        ref="searchInputRef"
      />
      <!-- Right control group: Filter, ESC, X -->
      <div
        class="top-1/2 right-3 absolute flex items-center gap-3 -translate-y-1/2"
      >
        <client-only>
          <span
            class="font-light text-[.95rem] text-slate-300 tracking-wider"
            aria-label="Total results"
          >
            {{ totalDisplay }}
          </span>
        </client-only>
        <SearchbarFilterBtnMenu
          :filters="props.filters"
          :counts="props.counts"
          :inline="true"
          @update:filters="(f) => emit('update:filters', f)"
        />
        <button
          v-if="searchTerm"
          @click="clearSearch"
          class="flex items-center gap-1 bg-transparent rounded-full w-auto transition-colors cursor-pointer"
          type="button"
          aria-label="Clear search"
        >
          <Icon
            name="mdi:keyboard-esc"
            class="hidden sm:block text-[1.35rem] text-white/50 hover:text-white"
          />
          <Icon
            name="mdi:close"
            class="block text-[1.35rem] text-white/80 hover:text-white"
          />
        </button>
      </div>
    </div>
    <div class="flex flex-row items-center gap-2 px-0 w-full">
      <div class="flex-1">
        <SearchbarIdeologyTagCloud
          :active-term="searchTerm"
          @select="onSelectIdeology"
        />
      </div>
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
  import { debounce } from 'lodash-es'
  import { ideologies } from '~/data/ideologies'

  const props = defineProps({
    search: String,
    counts: {
      type: Object,
      required: true,
      default: () => ({
        wall: { claims: 0, quotes: 0, memes: 0, total: 0 },
        total: { claims: 0, quotes: 0, memes: 0, total: 0 },
      }),
    },
    filters: {
      type: Object,
      default: () => ({ claims: true, quotes: true, memes: true }),
    },
  })
  const emit = defineEmits(['update:search', 'update:filters'])

  const searchTerm = ref(props.search || '')
  const searchInputRef = ref(null)

  // Map lowercase ideology term -> canonical term casing
  const ideologyCanonicalByLower = Object.fromEntries(
    ideologies.map((i) => [i.term.toLowerCase(), i.term])
  )

  const debouncedEmitSearch = debounce((val) => {
    emit('update:search', val)
  }, 300)

  const pillClaimCount = computed(() => props.counts.wall.claims || 0)
  const pillQuoteCount = computed(() => props.counts.wall.quotes || 0)
  const pillMemeCount = computed(() => props.counts.wall.memes || 0)
  const totalDisplay = computed(() => props.counts.wall.total || 0)

  // Pill buttons removed; filter menu now lives in the input; counts remain

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
    if (import.meta.dev) console.log('🔍 SearchBar clearSearch called')
    searchTerm.value = ''
    resetFilters()
    // Immediately emit the search change instead of waiting for debounce
    if (import.meta.dev) console.log('🔍 SearchBar emitting clear search')
    emit('update:search', '')
    // Ensure focus stays on search input to prevent pill focus ring
    nextTick(() => searchInputRef.value?.focus())
    // Remove q param from URL if present
    try {
      const router = useRouter()
      const route = useRoute()
      if (route.query.q) {
        router.replace({
          path: route.path,
          query: { ...route.query, q: undefined },
        })
      }
    } catch {}
  }

  function handleSearchInput() {
    if (import.meta.dev)
      console.log('🔍 SearchBar immediate input change - scrolling to top')
    // Immediately scroll to top on any input change
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleInputEscape() {
    // When escape is pressed within the input, always clear if there's text
    if (searchTerm.value.trim() !== '') {
      if (import.meta.dev)
        console.log('🔍 Input escape pressed - clearing search')
      clearSearch()
    } else {
      if (import.meta.dev)
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
        if (import.meta.dev)
          console.log('🔍 Escape key pressed - clearing search')
        clearSearch()
      } else {
        if (import.meta.dev)
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
    if (import.meta.dev)
      console.log('🔍 SearchBar internal searchTerm changed:', newValue)
    // Normalize case to match tag cloud items when input equals a tag term
    const trimmed = (newValue || '').trim()
    const canonical = ideologyCanonicalByLower[trimmed.toLowerCase()]
    let valueToEmit = newValue
    if (canonical && newValue !== canonical) {
      searchTerm.value = canonical
      valueToEmit = canonical
    }
    debouncedEmitSearch(valueToEmit)
    if (valueToEmit === '') resetFilters()
  })
  watch(
    () => props.search,
    (newValue) => (searchTerm.value = newValue)
  )

  function onSelectIdeology(term) {
    searchTerm.value = term
    // Emit immediately to feel responsive
    emit('update:search', term)
    nextTick(() => searchInputRef.value?.focus())
  }
</script>
