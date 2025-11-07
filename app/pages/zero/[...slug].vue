<!-- Dynamic route for individual zero profiles -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`zero-${route.path}`">
    <!-- Wall in background -->
    <WallTheWall
      :search-term="searchTerm"
      :content-filters="contentFilters"
      :counts="liveCounts"
      @update-counts="handleCounts"
    />

    <!-- Modal overlay -->
    <div class="fixed inset-0 z-50">
      <ModalsModalProfile
        v-if="profile && contentReady"
        :show="modalVisible"
        :modal-data="profile"
        @close="navigateHome"
      />

      <!-- Fallback if profile not found -->
      <div
        v-else-if="contentReady"
        class="flex h-screen items-center justify-center bg-slate-900"
      >
        <div class="text-center">
          <h1 class="mb-4 text-2xl font-bold text-white">Zero Not Found</h1>
          <p class="mb-6 text-gray-300">
            The zero profile you are looking for could not be found.
          </p>
          <button
            @click="navigateHome"
            class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
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

    const slug = routeSlug.value.toLowerCase().replace(/-/g, ' ')
    const found = profiles.value.find((p) => {
      // Check both p.status and p.meta?.status for compatibility
      const status = p.status || p.meta?.status
      // Normalize profile name: remove periods and convert to lowercase
      const profileName = (p.profile || p.meta?.profile || '')
        .toLowerCase()
        .replace(/\./g, '') // Remove periods for matching

      const normalizedSlug = slug.replace(/\./g, '') // Also remove periods from slug

      return profileName === normalizedSlug && status === 'zero'
    })

    // Debug logging in dev mode
    if (import.meta.dev && !found) {
      console.log('Profile not found for slug:', routeSlug.value)
      console.log('Converted to profile name:', slug)
      console.log(
        'Available zero profile names:',
        profiles.value
          .filter((p) => {
            const status = p.status || p.meta?.status
            return status === 'zero'
          })
          .map((p) => p.profile || p.meta?.profile)
      )
    }

    return found
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
        title: 'Zero Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The zero profile you are looking for could not be found.',
          },
        ],
      }
    }

    const name = profile.value.profile || profile.value.title
    const currentUrl = `${siteUrl}${route.path}`

    return {
      title: `${name} - Zero | WakeUpNPC`,
      meta: [
        { name: 'description', content: `Profile of ${name}` },
        { property: 'og:title', content: `${name} - Zero` },
        { property: 'og:description', content: `Profile of ${name}` },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${name} - Zero` },
        { name: 'twitter:description', content: `Profile of ${name}` },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
