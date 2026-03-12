<template>
  <div class="mx-auto w-full max-w-3xl px-6 py-0 md:px-6">
    <h1
      class="mb-4 text-center text-3xl"
      style="color: var(--color-text-heading)"
    >
      Advertising
    </h1>

    <!-- Teaser -->
    <div class="mb-8 px-6">
      <p
        class="font-100 mx-auto max-w-2xl text-center text-xl leading-normal"
        style="color: var(--color-text-body)"
      >
        The Left's propaganda torrent never stops. We're done ceding ideological
        ground. As Churchill warned: "Wars are not won by evacuation." Your
        message is the counter-narrative. One endless scroll flouting Woke
        Leftist insanity.
      </p>
    </div>

    <!-- Three Reasons -->
    <div class="mb-8 flex flex-col items-stretch gap-6 sm:flex-row">
      <div
        v-for="benefit in benefits"
        :key="benefit.title"
        class="card font-400 flex flex-1 flex-col gap-2 p-5"
      >
        <h3
          class="font-300 text-xl leading-tight"
          style="color: var(--color-text-heading)"
        >
          {{ benefit.title }}
        </h3>
        <p class="font-100 text-lg" style="color: var(--color-text-body)">
          {{ benefit.description }}
        </p>
      </div>
    </div>

    <!-- Pricing Tiers -->
    <div class="mb-8 px-3">
      <h2
        class="mb-3 text-center text-3xl"
        style="color: var(--color-text-heading)"
      >
        Pricing Tiers
      </h2>

      <!-- Square Ads Section -->
      <div class="mb-8">
        <div class="mb-6">
          <h3
            class="font-300 mb-2 text-center text-2xl leading-tight uppercase"
            style="color: var(--color-text-heading)"
          >
            Square Ads
          </h3>
          <p
            class="font-100 block text-center text-xl"
            style="color: var(--color-text-body)"
          >
            Native integration in meme slots. 378&hairsp;x&hairsp;378px • JPG or
            PNG • Max 500KB
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-6">
          <AdCard
            v-for="ad in squareAds"
            :key="ad.tier"
            :tier="ad.tier"
            :price="ad.price"
            :period="ad.period"
            :period-class="ad.periodClass"
            :features="ad.features"
          />
        </div>
      </div>

      <!-- Horizontal Ads Section -->
      <div class="mb-8">
        <div class="mb-6">
          <h3
            class="font-300 mb-2 text-center text-2xl leading-tight uppercase"
            style="color: var(--color-text-heading)"
          >
            Horizontal Ads
          </h3>
          <p
            class="font-100 block text-center text-xl"
            style="color: var(--color-text-body)"
          >
            Quote slot placement. 768&hairsp;x&hairsp;100px • JPG or PNG • Max
            500KB • Add 50% to tier price
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-6">
          <AdCard
            v-for="ad in horizontalAds"
            :key="ad.tier"
            :tier="ad.tier"
            :price="ad.price"
            :period="ad.period"
            :period-class="ad.periodClass"
            :features="ad.features"
          />
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="mb-12 px-3 text-center">
      <h2
        class="font-300 mb-2 text-3xl"
        style="color: var(--color-text-heading)"
      >
        Ready to Get Started?
      </h2>
      <p class="font-100 mb-8 text-xl" style="color: var(--color-text-body)">
        Founding advertisers get 50% off their first month
      </p>
      <div class="mt-4 flex justify-center">
        <UiButton
          to="/about"
          text="Contact Us Today"
          size="xl"
          variant="primary"
          class="no-underline"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  // Scroll to top when page loads
  onMounted(() => {
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTop = 0
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  })

  useHead({
    title: 'Advertising Rates - WakeUpNPC',
    meta: [
      {
        name: 'description',
        content:
          'Advertise on WakeUpNPC. Reach engaged conservatives with native advertising that works. View our rates and get started today.',
      },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Advertising Rates - WakeUpNPC' },
      {
        property: 'og:description',
        content:
          'Advertise on WakeUpNPC. Reach engaged conservatives with native advertising that works. View our rates and get started today.',
      },
      { property: 'og:url', content: 'https://wakeupnpc.com/advertising' },
      { property: 'og:site_name', content: 'WakeUpNPC' },
      {
        property: 'og:image',
        content: 'https://wakeupnpc.com/text-bg-1200x630.png?v=2',
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Advertising Rates - WakeUpNPC' },
      {
        name: 'twitter:description',
        content:
          'Advertise on WakeUpNPC. Reach engaged conservatives with native advertising that works. View our rates and get started today.',
      },
      {
        name: 'twitter:image',
        content: 'https://wakeupnpc.com/text-bg-1200x630.png?v=2',
      },
    ],
    link: [{ rel: 'canonical', href: 'https://wakeupnpc.com/advertising' }],
    bodyAttrs: {
      class: 'advertising',
    },
  })

  // Benefits/Features Data
  const benefits = [
    {
      title: 'Ground Floor Opportunity',
      description:
        'Early adopter pricing as we build a dedicated conservative audience. Get in now before rates increase with traffic.',
    },
    {
      title: 'Native Integration',
      description:
        'Ads blend seamlessly into the content wall alongside memes and quotes, capturing attention without disruption.',
    },
    {
      title: 'Engaged Audience',
      description:
        'Reach conservatives who are actively seeking the counter-narrative. High-intent visitors who share, discuss, and act.',
    },
  ]

  // Square Ads Data
  const squareAds = [
    {
      tier: 'Basic',
      price: 150,
      period: 'per month',
      features: ['Weight: 5-14', '~6-12% visibility', 'Performance reports'],
    },
    {
      tier: 'Standard',
      price: 300,
      period: 'per month',
      features: [
        'Weight: 15-29',
        '~12-25% visibility',
        'Priority placement',
        'Detailed analytics',
      ],
    },
    {
      tier: 'Premium',
      price: 500,
      period: 'per month',
      periodClass: 'tracking-wide',
      features: [
        'Weight: 30+',
        '25-40% visibility',
        'Maximum exposure',
        'Real-time analytics',
        'Dedicated support',
      ],
    },
  ]

  // Horizontal Ads Data
  const horizontalAds = [
    {
      tier: 'Basic',
      price: 225,
      period: 'Per Month',
      periodClass: 'mb-3',
      features: ['Weight: 5-14', '~6-12% visibility', 'Performance reports'],
    },
    {
      tier: 'Standard',
      price: 450,
      period: 'Per Month',
      periodClass: 'mb-3',
      features: [
        'Weight: 15-29',
        '~12-25% visibility',
        'Priority placement',
        'Detailed analytics',
      ],
    },
    {
      tier: 'Premium',
      price: 750,
      period: 'Per Month',
      periodClass: 'mb-3',
      features: [
        'Weight: 30+',
        '25-40% visibility',
        'Maximum exposure',
        'Real-time analytics',
        'Dedicated support',
      ],
    },
  ]
</script>
