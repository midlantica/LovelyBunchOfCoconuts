<!-- components/SearchBar.vue -->
<template>
  <div class="flex flex-col items-start gap-[0px] w-full h-auto text-seagull-950">
    <div class="relative flex flex-row gap-0 border-b-[1px] border-b-seagull-900 w-full">
      <Icon name="mdi:magnify" size="1.75rem" class="top-2 left-2 absolute" />
      <input
        type="search"
        v-model="searchTerm"
        class="focus:bg-seagull-900 bg-gradient-to-t from-seagull-200 to-seagull-100 p-0 ps-10 pr-0 rounded-md outline-none w-full h-10 text-seagull-900 text-xl leading-none tracking-wider placeholder-seagull-700"
        placeholder="Search..."
        @input="emitSearch"
        @keydown.esc="clearSearch"
        @search="handleSearchEvent"
      />
    </div>
    <div v-if="showResults" class="flex flex-row items-center gap-3 mt-2 px-2 w-full">
      <span class="font-light text-slate-300 uppercase tracking-wider" style="font-size: 1.155rem">
        {{ props.totalItemCount + " ITEMS" }}
      </span>
      <div class="flex flex-row gap-2">
        <button
          class="bg-slate-800 px-3 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 font-light text-slate-200 text-xs uppercase tracking-wider transition"
          :class="filters.claims ? 'opacity-100' : 'opacity-40 grayscale'"
          style="font-size: 0.88em; letter-spacing: 0.08em"
          @click="toggleFilter('claims')"
          :aria-pressed="filters.claims"
        >
          CLAIMS {{ pillClaimCount }}
        </button>
        <button
          class="bg-slate-800 px-3 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 font-light text-slate-200 text-xs uppercase tracking-wider transition"
          :class="filters.quotes ? 'opacity-100' : 'opacity-40 grayscale'"
          style="font-size: 0.88em; letter-spacing: 0.08em"
          @click="toggleFilter('quotes')"
          :aria-pressed="filters.quotes"
        >
          QUOTES {{ pillQuoteCount }}
        </button>
        <button
          class="bg-slate-800 px-3 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 font-light text-slate-200 text-xs uppercase tracking-wider transition"
          :class="filters.memes ? 'opacity-100' : 'opacity-40 grayscale'"
          style="font-size: 0.88em; letter-spacing: 0.08em"
          @click="toggleFilter('memes')"
          :aria-pressed="filters.memes"
        >
          MEMES {{ pillMemeCount }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue"

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

const showResults = computed(() => props.totalCount > 0 || props.search)

// Always show the search result counts for each type, not the filtered/active ones
const pillClaimCount = computed(() => props.claimCount)
const pillQuoteCount = computed(() => props.quoteCount)
const pillMemeCount = computed(() => props.memeCount)

const emitSearch = () => {
  emit("update:search", searchTerm.value)
}

const clearSearch = () => {
  searchTerm.value = ""
  emit("update:search", "")
  setTimeout(() => {
    emit("update:search", "")
  }, 50)
}

const handleSearchEvent = (event) => {
  if (searchTerm.value === "") {
    emit("update:search", "")
    setTimeout(() => {
      emit("update:search", "")
    }, 50)
  }
}

const toggleFilter = (key) => {
  filters.value[key] = !filters.value[key]
  // At least one filter should always be active
  if (!Object.values(filters.value).some(Boolean)) {
    filters.value[key] = true
  }
  emit("update:filters", { ...filters.value })
}

watch(searchTerm, (newValue) => emit("update:search", newValue))
watch(
  () => props.search,
  (newValue) => (searchTerm.value = newValue)
)
watch(
  () => props.filters,
  (newValue) => (filters.value = { ...newValue })
)
</script>

<style scoped>
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2306304b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E")
    no-repeat center;
  background-size: contain;
  cursor: pointer;
  margin-right: 1rem;
}
input[type="search"]::-webkit-search-cancel-button:hover {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2306304b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E")
    no-repeat center;
}
</style>
