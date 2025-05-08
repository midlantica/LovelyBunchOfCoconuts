<!-- components/SearchBar.vue -->
<template>
  <div class="search-bar w-full h-12 flex flex-row items-center text-white bg-slate-950 rounded-md">
    <div class="w-full relative">
      <input
        type="search"
        v-model="searchTerm"
        class="placeholder-slate-400 w-full h-12 p-3 ps-4 pr-24 text-xl tracking-wider leading-none text-slate-200 bg-slate-900 rounded-md outline-none focus:bg-slate-700 sm:rounded-r-none xs:rounded-r-none"
        placeholder="Search..."
        @input="emitSearch"
      />

      <!-- Content type filter pills inside the search input -->
      <div class="-translate-y-1/2 transform absolute right-2 top-1/2 flex flex-row gap-1">
        <button
          @click.prevent="toggleFilter('claims')"
          class="flex justify-center gap-2 px-3 py-0.5 text-sm tracking-wider uppercase rounded-full transition-colors duration-100"
          :class="filters.claims ? 'bg-slate-800 text-slate-400' : 'bg-slate-600 text-slate-200'"
        >
          <span class="self-center leading-none">⦿</span>NPC Claims
        </button>
        <button
          @click.prevent="toggleFilter('quotes')"
          class="flex justify-center gap-2 px-3 py-0.5 text-sm tracking-wider uppercase rounded-full transition-colors duration-100"
          :class="filters.quotes ? 'bg-slate-800 text-slate-400' : 'bg-slate-600 text-slate-200'"
        >
          <span class="self-center leading-none">⦿</span>Quotes
        </button>
        <button
          @click.prevent="toggleFilter('memes')"
          class="flex justify-center gap-2 px-3 py-0.5 text-sm tracking-wider uppercase rounded-full transition-colors duration-100"
          :class="filters.memes ? 'bg-slate-800 text-slate-400' : 'bg-slate-600 text-slate-200'"
        >
          <span class="self-center leading-none">⦿</span>Memes
        </button>
      </div>
    </div>

    <button
      type="submit"
      class="h-12 hidden px-4 text-slate-100 bg-slate-700 rounded-r-md hover:text-white hover:bg-slate-800 lg:block md:block xs:block"
      @click="emitSearch"
    >
      <Icon name="mdi:magnify" size="1.85rem" />
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  search: String,
  filters: {
    type: Object,
    default: () => ({ claims: true, quotes: true, memes: true }),
  },
})

const emit = defineEmits(["update:search", "update:filters"])

const searchTerm = ref(props.search || "")
const filters = ref(props.filters)

const emitSearch = () => emit("update:search", searchTerm.value)

const toggleFilter = (type) => {
  filters.value = {
    ...filters.value,
    [type]: !filters.value[type],
  }
  emit("update:filters", filters.value)
}

watch(searchTerm, (newValue) => emit("update:search", newValue))
watch(
  () => props.search,
  (newValue) => (searchTerm.value = newValue)
)

watch(
  () => props.filters,
  (newValue) => (filters.value = newValue),
  { deep: true }
)
</script>

<style scoped>
.search-bar {
  height: auto; /* Minimal height based on content */
}

/* Target the cancel button */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none; /* Reset default style */
  appearance: none; /* For future-proofing */
  width: 16px; /* Size it */
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23CBD5E1' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E")
    no-repeat center;
  background-size: contain;
  cursor: pointer;
  margin-right: 60px; /* Make room for the filter pills */
}

/* Optional: Hover effect */
input[type="search"]::-webkit-search-cancel-button:hover {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E")
    no-repeat center;
}
</style>
