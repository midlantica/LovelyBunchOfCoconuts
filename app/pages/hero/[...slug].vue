<!-- Dynamic route for individual hero profiles -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`hero-${route.path}`">
    <!-- Background Wall -->
    <section
      class="grid h-full grid-rows-[auto_1fr] gap-3 overflow-hidden px-0"
    >
      <!-- Search Bar -->
      <div class="flex justify-center">
        <div class="mx-auto w-full max-w-3xl px-4 md:px-0">
          <SearchbarSearchBar
            v-model:search="searchTerm"
            v-model:filters="contentFilters"
            :counts="liveCounts"
            class="sticky top-0 z-5 w-full"
          />
        </div>
      </div>

      <div
        class="scroll-container-stable h-full min-h-0 overflow-y-auto rounded-xl"
      >
        <div class="mx-auto w-full max-w-3xl pr-3 pl-2 md:px-0">
          <main class="pb-8">
            <WallTheWall
              :search="searchTerm"
              :filters="contentFilters"
              :hide-no-content="true"
              @counts="handleCounts"
            />
          </main>
        </div>
      </div>
    </section>

    <!-- Local modal overlay -->
    <ModalsModalProfile
      v-if="profile"
      :show="modalVisible"
      :modal-data="profile"
      @close="navigateHome"
    />
  </div>
</template>

<script setup>
  import { useProfiles } from '~/composables/useProfiles'

  const route = useRoute()
  const router = useRouter()

  // Local modal visibility
  const modalVisible = ref(true)

  // Search and filter state
  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    grifts: true,
    quotes: true,
    memes: true,
  }))

  // Count tracking
  const wallCounts = ref({ grifts: 0, quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ grifts: 0, quotes: 0, memes: 0 })
  const liveCounts = computed(() => ({
    wall: wallCounts.value,
    total: totalCounts.value,
  }))

  function handleCounts({ wallCounts: wc, totalCounts: tc }) {
    wallCounts.value = wc
    totalCounts.value = tc
  }

  // Persisted wall scroll position
  const wallScrollTop = useState('wallScrollTop', () => 0)
  const { fetchAllProfiles } = useProfiles()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)
  const loadingTimeout = ref(null)
  const profiles = ref([])

  onServerPrefetch(async () => {
    try {
      profiles.value = await fetchAllProfiles()
      contentReady.value = true
    } catch (e) {
      console.error('Server prefetch failed:', e)
    }
  })

  onMounted(async () => {
    if (!profiles.value?.length || !contentReady.value) {
      loadingTimeout.value = setTimeout(() => {
        console.warn('Content loading timeout - redirecting to home')
        navigateTo({ path: '/', query: { nf: '1' } }, { replace: true })
      }, 5000)

      try {
        profiles.value = await fetchAllProfiles()
        contentReady.value = true

        if (loadingTimeout.value) {
          clearTimeout(loadingTimeout.value)
          loadingTimeout.value = null
        }
      } catch (e) {
        console.error('Failed to load content:', e)
        navigateTo({ path: '/', query: { nf: '1' } }, { replace: true })
        return
      }
    }

    await nextTick()

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

  const routeSlug = computed(() => {
    const slug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug || ''
    return slug
  })

  const profile = computed(() => {
    if (!contentReady.value || !profiles.value?.length) return null

    const slug = routeSlug.value.toLowerCase()
    return profiles.value.find((p) => {
      const filename = (p._path || '')
        .split('/')
        .pop()
        ?.replace(/\.md$/, '')
        .toLowerCase()
      return filename === slug && p.meta?.status === 'hero'
    })
  })

  const navigateHome = () => {
    const modalGuardUntil = useState('modalGuardUntil', () => 0)
    modalGuardUntil.value = Date.now() + 150
    modalVisible.value = false
    requestAnimationFrame(() => router.push('/'))
  }

  useHead(() => {
    if (!profile.value) {
      return {
        title: 'Hero Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The hero profile you are looking for could not be found.',
          },
        ],
      }
    }

    const name = profile.value.profile || profile.value.title
    const currentUrl = `${siteUrl}${route.path}`

    return {
      title: `${name} - Hero | WakeUpNPC`,
      meta: [
        { name: 'description', content: `Profile of ${name}` },
        { property: 'og:title', content: `${name} - Hero` },
        { property: 'og:description', content: `Profile of ${name}` },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${name} - Hero` },
        { name: 'twitter:description', content: `Profile of ${name}` },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
