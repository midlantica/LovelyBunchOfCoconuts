<template>
  <div class="mx-auto w-full max-w-3xl px-8 py-0 sm:px-12">
    <AboutWakeUpNPC />
    <WhatWeDo />
    <ContactForm />
  </div>
</template>

<script setup>
  // Scroll to top when page loads
  onMounted(() => {
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTop = 0
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })

  useHead({
    title: 'About Our Mission - WakeUpNPC',
    meta: [
      {
        name: 'description',
        content:
          "We highlight the Woke Left's insanity sweeping through our civilization that took a thousand years to build. We make fun of the Left's madness. We see their Guilt Grift machine and decode it. We expose their empty rhetoric, regressive dogma, and the epic gaslighting.",
      },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'About Our Mission - WakeUpNPC' },
      {
        property: 'og:description',
        content:
          "We highlight the Woke Left's insanity sweeping through our civilization. We decode the Guilt Grift machine and expose their empty rhetoric and regressive dogma.",
      },
      { property: 'og:url', content: 'https://wakeupnpc.com/about' },
      { property: 'og:site_name', content: 'WakeUpNPC' },
      {
        property: 'og:image',
        content: 'https://wakeupnpc.com/text-bg-1200x630.png?v=2',
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'About Our Mission - WakeUpNPC' },
      {
        name: 'twitter:description',
        content:
          "We highlight the Woke Left's insanity sweeping through our civilization. We decode the Guilt Grift machine and expose their empty rhetoric and regressive dogma.",
      },
      {
        name: 'twitter:image',
        content: 'https://wakeupnpc.com/text-bg-1200x630.png?v=2',
      },
    ],
    link: [{ rel: 'canonical', href: 'https://wakeupnpc.com/about' }],
    bodyAttrs: {
      class: 'about',
    },
  })
</script>
