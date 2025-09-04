<!-- components/SearchBar.vue -->
<template>
  <div class="flex flex-col items-center gap-2 w-full h-auto text-seagull-950">
    <div class="relative flex flex-row gap-2 w-full">
      <Icon
        name="mdi:magnify"
        size="1.4rem"
        class="top-1/2 left-[.5rem] absolute text-slate-200/60 -translate-y-1/2"
      />
      <!-- Tokenized input with pills -->
      <div
        class="bg-transparent focus-within:bg-transparent px-[2.25rem] py-[0.2rem] border-[thin] border-seagull-400/40 focus-within:border-seagull-400/80 rounded-[20px] outline-none w-full font-light text-[1.02rem] text-slate-200 sm:text-[0.935rem] leading-none tracking-wider"
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
                class="flex justify-center items-center -mr-1 p-0 w-[1.15rem] h-[1.15rem] text-white/50 hover:text-white group-hover:text-white cursor-pointer"
                :aria-label="`Remove ${t}`"
                @click.stop="removeToken(idx)"
              >
                <Icon
                  name="mdi:close"
                  class="block text-[1rem] align-middle leading-none"
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
            @keydown.enter.prevent="commitInputAsToken()"
            @blur="commitInputAsToken()"
            @keydown="onKeydown"
            @keyup="onKeyup"
            @keydown.esc="handleInputEscape"
            @input="handleSearchInput"
            ref="searchInputRef"
          />
        </div>
      </div>
      <!-- Right control group: Filter, ESC, X -->
      <div
        class="top-1/2 right-3 absolute flex items-center gap-1 -translate-y-1/2"
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
          v-if="showInlineFilterMenu"
          :filters="props.filters"
          :counts="props.counts"
          :inline="true"
          @update:filters="(f) => emit('update:filters', f)"
        />
        <button
          @click="copyShareUrl"
          type="button"
          class="relative flex justify-center items-center text-white/80 hover:text-white"
          title="Copy shareable link"
          aria-label="Copy shareable link"
        >
          <Icon
            name="mdi:share-variant"
            class="mr-0.5 text-[1.25rem] cursor-pointer"
          />
          <span
            v-if="sharedCopied"
            class="-top-6 absolute bg-black/70 px-2 py-0.5 rounded text-[11px] text-white"
          >
            Copied
          </span>
        </button>
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
    <div
      v-if="hasSearch && totalDisplay === 0"
      class="flex flex-col flex-1 justify-center items-center w-full min-h-[60vh]"
    >
      <h1 class="m-auto mt-16 font-light text-white text-2xl text-center">
        No results found.
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

  const pillClaimCount = computed(() => props.counts.wall.claims || 0)
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

  function handleInputEscape() {
    // When escape is pressed within the input, always clear if there's text/tokens
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
    nextTick(() => searchInputRef.value?.focus())
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
  function onKeydown(e) {
    const k = e.key
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
      .join('+')
  }
  function updateUrlWithTokens(arr) {
    if (typeof window === 'undefined') return
    const qEnc = serializeTokensForUrl(arr ?? tokens.value)
    const raw = window.location.search.replace(/^\?/, '')
    const parts = raw ? raw.split('&').filter(Boolean) : []
    const kept = parts.filter(
      (p) => decodeURIComponent(p.split('=')[0]) !== 'q'
    )
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
    if (qEnc) kept.push(`q=${qEnc}`)
    const query = kept.length ? `?${kept.join('&')}` : ''
    return `${window.location.origin}${window.location.pathname}${query}${
      window.location.hash || ''
    }`
  }
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
