<template>
  <div ref="host" :class="['ui-scroll-area', rootClass]" :style="rootStyle">
    <div ref="content" class="ui-scroll-content" :style="contentStyle">
      <slot />
    </div>
    <div class="ui-scroll-rail" :style="railStyle" aria-hidden="true">
      <div
        class="ui-scroll-thumb"
        :style="thumbStyle"
        @mousedown.prevent="onThumbDown"
        @touchstart.passive.prevent="onThumbTouchStart"
      />
    </div>
    <div
      v-if="showBottomFade && hasOverflow"
      class="ui-scroll-fade"
      :style="bottomFadeStyle"
    ></div>
  </div>
</template>

<script setup>
  const props = defineProps({
    railWidth: { type: Number, default: 5 },
    trackColor: { type: String, default: 'rgba(255, 255, 255, 0.08)' },
    thumbColor: { type: String, default: '#0089cc' },
    thumbHoverColor: { type: String, default: '#09acee' },
    paddingRight: { type: Number, default: 8 },
    showBottomFade: { type: Boolean, default: true },
    bottomFadeHeight: { type: Number, default: 8 },
    height: { type: String, default: '' },
    maxHeight: { type: String, default: '' },
    class: { type: String, default: '' },
  })

  const rootClass = computed(() => props.class)

  const host = ref(null)
  const content = ref(null)

  const state = reactive({
    railHeight: 0,
    thumbHeight: 24,
    thumbTop: 0,
    dragging: false,
    dragStartY: 0,
    dragStartThumbTop: 0,
    hasOverflow: false,
    scrollTop: 0,
    maxScrollTop: 0,
  })

  const rootStyle = computed(() => ({
    height: props.height || undefined,
    maxHeight: props.maxHeight || undefined,
  }))

  const contentStyle = computed(() => ({
    paddingRight: `${props.paddingRight}px`,
    transform: `translateY(${-state.scrollTop}px)`,
  }))

  const railStyle = computed(() => ({
    width: `${props.railWidth}px`,
    height: '100%',
    background: props.trackColor,
    borderRadius: `${props.railWidth / 2}px`,
  }))

  const thumbStyle = computed(() => ({
    position: 'absolute',
    left: '0',
    width: '100%',
    height: `${state.thumbHeight}px`,
    transform: `translateY(${state.thumbTop}px)`,
    background: props.thumbColor,
    borderRadius: `${props.railWidth / 2}px`,
    cursor: state.dragging ? 'grabbing' : 'grab',
  }))

  const bottomFadeStyle = computed(() => ({
    height: `${props.bottomFadeHeight}px`,
    background:
      'linear-gradient(to top, rgb(30 41 59) 0%, rgba(30,41,59,0) 100%)',
  }))

  let roHost, roContent

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

  const recalc = () => {
    const vp = content.value
    const h = host.value
    if (!vp || !h) return
    state.railHeight = h.clientHeight
    const contentH = vp.scrollHeight
    const visible = h.clientHeight
    state.hasOverflow = contentH > visible + 1
    const minThumb = 24
    const ratio = visible > 0 && contentH > 0 ? visible / contentH : 1
    state.thumbHeight = clamp(
      Math.round(state.railHeight * ratio),
      minThumb,
      state.railHeight
    )
    const maxThumbTop = Math.max(0, state.railHeight - state.thumbHeight)
    state.maxScrollTop = Math.max(0, contentH - visible)
    state.scrollTop = clamp(state.scrollTop, 0, state.maxScrollTop)
    state.thumbTop =
      state.maxScrollTop > 0
        ? (state.scrollTop / state.maxScrollTop) * maxThumbTop
        : 0
  }

  const applyThumbDelta = (delta) => {
    const maxThumbTop = Math.max(0, state.railHeight - state.thumbHeight)
    const newThumbTop = clamp(state.dragStartThumbTop + delta, 0, maxThumbTop)
    state.thumbTop = newThumbTop
    state.scrollTop =
      maxThumbTop > 0 ? (newThumbTop / maxThumbTop) * state.maxScrollTop : 0
  }

  const onThumbDown = (e) => {
    state.dragging = true
    state.dragStartY = e.clientY
    state.dragStartThumbTop = state.thumbTop
    window.addEventListener('mousemove', onThumbMove, true)
    window.addEventListener('mouseup', onThumbUp, true)
    document.body.style.userSelect = 'none'
  }
  const onThumbMove = (e) => {
    if (!state.dragging) return
    const delta = e.clientY - state.dragStartY
    applyThumbDelta(delta)
  }
  const onThumbUp = () => {
    state.dragging = false
    window.removeEventListener('mousemove', onThumbMove, true)
    window.removeEventListener('mouseup', onThumbUp, true)
    document.body.style.userSelect = ''
  }

  const onThumbTouchStart = (e) => {
    const t = e.touches[0]
    state.dragging = true
    state.dragStartY = t.clientY
    state.dragStartThumbTop = state.thumbTop
    window.addEventListener('touchmove', onThumbTouchMove, { passive: false })
    window.addEventListener('touchend', onThumbTouchEnd, { passive: true })
  }
  const onThumbTouchMove = (e) => {
    if (!state.dragging) return
    const t = e.touches[0]
    const delta = t.clientY - state.dragStartY
    applyThumbDelta(delta)
  }
  const onThumbTouchEnd = () => {
    state.dragging = false
    window.removeEventListener('touchmove', onThumbTouchMove)
    window.removeEventListener('touchend', onThumbTouchEnd)
  }

  const onWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY
    state.scrollTop = clamp(state.scrollTop + delta, 0, state.maxScrollTop)
  }

  // Touch scroll on content area
  let touchStartY = 0
  let touchStartScroll = 0
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStartY = t.clientY
    touchStartScroll = state.scrollTop
  }
  const onTouchMove = (e) => {
    e.preventDefault()
    const t = e.touches[0]
    const delta = touchStartY - t.clientY
    state.scrollTop = clamp(touchStartScroll + delta, 0, state.maxScrollTop)
  }

  watch(
    () => state.scrollTop,
    () => {
      const maxThumbTop = Math.max(0, state.railHeight - state.thumbHeight)
      state.thumbTop =
        state.maxScrollTop > 0
          ? (state.scrollTop / state.maxScrollTop) * maxThumbTop
          : 0
    }
  )

  onMounted(() => {
    const h = host.value
    h?.addEventListener('wheel', onWheel, { passive: false })
    h?.addEventListener('touchstart', onTouchStart, { passive: true })
    h?.addEventListener('touchmove', onTouchMove, { passive: false })

    roHost = new ResizeObserver(recalc)
    roContent = new ResizeObserver(recalc)
    host.value && roHost.observe(host.value)
    content.value && roContent.observe(content.value)

    setTimeout(recalc, 0)
  })

  onBeforeUnmount(() => {
    const h = host.value
    h?.removeEventListener('wheel', onWheel)
    h?.removeEventListener('touchstart', onTouchStart)
    h?.removeEventListener('touchmove', onTouchMove)
    roHost?.disconnect()
    roContent?.disconnect()
  })
</script>

<style scoped>
  .ui-scroll-area {
    position: relative;
    width: 100%;
    min-height: 0; /* allow flex children to shrink */
    overflow: hidden; /* no native scrollbars */
    overscroll-behavior: contain;
    touch-action: pan-y;
  }
  .ui-scroll-content {
    position: relative;
    will-change: transform;
  }
  .ui-scroll-rail {
    position: absolute;
    top: 0;
    right: 0;
  }
  .ui-scroll-thumb {
    user-select: none;
  }
  .ui-scroll-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>
