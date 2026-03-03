<template>
  <div ref="menuContainer" class="relative isolate">
    <!-- Hamburger Button -->
    <LayoutHamburgerButton @click="toggleMenu" class="cursor-pointer!" />

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <nav
        v-if="isMenuOpen"
        @click.stop
        :class="[
          'nav-dropdown absolute top-full right-0 z-1500 mt-1 rounded-md border py-0 shadow-[0_8px_30px_rgb(0,0,0,0.6)] backdrop-blur-md',
          isDark ? 'nav-dropdown--dark' : 'nav-dropdown--light',
        ]"
      >
        <!-- Navigation Links -->
        <ul class="font-100 py-0.5">
          <LayoutNavigationMenuItem to="/" label="Home" @click="closeMenu" />
          <LayoutNavigationMenuItem
            to="/about"
            label="About"
            @click="closeMenu"
          />
          <LayoutNavigationMenuItem
            to="/advertising"
            label="Advertising"
            @click="closeMenu"
          />
        </ul>

        <!-- Social Links Section -->
        <LayoutSocialLinks />
      </nav>
    </Transition>
  </div>
</template>

<script setup>
  const { isDark } = useTheme()

  const isMenuOpen = ref(false)
  const menuContainer = ref(null)

  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
  }

  function closeMenu() {
    isMenuOpen.value = false
  }

  // Close menu when clicking outside
  function handleClickOutside(event) {
    if (menuContainer.value && !menuContainer.value.contains(event.target)) {
      closeMenu()
    }
  }

  // Set up click outside listener
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  // Close menu on route change
  const route = useRoute()
  watch(
    () => route.path,
    () => {
      closeMenu()
    }
  )
</script>

<style scoped>
  /* Dropdown transition */
  .dropdown-enter-active {
    transition: all 0.2s ease-out;
  }

  .dropdown-leave-active {
    transition: all 0.15s ease-in;
  }

  .dropdown-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  /* Dark mode */
  .nav-dropdown--dark {
    background-color: #0f172a; /* slate-900 */
    border-color: rgb(71 85 105 / 0.5); /* slate-600/50 */
  }

  /* Light mode: cream/off-white background, charcoal border */
  .nav-dropdown--light {
    background-color: #fdfdf8; /* cream-bright white */
    border-color: rgba(26, 26, 26, 0.15); /* charcoal 15% */
  }

  /* Barlow Condensed font classes — weights must match their class names */
  .font-100 {
    font-family:
      'Barlow Condensed',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    font-weight: 100;
  }

  .font-300 {
    font-family:
      'Barlow Condensed',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    font-weight: 300;
  }
</style>
