<!-- components/SearchBar.vue -->
<template>
  <div class="flex flex-col items-start gap-2 w-full h-auto text-seagull-950">
    <div class="relative flex flex-row gap-0 w-full">
      <Icon
        name="mdi:magnify"
        size="2rem"
        class="top-[.4rem] left-[.75rem] absolute text-slate-200/60"
      />
      <input
        type="search"
        v-model="searchTerm"
        class="bg-transparent focus:bg-transparent ps-12 pt-[.3rem] pr-3 pb-[.5rem] border-[#6dd3ff73] border-[1.5px] focus:border-seagull-400/50 rounded-lg outline-none w-full text-[1.5rem] text-slate-200 placeholder:text-seagull-200/50 leading-tight tracking-wide"
        placeholder="Search..."
        @keydown.esc="clearSearch"
        ref="searchInputRef"
      />
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
      <span
        class="font-light text-slate-400 uppercase tracking-wider"
        style="font-size: 1.155rem"
      >
        {{ props.totalItemCount }}
      </span>
    </div>
    <div
      v-if="searchTerm && props.totalCount === 0"
      class="flex flex-col flex-1 justify-center items-center w-full min-h-[60vh]"
      style="margin-top: 3.5rem"
    >
      <h1 class="m-auto mt-16 font-light text-white text-2xl text-center">
        No results found.
      </h1>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
  import { debounce } from 'lodash-es'
  import PillButton from '~/components/PillButton.vue'

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

  const debouncedEmitSearch = debounce((val) => emit('update:search', val), 300)

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
      keys.forEach((k) => (filters[k] = false))
      filters[key] = true
    } else if (onCount === 1 && filters[key]) {
      keys.forEach((k) => (filters[k] = true))
    } else {
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
    searchTerm.value = ''
    resetFilters()
    // nextTick(() => searchInputRef.value?.focus()) // optional
  }

  function onGlobalKeydown(e) {
    if (e.key === 'Escape') {
      clearSearch()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onGlobalKeydown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKeydown)
  })

  watch(searchTerm, (newValue) => {
    debouncedEmitSearch(newValue)
    if (newValue === '') resetFilters()
  })
  watch(
    () => props.search,
    (newValue) => (searchTerm.value = newValue)
  )
</script>
