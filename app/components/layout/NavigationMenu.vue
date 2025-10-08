<template>
  <div ref="menuContainer" class="isolate relative">
    <!-- Hamburger Button -->
    <LayoutHamburgerButton @click="toggleMenu" class="cursor-pointer" />

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <nav
        v-if="isMenuOpen"
        @click.stop
        class="top-full right-0 z-[1500] absolute bg-slate-800/95 shadow-[0_8px_30px_rgb(0,0,0,0.6)] backdrop-blur-md mt-[.25rem] py-0 border border-slate-600/50 rounded-md"
      >
        <!-- Navigation Links -->
        <ul class="py-0.5 font-100">
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
          <LayoutNavigationMenuItem
            to="/contact"
            label="Contact"
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

  /* Barlow Condensed font classes */
  .font-100 {
    font-family:
      'Barlow Condensed',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    font-weight: 300;
  }

  .font-300 {
    font-family:
      'Barlow Condensed',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    font-weight: 500;
  }
</style>
