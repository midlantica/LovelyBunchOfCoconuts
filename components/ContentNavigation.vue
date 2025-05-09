<!-- components/ContentNavigation.vue -->
<template>
  <div class="flex flex-wrap justify-between gap-3">
    <button
      class="flex items-center gap-2 px-4 py-1 text-slate-400 bg-slate-800 rounded-sm hover:text-white hover:bg-slate-700"
      @click="router.push('/')"
    >
      <Icon name="heroicons:home-20-solid" size="1.25rem" />
    </button>
    <div class="flex gap-4">
      <button
        class="flex items-center gap-2 px-5 py-1 text-slate-400 bg-slate-800 rounded-sm hover:text-white hover:bg-slate-700"
        @click="goToPrev"
      >
        <Icon name="heroicons:arrow-left-16-solid" size="1.5rem" />
      </button>
      <button
        class="flex items-center gap-2 px-5 py-1 text-slate-400 bg-slate-800 rounded-sm hover:text-white hover:bg-slate-700"
        @click="goToNext"
      >
        <Icon name="heroicons:arrow-right-16-solid" size="1.5rem" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"

const router = useRouter()
const { prevSlug, nextSlug } = defineProps({
  prevSlug: String,
  nextSlug: String,
})

const goToPrev = () => {
  if (prevSlug) router.push(prevSlug)
}
const goToNext = () => {
  if (nextSlug) router.push(nextSlug)
}
</script>
