<template>
  <div class="mt-10 mb-12">
    <h2
      class="mb-6 text-center text-3xl"
      style="color: var(--color-text-heading)"
    >
      What We Do
    </h2>

    <div class="flex flex-col gap-6">
      <div class="flex min-w-1/2 flex-col items-stretch gap-6 sm:flex-row">
        <FeatureCard
          title="Memes"
          description="The motherload of Memes! Liberate them! Quotes, cartoons, charts, that reveal the absurdity or contradictions inherent in Leftist Woke ideology."
        />
        <FeatureCard
          title="Grift→Decodes"
          description="Real ideological positions from hard Left-wing Woke sources, presented with sane Translations for normal people. These are actual beliefs being advocated in mainstream spaces."
        >
          <template #title>
            Grift<IconsArrowRight
              :size="20"
              class="100 relative -top-[2px] mr-0.5 ml-px inline-block text-xl"
            />Decodes
          </template>
        </FeatureCard>
      </div>
      <div class="flex flex-col items-stretch gap-6 sm:flex-row">
        <FeatureCard
          title="Quotes"
          description="Memorable statements from politicians, academics, activists, and media figures that reveal the absurdity or contradictions inherent in leftist Woke ideology."
        />
        <FeatureCard
          title="Heroes &amp; Zeros"
          description="Biographical sketches of influential figures in both the Conservative and the Leftist ideologies, highlighting their contributions and the impact of their ideas on society."
        />
      </div>
    </div>
  </div>
</template>
