<!-- components/TheHeader.vue -->
<template>
  <header
    class="sticky top-0 left-0 z-10 w-full bg-slate-900 px-2 pt-2 pb-1 sm:p-0 sm:pt-2 sm:pb-1"
  >
    <div class="pr-2 pl-4 sm:pr-4">
      <!-- Flex container with three sections for balanced layout -->
      <div class="flex items-center justify-between">
        <!-- Left spacer (same width as hamburger menu) - hidden on mobile -->
        <div class="hidden w-10 sm:block"></div>

        <!-- Center logo on desktop, left-aligned on mobile -->
        <div class="flex flex-1 justify-center">
          <button
            type="button"
            class="no-underline hover:cursor-pointer! focus:outline-none"
            @click="handleMastheadClick"
          >
            <LogoComponent />
          </button>
        </div>

        <!-- Right navigation menu -->
        <div class="w-10">
          <LayoutNavigationMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
  const route = useRoute()

  // Guard against double-clicks during reload
  const isReloading = ref(false)

  function handleMastheadClick() {
    if (isReloading.value) return // Ignore clicks while reload is in progress

    isReloading.value = true
    // Safety reset in case navigation is blocked or delayed
    setTimeout(() => {
      isReloading.value = false
    }, 3000)

    // Full page reload — behaves exactly like Cmd-R / F5.
    // If on a sub-page, navigate to home with a full reload;
    // if already on home, just reload the current page.
    if (route.path !== '/') {
      window.location.href = '/'
    } else {
      window.location.reload()
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
