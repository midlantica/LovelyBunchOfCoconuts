<template>
  <div
    class="relative"
    :class="!inline ? 'absolute top-1/2 right-[3.1rem] -translate-y-1/2' : ''"
    ref="root"
  >
    <button
      type="button"
      class="flex items-center justify-center text-white/80 hover:text-white focus:outline-none"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      @click.stop="toggle()"
      title="Filter results"
    >
      <IconsFilterVariant :size="22" class="text-[1.35rem]" />
    </button>

    <div
      v-if="open"
      class="absolute top-[1.9rem] right-0 z-20 min-w-[200px] rounded-md border border-slate-700 bg-slate-900/95 px-2.5 py-1.5 shadow-lg backdrop-blur"
      role="menu"
    >
      <div class="mb-1.5 text-[11px] tracking-wide text-slate-300 uppercase">
        Filter by type
      </div>
      <ul class="space-y-[.2rem]">
        <li v-for="opt in opts" :key="opt.key" class="flex items-center gap-2">
          <label class="flex cursor-pointer! items-center gap-2 select-none">
            <input
              type="checkbox"
              :checked="local[opt.key]"
              class="accent-seagull-400"
              @change="onToggle(opt.key)"
            />
            <span class="text-[13px] text-slate-200">{{ opt.label }}</span>
            <span class="ml-auto font-mono text-[11px] text-slate-400">{{
              counts?.wall?.[opt.key] ?? 0
            }}</span>
          </label>
        </li>
      </ul>
      <div class="mt-1.5 flex justify-between">
        <button
          class="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-200 hover:bg-slate-700"
          @click="selectAll()"
        >
          All
        </button>
        <button
          class="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-200 hover:bg-slate-700"
          @click="selectNoneThenDefault()"
        >
          Default
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    filters: {
      type: Object,
      default: () => ({ grifts: true, quotes: true, memes: true }),
    },
    counts: {
      type: Object,
      default: () => ({ wall: { grifts: 0, quotes: 0, memes: 0 } }),
    },
    inline: { type: Boolean, default: false },
  })
  const emit = defineEmits(['update:filters'])
  const open = ref(false)
  const root = ref(null)

  const opts = [
    { key: 'grifts', label: 'Grifts' },
    { key: 'quotes', label: 'Quotes' },
    { key: 'memes', label: 'Memes' },
  ]

  const local = reactive({ ...props.filters })
  watch(
    () => props.filters,
    (v) => Object.assign(local, v || {}),
    { deep: true }
  )

  function ensureKeys(obj) {
    return {
      grifts: typeof obj.grifts === 'boolean' ? obj.grifts : true,
      quotes: typeof obj.quotes === 'boolean' ? obj.quotes : true,
      memes: typeof obj.memes === 'boolean' ? obj.memes : true,
    }
  }

  function onToggle(key) {
    const next = ensureKeys({ ...local, [key]: !local[key] })
    // never allow all off
    if (!next.grifts && !next.quotes && !next.memes) next[key] = true
    Object.assign(local, next)
    emit('update:filters', { ...next })
  }

  function selectAll() {
    const next = { grifts: true, quotes: true, memes: true }
    Object.assign(local, next)
    emit('update:filters', { ...next })
  }
  function selectNoneThenDefault() {
    selectAll() // same as all for now; placeholder if default differs later
  }

  function toggle() {
    open.value = !open.value
  }
  function onClickOutside(e) {
    if (!open.value) return
    const el = root.value
    if (el && !el.contains(e.target)) open.value = false
  }
  onMounted(() => document.addEventListener('click', onClickOutside))
  onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped></style>
