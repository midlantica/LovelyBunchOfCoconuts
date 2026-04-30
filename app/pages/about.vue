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
    title: 'About - Tally Ho!',
    meta: [
      {
        name: 'description',
        content:
          'Tally Ho! is a celebration of British humour — from Oscar Wilde to Monty Python, Blackadder to Fawlty Towers. A wall of wit, wisdom, and wonderfully silly jokes.',
      },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'About - Tally Ho!' },
      {
        property: 'og:description',
        content:
          'A celebration of British humour — from Oscar Wilde to Monty Python, Blackadder to Fawlty Towers.',
      },
      { property: 'og:site_name', content: 'Tally Ho!' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'About - Tally Ho!' },
      {
        name: 'twitter:description',
        content:
          'A celebration of British humour — from Oscar Wilde to Monty Python, Blackadder to Fawlty Towers.',
      },
    ],
    bodyAttrs: {
      class: 'about',
    },
  })
</script>
