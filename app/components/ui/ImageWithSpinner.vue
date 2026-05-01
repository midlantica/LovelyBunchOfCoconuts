<!-- Universal image component with loading spinner -->
<template>
  <div class="relative">
    <!-- Spinner overlay - shown while loading -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/40"
      >
        <IconsSpinnerDotRevolve
          :size="spinnerSize"
          class-name="text-union-blue-400"
        />
      </div>
    </Transition>

    <!-- Actual image - always use src, let loading attribute handle lazy behavior -->
    <img
      ref="imgRef"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :decoding="decoding"
      :loading="loading"
      :fetchpriority="fetchpriority"
      :class="[imageClass, { 'opacity-0': isLoading }]"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>

<script setup>
  const props = defineProps({
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
    width: {
      type: [String, Number],
      default: undefined,
    },
    height: {
      type: [String, Number],
      default: undefined,
    },
    imageClass: {
      type: String,
      default: '',
    },
    isLazy: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: String,
      default: 'lazy',
    },
    decoding: {
      type: String,
      default: 'async',
    },
    fetchpriority: {
      type: String,
      default: undefined,
    },
    spinnerSize: {
      type: [String, Number],
      default: 48,
    },
  })

  const emit = defineEmits(['load', 'error'])

  const isLoading = ref(true)
  const imgRef = ref(null)

  const handleLoad = (event) => {
    isLoading.value = false
    emit('load', event)
  }

  const handleError = (event) => {
    isLoading.value = false
    emit('error', event)
  }

  // Reset loading state if src changes
  watch(
    () => props.src,
    () => {
      isLoading.value = true
    }
  )
</script>

<style scoped>
  /* No transitions - instant appearance for fluid performance */
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* No transition on image - instant appearance */
  img {
    transition: none;
  }
</style>
