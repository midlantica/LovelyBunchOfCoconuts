<!-- Dynamic route for individual comedian profiles -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`profile-${route.path}`">
    <!-- Wall in background -->
    <WallTheWall
      :search-term="searchTerm"
      :content-filters="contentFilters"
      :counts="liveCounts"
      @update-counts="handleCounts"
    />

    <!-- Modal overlay -->
    <ClientOnly>
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
            <h1 class="mb-4 text-2xl font-bold text-white">
              Profile Not Found
            </h1>
            <p class="mb-6 text-gray-300">
              The comedian profile you are looking for could not be found.
            </p>
            <button
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="navigateHome"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
  import { useProfiles } from '~/composables/useProfiles'

  const route = useRoute()
  const router = useRouter()

  const modalVisible = ref(true)

  const searchTerm = useState('searchTerm', () => '')
  const contentFilters = useState('contentFilters', () => ({
    quotes: true,
    memes: true,
  }))

  const wallCounts = ref({ quotes: 0, memes: 0, total: 0 })
  const totalCounts = ref({ quotes: 0, memes: 0 })
  const liveCounts = computed(() => ({
    wall: wallCounts.value,
    total: totalCounts.value,
  }))

  function handleCounts({ wallCounts: wc, totalCounts: tc }) {
    wallCounts.value = wc
    totalCounts.value = tc
  }

  const wallScrollTop = useState('wallScrollTop', () => 0)
  const { fetchAllProfiles } = useProfiles()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl =
    runtimeConfig.public.siteUrl || 'https://lovelybunchofcoconuts.com'

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
      // Support both top-level and meta-nested profile name
      const profileName = (p.profile || p.meta?.profile || '')
        .toLowerCase()
        .replace(/\./g, '')

      const normalizedSlug = slug.replace(/\./g, '')
      return profileName === normalizedSlug
    })

    if (import.meta.dev && !found) {
      console.log('Profile not found for slug:', routeSlug.value)
      console.log('Converted to profile name:', slug)
      console.log(
        'Available profiles:',
        profiles.value.map((p) => p.profile || p.meta?.profile)
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
        title: 'Profile Not Found | Lovely Bunch of Coconuts',
        meta: [
          {
            name: 'description',
            content:
              'The comedian profile you are looking for could not be found.',
          },
        ],
      }
    }

    const name =
      profile.value.profile ||
      profile.value.meta?.profile ||
      profile.value.title
    const currentUrl = `${siteUrl}${route.path}`

    return {
      title: `${name} | Lovely Bunch of Coconuts`,
      meta: [
        {
          name: 'description',
          content: `Profile of ${name} — British comedy legend.`,
        },
        { property: 'og:title', content: `${name} | Lovely Bunch of Coconuts` },
        {
          property: 'og:description',
          content: `Profile of ${name} — British comedy legend.`,
        },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:site_name', content: 'Lovely Bunch of Coconuts' },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: `${name} | Lovely Bunch of Coconuts`,
        },
        {
          name: 'twitter:description',
          content: `Profile of ${name} — British comedy legend.`,
        },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
