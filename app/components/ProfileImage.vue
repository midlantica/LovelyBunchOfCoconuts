<!-- components/ProfileImage.vue -->
<!-- Profile image with check/cross badge indicator -->
<template>
  <div :class="['relative block', sizeClasses]">
    <img
      v-if="imagePath"
      :src="imagePath"
      :alt="profileName"
      width="800"
      height="800"
      :class="[
        'rounded-full object-cover',
        status === 'hero' ? 'filter-hero' : 'filter-zero',
        sizeClasses,
      ]"
      loading="lazy"
      decoding="async"
    />
    <!-- Hero/Zero Icon Badge -->
    <div
      v-if="imagePath && (status === 'hero' || status === 'zero')"
      :class="[
        'absolute flex items-center justify-center rounded-full shadow-lg',
        badgeSizeClasses,
        status === 'hero' ? 'bg-hero' : 'bg-zero',
        iconPositionClass,
        iconRotationClass,
      ]"
      :style="
        status === 'hero'
          ? 'background: radial-gradient(#00e300, #007800);'
          : 'background: radial-gradient(#ff0a0a, #7d0000);'
      "
    >
      <!-- Hero Icon - White Check -->
      <Icon
        v-if="status === 'hero'"
        name="tabler:check"
        :class="iconSizeClasses"
      />
      <!-- Zero Icon - White Cross -->
      <Icon
        v-else-if="status === 'zero'"
        name="tabler:x"
        :class="iconSizeClasses"
      />
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    imagePath: { type: String, required: true },
    profileName: { type: String, required: true },
    status: { type: String, required: true }, // 'hero' or 'zero'
    size: { type: String, default: 'medium' }, // 'small', 'medium', 'large', 'modal'
    badgeSize: { type: String, default: 'normal' }, // 'small' or 'normal'
  })

  // Size classes for image based on size prop
  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'small':
        return 'h-24 w-24 sm:h-32 sm:w-32'
      case 'large':
        return 'h-32 w-32 sm:h-40 sm:w-40'
      case 'modal':
        return 'h-40 w-40 sm:h-40 sm:w-40' // 10rem x 10rem (below 640px), then same size
      case 'medium':
      default:
        return 'h-24 w-24 sm:h-40 sm:w-40'
    }
  })

  // Badge size classes - 25% smaller when badgeSize is 'small'
  const badgeSizeClasses = computed(() => {
    if (props.badgeSize === 'small') {
      return 'h-[1.5rem] w-[1.5rem] sm:h-[1.8rem] sm:w-[1.8rem]'
    }
    return 'h-[2rem] w-[2rem] sm:h-[2.4rem] sm:w-[2.4rem]'
  })

  // Icon size classes - 25% smaller when badgeSize is 'small'
  const iconSizeClasses = computed(() => {
    if (props.badgeSize === 'small') {
      return 'text-[1.35rem] text-white sm:text-[1.5rem]'
    }
    return 'text-[1.8rem] text-white sm:text-[2rem]'
  })

  // Random icon position (one of four corners)
  // Generate a stable random position based on profile name
  const iconPositionClass = computed(() => {
    if (!props.profileName) return 'badge-top-left'

    // Use profile name to generate consistent random position
    const name = props.profileName
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }

    const positions = [
      'badge-top-left', // top-left
      'badge-top-right', // top-right
      'badge-bottom-right', // bottom-right
      'badge-bottom-left', // bottom-left
    ]

    const index = Math.abs(hash) % positions.length
    return positions[index]
  })

  // Rotation class based on position (left = -8deg, right = +8deg)
  const iconRotationClass = computed(() => {
    const position = iconPositionClass.value

    // Left positions get -8deg rotation (counterclockwise)
    if (position.includes('left')) {
      return 'rotate-[-8deg]'
    }
    // Right positions get +8deg rotation (clockwise)
    if (position.includes('right')) {
      return 'rotate-[8deg]'
    }

    return ''
  })
</script>

<style scoped>
  /* Grayscale filter for Heroes */
  .filter-hero {
    filter: grayscale(1);
  }

  /* Grayscale filter for Zeros */
  .filter-zero {
    filter: grayscale(1);
  }

  /* Badge positioning - uses absolute positioning anchored to parent container corners */
  /* The parent has position: relative, so badge positions relative to it */
  .badge-top-left {
    top: 0.65rem;
    left: 0.45rem;
  }

  .badge-top-right {
    top: 0.65rem;
    right: 0.45rem;
  }

  .badge-bottom-right {
    bottom: 0.65rem;
    right: 0.45rem;
  }

  .badge-bottom-left {
    bottom: 0.65rem;
    left: 0.45rem;
  }
</style>
