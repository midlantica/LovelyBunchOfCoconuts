<template>
  <div
    class="prose-invert prose scrollbar-thin h-full min-h-0 w-full max-w-none overflow-y-auto px-6 py-8"
  >
    <h1 class="mt-0! text-2xl">Design Tokens (Tailwind)</h1>
    <p v-if="!isDev" class="font-300 text-base text-amber-400">
      Run pnpm dev to view live config (hidden in prod).
    </p>
    <div v-else>
      <!-- Button Showcase -->
      <section class="mt-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="mt-0! text-xl">Button Components</h2>
          <NuxtLink
            to="/tailwind-viewer/buttons"
            class="font-300 text-accent text-sm hover:underline"
          >
            See All 30 Button Variations →
          </NuxtLink>
        </div>

        <!-- Basic Variants Preview (LG size only) -->
        <div class="mb-2 rounded-lg bg-slate-950">
          <h3 class="mt-0! mb-4 text-base text-slate-300">
            Button Variants Preview
          </h3>
          <div class="flex flex-wrap gap-3">
            <UiButton text="Default" size="lg" />
            <UiButton text="Primary" variant="primary" size="lg" />
            <UiButton text="Secondary" variant="secondary" size="lg" />
            <UiButton text="Tertiary" variant="tertiary" size="lg" />
            <UiButton text="Outline" variant="outline" size="lg" />
          </div>
        </div>

        <!-- Custom Variant Example -->
        <div class="mb-6 rounded-lg bg-slate-950">
          <h3 class="mt-0! mb-4 text-base text-slate-300">
            Custom Variant (New!)
          </h3>
          <p class="mb-6 text-sm text-slate-400">
            Structural styles only - add your own colors without !important
            conflicts
          </p>
          <div class="mt-2 flex flex-wrap gap-3">
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
        </div>

        <!-- Light Background Sample -->
        <div class="mb-2 rounded-lg bg-white p-4">
          <h3 class="mt-0! mb-4 text-base text-slate-800">
            On Light Background
          </h3>
          <div class="flex flex-wrap gap-3">
            <UiButton text="Default" size="lg" />
            <UiButton text="Primary" variant="primary" size="lg" />
            <UiButton text="Secondary" variant="secondary" size="lg" />
          </div>
        </div>
      </section>
      <!-- CSS Root Variables moved to top -->
      <section class="mt-6">
        <h2 class="mt-0 text-xl">CSS Root Variables</h2>
        <ul
          class="grid gap-4 font-mono text-base sm:grid-cols-2 lg:grid-cols-3"
        >
          <li
            v-for="v in rootVars"
            :key="v.name"
            class="flex items-center gap-3"
          >
            <div
              class="h-10 w-10 shrink-0 rounded-sm border border-slate-600/70"
              :style="{ background: v.value }"
              :title="v.value"
            />
            <div class="min-w-0">
              <div class="text-accent leading-tight">{{ v.name }}</div>
              <div class="max-w-40 truncate text-[11px] text-slate-400">
                {{ v.value }}
              </div>
            </div>
          </li>
        </ul>
      </section>
      <!-- Two-column zone: Breakpoints (left) and Colors (right) -->
      <div class="mt-1 grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
        <section v-if="screenList.length" class="mt-0">
          <h2 id="screens" class="mt-0">Screens / Breakpoints</h2>
          <ul class="grid grid-cols-1 gap-2 font-mono text-xs">
            <li
              v-for="s in screenList"
              :key="s.name"
              class="m-0 flex items-center justify-between rounded bg-slate-800/60 px-3 py-2"
            >
              <span :class="{ 'text-accent': isCustomScreen(s.name) }">{{
                s.name
              }}</span>
              <span>{{ s.value }}</span>
            </li>
          </ul>
          <p class="mt-0 text-[10px] text-slate-500">
            Standard Tailwind first, then project custom.
          </p>
        </section>

        <section v-if="mainColors.length" class="mt-0">
          <h2 id="colors" class="mt-0! text-xl">Colors (Project)</h2>
          <div class="flex flex-col gap-4">
            <div
              v-for="c in mainColors"
              :key="c.name"
              class="overflow-hidden rounded-md border border-slate-700"
            >
              <div
                class="flex items-center justify-between bg-slate-800/70 px-3 py-3"
              >
                <span class="flex items-center gap-3 font-mono text-base">
                  <span
                    :class="{ 'text-accent': customColorNames.has(c.name) }"
                    >{{ c.name }}</span
                  >
                  <span
                    v-if="customColorNames.has(c.name)"
                    class="text-accent text-base font-semibold tracking-wide"
                    >CUSTOM</span
                  >
                </span>
                <span
                  class="text-base tracking-wide text-slate-300 uppercase"
                  >{{ c.shades ? 'Scale' : 'Color' }}</span
                >
              </div>
              <div v-if="c.shades" class="grid grid-cols-5 gap-1 p-2">
                <div
                  v-for="(hex, shade) in c.shades"
                  :key="shade"
                  :style="{ background: hex }"
                  class="hover:ring-accent/60 relative flex h-12 cursor-pointer! items-center justify-center rounded-sm ring-0 transition select-none hover:ring-2"
                  :title="`Click to copy ${c.name}-${shade}`"
                  role="button"
                  tabindex="0"
                  @click="copyColorShade(c.name, shade)"
                >
                  <span
                    class="font-300 text-base text-white mix-blend-difference"
                    >{{ shade }}</span
                  >
                  <span
                    v-if="copied === `${c.name}-${shade}`"
                    class="absolute inset-0 flex items-center justify-center bg-black/30 font-mono text-[11px] text-white"
                    >copied</span
                  >
                </div>
              </div>
              <div
                v-else
                class="hover:ring-accent/60 relative h-16 cursor-pointer! transition select-none hover:ring-2"
                :style="{ background: c.value }"
                :title="`Click to copy ${c.name}`"
                role="button"
                tabindex="0"
                @click="copyColorName(c.name)"
              >
                <span
                  v-if="copied === c.name"
                  class="absolute inset-0 flex items-center justify-center bg-black/30 font-mono text-[11px] text-white"
                  >copied</span
                >
              </div>
              <div
                v-if="c.value"
                class="truncate border-t border-slate-700 bg-slate-900/60 px-3 py-3 font-mono text-base"
              >
                {{ c.value }}
              </div>
            </div>
          </div>
        </section>
      </div>
      <section v-if="shadowsList.length" class="mt-10">
        <h2 id="shadows" class="mt-0 text-xl">Shadows</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="s in shadowsList"
            :key="s.name"
            class="rounded-md border border-slate-700 bg-slate-800/70 p-4"
          >
            <div class="text-accent mb-2 font-mono text-base font-semibold">
              {{ s.name }}
            </div>
            <div
              class="flex h-20 items-center justify-center rounded bg-slate-900 text-base tracking-wide uppercase"
              :style="{ boxShadow: s.value }"
            >
              preview
            </div>
            <div class="mt-2 font-mono text-base leading-tight break-all">
              {{ s.value }}
            </div>
          </div>
        </div>
      </section>
      <section class="mt-12" v-if="fontFamilies.length">
        <h2 class="mt-0 text-xl">Font Family</h2>
        <div
          v-for="f in fontFamilies"
          :key="f.name"
          class="max-w-md rounded border border-slate-700 bg-slate-800/40 p-3"
        >
          <div class="mb-2 flex items-center justify-between">
            <span class="text-accent font-mono text-base font-semibold">{{
              f.name
            }}</span>
            <span
              class="max-w-[55%] truncate font-mono text-base text-slate-400"
              >{{ f.stack }}</span
            >
          </div>
          <p class="text-base" :style="{ fontFamily: f.first }">
            The quick brown fox jumps over 12 lazy dogs.
          </p>
        </div>
      </section>
      <section class="mt-12" v-if="otherCustom.length">
        <h2 class="mt-0 text-xl">Other Custom Tokens</h2>
        <ul class="grid gap-3 font-mono text-base md:grid-cols-2">
          <li
            v-for="t in otherCustom"
            :key="t.key"
            class="rounded border border-slate-700 bg-slate-800/40 p-4 break-all"
          >
            <span class="text-accent font-semibold">{{ t.key }}</span>
            <pre class="mt-3 text-base leading-snug whitespace-pre-wrap">{{
              t.json
            }}</pre>
          </li>
        </ul>
      </section>
      <p class="mt-12 text-base text-slate-500">
        Loaded from tailwind.config.js (dev only). Run
        <code class="font-mono text-base">pnpm tw:config</code>.
      </p>
    </div>
  </div>
</template>
<script setup>
  import { computed, ref, onMounted } from 'vue'
  definePageMeta({ alias: ['/dev/tokens'] })
  const isDev = import.meta.dev
  if (!isDev && process.client) window.location.replace('/')
  const themeExtend = ref({})
  if (isDev && process.client) {
    ;(async () => {
      try {
        const mod = await import('../../../tailwind.config.js')
        const configObj = (mod && (mod.default || mod)) || {}
        themeExtend.value = configObj?.theme?.extend || {}
      } catch (e) {
        console.warn('[viewer] Tailwind config import failed:', e)
      }
    })()
  }
  const standardScreensOrder = ['sm', 'md', 'lg', 'xl', '2xl']
  const standardDefaults = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
  const screenList = computed(() => {
    const custom = themeExtend.value.screens || {}
    const list = []
    for (const key of standardScreensOrder) {
      list.push({ name: key, value: custom[key] || standardDefaults[key] })
    }
    for (const [k, v] of Object.entries(custom)) {
      if (standardScreensOrder.includes(k)) continue
      list.push({ name: k, value: v })
    }
    // Sort by pixel value in ascending order
    return list.sort((a, b) => {
      const aNum = parseInt(a.value)
      const bNum = parseInt(b.value)
      return aNum - bNum
    })
  })
  const isCustomScreen = (name) => !standardScreensOrder.includes(name)
  const colorsList = computed(() => {
    // custom extended colors only
    const colors = themeExtend.value.colors || {}
    return Object.entries(colors).map(([name, value]) =>
      typeof value === 'string'
        ? { name, value }
        : value && typeof value === 'object'
          ? { name, shades: value }
          : { name, value: String(value) }
    )
  })
  // Default palette (subset) merged for comprehensive view
  const corePaletteNames = [
    'slate',
    'gray',
    'neutral',
    'stone',
    'zinc',
    'blue',
    'sky',
    'cyan',
    'teal',
    'emerald',
    'green',
    'lime',
    'yellow',
    'amber',
    'orange',
    'red',
    'rose',
    'pink',
    'fuchsia',
    'purple',
    'violet',
    'indigo',
    'black',
    'white',
  ]
  const defaultColors = ref({})
  const customColorNames = computed(() => new Set(['seagull']))
  async function loadDefaults() {
    try {
      const mod = await import('tailwindcss/colors')
      defaultColors.value = mod?.default || mod || {}
    } catch (e) {
      // gracefully ignore if module not available in client bundle
      console.warn('[viewer] could not load tailwindcss/colors', e)
    }
  }
  if (isDev && process.client) loadDefaults()
  const mainColors = computed(() => {
    const out = []
    const extMap = new Map(colorsList.value.map((c) => [c.name, c]))
    if (extMap.has('seagull')) out.push(extMap.get('seagull'))
    const slate = (defaultColors.value || {}).slate
    if (slate) out.push({ name: 'slate', shades: slate })
    return out
  })
  const copied = ref('')
  function setCopied(key) {
    copied.value = key
    window.clearTimeout(setCopied._t)
    setCopied._t = window.setTimeout(() => (copied.value = ''), 1000)
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
    } catch (e) {
      console.warn('copy failed', e)
    }
  }
  function copyColorShade(name, shade) {
    copy(`${name}-${shade}`)
  }
  function copyColorName(name) {
    copy(name)
  }
  const shadowsList = computed(() => {
    const raw = themeExtend.value.boxShadow || {}
    return Object.entries(raw).map(([name, value]) => ({ name, value }))
  })
  // Font families (custom first, then a few core fallbacks)
  const fontFamilies = computed(() => {
    const ff = themeExtend.value.fontFamily || {}
    const barlow = ff.Barlow || ff.barlow || ff['Barlow']
    if (!barlow) return []
    const stack = Array.isArray(barlow) ? barlow.join(', ') : String(barlow)
    const first = Array.isArray(barlow) ? barlow[0] : stack.split(',')[0]
    return [{ name: 'Barlow Condensed', stack, first }]
  })
  // Spacing scale (merge extend spacing + core subset via CSS vars fallback?) – we only have extend, so show if present else derive a common scale
  const otherCustom = computed(() => {
    const ext = themeExtend.value || {}
    const omit = new Set([
      'colors',
      'boxShadow',
      'fontFamily',
      'screens',
      'spacing',
      'borderRadius',
    ])
    return Object.entries(ext)
      .filter(([k]) => !omit.has(k))
      .map(([key, val]) => ({ key, json: JSON.stringify(val, null, 2) }))
  })
  const rootVars = ref([])
  onMounted(() => {
    const names = [
      '--dark',
      '--light',
      '--accent',
      '--scrollbar-track',
      '--scrollbar-track-bg',
    ]
    rootVars.value = names.map((n) => ({
      name: n,
      value:
        getComputedStyle(document.documentElement).getPropertyValue(n) || '—',
    }))
  })
</script>
<style scoped>
  :deep(.prose) {
    max-width: none;
  }
  .text-accent {
    color: var(--accent);
  }

  ul,
  ol {
    margin: 0 !important;
    padding: 0 !important;
  }

  li {
    margin: 0 !important;
    /* padding: 0 !important; */
  }
</style>
