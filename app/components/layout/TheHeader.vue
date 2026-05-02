<!-- components/TheHeader.vue -->
<template>
  <header class="bg-theme-header sticky top-0 left-0 z-10 w-full py-1">
    <div class="px-2 sm:px-3 md:px-5 lg:px-8">
      <!-- Single row: theme toggle | logo + socials | about/home icon -->
      <div class="flex items-center justify-between gap-1">
        <!-- Left: theme toggle -->
        <div class="flex items-center">
          <button
            type="button"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-label="
              isDark ? 'Switch to light mode' : 'Switch to dark mode'
            "
            class="p-2 text-white focus:outline-none"
            @click="toggleTheme"
          >
            <!-- Sun icon (shown in dark mode → click to go light) -->
            <svg
              v-if="isDark"
              xmlns="http://www.w3.org/2000/svg"
              class="icon-halo h-6 w-6"
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
              class="icon-halo h-6 w-6"
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

        <!-- Center: logo + social icons stacked tightly -->
        <div class="flex flex-1 flex-col items-center gap-0.5">
          <button
            type="button"
            aria-label="Lovely Bunch of Coconuts — go to home page"
            class="no-underline hover:cursor-pointer! focus:outline-none"
            @click="handleMastheadClick"
          >
            <LogoComponent />
          </button>
          <div class="flex gap-3">
            <a
              href="#"
              aria-label="Visit Lovely Bunch of Coconuts on X"
              class="p-0.5 text-white"
            >
              <IconsXTwitter class="icon-halo" :size="18" />
            </a>
            <a
              href="#"
              aria-label="Visit Lovely Bunch of Coconuts on Facebook"
              class="p-0.5 text-white"
            >
              <IconsFacebook class="icon-halo" :size="18" />
            </a>
          </div>
        </div>

        <!-- Right: About icon (or Home icon when on /about) -->
        <div class="flex items-center">
          <NuxtLink
            v-if="isOnAbout"
            to="/"
            aria-label="Go to home page"
            class="p-2 text-white focus:outline-none"
          >
            <IconsIconHome class="icon-halo h-6 w-6" />
          </NuxtLink>
          <NuxtLink
            v-else
            to="/about"
            aria-label="About Lovely Bunch of Coconuts"
            class="p-2 text-white focus:outline-none"
          >
            <IconsIconAbout class="icon-halo h-6 w-6" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
  const route = useRoute()
  const { isDark, toggleTheme, init } = useTheme()

  const isOnAbout = computed(() => route.path === '/about')

  onMounted(() => {
    init()
  })

  // Guard against double-clicks during reload
  const isReloading = ref(false)

  function handleMastheadClick() {
    if (isReloading.value) return

    isReloading.value = true
    setTimeout(() => {
      isReloading.value = false
    }, 3000)

    if (route.path !== '/') {
      window.location.href = '/'
    } else {
      window.location.reload()
    }
  }
</script>

<style scoped>
  .logo-hover-effect {
    transition: filter 0.5s ease-in-out;
  }

  .logo-hover-effect:hover {
    filter: brightness(0.8) contrast(1.1);
  }

  .icon-halo {
    transition: filter 0.2s ease;
  }

  .icon-halo:hover,
  button:hover .icon-halo,
  a:hover .icon-halo {
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))
      drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
  }
</style>
