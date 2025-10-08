<template>
  <div class="mx-auto px-2 md:px-0 py-0 w-full max-w-screen-md">
    <!-- About WakeUpNPC -->
    <div class="px-3 pb-6">
      <h1 class="mt-2 mb-3 font-300 text-2xl">About WakeUpNPC</h1>
      <p
        class="mb-3 last:pb-0 font-100 text-seagull-100 text-xl leading-relaxed"
      >
        WakeUpNPC satirizes progressive ideology through humor that resonates
        with those who see through the absurdities of modern "woke" culture. We
        believe laughter is one of the most powerful tools for revealing truth
        and challenging groupthink.
      </p>
      <p class="last:pb-0 font-100 text-seagull-100 text-xl leading-relaxed">
        Our content spans claims, quotes, and memes that expose the
        contradictions, hypocrisy, and circular reasoning endemic to
        contemporary progressive thought. If you "get the joke," you're not
        alone.
      </p>
    </div>

    <!-- Rest of About WakeUpNPC -->
    <div class="space-y-6 px-3 pb-8">
      <!-- What We Do -->
      <div class="bg-slate-800/60 shadow-xl px-6 py-5 rounded-lg">
        <h2 class="mb-4 text-seagull-300 text-2xl uppercase">What We Do</h2>

        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-xl uppercase">Claims</h3>
            <p class="last:pb-0 font-100 text-seagull-100 text-xl">
              Real statements and ideological positions from progressive
              sources, presented with sane translations. These aren't strawmen —
              they're actual beliefs being advocated in mainstream spaces.
            </p>
          </div>

          <div>
            <h3 class="mb-1 text-xl uppercase">Quotes</h3>
            <p class="last:pb-0 font-100 text-seagull-100 text-xl">
              Memorable statements from politicians, academics, activists, and
              media figures that reveal the absurdity or contradictions inherent
              in progressive ideology.
            </p>
          </div>

          <div>
            <h3 class="mb-1 text-xl uppercase">Memes</h3>
            <p class="last:pb-0 font-100 text-seagull-100 text-xl">
              Visual humor that cuts through the noise and exposes ideological
              inconsistencies in ways that are immediately shareable and
              relatable.
            </p>
          </div>
        </div>
      </div>

      <!-- Why This Matters -->
      <div class="bg-slate-900 shadow-xl px-6 py-5 rounded-lg font-100">
        <h2 class="mb-3 text-seagull-300 text-2xl uppercase">
          Why This Matters
        </h2>
        <div
          class="space-y-3 font-100 text-seagull-100 *:text-xl leading-relaxed"
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
            Sometimes you just need to know you're not crazy, and that others
            see what you see.
          </p>
          <p>
            The content here represents real positions, real statements, and
            real ideological movements. We don't need to exaggerate or
            misrepresent—the material speaks for itself. Our role is simply to
            present it in ways that highlight the inherent contradictions and
            absurdities.
          </p>
        </div>
      </div>

      <!-- Get Involved -->
      <div class="bg-slate-900 shadow-xl px-6 py-5 rounded-lg text-center">
        <h2 class="mb-3 text-xl uppercase">Get Involved</h2>
        <p class="mb-6 font-100 text-seagull-100 text-base">
          Have content to submit? Want to support our work? We'd love to hear
          from you.
        </p>
        <div class="flex sm:flex-row flex-col justify-center gap-5 mt-4">
          <UiButton to="/contact" text="Contact Us" size="lg" />
          <UiButton to="/" text="Browse Content" size="lg" />
        </div>
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
