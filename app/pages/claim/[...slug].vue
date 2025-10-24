<!-- Dynamic route for individual claims -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`claim-${route.path}`">
    <!-- Background Wall (keeps index experience visible) -->
    <section
      class="grid h-full grid-rows-[auto_1fr] gap-3 overflow-hidden px-0"
    >
      <div
        class="scroll-container-stable h-full min-h-0 overflow-y-auto rounded-xl"
      >
        <div class="mx-auto w-full max-w-screen-md pr-3 pl-2 md:px-0">
          <main class="pb-8">
            <WallTheWall :hide-no-content="true" />
          </main>
        </div>
      </div>
    </section>

    <!-- Local modal overlay so URL remains /claim/... -->
    <ModalsModalClaim
      v-if="claim"
      :show="modalVisible"
      :modal-data="claim"
      @close="navigateHome"
    />
  </div>
</template>

<script setup>
  // Nuxt auto-imports: onMounted, watch, nextTick, ref, computed

  import { useContentCache } from '~/composables/useContentCache'
  const route = useRoute()
  const router = useRouter()

  const modalVisible = ref(true)
  const { claims, ensureContentLoaded, loadAllContent, slugMaps } =
    useContentCache()
  const contentReady = ref(false)
  onServerPrefetch(async () => {
    try {
      await loadAllContent()
      contentReady.value = true
    } catch (e) {
      console.error('Server prefetch failed:', e)
    }
  })

  const wallScrollTop = useState('wallScrollTop', () => 0)

  const slugPath = computed(() => {
    const slug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug || ''
    return slug
  })

  // Claim referenced in template - only look in slug maps after content is loaded
  const claim = computed(() => {
    if (!contentReady.value) return null

    // First try slug map lookup
    let foundClaim = slugMaps.claims.get(slugPath.value)

    // If not found, try fallback search through claims array
    if (!foundClaim && claims.value?.length) {
      const slug = slugPath.value.toLowerCase()
      foundClaim = claims.value.find((claim) => {
        const filename = (claim.id || claim._path || '')
          .split('/')
          .pop()
          ?.replace(/\.md$/, '')
          .toLowerCase()
        return (
          filename === slug ||
          filename?.includes(slug) ||
          slug.includes(filename || '')
        )
      })
    }

    return foundClaim
  })

  function navigateHome() {
    modalVisible.value = false
    const modalGuardUntil = useState('modalGuardUntil', () => 0)
    modalGuardUntil.value = Date.now() + 150
    router.push('/')
  }

  const loadingTimeout = ref(null)

  onMounted(async () => {
    // Ensure content is loaded first
    if (!claims?.value?.length || !contentReady.value) {
      // Set a timeout to prevent infinite loading
      loadingTimeout.value = setTimeout(() => {
        console.warn('Content loading timeout - redirecting to home')
        const q = slugPath.value?.split('/').pop() || ''
        navigateTo({ path: '/', query: { nf: '1', q } }, { replace: true })
      }, 5000) // 5 second timeout

      try {
        await loadAllContent()
        contentReady.value = true

        // Clear timeout if loading succeeded
        if (loadingTimeout.value) {
          clearTimeout(loadingTimeout.value)
          loadingTimeout.value = null
        }
      } catch (e) {
        console.error('Failed to load content:', e)
        // Redirect on error
        const q = slugPath.value?.split('/').pop() || ''
        navigateTo({ path: '/', query: { nf: '1', q } }, { replace: true })
        return
      }
    }

    // Wait for next tick to ensure reactive updates have processed
    await nextTick()

    // Restore wall scroll if available
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer && wallScrollTop.value > 0) {
      scrollContainer.scrollTo({ top: wallScrollTop.value })
    }
  })

  onBeforeUnmount(() => {
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value)
    }
  })

  // Watch for content loading completion and check claim availability
  watch(contentReady, async (ready) => {
    if (ready) {
      await nextTick()
    }
  })
</script>
