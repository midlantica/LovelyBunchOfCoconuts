<!-- components/SearchBar.vue -->
<template>
  <div class="flex flex-col items-center gap-2 w-full h-auto text-seagull-950">
    <div class="relative flex flex-row gap-2 w-full overflow-visible">
      <Icon
        name="mdi:magnify"
        size="1.4rem"
        class="top-1/2 left-[.5rem] absolute text-slate-200/60 -translate-y-1/2"
      />
      <!-- Tokenized input with pills -->
      <div
        class="bg-transparent focus-within:bg-transparent px-[2.25rem] py-[0.2rem] border-[thin] border-seagull-400/40 rounded-[20px] outline-none w-full font-100 text-[1.02rem] text-slate-200 sm:text-[0.935rem] leading-none tracking-wider"
        @click="focusInnerInput"
      >
        <div
          class="flex flex-wrap items-center content-center gap-1 leading-none"
        >
          <template v-for="(t, idx) in tokens" :key="t + ':' + idx">
            <span
              class="group inline-flex items-center gap-0.5 bg-white/15 hover:bg-white/25 py-0.5 pr-2 pl-2.5 rounded-full focus:outline-none text-[.825rem] text-white/80 leading-none transition-colors cursor-pointer select-none"
              :class="{ 'pill-flash': isFlashing(t) }"
              role="button"
              tabindex="0"
              @click.stop="removeToken(idx)"
              @keydown.enter.prevent="removeToken(idx)"
              @keydown.space.prevent="removeToken(idx)"
            >
              <span
                class="block group-hover:text-white align-middle leading-none whitespace-nowrap"
                >{{ t }}</span
              >
              <button
                type="button"
                class="flex justify-center items-center -mr-1 ml-0.5 p-0 w-[1.25rem] h-[1.25rem] text-white/70 hover:text-white group-hover:text-white transition-colors cursor-pointer"
                :aria-label="`Remove ${t}`"
                @click.stop="removeToken(idx)"
              >
                <Icon
                  name="mdi:close"
                  class="block text-[1.1rem] align-middle leading-none"
                />
              </button>
            </span>
          </template>
          <input
            type="text"
            v-model="inputText"
            id="search-input"
            name="q"
            aria-label="Search terms"
            class="flex-1 bg-transparent focus:bg-transparent pb-0.5 outline-none min-w-[6ch] h-[1.6rem] placeholder:text-seagull-200/50 leading-[1.6rem]"
            :placeholder="tokens.length ? '' : 'Search...'"
            @keydown.enter.prevent="handleEnterKey()"
            @blur="commitInputAsToken()"
            @keydown="onKeydown"
            @keyup="onKeyup"
            @keydown.esc="handleInputEscape"
            @input="handleSearchInput"
            ref="searchInputRef"
          />
        </div>
      </div>
      <!-- Search suggestions dropdown -->
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="top-full right-0 left-0 z-[5] absolute bg-slate-800 shadow-lg mt-1 border border-seagull-400/40 rounded-lg max-h-64 overflow-y-auto"
      >
        <div
          v-for="(suggestion, idx) in suggestions"
          :key="suggestion.term + idx"
          class="px-4 py-2 text-slate-200 transition-colors cursor-pointer"
          :class="{
            'bg-slate-700': selectedSuggestionIndex === idx,
            'hover:bg-slate-600': selectedSuggestionIndex !== idx,
          }"
          @click="selectSuggestion(suggestion)"
          @mouseenter="selectedSuggestionIndex = idx"
        >
          <div class="flex justify-between items-center">
            <span class="font-100">{{ suggestion.term }}</span>
            <span class="text-slate-400 text-xs capitalize">{{
              suggestion.type
            }}</span>
          </div>
        </div>
      </div>

      <!-- Right control group: Filter, ESC, X -->
      <div
        class="top-1/2 right-3 absolute flex items-center gap-1 overflow-visible -translate-y-1/2"
      >
        <client-only>
          <span
            class="font-100 text-[.95rem] text-slate-300 tracking-wider"
            aria-label="Total results"
          >
            {{ totalDisplay }}
          </span>
        </client-only>
        <SearchbarFilterBtnMenu
          v-if="showInlineFilterMenu"
          :filters="props.filters"
          :counts="props.counts"
          :inline="true"
          @update:filters="(f) => emit('update:filters', f)"
        />
        <button
          v-if="hasSearch"
          @click="clearSearch"
          class="flex items-center gap-1 bg-transparent rounded-full w-auto transition-colors cursor-pointer"
          type="button"
          aria-label="Clear search"
        >
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
          :active-term="tokens"
          @select="onSelectIdeology"
        />
      </div>
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
        wall: { grifts: 0, quotes: 0, memes: 0, total: 0 },
        total: { grifts: 0, quotes: 0, memes: 0, total: 0 },
      }),
    },
    filters: {
      type: Object,
      default: () => ({ grifts: true, quotes: true, memes: true }),
    },
  })
  const emit = defineEmits(['update:search', 'update:filters'])
  // Hide inline filter menu for now; flip to true to re-enable or move elsewhere
  const showInlineFilterMenu = false

  // Tokenized search state
  const tokens = ref([])
  const inputText = ref('')
  const joinedSearch = computed(() => [...tokens.value].join(' ').trim())
  const hasSearch = computed(() => tokens.value.length > 0)
  const searchInputRef = ref(null)
  const router = useRouter()
  const route = useRoute()
  const lastEmittedSearch = ref('')
  const popLock = ref(false)
  const flashingTokens = ref(new Set())

  // Search autocomplete state
  const showSuggestions = ref(false)
  const suggestions = ref([])
  const recentSearches = useState('recentSearches', () => [])
  const selectedSuggestionIndex = ref(-1)

  // Ensure suggestions is always an array
  if (!suggestions.value) {
    suggestions.value = []
  }

  // Map lowercase ideology term -> canonical term casing
  const ideologyCanonicalByLower = Object.fromEntries(
    ideologies.map((i) => [i.term.toLowerCase(), i.term])
  )

  const debouncedEmitSearch = debounce((val) => {
    lastEmittedSearch.value = val
    emit('update:search', val)
    // Update the display URL preserving literal '+' separators
    updateUrlWithTokens()
  }, 250)

  const pillGriftCount = computed(() => props.counts.wall.grifts || 0)
  const pillQuoteCount = computed(() => props.counts.wall.quotes || 0)
  const pillMemeCount = computed(() => props.counts.wall.memes || 0)
  const totalDisplay = computed(() => props.counts.wall.total || 0)
  const sharedCopied = ref(false)
  function copyShareUrl() {
    try {
      const href = buildShareUrlWithTokens()
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(href)
      } else {
        const ta = document.createElement('textarea')
        ta.value = href
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      sharedCopied.value = true
      setTimeout(() => (sharedCopied.value = false), 1200)
    } catch {}
  }

  // Pill buttons removed; filter menu now lives in the input; counts remain

  function ensureFilterKeys(obj) {
    obj = obj && typeof obj === 'object' ? obj : {}
    return {
      grifts: typeof obj.grifts === 'boolean' ? obj.grifts : true,
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
    emit('update:filters', { grifts: true, quotes: true, memes: true })
  }

  function clearSearch() {
    if (import.meta.dev) console.log('🔍 SearchBar clearSearch called')
    tokens.value = []
    inputText.value = ''
    resetFilters()
    // Immediately emit the search change instead of waiting for debounce
    if (import.meta.dev) console.log('🔍 SearchBar emitting clear search')
    emit('update:search', '')
    // Ensure focus stays on search input to prevent pill focus ring
    nextTick(() => searchInputRef.value?.focus())
    // Remove q param from URL if present (preserve other params and literal '+')
    try {
      updateUrlWithTokens([])
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

  // When escape is pressed within the input, always clear if there's text/tokens
  function handleInputEscape() {
    if (inputText.value.trim() !== '' || tokens.value.length > 0) {
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
      if (inputText.value.trim() !== '' || tokens.value.length > 0) {
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

  // Emit whenever tokens change
  watch(
    tokens,
    (arr) => {
      const valueToEmit = arr.join(' ').trim()
      debouncedEmitSearch(valueToEmit)
      if (valueToEmit === '') resetFilters()
    },
    { deep: true }
  )
  // Keep internal tokens in sync with prop changes (e.g., initial q)
  watch(
    () => props.search,
    (newValue) => {
      const incoming = String(newValue || '')
      if (incoming === lastEmittedSearch.value) return
      const parsed = parseToTokens(incoming)
      tokens.value = parsed
    },
    { immediate: true }
  )

  function onSelectIdeology(term) {
    // Toggle-add behavior for multi-term search
    const lower = term.toLowerCase()
    const idx = tokens.value.findIndex((p) => p.toLowerCase() === lower)
    if (idx >= 0) tokens.value.splice(idx, 1)
    else tokens.value.push(canonicalizeToken(term))
    // Emit immediately to feel responsive and guard re-parse
    lastEmittedSearch.value = joinedSearch.value
    emit('update:search', joinedSearch.value)
    // On mobile, blur to dismiss keyboard after selecting a tag
    // On desktop, keep focus for continued typing
    nextTick(() => {
      if (window.innerWidth < 768) {
        searchInputRef.value?.blur()
      } else {
        searchInputRef.value?.focus()
      }
    })
  }

  // Helpers for tokenized input
  function parseToTokens(text) {
    const raw = String(text || '').trim()
    if (!raw) return []
    if (raw.includes('+')) {
      return raw
        .split('+')
        .map((s) => s.replace(/_/g, ' ').trim())
        .filter(Boolean)
        .map(canonicalizeToken)
    }
    // Fallback: treat as a single token (preserve spaces in phrases)
    return [canonicalizeToken(raw)]
  }
  function canonicalizeToken(t) {
    const cleaned = String(t || '').replace(/_/g, ' ')
    const c = ideologyCanonicalByLower[cleaned.toLowerCase()]
    return c || cleaned
  }
  function commitInputAsToken() {
    const raw = inputText.value.trim()
    if (!raw) return
    const token = canonicalizeToken(raw)
    const exists = tokens.value.some(
      (p) => p.toLowerCase() === token.toLowerCase()
    )
    if (exists) {
      inputText.value = ''
      flashToken(token)
      return
    }
    tokens.value.push(token)
    inputText.value = ''
  }

  // Handle Enter key - commit token and blur to dismiss keyboard on mobile
  function handleEnterKey() {
    commitInputAsToken()
    // Blur the input to dismiss the keyboard on mobile devices
    if (searchInputRef.value) {
      searchInputRef.value.blur()
    }
  }
  function onKeydown(e) {
    const k = e.key

    // Handle suggestion navigation when suggestions are visible
    if (showSuggestions.value && suggestions.value.length > 0) {
      if (k === 'ArrowDown') {
        e.preventDefault()
        selectedSuggestionIndex.value = Math.min(
          selectedSuggestionIndex.value + 1,
          suggestions.value.length - 1
        )
        return
      } else if (k === 'ArrowUp') {
        e.preventDefault()
        selectedSuggestionIndex.value = Math.max(
          selectedSuggestionIndex.value - 1,
          0
        )
        return
      } else if (k === 'Enter') {
        e.preventDefault()
        if (
          selectedSuggestionIndex.value >= 0 &&
          selectedSuggestionIndex.value < suggestions.value.length
        ) {
          selectSuggestion(suggestions.value[selectedSuggestionIndex.value])
        } else {
          // No selection, commit current input as token
          commitInputAsToken()
        }
        return
      } else if (k === 'Escape') {
        e.preventDefault()
        showSuggestions.value = false
        selectedSuggestionIndex.value = -1
        return
      }
    }

    if ((k === 'Backspace' || k === 'Delete') && inputText.value.length === 0) {
      if (tokens.value.length > 0 && !popLock.value) {
        tokens.value.pop()
        popLock.value = true
      }
      e.preventDefault()
    }
    // Allow spaces to be typed as part of a single token; do not commit on space
  }
  function onKeyup(e) {
    const k = e.key
    if (k === 'Backspace' || k === 'Delete') popLock.value = false
  }
  function removeToken(idx) {
    tokens.value.splice(idx, 1)
  }
  function focusInnerInput() {
    searchInputRef.value?.focus()
  }
  function isFlashing(t) {
    return flashingTokens.value.has(String(t).toLowerCase())
  }
  function flashToken(t) {
    const key = String(t).toLowerCase()
    const next = new Set(flashingTokens.value)
    next.add(key)
    flashingTokens.value = next
    setTimeout(() => {
      const rem = new Set(flashingTokens.value)
      rem.delete(key)
      flashingTokens.value = rem
    }, 450)
  }

  // URL helpers to preserve literal '+' for token separation
  function serializeTokensForUrl(arr = tokens.value) {
    return (arr || [])
      .map((t) => String(t).trim().toLowerCase().replace(/\s+/g, '_'))
      .filter(Boolean)
      .join('+') // Use literal + as separator for cleaner URLs
  }
  function updateUrlWithTokens(arr) {
    if (typeof window === 'undefined') return
    const qEnc = serializeTokensForUrl(arr ?? tokens.value)
    const raw = window.location.search.replace(/^\?/, '')
    const parts = raw ? raw.split('&').filter(Boolean) : []
    const kept = parts.filter(
      (p) => decodeURIComponent(p.split('=')[0]) !== 'q'
    )
    // Don't double-encode - qEnc already contains %2B
    if (qEnc) kept.push(`q=${qEnc}`)
    const query = kept.length ? `?${kept.join('&')}` : ''
    const url = `${window.location.pathname}${query}${
      window.location.hash || ''
    }`
    window.history.replaceState({}, '', url)
  }
  function buildShareUrlWithTokens() {
    if (typeof window === 'undefined') return ''
    const qEnc = serializeTokensForUrl()
    const raw = window.location.search.replace(/^\?/, '')
    const parts = raw ? raw.split('&').filter(Boolean) : []
    const kept = parts.filter(
      (p) => decodeURIComponent(p.split('=')[0]) !== 'q'
    )
    // Don't double-encode - qEnc already contains %2B
    if (qEnc) kept.push(`q=${qEnc}`)
    const query = kept.length ? `?${kept.join('&')}` : ''
    return `${window.location.origin}${window.location.pathname}${query}${
      window.location.hash || ''
    }`
  }

  // Search autocomplete functionality
  const popularTerms = [
    'freedom',
    'equality',
    'capitalism',
    'socialism',
    'democracy',
    'climate change',
    'environment',
    'education',
    'healthcare',
    'rights',
    'government',
    'politics',
    'economy',
    'society',
    'justice',
    'liberty',
    'progressive',
    'conservative',
    'reform',
    'policy',
  ]

  function generateSuggestions(input) {
    if (!input || input.length < 2) {
      suggestions.value = []
      showSuggestions.value = false
      return
    }

    const inputLower = input.toLowerCase()
    const results = []

    // Add matching popular terms
    popularTerms.forEach((term) => {
      if (term.toLowerCase().includes(inputLower)) {
        results.push({ term, type: 'popular' })
      }
    })

    // Add recent searches that match
    recentSearches.value.forEach((term) => {
      if (
        term.toLowerCase().includes(inputLower) &&
        !results.find((r) => r.term === term)
      ) {
        results.push({ term, type: 'recent' })
      }
    })

    // Add ideology terms that match
    ideologies.forEach((ideology) => {
      if (
        ideology.term.toLowerCase().includes(inputLower) &&
        !results.find((r) => r.term === ideology.term)
      ) {
        results.push({ term: ideology.term, type: 'ideology' })
      }
    })

    suggestions.value = results.slice(0, 6) // Limit to 6 suggestions
    showSuggestions.value = results.length > 0
  }

  function selectSuggestion(suggestion) {
    inputText.value = suggestion.term
    showSuggestions.value = false
    commitInputAsToken()

    // Add to recent searches if not already there
    const termLower = suggestion.term.toLowerCase()
    const existingIndex = recentSearches.value.findIndex(
      (t) => t.toLowerCase() === termLower
    )
    if (existingIndex >= 0) {
      recentSearches.value.splice(existingIndex, 1)
    }
    recentSearches.value.unshift(suggestion.term)
    recentSearches.value = recentSearches.value.slice(0, 10) // Keep only 10 recent searches
  }

  // Watch for input changes to generate suggestions
  watch(inputText, (newVal) => {
    generateSuggestions(newVal)
  })

  // Hide suggestions when clicking outside
  function handleGlobalClick(e) {
    if (searchInputRef.value && !searchInputRef.value.contains(e.target)) {
      showSuggestions.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onGlobalKeydown)
    window.addEventListener('click', handleGlobalClick)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKeydown)
    window.removeEventListener('click', handleGlobalClick)
  })
</script>

<style scoped>
  @keyframes pillFlash {
    0% {
      background-color: rgba(255, 255, 255, 0.15);
    }
    50% {
      background-color: rgba(255, 255, 255, 0.45);
    }
    100% {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
  .pill-flash {
    animation: pillFlash 200ms ease-in-out 2;
    will-change: background-color;
  }
</style>
