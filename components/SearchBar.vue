<!-- components/SearchBar.vue -->
<template>
  <div
    class="pl-[0.9rem] pr-[1rem] search-bar w-full h-12 max-h-12 flex flex-row items-center text-white bg-slate-950 rounded-md"
  >
    <input
      type="search"
      v-model="searchTerm"
      class="placeholder-slate-400 w-full h-full p-3 ps-4 text-xl tracking-wider leading-none text-slate-200 bg-slate-900 rounded-md outline-none focus:bg-slate-800 sm:rounded-r-none xs:rounded-r-none"
      3
      placeholder="Search..."
      @input="emitSearch"
    />
    <button
      type="submit"
      class="h-full hidden px-4 text-slate-200 bg-slate-700 rounded-r-md hover:text-white hover:bg-slate-800 lg:block md:block xs:block"
      @click="emitSearch"
    >
      <Icon name="mdi:magnify"
size="1.85rem"
class="mt-2" />
    </button>
  </div>
</template>

<script setup>
  import { ref, watch } from "vue"

  const props = defineProps({
    search: String,
  })
  const emit = defineEmits(["update:search"])

  const searchTerm = ref(props.search || "")
  const emitSearch = () => emit("update:search", searchTerm.value)

  watch(searchTerm, (newValue) => emit("update:search", newValue))
  watch(
    () => props.search,
    (newValue) => (searchTerm.value = newValue)
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
}

/* Optional: Hover effect */
input[type="search"]::-webkit-search-cancel-button:hover {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E")
    no-repeat center;
}
</style>
