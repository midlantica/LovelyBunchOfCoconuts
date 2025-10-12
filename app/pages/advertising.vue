<template>
  <div class="mx-auto px-2 md:px-0 py-0 w-full max-w-screen-md">
    <div class="pb-4">
      <h1 class="mt-2 mb-3 font-300 text-2xl">Advertising Rates</h1>
      <p class="mb-8 font-100 text-slate-300 text-base">
        Reach engaged conservatives who get the joke
      </p>
    </div>

    <!-- Stats Overview -->
    <div class="gap-4 grid grid-cols-1 md:grid-cols-3 mb-8">
      <div class="bg-slate-800 shadow-lg p-4 rounded-lg text-center">
        <div class="mb-1 font-300 text-slate-400 text-2xl">50K+</div>
        <div class="font-100 text-slate-300 text-sm">Monthly Visitors</div>
      </div>
      <div class="bg-slate-800 shadow-lg p-4 rounded-lg text-center">
        <div class="mb-1 font-300 text-slate-400 text-2xl">4.2 min</div>
        <div class="font-100 text-slate-300 text-sm">Avg. Session</div>
      </div>
      <div class="bg-slate-800 shadow-lg p-4 rounded-lg text-center">
        <div class="mb-1 font-300 text-slate-400 text-2xl">72%</div>
        <div class="font-100 text-slate-300 text-sm">Return Rate</div>
      </div>
    </div>

    <!-- Ad Specifications -->
    <div class="bg-slate-800 shadow-xl mb-8 p-6 rounded-lg">
      <h2 class="mb-4 font-300 text-lg">Ad Specifications</h2>

      <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
        <!-- Square Ads -->
        <div class="p-4 border border-slate-700 rounded-lg">
          <h3 class="mb-3 font-300 text-slate-400">Square Ads</h3>
          <ul class="space-y-1 font-100 text-slate-300 text-base">
            <li>• Size: 378x378px</li>
            <li>• Format: JPG or PNG</li>
            <li>• Max file size: 500KB</li>
            <li>• Placement: Meme slots in content wall</li>
          </ul>
        </div>

        <!-- Horizontal Ads -->
        <div class="p-4 border border-slate-700 rounded-lg">
          <h3 class="mb-3 font-300 text-slate-400">Horizontal Ads</h3>
          <ul class="space-y-1 font-100 text-slate-300 text-base">
            <li>• Size: 768x100px (max height)</li>
            <li>• Format: JPG or PNG</li>
            <li>• Max file size: 500KB</li>
            <li>• Placement: Quote slots in content wall</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Pricing Tiers -->
    <div class="mb-8">
      <h2 class="mb-4 font-300 text-lg text-center">Pricing Tiers</h2>

      <div class="gap-4 grid grid-cols-1 md:grid-cols-3">
        <!-- Basic -->
        <div
          class="bg-slate-800 shadow-lg p-5 border-2 border-slate-700 rounded-lg"
        >
          <h3 class="mb-1 font-300">Basic</h3>
          <div class="mb-2 font-300 text-slate-400 text-2xl">$150</div>
          <div class="mb-4 font-100 text-slate-400 text-xs">per month</div>
          <ul class="space-y-2 mb-4 font-100 text-slate-300 text-base">
            <li>✓ Square ads (378x378px)</li>
            <li>✓ Weight: 5-14</li>
            <li>✓ ~6-12% visibility</li>
            <li>✓ Performance reports</li>
          </ul>
          <NuxtLink
            to="/contact"
            class="block bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-300 text-sm text-center transition-colors"
          >
            Get Started
          </NuxtLink>
        </div>

        <!-- Standard -->
        <div
          class="bg-slate-800 shadow-xl p-5 border-2 border-slate-500 rounded-lg scale-105 transform"
        >
          <div
            class="top-0 right-0 absolute bg-slate-500 px-2 py-1 rounded-tr-lg rounded-bl-lg font-300 text-xs"
          >
            Popular
          </div>
          <h3 class="mb-1 font-300">Standard</h3>
          <div class="mb-2 font-300 text-slate-400 text-2xl">$300</div>
          <div class="mb-4 font-100 text-slate-400 text-xs">per month</div>
          <ul class="space-y-2 mb-4 font-100 text-slate-300 text-base">
            <li>✓ Square ads (378x378px)</li>
            <li>✓ Weight: 15-29</li>
            <li>✓ ~12-25% visibility</li>
            <li>✓ Priority placement</li>
            <li>✓ Detailed analytics</li>
          </ul>
          <NuxtLink
            to="/contact"
            class="block bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-300 text-sm text-center transition-colors"
          >
            Get Started
          </NuxtLink>
        </div>

        <!-- Premium -->
        <div
          class="bg-slate-800 shadow-lg p-5 border-2 border-slate-700 rounded-lg"
        >
          <h3 class="mb-1 font-300">Premium</h3>
          <div class="mb-2 font-300 text-slate-400 text-2xl">$500</div>
          <div class="mb-4 font-100 text-slate-400 text-xs">per month</div>
          <ul class="space-y-2 mb-4 font-100 text-slate-300 text-base">
            <li>✓ Square ads (378x378px)</li>
            <li>✓ Weight: 30+</li>
            <li>✓ 25-40% visibility</li>
            <li>✓ Maximum exposure</li>
            <li>✓ Real-time analytics</li>
            <li>✓ Dedicated support</li>
          </ul>
          <NuxtLink
            to="/contact"
            class="block bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-300 text-sm text-center transition-colors"
          >
            Get Started
          </NuxtLink>
        </div>
      </div>

      <!-- Horizontal Ads Pricing -->
      <div class="mt-6 font-100 text-slate-300 text-base text-center">
        <p class="mb-1">
          <strong class="font-300 text-slate-400">Horizontal Ads:</strong>
          Add 50% to any tier price
        </p>
        <p class="text-slate-400 text-xs">
          (Basic: $225/mo, Standard: $450/mo, Premium: $750/mo)
        </p>
      </div>
    </div>

    <!-- Why Advertise -->
    <div class="bg-slate-800 shadow-xl mb-8 p-6 rounded-lg">
      <h2 class="mb-4 font-300 text-lg">Why Advertise on WakeUpNPC?</h2>
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <h3 class="mb-2 font-300 text-slate-400">Native Integration</h3>
          <p class="font-100 text-slate-300 text-base">
            Ads seamlessly blend into the content wall, maintaining user
            experience while maximizing visibility.
          </p>
        </div>
        <div>
          <h3 class="mb-2 font-300 text-slate-400">Engaged Audience</h3>
          <p class="font-100 text-slate-300 text-base">
            High session duration and return rate indicate an audience that
            actively engages with content.
          </p>
        </div>
        <div>
          <h3 class="mb-2 font-300 text-slate-400">
            Conservative Demographics
          </h3>
          <p class="font-100 text-slate-300 text-base">
            Reach an audience aligned with conservative values, making it
            perfect for political content and related products.
          </p>
        </div>
        <div>
          <h3 class="mb-2 font-300 text-slate-400">Performance Tracking</h3>
          <p class="font-100 text-slate-300 text-base">
            Detailed analytics and reporting to measure your campaign's
            effectiveness and ROI.
          </p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-slate-600 shadow-xl p-6 rounded-lg text-center">
      <h2 class="mb-3 font-300 text-lg">Ready to Get Started?</h2>
      <p class="mb-4 font-100 text-slate-100 text-base">
        Founding advertisers get 50% off their first month
      </p>
      <div class="flex justify-center">
        <UiButton
          to="/contact"
          text="Contact Us Today"
          size="lg"
          variant="tertiary"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  useHead({
    title: 'Advertising Rates - WakeUpNPC',
    meta: [
      {
        name: 'description',
        content:
          'Advertise on WakeUpNPC. Reach 50K+ engaged conservatives with native advertising that works. View our rates and get started today.',
      },
    ],
    bodyAttrs: {
      class: 'advertising',
    },
  })
</script>

<style scoped></style>
