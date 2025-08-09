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
  import { onMounted, watch, ref, computed } from 'vue'

  const route = useRoute()
  const router = useRouter()

  const { memes, ensureContentLoaded, cache } = useContentCache()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)

  // Local modal visibility
  const modalVisible = ref(true)

  // Persisted wall scroll position
  const wallScrollTop = useState('wallScrollTop', () => 0)

  // Ensure content is loaded immediately for SSR and client-side
  await ensureContentLoaded()
  contentReady.value = true

  onMounted(async () => {
    await ensureContentLoaded()
    contentReady.value = true
    // Restore background wall scroll position
    const scroller = document.querySelector('.scroll-container-stable')
    if (scroller && wallScrollTop.value > 0) {
      scroller.scrollTop = wallScrollTop.value
    }
  })

  const routeSlug = computed(() =>
    Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug
  )

  // Find the meme that matches this path - make it reactive to route changes
  const meme = computed(() => {
    const currentSlug = routeSlug.value

    const memesArray = memes.value?.length > 0 ? memes.value : cache.memes

    if (!memesArray || memesArray.length === 0) {
      return null
    }

    const foundMeme = memesArray.find((meme) => {
      if (meme.id) {
        const filename = meme.id.split('/').pop()?.replace(/\.md$/, '') || ''
        const currentSlugLower = currentSlug.toLowerCase()
        const filenameLower = filename.toLowerCase()

        return (
          filenameLower.includes(currentSlugLower) ||
          currentSlugLower.includes(filenameLower)
        )
      }
      return false
    })

    return foundMeme
  })

  // Redirect to home with prefilled search if not found
  watch(
    meme,
    (val) => {
      if (!contentReady.value) return
      if (!val && routeSlug.value) {
        const q = routeSlug.value
        navigateTo({ path: '/', query: { nf: '1', q } })
      }
    },
    { immediate: true }
  )

  const slugify = (str = '') =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80)

  const navigateHome = () => {
    const modalGuardUntil = useState('modalGuardUntil', () => 0)
    modalGuardUntil.value = Date.now() + 450
    modalVisible.value = false
    requestAnimationFrame(() => router.push('/'))
  }

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

    const title = meme.value.title || meme.value.description || 'Meme'
    const currentUrl = `${siteUrl}${route.path}`
    const ogImageUrl = `${siteUrl}/api/share/meme/${slugify(title)}.png`

    return {
      title: `${title} | WakeUpNPC`,
      meta: [
        { name: 'description', content: title },
        { property: 'og:title', content: title },
        { property: 'og:description', content: title },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:image', content: ogImageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: title },
        { name: 'twitter:image', content: ogImageUrl },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
