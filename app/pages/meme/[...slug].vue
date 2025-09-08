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
  // Nuxt auto-imports: onMounted, watch, ref, computed, nextTick

  import { useContentCache } from '~/composables/useContentCache'
  const route = useRoute()
  const router = useRouter()
  const modalVisible = ref(true)

  const wallScrollTop = useState('wallScrollTop', () => 0)
  const modalGuardUntil = useState('modalGuardUntil', () => 0)
  const { memes, ensureContentLoaded, cache, loadAllContent, slugMaps } =
    useContentCache()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)
  onServerPrefetch(async () => {
    try {
      await ensureContentLoaded()
      contentReady.value = true
    } catch {}
  })

  const slugPath = computed(() =>
    Array.isArray(route.params.slug) ? route.params.slug.join('/') : ''
  )

  // Try slug map first, then fallback to linear search if not found yet (e.g. progressive load)
  const meme = computed(() => {
    const slug = slugPath.value
    if (slugMaps.memes.has(slug)) return slugMaps.memes.get(slug)
    const memesArr = memes.value?.length ? memes.value : cache.memes
    return memesArr.find((m) => (m.title || '').toLowerCase().includes(slug))
  })

  watch(
    meme,
    (val) => {
      if (!contentReady.value) return
      if (!val && slugPath.value) {
        const q = slugPath.value.split('/').pop()
        navigateTo({ path: '/', query: { nf: '1', q } })
      }
    },
    { immediate: true }
  )

  function navigateHome() {
    modalVisible.value = false
    modalGuardUntil.value = Date.now() + 450
    requestAnimationFrame(() => router.push('/'))
  }

  onMounted(async () => {
    if (!contentReady.value) {
      await ensureContentLoaded()
      contentReady.value = true
    }
    nextTick(() => {
      const scrollContainer = document.querySelector('.scroll-container-stable')
      if (scrollContainer && wallScrollTop.value > 0) {
        scrollContainer.scrollTo({ top: wallScrollTop.value })
      }
    })
    if (!meme.value) {
      const unfound = route.params.slug
      const q = Array.isArray(unfound) ? unfound[unfound.length - 1] : unfound
      router.replace({ path: '/', query: { q: q, nf: '1' } })
    }
  })

  const slugify = (str = '') =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80)

  useHead(() => {
    if (!meme.value) {
      return {
        title: 'Meme Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The meme you are looking for could not be found.',
          },
        ],
      }
    }
    const memeTitle = meme.value.title || meme.value.description || 'Meme'
    const currentUrl = `${siteUrl}${route.path}`
    const ogImageUrl = meme.value.image
      ? meme.value.image.startsWith('http')
        ? meme.value.image
        : `${siteUrl}${meme.value.image}`
      : `${siteUrl}/npc_icon.svg`
    return {
      title: `${memeTitle} | WakeUpNPC`,
      meta: [
        { name: 'description', content: memeTitle },
        { property: 'og:title', content: memeTitle },
        { property: 'og:description', content: memeTitle },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:image', content: ogImageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: memeTitle },
        { name: 'twitter:description', content: memeTitle },
        { name: 'twitter:image', content: ogImageUrl },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
