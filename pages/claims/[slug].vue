<!-- Dynamic page for individual claims -->
<template>
  <div class="mx-auto px-4 py-8 container">
    <div v-if="claim" class="mx-auto max-w-2xl">
      <div class="bg-slate-800 shadow-lg p-6 rounded-lg">
        <h1 class="mb-4 font-bold text-white text-2xl">{{ claim.claim }}</h1>
        <hr class="my-4 border-white/10" />
        <h2 class="mb-4 font-bold text-white text-2xl">
          {{ claim.translation }}
        </h2>
        <div
          v-if="claim.body"
          v-html="claim.bodyHtml"
          class="prose-invert max-w-none prose"
        ></div>
      </div>

      <!-- Share buttons -->
      <ShareButton
        :title="claim.claim"
        :text="`${claim.claim} - ${claim.translation}`"
        :url="$route.fullPath"
        :generated-image-blob="shareImageBlob"
        class="mt-6"
      />
    </div>
    <div v-else class="text-white text-center">
      <h1 class="text-2xl">Claim not found</h1>
      <NuxtLink to="/" class="text-seagull-400 hover:underline"
        >← Back to home</NuxtLink
      >
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const route = useRoute()
  const { data: claim } = await $fetch(`/api/claims/${route.params.slug}`)

  const shareImageBlob = ref(null)

  // Generate share image
  if (claim) {
    const { generateClaimImage } = await import(
      '~/composables/useShareImageGenerator'
    )
    shareImageBlob.value = await generateClaimImage(
      claim.claim,
      claim.translation
    )

    // Set meta tags for social sharing
    useHead({
      title: `${claim.claim} - WakeUpNPC`,
      meta: [
        { name: 'description', content: claim.translation },
        { property: 'og:title', content: `${claim.claim} - WakeUpNPC` },
        { property: 'og:description', content: claim.translation },
        {
          property: 'og:image',
          content: `/api/og/claim?claim=${encodeURIComponent(claim.claim)}&translation=${encodeURIComponent(claim.translation)}`,
        },
        { property: 'og:type', content: 'article' },
        {
          property: 'og:url',
          content: `https://wakeupnpc.com${route.fullPath}`,
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${claim.claim} - WakeUpNPC` },
        { name: 'twitter:description', content: claim.translation },
        {
          name: 'twitter:image',
          content: `/api/og/claim?claim=${encodeURIComponent(claim.claim)}&translation=${encodeURIComponent(claim.translation)}`,
        },
      ],
    })
  }
</script>
