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
  import { onMounted, watch, nextTick, ref, computed } from 'vue'

  const route = useRoute()
  const router = useRouter()

  const { claims, ensureContentLoaded, cache } = useContentCache()
  const shareImage = ref(null)
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = runtimeConfig.public.siteUrl || 'https://wakeupnpc.com'

  const contentReady = ref(false)

  // Modal local visibility for instant close
  const modalVisible = ref(true)

  // Persisted wall scroll position
  const wallScrollTop = useState('wallScrollTop', () => 0)

  // Global modal reopen guard shared with TheWall
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  // Ensure content is loaded immediately for SSR and client-side
  await ensureContentLoaded()
  contentReady.value = true

  // Also ensure content is loaded on mount as fallback and sync scroll position
  onMounted(async () => {
    await ensureContentLoaded()
    contentReady.value = true
    // Restore background wall scroll position
    const scroller = document.querySelector('.scroll-container-stable')
    if (scroller && wallScrollTop.value > 0) {
      scroller.scrollTop = wallScrollTop.value
    }
  })

  // Watch route changes and re-ensure content is available
  watch(
    () => route.params.slug,
    async () => {
      await ensureContentLoaded()
      await nextTick()
      modalVisible.value = true
    },
    { immediate: false }
  )

  const routeSlug = computed(() =>
    Array.isArray(route.params.slug)
      ? route.params.slug.join('/')
      : route.params.slug
  )

  // Find the claim that matches this path - make it reactive to route changes
  const claim = computed(() => {
    const currentSlug = routeSlug.value

    const claimsArray = claims.value?.length > 0 ? claims.value : cache.claims

    if (!claimsArray || claimsArray.length === 0) {
      return null
    }

    const foundClaim = claimsArray.find((claim) => {
      if (claim.id) {
        const filename = claim.id.split('/').pop()?.replace(/\.md$/, '') || ''
        const currentSlugLower = currentSlug.toLowerCase()
        const filenameLower = filename.toLowerCase()

        return (
          filenameLower.includes(currentSlugLower) ||
          currentSlugLower.includes(filenameLower)
        )
      }
      return false
    })

    return foundClaim
  })

  // Redirect to home with prefilled search if not found
  watch(
    claim,
    (val) => {
      if (!contentReady.value) return
      if (!val && routeSlug.value) {
        const q = routeSlug.value
        navigateTo({ path: '/', query: { nf: '1', q } })
      }
    },
    { immediate: true }
  )

  // Helper to slugify claim text for API endpoint
  const slugify = (str = '') =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80)

  // Remove head override with data URLs; keep optional generation for UI use only
  watch(claim, async (val) => {
    if (!process.client || !val) return
    try {
      const { generateClaimShareAsset } = useShareImageGenerator()
      const { dataUrl } = await generateClaimShareAsset(
        val.claim || val.title,
        val.translation || ''
      )
      shareImage.value = dataUrl
      // Do not override SSR share tags here to preserve crawler-friendly URLs
    } catch (e) {
      console.warn('Share image generation failed:', e)
    }
  })

  const navigateHome = () => {
    modalGuardUntil.value = Date.now() + 450
    modalVisible.value = false
    // Navigate after the frame to ensure UI hides immediately
    requestAnimationFrame(() => router.push('/'))
  }

  // Set page meta for social sharing (use server share endpoint)
  useHead(() => {
    if (!claim.value) {
      return {
        title: 'Claim Not Found | WakeUpNPC',
        meta: [
          {
            name: 'description',
            content: 'The claim you are looking for could not be found.',
          },
        ],
      }
    }

    const claimText = claim.value.claim || claim.value.title
    const translation = claim.value.translation || ''
    const currentUrl = `${siteUrl}${route.path}`
    const ogImageUrl = `${siteUrl}/api/share/claim/${slugify(claimText)}.png`

    return {
      title: `${claimText} | WakeUpNPC`,
      meta: [
        { name: 'description', content: translation || claimText },
        { property: 'og:title', content: claimText },
        { property: 'og:description', content: translation || claimText },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:image', content: ogImageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'WakeUpNPC' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: claimText },
        { name: 'twitter:description', content: translation || claimText },
        { name: 'twitter:image', content: ogImageUrl },
      ],
      link: [{ rel: 'canonical', href: currentUrl }],
    }
  })
</script>
