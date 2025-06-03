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
        class="bg-transparent focus:bg-transparent ps-12 pt-[.3rem] pr-3 pb-[.5rem] border-[#999999] border-2 focus:border-seagull-400/50 rounded-lg outline-none w-full text-[1.5rem] text-slate-200 placeholder:text-seagull-200/50 leading-tight tracking-wide"
        placeholder="Search..."
        @input="emitSearch"
        @keydown.esc="clearSearch"
        @search="handleSearchEvent"
        ref="searchInputRef"
      />
    </div>
    <div class="flex flex-row items-center gap-3 px-0 w-full">
      <div class="flex flex-row gap-2">
        <button
          class="pill-btn"
          :class="filters.claims ? 'pill-on' : 'pill-off'"
          @click="toggleFilter('claims')"
        >
          <span class="pill-label">CLAIMS</span>
          <span class="pill-count">{{ pillClaimCount }}</span>
        </button>
        <button
          class="pill-btn"
          :class="filters.quotes ? 'pill-on' : 'pill-off'"
          @click="toggleFilter('quotes')"
        >
          <span class="pill-label">QUOTES</span>
          <span class="pill-count">{{ pillQuoteCount }}</span>
        </button>
        <button
          class="pill-btn"
          :class="filters.memes ? 'pill-on' : 'pill-off'"
          @click="toggleFilter('memes')"
        >
          <span class="pill-label">MEMES</span>
          <span class="pill-count">{{ pillMemeCount }}</span>
        </button>
      </div>
      <span class="font-light text-slate-400 uppercase tracking-wider" style="font-size: 1.155rem">
        {{ props.totalItemCount }}
      </span>
    </div>
    <div
      v-if="searchTerm && props.totalCount === 0"
      class="flex flex-col flex-1 justify-center items-center w-full min-h-[60vh]"
      style="margin-top: 3.5rem"
    >
      <h1 class="m-auto mt-16 font-light text-white text-2xl text-center">No results found.</h1>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue"

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
const emit = defineEmits(["update:search", "update:filters"])

const searchTerm = ref(props.search || "")
const filters = ref({ ...props.filters })

const pillClaimCount = computed(() => props.totalClaimCount ?? props.claimCount ?? 0)
const pillQuoteCount = computed(() => props.totalQuoteCount ?? props.quoteCount ?? 0)
const pillMemeCount = computed(() => props.totalMemeCount ?? props.memeCount ?? 0)

function ensureFilterKeys(obj) {
  obj = obj && typeof obj === "object" ? obj : {}
  return {
    claims: typeof obj.claims === "boolean" ? obj.claims : true,
    quotes: typeof obj.quotes === "boolean" ? obj.quotes : true,
    memes: typeof obj.memes === "boolean" ? obj.memes : true,
  }
}

onMounted(() => {
  filters.value = ensureFilterKeys(props.filters)
})

watch(
  () => props.filters,
  (newVal) => {
    filters.value = ensureFilterKeys(newVal)
  },
  { deep: true }
)

function toggleFilter(key) {
  const keys = Object.keys(filters.value)
  const onCount = keys.filter((k) => filters.value[k]).length
  if (onCount === keys.length) {
    // All ON: clicking one turns only it ON
    keys.forEach((k) => (filters.value[k] = false))
    filters.value[key] = true
  } else if (onCount === 1 && filters.value[key]) {
    // Only one ON and it's clicked: turn all ON
    keys.forEach((k) => (filters.value[k] = true))
  } else {
    // Toggle the clicked pill
    filters.value[key] = !filters.value[key]
    // Never allow all OFF
    if (Object.values(filters.value).every((v) => !v)) {
      filters.value[key] = true
    }
  }
  emit("update:filters", { ...filters.value })
}

function resetFilters() {
  filters.value = { claims: true, quotes: true, memes: true }
  emit("update:filters", { ...filters.value })
}

watch(searchTerm, (newValue) => {
  emit("update:search", newValue)
  if (newValue === "") {
    resetFilters()
  }
})
watch(
  () => props.search,
  (newValue) => (searchTerm.value = newValue)
)
</script>

<style scoped>
.pill-btn {
  @apply flex justify-between items-center gap-1 bg-slate-800 px-3 pt-[.2rem] pb-[0.3rem] rounded-md w-[100px] font-light text-slate-200 text-sm uppercase tracking-wider transition;
  font-size: 1rem;
}
.pill-label {
  @apply ml-auto;
}
.pill-count {
  @apply mr-auto;
}
.pill-on {
  @apply opacity-100;
}
.pill-off {
  @apply opacity-80 grayscale;
}
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E")
    no-repeat center;
  background-size: contain;
  cursor: pointer;
  margin-right: 0rem;
  filter: none;
}
</style>
