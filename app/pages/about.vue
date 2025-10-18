<template>
  <div class="mx-auto px-2 md:px-0 py-0 w-full max-w-screen-md">
    <AboutWakeUpNPC />

    <div class="space-y-6 px-3 pb-8">
      <WhatWeDo />
      <ContactForm />
    </div>
  </div>
</template>

<script setup>
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
