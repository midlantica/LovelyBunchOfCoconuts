<!-- components/TheHeader.vue -->
<template>
  <header class="top-0 left-0 z-10 sticky bg-slate-900 pt-2 pb-1 w-full">
    <div class="px-6">
      <!-- New unified logo -->
      <div class="flex justify-center">
        <button
          type="button"
          class="focus:outline-none no-underline hover:cursor-pointer"
          @click="handleMastheadClick"
        >
          <LogoComponent />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
  const { reseedWall } = useWallSeed()
  const route = useRoute()
  const router = useRouter()

  // Global loading state for wall refresh
  const isWallRefreshing = useState('isWallRefreshing', () => false)

  async function handleMastheadClick() {
    if (isWallRefreshing.value) return // Prevent multiple clicks

    // For optimal performance, do a full page reload instead of client-side navigation
    // This matches the speed of a hard refresh (4s) vs slow client-side rebuild (6s)
    if (typeof window !== 'undefined') {
      // Clear any search params and reload
      const currentUrl = new URL(window.location)
      currentUrl.search = '' // Remove all query parameters
      window.location.href = currentUrl.toString()
    }
  }
</script>

<style scoped>
  /* Logo hover effects */
  .logo-hover-effect {
    transition: filter 0.5s ease-in-out;
  }

  .logo-hover-effect:hover {
    filter: brightness(0.8) contrast(1.1);
  }
</style>
