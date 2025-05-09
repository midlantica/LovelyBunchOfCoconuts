<!-- components/SearchBar.vue -->
<template>
  <div class="flex flex-col items-center gap-[0px] w-full h-auto text-white">
    <div class="relative flex flex-row gap-0 border-b-[1px] border-b-slate-800 w-full">
      <Icon name="mdi:magnify" size="1.75rem" class="top-2 left-2 absolute" />
      <input
        type="search"
        v-model="searchTerm"
        class="focus:bg-slate-800 bg-gradient-to-b from-slate-700 to-slate-800 p-0 ps-10 pr-0 rounded-t-md outline-none w-full h-10 font-light text-slate-100 text-xl leading-none tracking-wider placeholder-slate-400"
        placeholder="Search..."
        @input="emitSearch"
        @keydown.esc="clearSearch"
        @search="handleSearchEvent"
      />
    </div>
    <!-- Content type filter pills inside the search input -->
    <div id="ButtonBar" class="flex flex-row flex-wrap justify-center gap-[2px] w-full">
      <button
        @click.prevent="toggleFilter('claims')"
        class="flex justify-center gap-[.25rem] px-2 py-1.5 border-slate-700/50 border-b-2 rounded-bl-md text-base uppercase tracking-wider transition-colors duration-100 grow"
        :class="[
          filters.claims ? 'bg-slate-900' : 'text-slate-800',
          allFiltersOff ? 'animate-pulse' : '',
        ]"
      >
        <span
          class="tracking-widest"
          :class="filters.claims ? 'text-sky-200' : 'text-slate-200/40 blur-[.5px]'"
          >Claims</span
        >
      </button>
      <button
        @click.prevent="toggleFilter('quotes')"
        class="flex justify-center gap-[.25rem] px-2 py-1.5 border-slate-700/50 border-b-2 rounded-none text-base uppercase tracking-wider transition-colors duration-100 grow"
        :class="[
          filters.quotes ? 'bg-slate-900' : 'text-slate-800',
          allFiltersOff ? 'animate-pulse' : '',
        ]"
      >
        <span
          class="tracking-widest"
          :class="filters.quotes ? 'text-sky-200' : 'text-slate-200/40 blur-[.5px]'"
          >Quotes</span
        >
      </button>
      <button
        @click.prevent="toggleFilter('memes')"
        class="flex justify-center gap-[.25rem] px-2 py-1.5 border-slate-700/50 border-b-2 rounded-br-md text-base uppercase tracking-wider transition-colors duration-100 grow"
        :class="[
          filters.memes ? 'bg-slate-900' : 'text-slate-800',
          allFiltersOff ? 'animate-pulse' : '',
        ]"
      >
        <span
          class="tracking-widest"
          :class="filters.memes ? 'text-sky-200' : 'text-slate-200/40 blur-[.5px]'"
          >Memes</span
        >
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
