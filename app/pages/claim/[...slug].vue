<!-- Dynamic route for individual claims -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`claim-${route.path}`">
    <!-- Background Wall (keeps index experience visible) -->
    <section
      class="gap-3 grid grid-rows-[auto_1fr] px-0 h-full overflow-hidden"
    >
      <div
        class="rounded-xl h-full min-h-0 overflow-y-auto scroll-container-stable"
      >
        <div class="mx-auto md:px-0 pr-3 pl-2 w-full max-w-screen-md">
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

  onMounted(async () => {
    console.log('🔍 Claim page mounted, looking for:', slugPath.value)

    // Ensure content is loaded first
    if (!claims?.value?.length || !contentReady.value) {
      console.log('📥 Loading content...')
      await loadAllContent()
      contentReady.value = true
    }

    // Wait for next tick to ensure reactive updates have processed
    await nextTick()

    console.log('🗺️ Slug maps claims size:', slugMaps.claims.size)
    console.log('🔍 Looking for slug:', slugPath.value)
    console.log('✅ Found claim:', !!slugMaps.claims.get(slugPath.value))

    // Debug: show all available claim slugs
    if (import.meta.dev) {
      console.log('Available claim slugs:', Array.from(slugMaps.claims.keys()))
    }

    // Restore wall scroll if available
    const scrollContainer = document.querySelector('.scroll-container-stable')
    if (scrollContainer && wallScrollTop.value > 0) {
      scrollContainer.scrollTo({ top: wallScrollTop.value })
    }

    // Don't redirect - just stay on the claim URL even if not found
    if (contentReady.value && !claim.value) {
      console.log('❌ Claim not found, but staying on URL')
    }
  })

  // Watch for content loading completion and check claim availability
  watch(contentReady, async (ready) => {
    if (ready) {
      await nextTick()
      // Don't redirect - just stay on the claim URL even if not found
      if (!claim.value) {
        console.log('❌ Claim not found in watcher, but staying on URL')
      }
    }
  })
</script>
