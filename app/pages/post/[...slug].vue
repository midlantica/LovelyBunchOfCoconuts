<!-- Dynamic route for individual posts -->
<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :key="`post-${route.path}`">
    <!-- Background Wall -->
    <section
      class="grid h-full grid-rows-[auto_1fr] gap-3 overflow-hidden px-0"
    >
      <div
        class="scroll-container-stable h-full min-h-0 overflow-y-auto rounded-xl"
      >
        <div class="mx-auto w-full max-w-3xl pr-3 pl-2 md:px-0">
          <main class="pb-8">
            <WallTheWall :hide-no-content="true" />
          </main>
        </div>
      </div>
    </section>

    <!-- Local modal overlay -->
    <ClientOnly>
      <ModalsModalPost
        v-if="post"
        :show="modalVisible"
        :modal-data="post"
        @close="navigateHome"
      />
    </ClientOnly>
  </div>
</template>

<script setup>
  // Nuxt auto-imports: onMounted, watch, ref, computed

  import { useContentCache } from '~/composables/useContentCache'
  const route = useRoute()
  const router = useRouter()

  // Local modal visibility
  const modalVisible = ref(true)

  // Persisted wall scroll position
  const wallScrollTop = useState('wallScrollTop', () => 0)
  const { posts, loadAllContent, slugMaps } = useContentCache()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)
  const loadingTimeout = ref(null)

  onServerPrefetch(async () => {
    try {
      await loadAllContent()
      contentReady.value = true
    } catch (e) {
      console.error('Server prefetch failed:', e)
    }
  })

  onMounted(async () => {
    // Ensure content is loaded first
    if (!posts?.value?.length || !contentReady.value) {
      // Set a timeout to prevent infinite loading
      loadingTimeout.value = setTimeout(() => {
        console.warn('Content loading timeout - redirecting to home')
        const q = routeSlug.value?.split('/').pop() || ''
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
        const q = routeSlug.value?.split('/').pop() || ''
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

  const routeSlug = computed(() => {
    let slug = Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug || ''

    // Remove any query parameters from the slug (in case they got mixed in)
    if (slug.includes('?')) {
      slug = slug.split('?')[0]
    }

    // Handle different slug formats
    const parts = slug.split('/')
    if (parts.length > 1) {
      return parts[parts.length - 1]
    }
    return slug
  })

  // Post referenced in template - only look in slug maps after content is loaded
  const post = computed(() => {
    if (!contentReady.value) return null

    // First try slug map lookup with the processed slug
    let foundPost = slugMaps.posts.get(routeSlug.value)

    // If not found, try with full path
    if (!foundPost && route.params.slug) {
      const fullSlug = Array.isArray(route.params.slug)
        ? route.params.slug.join('/')
        : route.params.slug
      foundPost = slugMaps.posts.get(fullSlug)
    }

    // If not found, try fallback search through posts array
    if (!foundPost && posts.value?.length) {
      const slug = routeSlug.value.toLowerCase()
      foundPost = posts.value.find((post) => {
        const filename = (post.id || post._path || '')
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

    return foundPost
  })

  // Watch for content loading completion and check post availability
  watch(contentReady, async (ready) => {
    if (ready) {
      await nextTick()
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

  const navigateHome = () => {
    const modalGuardUntil = useState('modalGuardUntil', () => 0)
    modalGuardUntil.value = Date.now() + 150
    modalVisible.value = false
    requestAnimationFrame(() => router.push('/'))
  }

  useHead(() => {
    if (!post.value) {
      return {
        title: 'Post Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The post you are looking for could not be found.',
          },
        ],
      }
    }

    const postTitle = post.value.title
    const currentUrl = `${siteUrl}${route.path}`

    return {
      title: `${postTitle} | WakeUpNPC`,
      meta: [
        { name: 'description', content: postTitle },
        { property: 'og:title', content: postTitle },
        { property: 'og:description', content: postTitle },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: postTitle },
        { name: 'twitter:description', content: postTitle },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
