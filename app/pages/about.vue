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
    ],
    bodyAttrs: {
      class: 'about',
    },
  })
</script>
