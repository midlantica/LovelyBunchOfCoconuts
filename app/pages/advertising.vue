<template>
  <div class="mx-auto px-2 md:px-0 py-0 w-full max-w-3xl">
    <h1 class="mb-6 text-seagull-100! text-3xl text-center">Advertising</h1>

    <!-- Ad Specifications -->
    <div class="mb-8 px-3">
      <div class="flex sm:flex-row flex-col items-stretch gap-8">
        <!-- Square Ads Specs -->
        <div
          class="flex flex-col flex-1 gap-6 bg-slate-900 hover:shadow-xl p-8 rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <h2 class="text-2xl uppercase leading-tight">Square Ads</h2>
          <ol
            class="space-y-1 font-100 text-seagull-100 text-base list-decimal list-inside"
          >
            <li>Size: 378x378px</li>
            <li>Format: JPG or PNG</li>
            <li>Max file size: 500KB</li>
            <li>Placement: Meme slots in content wall</li>
          </ol>
        </div>

        <!-- Horizontal Ads Specs -->
        <div
          class="flex flex-col flex-1 gap-2 bg-slate-900 hover:shadow-xl p-8 rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <h2 class="text-2xl uppercase leading-tight">Horizontal Ads</h2>
          <ol
            class="space-y-1 font-100 text-seagull-100 text-base list-decimal list-inside"
          >
            <li>Size: 768x100px (max height)</li>
            <li>Format: JPG or PNG</li>
            <li>Max file size: 500KB</li>
            <li>Placement: Quote slots in content wall</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Pricing Tiers -->
    <div class="mb-8 px-3">
      <h2 class="mb-6 text-seagull-100! text-3xl text-center">Pricing Tiers</h2>

      <!-- Square Ads Panel -->
      <div
        class="inline-block bg-slate-900/60 shadow-xl mb-6 px-8 py-6 rounded-md w-full"
      >
        <div class="mb-4">
          <h2 class="font-300 text-2xl text-center uppercase leading-tight">
            Square Ads
          </h2>
          <p class="block mb-6 font-100 text-slate-300 text-base text-center">
            Native integration in meme slots with maximum visibility
          </p>
        </div>

        <div class="gap-4 grid grid-cols-1 md:grid-cols-3">
          <!-- Basic -->
          <div
            class="relative flex flex-col bg-slate-800/60 shadow-xl rounded-md hover:scale-105 transition-all duration-300"
          >
            <div class="flex-1 p-5">
              <h3 class="mb-1 font-300 text-2xl text-center uppercase">
                Basic
              </h3>
              <div
                class="font-300 text-seagull-100 text-3xl text-center tracking-widest"
              >
                $150
              </div>
              <div
                class="mb-4 font-100 text-slate-200 text-lg text-center uppercase tracking-wider"
              >
                per month
              </div>
              <div class="mb-4">
                <table class="w-full font-100 text-slate-300 text-base">
                  <tbody>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">Square ads (378x378px)</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1.5">Weight: 5-14</td>
                    </tr>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">~6-12% visibility</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1.5">Performance reports</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="p-0">
              <UiButton
                to="/about"
                text="Get Started"
                size="lg"
                variant="primary"
                class="rounded-t-none rounded-b-md w-full"
              />
            </div>
          </div>

          <!-- Standard -->
          <div
            class="relative flex flex-col bg-slate-800/60 shadow-xl rounded-md hover:scale-105 transition-all duration-300"
          >
            <div
              class="top-0 right-0 absolute bg-slate-500 px-2 py-1 rounded-tr-md rounded-bl-md font-300 text-xs uppercase tracking-wider"
            >
              Popular
            </div>
            <div class="flex-1 p-5">
              <h3 class="mb-1 font-300 text-2xl text-center uppercase">
                Standard
              </h3>
              <div
                class="font-300 text-seagull-100 text-3xl text-center tracking-widest"
              >
                $300
              </div>
              <div
                class="mb-4 font-100 text-slate-200 text-lg text-center uppercase tracking-wider"
              >
                per month
              </div>
              <div class="mb-4">
                <table class="w-full font-100 text-slate-300 text-base">
                  <tbody>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">Square ads (378x378px)</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1.5">Weight: 15-29</td>
                    </tr>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">~12-25% visibility</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1.5">Priority placement</td>
                    </tr>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">Detailed analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="p-0">
              <UiButton
                to="/about"
                text="Get Started"
                size="lg"
                variant="primary"
                class="rounded-t-none rounded-b-md w-full"
              />
            </div>
          </div>

          <!-- Premium -->
          <div
            class="relative flex flex-col bg-slate-800/60 shadow-xl rounded-md hover:scale-105 transition-all duration-300"
          >
            <div class="flex-1 p-5">
              <h3 class="mb-1 font-300 text-2xl text-center uppercase">
                Premium
              </h3>
              <div
                class="font-300 text-seagull-100 text-3xl text-center tracking-widest"
              >
                $500
              </div>
              <div
                class="mb-4 font-100 text-slate-200 text-lg text-center uppercase tracking-wide"
              >
                per month
              </div>
              <div class="mb-4">
                <table class="w-full font-100 text-slate-300 text-base">
                  <tbody>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">Square ads (378x378px)</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1.5">Weight: 30+</td>
                    </tr>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">25-40% visibility</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1.5">Maximum exposure</td>
                    </tr>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1.5">Real-time analytics</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1.5">Dedicated support</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="p-0">
              <UiButton
                to="/about"
                text="Get Started"
                size="lg"
                variant="primary"
                class="rounded-t-none rounded-b-md w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Horizontal Ads Panel -->
      <div
        class="inline-block bg-slate-900/60 shadow-xl px-8 py-6 rounded-md w-full"
      >
        <div class="mb-4">
          <h2 class="font-300 text-2xl text-center uppercase leading-tight">
            Horizontal Ads
          </h2>
          <p class="block mb-6 font-100 text-slate-300 text-base text-center">
            Add 50% to any tier price for quote slot placement
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-4">
          <!-- Horizontal Basic -->
          <div
            class="relative flex flex-col bg-slate-800/60 shadow-xl rounded-md min-w-[200px] hover:scale-105 transition-all duration-300"
          >
            <div class="flex-1 px-4 pt-4 pb-2">
              <h3 class="font-300 text-2xl text-center uppercase">Basic</h3>
              <div
                class="font-300 text-seagull-100 text-3xl text-center tracking-widest"
              >
                $225
              </div>
              <div
                class="mb-3 font-100 text-slate-200 text-lg text-center uppercase tracking-wider"
              >
                Per Month
              </div>
              <div class="mb-3">
                <table class="w-full font-100 text-slate-300 text-sm">
                  <tbody>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1">Weight: 5-14</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1">~6-12% visibility</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="p-0">
              <UiButton
                to="/about"
                text="Get Started"
                size="lg"
                variant="primary"
                class="rounded-t-none rounded-b-md w-full"
              />
            </div>
          </div>

          <!-- Horizontal Standard -->
          <div
            class="relative flex flex-col bg-slate-800/60 shadow-xl rounded-md min-w-[200px] hover:scale-105 transition-all duration-300"
          >
            <div class="flex-1 px-4 pt-4 pb-2">
              <h3 class="font-300 text-2xl text-center uppercase">Standard</h3>
              <div
                class="font-300 text-seagull-100 text-3xl text-center tracking-widest"
              >
                $450
              </div>
              <div
                class="mb-3 font-100 text-slate-200 text-lg text-center uppercase tracking-wider"
              >
                Per Month
              </div>
              <div class="mb-3">
                <table class="w-full font-100 text-slate-300 text-sm">
                  <tbody>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1">Weight: 15-29</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1">~12-25% visibility</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="p-0">
              <UiButton
                to="/about"
                text="Get Started"
                size="lg"
                variant="primary"
                class="rounded-t-none rounded-b-md w-full"
              />
            </div>
          </div>

          <!-- Horizontal Premium -->
          <div
            class="relative flex flex-col bg-slate-800/60 shadow-xl rounded-md min-w-[200px] hover:scale-105 transition-all duration-300"
          >
            <div class="flex-1 px-4 pt-4 pb-2">
              <h3 class="font-300 text-2xl text-center uppercase">Premium</h3>
              <div
                class="font-300 text-seagull-100 text-3xl text-center tracking-widest"
              >
                $750
              </div>
              <div
                class="mb-3 font-100 text-slate-200 text-lg text-center uppercase tracking-wider"
              >
                Per Month
              </div>
              <div class="mb-3">
                <table class="w-full font-100 text-slate-300 text-sm">
                  <tbody>
                    <tr class="bg-slate-800/30">
                      <td class="px-2 py-1">Weight: 30+</td>
                    </tr>
                    <tr>
                      <td class="px-2 py-1">25-40% visibility</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="p-0">
              <UiButton
                to="/about"
                text="Get Started"
                size="lg"
                variant="primary"
                class="rounded-t-none rounded-b-md w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Why Advertise -->
    <div class="bg-slate-800/60 shadow-xl mb-8 px-6 py-4 rounded-md">
      <h2 class="mb-6 font-300 text-2xl">Why Advertise on WakeUpNPC?</h2>
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 class="font-300 text-slate-400 text-lg leading-tight">
            Native Integration
          </h3>
          <p class="font-100 text-slate-300 text-base">
            Ads seamlessly blend into the content wall, maintaining user
            experience while maximizing visibility.
          </p>
        </div>
        <div>
          <h3 class="font-300 text-slate-400 text-lg leading-tight">
            Engaged Audience
          </h3>
          <p class="font-100 text-slate-300 text-base">
            High session duration and return rate indicate an audience that
            actively engages with content.
          </p>
        </div>
        <div>
          <h3 class="font-300 text-slate-400 text-lg leading-tight">
            Conservative Demographics
          </h3>
          <p class="font-100 text-slate-300 text-base">
            Reach an audience aligned with conservative values, making it
            perfect for political content and related products.
          </p>
        </div>
        <div>
          <h3 class="font-300 text-slate-400 text-lg leading-tight">
            Performance Tracking
          </h3>
          <p class="font-100 text-slate-300 text-base">
            Detailed analytics and reporting to measure your campaign's
            effectiveness and ROI.
          </p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div
      class="bg-slate-800/60 shadow-xl p-6 px-3 md:px-6 rounded-md text-center"
    >
      <h2 class="mb-3 font-300 text-2xl">Ready to Get Started?</h2>
      <p class="mb-4 font-100 text-slate-100 text-base">
        Founding advertisers get 50% off their first month
      </p>
      <div class="flex justify-center mt-4">
        <UiButton
          to="/about"
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
