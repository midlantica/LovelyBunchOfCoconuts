<template>
  <div
    class="relative"
    :class="!inline ? 'absolute top-1/2 right-[3.1rem] -translate-y-1/2' : ''"
    ref="root"
  >
    <button
      type="button"
      class="relative z-30 flex cursor-pointer! items-center justify-center text-white/80 hover:text-white focus:outline-none"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      @click.stop="toggle()"
      title="Filter results"
      :ref="(el) => (filterBtn = el)"
    >
      <Icon name="mdi:filter-variant" class="text-[1.35rem]" />
    </button>

    <div
      v-if="open"
      class="bg-seagull-950 absolute top-[1.9rem] right-0 z-20 w-fit rounded-lg p-2 shadow-[3px_4px_9px_-2px_rgba(0,0,0,1)] backdrop-blur"
      role="menu"
      :ref="(el) => (panelRef = el)"
      :style="panelStyle"
    >
      <!-- Cap behind the filter icon to visually merge button with panel -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute"
        :style="capStyle"
      />
      <div class="flex flex-col gap-[0.15rem]">
        <button
          type="button"
          class="w-auto cursor-pointer! px-3.5 py-1 text-center text-[13px] font-normal tracking-wider whitespace-nowrap uppercase transition"
          :class="[btnClass('grifts'), radiusClass('top')]"
          :style="
            btnWidthPx
              ? { width: btnWidthPx + 'px', maxWidth: MAX_BTN_PX + 'px' }
              : { maxWidth: MAX_BTN_PX + 'px' }
          "
          :ref="(el) => (btnRefs.grifts = el)"
          @click.stop="onPress('grifts')"
        >
          Grifts
        </button>
        <button
          type="button"
          class="w-auto cursor-pointer! px-3.5 py-1 text-center text-[13px] font-normal tracking-wider whitespace-nowrap uppercase transition"
          :class="[btnClass('quotes'), radiusClass('middle')]"
          :style="
            btnWidthPx
              ? { width: btnWidthPx + 'px', maxWidth: MAX_BTN_PX + 'px' }
              : { maxWidth: MAX_BTN_PX + 'px' }
          "
          :ref="(el) => (btnRefs.quotes = el)"
          @click.stop="onPress('quotes')"
        >
          Quotes
        </button>
        <button
          type="button"
          class="w-auto cursor-pointer! px-3.5 py-1 text-center text-[13px] font-normal tracking-wider whitespace-nowrap uppercase transition"
          :class="[btnClass('memes'), radiusClass('bottom')]"
          :style="
            btnWidthPx
              ? { width: btnWidthPx + 'px', maxWidth: MAX_BTN_PX + 'px' }
              : { maxWidth: MAX_BTN_PX + 'px' }
          "
          :ref="(el) => (btnRefs.memes = el)"
          @click.stop="onPress('memes')"
        >
          Memes
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
    counts: { type: Object, default: () => ({}) },
    inline: { type: Boolean, default: false },
  })
  const emit = defineEmits(['update:filters'])
  const open = ref(false)
  const root = ref(null)
  let filterBtn = ref(null)
  let panelRef = ref(null)
  const btnRefs = reactive({ grifts: null, quotes: null, memes: null })
  const btnWidthPx = ref(null)
  const capStyle = ref({})
  const panelStyle = ref({})
  const MAX_BTN_PX = 180

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

  function onPress(key) {
    const next = ensureKeys({ ...local })
    const keys = ['grifts', 'quotes', 'memes']
    const onCount = keys.filter((k) => next[k]).length

    if (onCount === keys.length) {
      // All selected → select only this one
      keys.forEach((k) => (next[k] = false))
      next[key] = true
    } else if (onCount === 1 && next[key]) {
      // Only this selected and clicked again → select all
      keys.forEach((k) => (next[k] = true))
    } else {
      // Toggle, but never allow all off
      next[key] = !next[key]
      if (keys.every((k) => !next[k])) next[key] = true
    }

    Object.assign(local, next)
    emit('update:filters', { ...next })
  }

  function btnClass(key) {
    const active = !!local[key]
    return active
      ? 'bg-[#358fbb] text-black hover:brightness-110'
      : 'bg-seagull-800/90 text-slate-200/80 hover:brightness-[1.15] text-shadow-sm'
  }

  function radiusClass(pos) {
    if (pos === 'top') return 'rounded-t-md rounded-b-none'
    if (pos === 'bottom') return 'rounded-b-md rounded-t-none'
    return 'rounded-none'
  }

  function toggle() {
    open.value = !open.value
  }
  function measureBtnWidth() {
    const keys = ['grifts', 'quotes', 'memes']
    let max = 0
    for (const k of keys) {
      const el = btnRefs[k]
      if (!el) continue
      const prev = el.style.width
      el.style.width = 'auto' // measure natural width
      const rect = el.getBoundingClientRect()
      const w = Math.ceil(rect.width)
      if (prev) el.style.width = prev
      max = Math.max(max, w)
    }
    if (max > 0) {
      const expanded = Math.round(max * 1.05)
      btnWidthPx.value = Math.min(expanded, MAX_BTN_PX)
    }
  }
  watch(open, (v) => {
    if (v)
      nextTick(() => {
        measureBtnWidth()
        applyPanelAndCapStyles()
      })
  })
  function onClickOutside(e) {
    if (!open.value) return
    const el = root.value
    if (el && !el.contains(e.target)) open.value = false
  }
  function onResize() {
    if (open.value) {
      measureBtnWidth()
      applyPanelAndCapStyles()
    }
  }
  onMounted(() => {
    document.addEventListener('click', onClickOutside)
    window.addEventListener('resize', onResize)
  })
  onUnmounted(() => {
    document.removeEventListener('click', onClickOutside)
    window.removeEventListener('resize', onResize)
  })

  function applyPanelAndCapStyles() {
    // Use prior offset approach and add a responsive maxWidth guard
    panelStyle.value = { right: '-11.4px', maxWidth: 'min(90vw, 20rem)' }

    // Cap shape/position exactly as provided
    capStyle.value = {
      right: '0px',
      top: '-38.25px',
      borderRadius: '12px 12px 0 0',
      width: '2.7rem',
      height: '2.9rem',
      opacity: '1',
      backgroundColor: '#06304b',
      zIndex: -20,
      boxShadow: 'none',
    }
  }
</script>

<style scoped>
  .text-shadow-sm {
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.9);
  }
</style>
