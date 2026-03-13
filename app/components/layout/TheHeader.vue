<!-- components/TheHeader.vue -->
<template>
  <header
    class="bg-theme-elevated sticky top-0 left-0 z-10 w-full px-2 pt-2 pb-1 sm:p-0 sm:pt-2 sm:pb-1"
  >
    <div class="xs:px-1 px-2 sm:px-2">
      <!-- Flex container with three sections for balanced layout -->
      <div class="flex items-center justify-between gap-1">
        <!-- Left: theme toggle (mirrors hamburger on the right) -->
        <div class="flex items-center">
          <button
            type="button"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-label="
              isDark ? 'Switch to light mode' : 'Switch to dark mode'
            "
            class="hover:bg-theme-overlay text-theme-muted hover:text-theme-accent-light rounded-lg p-2 transition-colors focus:outline-none"
            @click="toggleTheme"
          >
            <!-- Sun icon (shown in dark mode → click to go light) -->
            <svg
              v-if="isDark"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
              />
            </svg>
            <!-- Moon icon (shown in light mode → click to go dark) -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
              />
            </svg>
          </button>
        </div>

        <!-- Center logo -->
        <div class="flex flex-1 justify-center">
          <button
            type="button"
            aria-label="WakeUpNPC — go to home page"
            class="no-underline hover:cursor-pointer! focus:outline-none"
            @click="handleMastheadClick"
          >
            <LogoComponent />
          </button>
        </div>

        <!-- Right: navigation menu (hamburger) -->
        <div class="flex items-center">
          <LayoutNavigationMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
  const route = useRoute()
  const { isDark, toggleTheme, init } = useTheme()

  onMounted(() => {
    init()
  })

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
