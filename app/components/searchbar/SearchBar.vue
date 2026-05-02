<!-- components/SearchBar.vue -->
<template>
  <div class="mt-0.5 flex h-auto w-full flex-col items-center gap-2">
    <div class="relative flex w-full flex-row gap-2 overflow-visible">
      <Icon
        name="mdi:magnify"
        size="1.4rem"
        class="absolute top-1/2 left-2 -translate-y-1/2"
        :style="{ color: 'var(--color-search-text)' }"
      />
      <!-- Tokenized input with pills -->
      <div
        class="font-100 ring-theme-border-hover/40 focus-within:ring-theme-accent w-full rounded-[20px] bg-(--color-search-bg) px-9 py-[0.2rem] text-[1.02rem] leading-none tracking-wider ring-1 transition-all duration-200 outline-none focus-within:bg-(--color-search-bg) focus-within:ring-1 sm:text-[0.935rem]"
        :style="{ color: 'var(--color-search-text)' }"
        @click="focusInnerInput"
      >
        <div
          class="flex flex-wrap content-center items-center gap-1 leading-none"
        >
          <template v-for="(t, idx) in tokens" :key="t + ':' + idx">
            <span
              class="group inline-flex cursor-pointer! items-center gap-0.5 rounded-full bg-(--color-pill-bg) py-0.5 pr-2 pl-2.5 text-[.825rem] leading-none text-(--color-pill-text) transition-colors select-none hover:bg-(--color-pill-bg-hover) focus:outline-none"
              :class="{ 'pill-flash': isFlashing(t) }"
              role="button"
              tabindex="0"
              @click.stop="removeToken(idx)"
              @keydown.enter.prevent="removeToken(idx)"
              @keydown.space.prevent="removeToken(idx)"
            >
              <span
                class="group-hover:text-theme-body block align-middle leading-none font-(--color-pill-font-weight) whitespace-nowrap"
                >{{ t }}</span
              >
              <button
                type="button"
                class="-mr-1 ml-0.5 flex h-5 w-5 cursor-pointer! items-center justify-center p-0 text-white transition-colors"
                :aria-label="`Remove ${t}`"
                @click.stop="removeToken(idx)"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="block h-[1.1rem] w-[1.1rem] align-middle leading-none"
                  fill="none"
                  stroke="currentColor"
                  :stroke-width="pillXStroke"
                  stroke-linecap="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </span>
          </template>
          <input
            type="text"
            v-model="inputText"
            id="search-input"
            name="q"
            aria-label="Search terms"
            class="h-[1.6rem] min-w-[6ch] flex-1 bg-transparent pb-0.5 leading-[1.6rem] outline-none placeholder:opacity-50 focus:bg-transparent"
            :style="{ color: 'var(--color-search-text)' }"
            :placeholder="tokens.length ? '' : 'Search...'"
            @blur="commitInputAsToken()"
            @keydown="onKeydown"
            @keyup="onKeyup"
            @keydown.esc="handleInputEscape"
            @input="handleSearchInput"
            ref="searchInput"
          />
        </div>
      </div>
      <!-- Search suggestions dropdown -->
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="border-union-blue-400/40 bg-theme-elevated absolute top-full right-0 left-0 z-5 mt-1 max-h-64 overflow-y-auto rounded-lg border shadow-lg"
        @mousedown.prevent
      >
        <div
          v-for="(suggestion, idx) in suggestions"
          :key="suggestion.term + idx"
          class="text-theme-body cursor-pointer! px-4 py-2 transition-colors"
          :class="{
            'bg-theme-overlay': selectedSuggestionIndex === idx,
            'hover:bg-theme-surface': selectedSuggestionIndex !== idx,
          }"
          @click="selectSuggestion(suggestion)"
          @mouseenter="selectedSuggestionIndex = idx"
        >
          <div class="flex items-center justify-between">
            <span class="font-100">{{ suggestion.term }}</span>
            <span class="text-theme-icon text-xs capitalize">{{
              suggestion.type
            }}</span>
          </div>
        </div>
      </div>

      <!-- Right control group: Filter, ESC, X -->
      <div
        class="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 overflow-visible"
      >
        <client-only>
          <span
            class="font-100 text-[.95rem] tracking-wider"
            :style="{ color: 'var(--color-search-text)' }"
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
          class="flex w-auto cursor-pointer! items-center gap-1 rounded-full bg-transparent transition-colors"
          type="button"
          aria-label="Clear search"
        >
          <svg
            viewBox="0 0 24 24"
            class="block h-[1.35rem] w-[1.35rem] opacity-60 hover:opacity-100"
            :style="{ color: 'var(--color-search-text)' }"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="flex w-full flex-row items-center gap-2 px-0">
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
  import { acts } from '~/data/acts'

  // Native debounce implementation to replace lodash-es (saves 300KB)
  function debounce(fn, delay) {
    let timeoutId
    const debounced = function (...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn.apply(this, args), delay)
    }
    debounced.cancel = () => {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    return debounced
  }

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

  // X icon stroke weight — thinner in light mode to match lighter font-weight
  const { isDark } = useTheme()
  const pillXStroke = computed(() => (isDark.value ? 2 : 1.5))

  // Tokenized search state
  const tokens = ref([])
  const inputText = ref('')
  const joinedSearch = computed(() => [...tokens.value].join(' ').trim())
  const hasSearch = computed(() => tokens.value.length > 0)
  // useTemplateRef (Vue 3.5): typed template ref — replaces `ref(null)` + matching ref="name" pattern.
  // The string 'searchInput' must match ref="searchInput" on the <input> element in the template.
  const searchInputRef = useTemplateRef('searchInput')
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
  const isSelectingSuggestion = ref(false)

  // Ensure suggestions is always an array
  if (!suggestions.value) {
    suggestions.value = []
  }

  // Map lowercase act name -> canonical name casing
  const ideologyCanonicalByLower = Object.fromEntries(
    acts.map((a) => [a.term.toLowerCase(), a.term])
  )

  const debouncedEmitSearch = debounce((val) => {
    lastEmittedSearch.value = val
    emit('update:search', val)
    // Update the display URL preserving literal '+' separators
    updateUrlWithTokens()
  }, 350) // Increased from 250ms to 350ms for better performance

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
    // Cancel any pending debounced search emission first
    // This prevents the watcher from re-emitting after we clear
    debouncedEmitSearch.cancel?.()

    tokens.value = []
    inputText.value = ''
    resetFilters()
    // Immediately emit the search change instead of waiting for debounce
    lastEmittedSearch.value = ''
    emit('update:search', '')
    // Ensure focus stays on search input to prevent pill focus ring
    nextTick(() => searchInputRef.value?.focus())
    // Remove q param from URL if present (preserve other params and literal '+')
    try {
      updateUrlWithTokens([])
    } catch {}
  }

  function handleSearchInput() {
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
      clearSearch()
    } else {
      // If no text, just blur the input
      searchInputRef.value?.blur()
    }
  }

  function onGlobalKeydown(e) {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      searchInputRef.value?.focus()
      return
    }

    if (e.key === 'Escape') {
      // Only clear search if there's actually something in the search input
      if (inputText.value.trim() !== '' || tokens.value.length > 0) {
        clearSearch()
      }
    }
  }

  // Emit whenever tokens change
  watch(
    tokens,
    (arr) => {
      const valueToEmit = arr.join(' ').trim()
      // Skip debounced emit if the value was already emitted (e.g. by clearSearch)
      // This prevents a redundant 350ms delayed re-emission after the X button
      if (valueToEmit === lastEmittedSearch.value) return
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
    // Cancel any pending debounced emission so it doesn't fight with our
    // immediate emit below (prevents the "4 ticks" delay).
    debouncedEmitSearch.cancel?.()

    // Toggle-add behavior for multi-term search
    const lower = term.toLowerCase()
    const idx = tokens.value.findIndex((p) => p.toLowerCase() === lower)
    if (idx >= 0) tokens.value.splice(idx, 1)
    else tokens.value.push(canonicalizeToken(term))
    // Emit immediately to feel responsive and guard re-parse
    const searchValue = joinedSearch.value
    lastEmittedSearch.value = searchValue
    emit('update:search', searchValue)
    // Update URL with ?q= parameter
    updateUrlWithTokens()
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
    // Don't commit if we're in the process of selecting a suggestion
    if (isSelectingSuggestion.value) return

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
          // Set flag before selecting to prevent blur from committing
          isSelectingSuggestion.value = true
          selectSuggestion(suggestions.value[selectedSuggestionIndex.value])
        } else {
          // No selection, commit current input as token
          handleEnterKey()
        }
        return
      } else if (k === 'Escape') {
        e.preventDefault()
        showSuggestions.value = false
        selectedSuggestionIndex.value = -1
        return
      }
    }

    // Handle Enter when no suggestions are visible
    if (k === 'Enter') {
      e.preventDefault()
      handleEnterKey()
      return
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
    'benny hill',
    'douglas adams',
    'eric morecambe',
    'french & saunders',
    'graham chapman',
    'john cleese',
    'oscar wilde',
    'p.g. wodehouse',
    'peter sellers',
    'rowan atkinson',
    'spike milligan',
    'stephen fry',
    'the two ronnies',
    'tony hancock',
    'victoria wood',
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

    // Add act names that match
    acts.forEach((act) => {
      if (
        act.term.toLowerCase().includes(inputLower) &&
        !results.find((r) => r.term === act.term)
      ) {
        results.push({ term: act.term, type: 'act' })
      }
    })

    suggestions.value = results.slice(0, 6) // Limit to 6 suggestions
    showSuggestions.value = results.length > 0
  }

  function selectSuggestion(suggestion) {
    // Cancel pending debounce and set flag to prevent blur from committing
    debouncedEmitSearch.cancel?.()
    isSelectingSuggestion.value = true

    inputText.value = '' // Clear the input first
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1

    // Add the suggestion as a token directly
    const token = canonicalizeToken(suggestion.term)
    const exists = tokens.value.some(
      (p) => p.toLowerCase() === token.toLowerCase()
    )
    if (!exists) {
      tokens.value.push(token)
    } else {
      flashToken(token)
    }

    // Emit immediately (don't wait for debounce) and update URL
    const searchValue = joinedSearch.value
    lastEmittedSearch.value = searchValue
    emit('update:search', searchValue)
    updateUrlWithTokens()

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

    // Reset the flag after a short delay
    setTimeout(() => {
      isSelectingSuggestion.value = false
    }, 100)
  }

  // Watch for input changes to generate suggestions with debouncing
  const debouncedGenerateSuggestions = debounce((val) => {
    generateSuggestions(val)
  }, 200)

  watch(inputText, (newVal) => {
    debouncedGenerateSuggestions(newVal)
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
