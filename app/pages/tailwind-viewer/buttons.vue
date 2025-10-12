<template>
  <div class="mx-auto px-6 pt-6 pb-8 w-full max-w-7xl">
    <div class="mb-8">
      <NuxtLink
        to="/tailwind-viewer"
        class="inline-flex items-center gap-2 mb-4 text-accent hover:underline"
      >
        ← Back to Design Tokens
      </NuxtLink>
      <h1 class="mb-2 font-300 text-3xl">Button Component Grid</h1>
      <p class="text-slate-400">
        Complete showcase of all button variants, sizes, and states
      </p>
    </div>

    <!-- Custom Variant Demo -->
    <section class="mb-12">
      <h2 class="mb-6 font-300 text-2xl">Custom Variant (New!)</h2>
      <div class="bg-slate-900 p-4 rounded-lg">
        <p class="text-slate-300">
          The custom variant provides only structural styles (padding, layout,
          typography) without any color/background styles, allowing you to
          easily set custom colors without !important conflicts.
        </p>
        <div class="flex flex-wrap items-center gap-4 mt-4">
          <UiButton
            text="Fuchsia Button"
            variant="custom"
            size="lg"
            class="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          />
          <UiButton
            text="Purple & Yellow"
            variant="custom"
            size="lg"
            class="bg-purple-600 hover:bg-purple-500 text-yellow-300 hover:text-yellow-200"
          />
          <UiButton
            text="Pink Gradient"
            variant="custom"
            size="lg"
            class="bg-gradient-to-r from-pink-500 hover:from-pink-600 to-violet-600 hover:to-violet-700 text-white"
          />
        </div>
        <div class="bg-slate-800 mt-4 p-3 rounded">
          <code class="text-slate-300 text-sm">
            &lt;UiButton variant="custom" class="bg-fuchsia-600 text-orange-400"
            /&gt;
          </code>
        </div>
      </div>
    </section>

    <!-- Variants Section -->
    <section class="mb-12">
      <h2 class="mb-6 font-300 text-2xl">Variants (Large Size)</h2>

      <!-- Dark Background -->
      <div class="bg-slate-900 mb-4 p-4 rounded-lg">
        <h3 class="mb-4 text-slate-300 text-lg">On Dark Background</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-slate-400 text-sm uppercase tracking-wider"
              >Default</span
            >
            <UiButton text="Default Button" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-400 text-sm uppercase tracking-wider"
              >Primary</span
            >
            <UiButton text="Primary Button" variant="primary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-400 text-sm uppercase tracking-wider"
              >Secondary</span
            >
            <UiButton text="Secondary Button" variant="secondary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-400 text-sm uppercase tracking-wider"
              >Tertiary</span
            >
            <UiButton text="Tertiary Button" variant="tertiary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-400 text-sm uppercase tracking-wider"
              >Outline</span
            >
            <UiButton text="Outline Button" variant="outline-dark" size="lg" />
          </div>
        </div>
      </div>

      <!-- Light Background -->
      <div class="bg-white p-4 rounded-lg">
        <h3 class="mb-4 text-slate-800 text-lg">On Light Background</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-slate-600 text-sm uppercase tracking-wider"
              >Default</span
            >
            <UiButton text="Default Button" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-600 text-sm uppercase tracking-wider"
              >Primary</span
            >
            <UiButton text="Primary Button" variant="primary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-600 text-sm uppercase tracking-wider"
              >Secondary</span
            >
            <UiButton text="Secondary Button" variant="secondary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-600 text-sm uppercase tracking-wider"
              >Tertiary</span
            >
            <UiButton text="Tertiary Button" variant="tertiary" size="lg" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-slate-600 text-sm uppercase tracking-wider"
              >Outline</span
            >
            <UiButton text="Outline Button" variant="outline" size="lg" />
          </div>
        </div>
      </div>
    </section>

    <!-- Full Size × Variant Grid -->
    <section class="mb-12">
      <h2 class="mb-6 font-300 text-2xl">
        Complete Grid: All Sizes × All Variants
      </h2>
      <h3 class="mb-4 text-slate-300 text-lg">On Dark Background</h3>
      <div class="bg-slate-900 mb-8 p-0 rounded-lg overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-4 text-slate-400 text-sm text-left uppercase">
                Size
              </th>
              <th class="p-4 text-slate-400 text-sm text-left uppercase">
                Default
              </th>
              <th class="p-4 text-slate-400 text-sm text-left uppercase">
                Primary
              </th>
              <th class="p-4 text-slate-400 text-sm text-left uppercase">
                Secondary
              </th>
              <th class="p-4 text-slate-400 text-sm text-left uppercase">
                Tertiary
              </th>
              <th class="p-4 text-slate-400 text-sm text-left uppercase">
                Outline Dark
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="size in sizes"
              :key="size.value"
              class="border-slate-800 border-t"
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

      <h3 class="mb-4 text-white text-lg">On Light Background</h3>
      <div class="bg-white p-0 rounded-lg overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="p-4 text-slate-700 text-sm text-left uppercase">
                Size
              </th>
              <th class="p-4 text-slate-700 text-sm text-left uppercase">
                Default
              </th>
              <th class="p-4 text-slate-700 text-sm text-left uppercase">
                Primary
              </th>
              <th class="p-4 text-slate-700 text-sm text-left uppercase">
                Secondary
              </th>
              <th class="p-4 text-slate-700 text-sm text-left uppercase">
                Tertiary
              </th>
              <th class="p-4 text-slate-700 text-sm text-left uppercase">
                Outline
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="size in sizes"
              :key="size.value + '-light'"
              class="border-slate-200 border-t"
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
      <h2 class="mb-6 font-300 text-2xl">Button States</h2>
      <div class="bg-slate-900 p-4 rounded-lg">
        <div class="gap-8 grid grid-cols-1 md:grid-cols-2">
          <div>
            <h3 class="mb-4 text-slate-300 text-lg">Normal State</h3>
            <div class="flex flex-wrap gap-3">
              <UiButton text="Default" size="lg" />
              <UiButton text="Primary" variant="primary" size="lg" />
              <UiButton text="Secondary" variant="secondary" size="lg" />
            </div>
          </div>
          <div>
            <h3 class="mb-4 text-slate-300 text-lg">Disabled State</h3>
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
      <h2 class="mb-6 font-300 text-2xl">Buttons with Icons</h2>
      <div class="bg-slate-900 p-4 rounded-lg">
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
      <h2 class="mb-6 font-300 text-2xl">Code Examples</h2>
      <div class="bg-slate-900 p-6 rounded-lg">
        <pre
          class="overflow-x-auto text-slate-300 text-sm"
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
      <h2 class="mb-6 font-300 text-2xl">Props Reference</h2>
      <div class="bg-slate-900 p-6 rounded-lg overflow-x-auto">
        <table class="w-full text-left">
          <thead class="border-slate-700 border-b">
            <tr>
              <th class="p-3 text-slate-300">Prop</th>
              <th class="p-3 text-slate-300">Type</th>
              <th class="p-3 text-slate-300">Default</th>
              <th class="p-3 text-slate-300">Options</th>
            </tr>
          </thead>
          <tbody class="font-mono text-slate-400 text-sm">
            <tr class="border-slate-800 border-b">
              <td class="p-3">text</td>
              <td class="p-3">String</td>
              <td class="p-3">''</td>
              <td class="p-3">Button text content</td>
            </tr>
            <tr class="border-slate-800 border-b">
              <td class="p-3">variant</td>
              <td class="p-3">String</td>
              <td class="p-3">'default'</td>
              <td class="p-3">
                default | primary | secondary | tertiary | outline |
                outline-dark | custom
              </td>
            </tr>
            <tr class="border-slate-800 border-b">
              <td class="p-3">size</td>
              <td class="p-3">String</td>
              <td class="p-3">'' (base)</td>
              <td class="p-3">xl | lg | '' / base | sm | xs | badge</td>
            </tr>
            <tr class="border-slate-800 border-b">
              <td class="p-3">to</td>
              <td class="p-3">String | Object</td>
              <td class="p-3">null</td>
              <td class="p-3">Route path or object (converts to NuxtLink)</td>
            </tr>
            <tr class="border-slate-800 border-b">
              <td class="p-3">icon-left</td>
              <td class="p-3">String</td>
              <td class="p-3">''</td>
              <td class="p-3">Icon name for left side</td>
            </tr>
            <tr class="border-slate-800 border-b">
              <td class="p-3">icon-right</td>
              <td class="p-3">String</td>
              <td class="p-3">''</td>
              <td class="p-3">Icon name for right side</td>
            </tr>
            <tr class="border-slate-800 border-b">
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
