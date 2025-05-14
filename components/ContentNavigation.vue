<!-- components/ContentNavigation.vue -->
<template>
  <div class="flex flex-wrap justify-between gap-3 mb-3">
    <button
      class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded-sm text-slate-400 hover:text-white"
      @click="router.push('/')"
    >
      <Icon name="heroicons:home-20-solid" size="1.25rem" />
    </button>
    <div class="flex gap-4">
      <button
        class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"
        @click="goToPrev"
        :disabled="!prevSlug"
        :class="{ 'opacity-50 cursor-not-allowed': !prevSlug }"
      >
        <Icon name="heroicons:arrow-left-16-solid" size="1.5rem" />
      </button>
      <button
        class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-1 rounded-sm text-slate-400 hover:text-white"
        @click="goToNext"
        :disabled="!nextSlug"
        :class="{ 'opacity-50 cursor-not-allowed': !nextSlug }"
      >
        <Icon name="heroicons:arrow-right-16-solid" size="1.5rem" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"

const router = useRouter()
const props = defineProps({
  prevSlug: String,
  nextSlug: String,
})

const goToPrev = () => {
  if (props.prevSlug) router.push(props.prevSlug)
}
const goToNext = () => {
  if (props.nextSlug) router.push(props.nextSlug)
}
</script>
