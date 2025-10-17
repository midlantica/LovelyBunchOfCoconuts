<template>
  <div class="app-root">
    <NuxtLayout>
      <NuxtPage :keepalive="keepAliveConfig" />
    </NuxtLayout>
    <!-- Modal root for teleport -->
    <div id="modal-root"></div>
    <!-- Welcome modal for first-time visitors -->
    <ModalsWelcomeModal :show="showWelcomeModal" @close="closeWelcomeModal" />
  </div>
</template>

<script setup>
  const route = useRoute()

  // Welcome modal state - show on index page if not yet visited
  const showWelcomeModal = ref(false)

  if (import.meta.client) {
    const checkAndShowModal = () => {
      // Only show modal on the index page (the Wall)
      if (route.path === '/') {
        const hasVisited = localStorage.getItem('wakeupnpc_wall_visited')
        if (!hasVisited) {
          showWelcomeModal.value = true
        }
      } else {
        // When navigating away from index page, reset the visited flag
        // so they see the modal again when they return
        if (showWelcomeModal.value === false) {
          localStorage.removeItem('wakeupnpc_wall_visited')
        }
      }
    }

    // Check on mount
    onMounted(() => {
      checkAndShowModal()
    })

    // Watch for route changes
    watch(
      () => route.path,
      () => {
        checkAndShowModal()
      }
    )
  }

  const closeWelcomeModal = () => {
    showWelcomeModal.value = false
    if (import.meta.client) {
      localStorage.setItem('wakeupnpc_wall_visited', 'true')
    }
  }

  // Production-specific loading recovery
  if (import.meta.client && !import.meta.dev) {
    onMounted(() => {
      // Check if we're on a problematic URL pattern
      const url = new URL(window.location.href)
      const hasNfParam = url.searchParams.has('nf')
      const hasQParam = url.searchParams.has('q')

      if (hasNfParam && hasQParam) {
        // Set up a recovery mechanism
        let checkCount = 0
        const maxChecks = 10

        const checkInterval = setInterval(() => {
          checkCount++

          // Look for signs the page is stuck
          const bodyText = document.body?.textContent || ''
          const isStuck =
            bodyText.includes('loading content...') &&
            bodyText.length < 200 &&
            checkCount > 3

          if (isStuck) {
            console.warn('Detected stuck loading state, attempting recovery...')
            clearInterval(checkInterval)

            // Extract search query and redirect cleanly
            const searchQuery = url.searchParams.get('q') || ''

            // Try a clean redirect without the nf parameter
            const cleanUrl = `/?q=${encodeURIComponent(searchQuery)}`

            // Use replace to avoid back button issues
            window.location.replace(cleanUrl)
          }

          // Stop checking after max attempts or if content loads
          if (checkCount >= maxChecks || bodyText.length > 500) {
            clearInterval(checkInterval)
          }
        }, 1000) // Check every second
      }
    })
  }

  // Keep alive configuration for dynamic routes
  const keepAliveConfig = {
    include: ['index'],
    exclude: ['[...slug]'],
    max: 5,
  }
</script>

<style>
  /* Ensure consistent background during hydration - minimal override */
  #__nuxt {
    min-height: 100vh;
  }
</style>
