<template>
  <div class="z-10 relative" ref="buttonRef">
    <button
      @click="handleClick"
      class="z-10 relative flex justify-center items-center bg-transparent hover:brightness-150 rounded-lg text-gray-400 hover:text-white transition-all duration-200 hover:cursor-pointer"
      :aria-label="ariaLabel"
      :style="buttonStyle"
    >
      <Icon :name="iconName" :size="iconSize" />
    </button>
  </div>

  <!-- Toast disabled - using external toast system -->
</template>

<script setup>
  const props = defineProps({
    iconName: { type: String, required: true },
    ariaLabel: { type: String, required: true },
    toastMessage: { type: String, required: true },
    toastDuration: { type: Number, default: 2000 },
    iconSize: { type: String, default: '1.3rem' },
    buttonStyle: { type: [String, Object], default: null },
  })

  const emit = defineEmits(['click', 'toast-show', 'toast-hide'])

  // Handle button click - just emit click event, no toast
  const handleClick = () => {
    emit('click')
  }
</script>
