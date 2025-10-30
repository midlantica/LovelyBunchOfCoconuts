<template>
  <div class="mt-10 mb-12">
    <h2 class="text-seagull-200! mb-6 text-center text-3xl">What We Do</h2>

    <div class="flex flex-col items-stretch gap-6 sm:flex-row">
      <FeatureCard
        title="Memes"
        description="The motherload of Memes! Liberate them! Quotes, cartoons, charts, that reveal the absurdity or contradictions inherent in Leftist Woke ideology."
      />

      <FeatureCard
        title="Grift→Decodes"
        description="Real ideological positions from hard Left-wing Woke sources, presented with sane Translations for normal people. These are actual beliefs being advocated in mainstream spaces."
      >
        <template #title>
          Grift<Icon
            name="i-heroicons:arrow-right-20-solid"
            class="100 relative top-0.5 mr-0.5 ml-px text-xl"
          />Decodes
        </template>
      </FeatureCard>

      <FeatureCard
        title="Quotes"
        description="Memorable statements from politicians, academics, activists, and media figures that reveal the absurdity or contradictions inherent in leftist Woke ideology."
      />
    </div>
  </div>
</template>
