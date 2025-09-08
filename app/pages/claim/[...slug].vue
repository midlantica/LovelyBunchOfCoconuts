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
            <WallTheWall />
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
      await ensureContentLoaded()
      contentReady.value = true
    } catch {}
  })

  const wallScrollTop = useState('wallScrollTop', () => 0)

  const slugPath = computed(() =>
    Array.isArray(route.params.slug) ? route.params.slug.join('/') : ''
  )

  // Claim referenced in template
  const claim = computed(() => slugMaps.claims.get(slugPath.value))

  function navigateHome() {
    modalVisible.value = false
    const modalGuardUntil = useState('modalGuardUntil', () => 0)
    modalGuardUntil.value = Date.now() + 450
    router.push('/')
  }

  onMounted(async () => {
    // Ensure content is loaded
    if (!claims?.value?.length) {
      await loadAllContent()
    }
    if (!contentReady.value) {
      try {
        await ensureContentLoaded()
        contentReady.value = true
      } catch {}
    }

    // Restore wall scroll if available
    nextTick(() => {
      const scrollContainer = document.querySelector('.scroll-container-stable')
      if (scrollContainer && wallScrollTop.value > 0) {
        scrollContainer.scrollTo({ top: wallScrollTop.value })
      }
    })

    // Handle missing item
    if (!claim.value) {
      const unfound = route.params.slug
      const q = Array.isArray(unfound) ? unfound[unfound.length - 1] : unfound
      router.replace({ path: '/', query: { q: q, nf: '1' } })
    }
  })
</script>
