<!-- components/SearchBar.vue -->
<template>
  <div
    class="search-bar w-full h-10 flex flex-col items-center gap-0 text-white bg-slate-950 rounded-t-md"
  >
    <div class="w-full relative flex flex-row gap-0">
      <input
        type="search"
        v-model="searchTerm"
        class="placeholder-slate-400 w-full h-10 p-0 ps-3 pr-0 text-xl font-light tracking-wider leading-none text-slate-100 bg-slate-900 rounded-t-md outline-none focus:bg-slate-800 sm:rounded-r-none xs:rounded-r-none"
        placeholder="Search..."
        @input="emitSearch"
        @keydown.esc="clearSearch"
        @search="handleSearchEvent"
      />
      <button
        type="submit"
        class="h-10 hidden px-2 text-slate-400 bg-slate-900 rounded-tr-md hover:text-slate-100 lg:block md:block xs:block"
        @click="emitSearch"
      >
        <Icon name="mdi:magnify" size="1.75rem" />
      </button>
    </div>
    <!-- Content type filter pills inside the search input -->
    <div id="ButtonBar" class="gap-[1px] w-full flex flex-row flex-wrap justify-center">
      <button
        @click.prevent="toggleFilter('claims')"
        class="flex grow justify-center gap-1 px-2 py-1 text-base tracking-wider uppercase rounded-bl-md transition-colors duration-100"
        :class="[
          filters.claims ? 'bg-slate-700' : 'bg-slate-600',
          allFiltersOff ? 'pulse-animation' : '',
        ]"
      >
        <span
          class="top-[-1px] relative self-center leading-none"
          :class="filters.claims ? 'text-sky-200' : 'text-slate-400'"
          >⦿</span
        >
        <span :class="filters.claims ? 'text-slate-200' : 'text-slate-400'">Claims</span>
      </button>
      <button
        @click.prevent="toggleFilter('quotes')"
        class="flex grow justify-center gap-1 px-2 py-1 text-base tracking-wider uppercase rounded-none transition-colors duration-100"
        :class="[
          filters.quotes ? 'bg-slate-700' : 'bg-slate-600',
          allFiltersOff ? 'pulse-animation' : '',
        ]"
      >
        <span
          class="top-[-1px] relative self-center leading-none"
          :class="filters.quotes ? 'text-sky-200' : 'text-slate-400'"
          >⦿</span
        >
        <span :class="filters.quotes ? 'text-slate-200' : 'text-slate-400'">Quotes</span>
      </button>
      <button
        @click.prevent="toggleFilter('memes')"
        class="flex grow justify-center gap-1 px-2 py-1 text-base tracking-wider uppercase rounded-br-md transition-colors duration-100"
        :class="[
          filters.memes ? 'bg-slate-700' : 'bg-slate-600',
          allFiltersOff ? 'pulse-animation' : '',
        ]"
      >
        <span
          class="top-[-1px] relative self-center leading-none"
          :class="filters.memes ? 'text-sky-200' : 'text-slate-400'"
          >⦿</span
        >
        <span :class="filters.memes ? 'text-slate-200' : 'text-slate-400'">Memes</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue"

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

// Computed property to check if all filters are off
const allFiltersOff = computed(() => {
  return !filters.value.claims && !filters.value.quotes && !filters.value.memes
})

const emitSearch = () => {
  emit("update:search", searchTerm.value)
  console.log(`Search emitted: "${searchTerm.value}"`)
}

const clearSearch = () => {
  searchTerm.value = ""
  emit("update:search", "")
  console.log("Search cleared via ESC key")

  // Force a reset of the content wall
  setTimeout(() => {
    emit("update:search", "")
  }, 50)
}

const handleSearchEvent = (event) => {
  // This event fires when the search input is cleared via the "x" button or when Enter is pressed
  console.log("Search event triggered")
  if (searchTerm.value === "") {
    console.log("Search cleared via browser clear button")
    emit("update:search", "")

    // Force a reset of the content wall
    setTimeout(() => {
      emit("update:search", "")
    }, 50)
  }
}

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
  margin-right: 1rem; /* Make room for the filter pills */
}

/* Optional: Hover effect */
input[type="search"]::-webkit-search-cancel-button:hover {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E")
    no-repeat center;
}

/* Pulsing animation for unlit pills when all filters are off */
@keyframes softPulse {
  0% {
    background-color: rgb(71 85 105);
  } /* bg-slate-600 */
  50% {
    background-color: rgb(100 116 139);
  } /* bg-slate-500 */
  100% {
    background-color: rgb(71 85 105);
  } /* bg-slate-600 */
}

.pulse-animation {
  animation: softPulse 2s infinite ease-in-out;
}
</style>
