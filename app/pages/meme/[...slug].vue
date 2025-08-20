<!-- Dynamic route for individual memes -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`meme-${route.path}`">
    <!-- Background Wall -->
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

    <!-- Local modal overlay -->
    <ModalsModalMeme
      v-if="meme"
      :show="modalVisible"
      :modal-data="meme"
      @close="navigateHome"
    />
  </div>
</template>

<script setup>
  // Nuxt auto-imports: onMounted, watch, ref, computed

  const route = useRoute()
  const router = useRouter()

  const modalVisible = ref(true)
  const { useContentCache } = await import('~/composables/useContentCache')
  const { memes, loadAllContent, slugMaps } = useContentCache()

  const wallScrollTop = useState('wallScrollTop', () => 0)

  const slugPath = computed(() =>
    Array.isArray(route.params.slug) ? route.params.slug.join('/') : ''
  )

  const item = computed(() => slugMaps.memes.get(slugPath.value))

  // Expose meme object for template (was missing causing Vue warn)
  const meme = computed(() => item.value)

  function navigateHome() {
    modalVisible.value = false
    const modalGuardUntil = useState('modalGuardUntil', () => 0)
    modalGuardUntil.value = Date.now() + 450
    router.push('/')
  }

  onMounted(async () => {
    if (!memes?.value?.length) {
      await loadAllContent()
    }

    nextTick(() => {
      const scrollContainer = document.querySelector('.scroll-container-stable')
      if (scrollContainer && wallScrollTop.value > 0) {
        scrollContainer.scrollTo({ top: wallScrollTop.value })
      }
    })

    if (!item.value) {
      const unfound = route.params.slug
      const q = Array.isArray(unfound) ? unfound[unfound.length - 1] : unfound
      router.replace({ path: '/', query: { q: q, nf: '1' } })
    }
  })
</script>
