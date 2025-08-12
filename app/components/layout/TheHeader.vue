<!-- components/TheHeader.vue -->
<template>
  <header class="top-0 left-0 z-10 sticky bg-slate-900 pt-4 pb-3 w-full">
    <div class="px-6">
      <!-- New unified logo -->
      <div class="flex justify-center">
        <button
          type="button"
          class="focus:outline-none no-underline hover:cursor-pointer"
          @click="handleMastheadClick"
        >
          <img
            src="@/assets/WakeUpNPC-logo.svg"
            alt="Wake up NPC"
            class="w-full max-w-[545px] object-contain transition-all duration-300 ease-out"
          />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
  const { reseedWall } = useWallSeed()
  const route = useRoute()
  const router = useRouter()

  function handleMastheadClick() {
    // Reseed wall for new randomized ordering
    reseedWall('masthead-click')
    // If not already on root, navigate without full reload
    if (route.path !== '/') router.push('/')
  }
</script>
