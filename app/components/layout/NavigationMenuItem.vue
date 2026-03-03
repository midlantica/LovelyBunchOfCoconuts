<template>
  <li>
    <NuxtLink
      :to="to"
      @click="$emit('click')"
      :class="[
        'flex items-center gap-2 rounded-none py-1.5 pr-4 pl-5 text-base no-underline transition-colors',
        isDark ? 'nav-menu-link--dark' : 'nav-menu-link--light',
      ]"
    >
      <span class="ml-auto tracking-widest uppercase">{{ label }}</span>
    </NuxtLink>
  </li>
</template>

<script setup>
  const { isDark } = useTheme()

  defineProps({
    to: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  })

  defineEmits(['click'])
</script>

<style scoped>
  /* Dark mode */
  .nav-menu-link--dark {
    color: #f8fafc; /* slate-50 */
  }
  .nav-menu-link--dark:hover {
    background-color: #1e293b; /* slate-800 */
    color: #ffffff;
  }

  /* Light mode: charcoal text, warm grey hover */
  .nav-menu-link--light {
    color: #1a1a1a; /* charcoal */
  }
  .nav-menu-link--light:hover {
    background-color: #e5e4de; /* warm grey overlay */
    color: #1a1a1a;
  }
</style>
