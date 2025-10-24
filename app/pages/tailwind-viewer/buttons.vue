<template>
  <div v-if="isDev" class="mx-auto w-full max-w-7xl px-6 pt-6 pb-8">
    <div class="mb-8">
      <NuxtLink
        to="/tailwind-viewer"
        class="text-accent mb-4 inline-flex items-center gap-2 hover:underline"
      >
        ← Back to Design Tokens
      </NuxtLink>
      <h1 class="font-300 mb-2 text-3xl">Button Component Grid</h1>
      <p class="text-slate-400">
        Complete showcase of all button variants, sizes, and states
      </p>
    </div>

    <!-- Custom Variant Demo -->
    <section class="mb-12">
      <h2 class="font-300 mb-6 text-2xl">Custom Variant (New!)</h2>
      <div class="rounded-lg bg-slate-900 p-4">
        <p class="text-slate-300">
          The custom variant provides only structural styles (padding, layout,
          typography) without any color/background styles, allowing you to
          easily set custom colors without !important conflicts.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-4">
          <UiButton
            text="Fuchsia Button"
            variant="custom"
            size="lg"
            class="bg-fuchsia-600 text-white hover:bg-fuchsia-700"
          />
          <UiButton
            text="Purple & Yellow"
            variant="custom"
            size="lg"
            class="bg-purple-600 text-yellow-300 hover:bg-purple-500 hover:text-yellow-200"
          />
          <UiButton
            text="Pink Gradient"
            variant="custom"
            size="lg"
            class="bg-linear-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700"
          />
        </div>
        <div class="mt-4 rounded bg-slate-800 p-3">
          <code class="text-sm text-slate-300">
            &lt;UiButton variant="custom" class="bg-fuchsia-600 text-orange-400"
            /&gt;
          </code>
        </div>
      </div>
    </section>

    <!-- Variants Section -->
    <section class="mb-12">
      <h2 class="font-300 mb-6 text-2xl">Variants (Large Size)</h2>

      <!-- Dark Background -->
      <div class="mb-4 rounded-lg bg-slate-900 p-4">
        <h3 class="mb-4 text-lg text-slate-300">On Dark Background</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-400 uppercase"
              >Default</span
            >
            <UiButton text="Default Button" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-400 uppercase"
              >Primary</span
            >
            <UiButton text="Primary Button" variant="primary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-400 uppercase"
              >Secondary</span
            >
            <UiButton text="Secondary Button" variant="secondary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-400 uppercase"
              >Tertiary</span
            >
            <UiButton text="Tertiary Button" variant="tertiary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-400 uppercase"
              >Outline</span
            >
            <UiButton text="Outline Button" variant="outline-dark" size="lg" />
          </div>
        </div>
      </div>

      <!-- Light Background -->
      <div class="rounded-lg bg-white p-4">
        <h3 class="mb-4 text-lg text-slate-800">On Light Background</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-600 uppercase"
              >Default</span
            >
            <UiButton text="Default Button" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-600 uppercase"
              >Primary</span
            >
            <UiButton text="Primary Button" variant="primary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-600 uppercase"
              >Secondary</span
            >
            <UiButton text="Secondary Button" variant="secondary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-600 uppercase"
              >Tertiary</span
            >
            <UiButton text="Tertiary Button" variant="tertiary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-sm tracking-wider text-slate-600 uppercase"
              >Outline</span
            >
            <UiButton text="Outline Button" variant="outline" size="lg" />
          </div>
        </div>
      </div>
    </section>

    <!-- Full Size × Variant Grid -->
    <section class="mb-12">
      <h2 class="font-300 mb-6 text-2xl">
        Complete Grid: All Sizes × All Variants
      </h2>
      <h3 class="mb-4 text-lg text-slate-300">On Dark Background</h3>
      <div class="mb-8 overflow-x-auto rounded-lg bg-slate-900 p-0">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-4 text-left text-sm text-slate-400 uppercase">
                Size
              </th>
              <th class="p-4 text-left text-sm text-slate-400 uppercase">
                Default
              </th>
              <th class="p-4 text-left text-sm text-slate-400 uppercase">
                Primary
              </th>
              <th class="p-4 text-left text-sm text-slate-400 uppercase">
                Secondary
              </th>
              <th class="p-4 text-left text-sm text-slate-400 uppercase">
                Tertiary
              </th>
              <th class="p-4 text-left text-sm text-slate-400 uppercase">
                Outline Dark
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="size in sizes"
              :key="size.value"
              class="border-t border-slate-800"
            >
              <td class="p-6 font-mono text-slate-300">{{ size.label }}</td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(0) : size.text"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(1) : size.text"
                  variant="primary"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(2) : size.text"
                  variant="secondary"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(3) : size.text"
                  variant="tertiary"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(4) : size.text"
                  variant="outline-dark"
                  :size="size.value"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="mb-4 text-lg text-white">On Light Background</h3>
      <div class="overflow-x-auto rounded-lg bg-white p-0">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-4 text-left text-sm text-slate-700 uppercase">
                Size
              </th>
              <th class="p-4 text-left text-sm text-slate-700 uppercase">
                Default
              </th>
              <th class="p-4 text-left text-sm text-slate-700 uppercase">
                Primary
              </th>
              <th class="p-4 text-left text-sm text-slate-700 uppercase">
                Secondary
              </th>
              <th class="p-4 text-left text-sm text-slate-700 uppercase">
                Tertiary
              </th>
              <th class="p-4 text-left text-sm text-slate-700 uppercase">
                Outline
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="size in sizes"
              :key="size.value + '-light'"
              class="border-t border-slate-200"
            >
              <td class="p-6 font-mono text-slate-700">{{ size.label }}</td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(0) : size.text"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(1) : size.text"
                  variant="primary"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(2) : size.text"
                  variant="secondary"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(3) : size.text"
                  variant="tertiary"
                  :size="size.value"
                />
              </td>
              <td class="px-4 text-center">
                <UiButton
                  :text="size.value === 'badge' ? getBadgeText(4) : size.text"
                  variant="outline"
                  :size="size.value"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- States Section -->
    <section class="mb-12">
      <h2 class="font-300 mb-6 text-2xl">Button States</h2>
      <div class="rounded-lg bg-slate-900 p-4">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 class="mb-4 text-lg text-slate-300">Normal State</h3>
            <div class="flex flex-wrap gap-3">
              <UiButton text="Default" size="lg" />
              <UiButton text="Primary" variant="primary" size="lg" />
              <UiButton text="Secondary" variant="secondary" size="lg" />
            </div>
          </div>
          <div>
            <h3 class="mb-4 text-lg text-slate-300">Disabled State</h3>
            <div class="flex flex-wrap gap-3">
              <UiButton text="Default" size="lg" disabled />
              <UiButton text="Primary" variant="primary" size="lg" disabled />
              <UiButton
                text="Secondary"
                variant="secondary"
                size="lg"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- With Icons Section -->
    <section class="mb-12">
      <h2 class="font-300 mb-6 text-2xl">Buttons with Icons</h2>
      <div class="rounded-lg bg-slate-900 p-4">
        <div class="flex flex-wrap gap-4">
          <UiButton
            text="Left Icon"
            icon-left="heroicons:arrow-left"
            variant="primary"
            size="lg"
          />
          <UiButton
            text="Right Icon"
            icon-right="heroicons:arrow-right"
            variant="secondary"
            size="lg"
          />
          <UiButton
            text="Both Icons"
            icon-left="heroicons:star"
            icon-right="heroicons:star"
            variant="tertiary"
            size="lg"
          />
        </div>
      </div>
    </section>

    <!-- Usage Examples -->
    <section class="mb-12">
      <h2 class="font-300 mb-6 text-2xl">Code Examples</h2>
      <div class="rounded-lg bg-slate-900 p-6">
        <pre
          class="overflow-x-auto text-sm text-slate-300"
        ><code>&lt;!-- Default button --&gt;
&lt;UiButton text="Click Me" /&gt;

&lt;!-- Primary variant, large size --&gt;
&lt;UiButton text="Primary" variant="primary" size="lg" /&gt;

&lt;!-- With navigation (becomes NuxtLink) --&gt;
&lt;UiButton to="/contact" text="Contact Us" variant="secondary" /&gt;

&lt;!-- With icons --&gt;
&lt;UiButton
  text="Download"
  icon-left="heroicons:arrow-down-tray"
  variant="primary"
/&gt;

&lt;!-- Disabled state --&gt;
&lt;UiButton text="Disabled" disabled /&gt;</code></pre>
      </div>
    </section>

    <!-- Props Reference -->
    <section>
      <h2 class="font-300 mb-6 text-2xl">Props Reference</h2>
      <div class="overflow-x-auto rounded-lg bg-slate-900 p-6">
        <table class="w-full text-left">
          <thead class="border-b border-slate-700">
            <tr>
              <th class="p-3 text-slate-300">Prop</th>
              <th class="p-3 text-slate-300">Type</th>
              <th class="p-3 text-slate-300">Default</th>
              <th class="p-3 text-slate-300">Options</th>
            </tr>
          </thead>
          <tbody class="font-mono text-sm text-slate-400">
            <tr class="border-b border-slate-800">
              <td class="p-3">text</td>
              <td class="p-3">String</td>
              <td class="p-3">''</td>
              <td class="p-3">Button text content</td>
            </tr>
            <tr class="border-b border-slate-800">
              <td class="p-3">variant</td>
              <td class="p-3">String</td>
              <td class="p-3">'default'</td>
              <td class="p-3">
                default | primary | secondary | tertiary | outline |
                outline-dark | custom
              </td>
            </tr>
            <tr class="border-b border-slate-800">
              <td class="p-3">size</td>
              <td class="p-3">String</td>
              <td class="p-3">'' (base)</td>
              <td class="p-3">xl | lg | '' / base | sm | xs | badge</td>
            </tr>
            <tr class="border-b border-slate-800">
              <td class="p-3">to</td>
              <td class="p-3">String | Object</td>
              <td class="p-3">null</td>
              <td class="p-3">Route path or object (converts to NuxtLink)</td>
            </tr>
            <tr class="border-b border-slate-800">
              <td class="p-3">icon-left</td>
              <td class="p-3">String</td>
              <td class="p-3">''</td>
              <td class="p-3">Icon name for left side</td>
            </tr>
            <tr class="border-b border-slate-800">
              <td class="p-3">icon-right</td>
              <td class="p-3">String</td>
              <td class="p-3">''</td>
              <td class="p-3">Icon name for right side</td>
            </tr>
            <tr class="border-b border-slate-800">
              <td class="p-3">disabled</td>
              <td class="p-3">Boolean</td>
              <td class="p-3">false</td>
              <td class="p-3">Disabled state</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
  // Only show this page in development
  const isDev = import.meta.dev

  const sizes = [
    { label: 'XL', value: 'xl', text: 'Button' },
    { label: 'LG', value: 'lg', text: 'Button' },
    { label: 'Base', value: '', text: 'Button' },
    { label: 'SM', value: 'sm', text: 'Button' },
    { label: 'XS', value: 'xs', text: 'Button' },
    { label: 'Badge', value: 'badge', text: '' }, // will be replaced per variant
  ]

  const badgeNumbers = ['7', '36', '273', '2.5k', '7.2M']

  function getBadgeText(variantIndex) {
    return badgeNumbers[variantIndex] || '7'
  }

  useHead({
    title: 'Button Components - Design System',
  })
</script>
