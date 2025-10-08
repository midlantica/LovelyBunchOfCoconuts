<template>
  <div class="space-y-4 mx-auto px-2 md:px-0 py-0 w-full max-w-screen-md">
    <h1 class="mt-2 font-100 text-2xl">About WakeUpNPC</h1>

    <!-- Mission Statement -->
    <div class="bg-slate-800/60 shadow-xl p-6 rounded-lg">
      <h2 class="mb-3 text-blue-200 text-2xl uppercase">Our Mission</h2>
      <p
        class="mb-3 last:pb-0 font-100 text-seagull-100 text-lg leading-relaxed"
      >
        WakeUpNPC satirizes progressive ideology through humor that resonates
        with those who see through the absurdities of modern "woke" culture. We
        believe laughter is one of the most powerful tools for revealing truth
        and challenging groupthink.
      </p>
      <p class="last:pb-0 font-100 text-seagull-100 text-lg leading-relaxed">
        Our content spans claims, quotes, and memes that expose the
        contradictions, hypocrisy, and circular reasoning endemic to
        contemporary progressive thought. If you "get the joke," you're not
        alone.
      </p>
    </div>

    <!-- What We Do -->
    <div class="bg-slate-800/60 shadow-xl p-6 rounded-lg">
      <h2 class="mb-4 font-100 text-blue-200 text-2xl uppercase">What We Do</h2>

      <div class="space-y-4">
        <div>
          <h3 class="mb-1 font-100 text-xl uppercase">Claims</h3>
          <p class="last:pb-0 font-100 text-seagull-100 text-lg">
            Real statements and ideological positions from progressive sources,
            presented with analysis and satire. These aren't strawmen—they're
            actual beliefs being advocated in mainstream spaces.
          </p>
        </div>

        <div>
          <h3 class="mb-1 font-100 text-xl uppercase">Quotes</h3>
          <p class="last:pb-0 font-100 text-seagull-100 text-lg">
            Memorable statements from politicians, academics, activists, and
            media figures that reveal the absurdity or contradictions inherent
            in progressive ideology.
          </p>
        </div>

        <div>
          <h3 class="mb-1 font-100 text-xl uppercase">Memes</h3>
          <p class="last:pb-0 font-100 text-seagull-100 text-lg">
            Visual humor that cuts through the noise and exposes ideological
            inconsistencies in ways that are immediately shareable and
            relatable.
          </p>
        </div>
      </div>
    </div>

    <!-- Why This Matters -->
    <div class="bg-slate-800/60 shadow-xl p-6 rounded-lg font-100">
      <h2 class="mb-3 font-100 text-blue-200 text-2xl uppercase">
        Why This Matters
      </h2>
      <div
        class="space-y-3 font-100 text-seagull-100 *:text-lg leading-relaxed"
      >
        <p>
          In an era of increasing ideological conformity, where questioning
          progressive orthodoxy can result in social and professional
          consequences, humor provides a necessary release valve and a way to
          maintain sanity.
        </p>
        <p>
          We're not trying to change minds—we're providing community and
          validation for those who already see the emperor has no clothes.
          Sometimes you just need to know you're not crazy, and that others see
          what you see.
        </p>
        <p>
          The content here represents real positions, real statements, and real
          ideological movements. We don't need to exaggerate or misrepresent—the
          material speaks for itself. Our role is simply to present it in ways
          that highlight the inherent contradictions and absurdities.
        </p>
      </div>
    </div>

    <!-- Values -->
    <div class="bg-slate-800/60 shadow-xl p-6 rounded-lg">
      <h2 class="mb-4 font-100 text-blue-200 text-2xl uppercase">Our Values</h2>

      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div class="mb-0 px-6 py-4 border-1 border-slate-700 rounded-lg">
          <h3 class="mb-1 font-100 uppercase">Truth in Satire</h3>
          <p class="last:pb-0 font-100 text-seagull-200 text-base">
            We don't misrepresent positions. The best satire is grounded in
            reality.
          </p>
        </div>

        <div class="px-6 py-4 border-1 border-slate-700 rounded-lg">
          <h3 class="mb-1 font-100 uppercase">Humor as Resistance</h3>
          <p class="last:pb-0 font-100 text-seagull-200 text-base">
            Laughter undermines authoritarian conformity and reveals absurdity.
          </p>
        </div>

        <div class="px-6 py-4 border-1 border-slate-700 rounded-lg">
          <h3 class="mb-1 font-100 uppercase">Community Building</h3>
          <p class="last:pb-0 font-100 text-seagull-200 text-base">
            Providing a space where people who "get it" can find validation and
            solidarity.
          </p>
        </div>

        <div class="px-6 py-4 border-1 border-slate-700 rounded-lg">
          <h3 class="mb-1 font-100 uppercase">Intellectual Honesty</h3>
          <p class="last:pb-0 font-100 text-seagull-200 text-base">
            We follow the evidence and logic, even when it's uncomfortable.
          </p>
        </div>
      </div>
    </div>

    <!-- Get Involved -->
    <div class="bg-blue-600 shadow-xl p-6 rounded-lg text-center">
      <h2 class="mb-3 font-100 text-lg">Get Involved</h2>
      <p class="mb-4 font-100 text-blue-100 text-base">
        Have content to submit? Want to support our work? We'd love to hear from
        you.
      </p>
      <div class="flex sm:flex-row flex-col justify-center gap-3">
        <NuxtLink
          to="/contact"
          class="inline-block bg-white hover:bg-slate-100 px-5 py-2 rounded-lg font-100 text-blue-600 text-sm transition-colors"
        >
          Contact Us
        </NuxtLink>
        <NuxtLink
          to="/"
          class="inline-block bg-blue-700 hover:bg-blue-800 px-5 py-2 border-2 border-white rounded-lg font-100 text-sm transition-colors"
        >
          Browse Content
        </NuxtLink>
      </div>
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
          "Learn about WakeUpNPC's mission to satirize progressive ideology through humor, claims, quotes, and memes that expose ideological contradictions.",
      },
    ],
    bodyAttrs: {
      class: 'about',
    },
  })
</script>

<style scoped></style>
