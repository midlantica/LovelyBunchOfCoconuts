<!-- components/Button.vue -->
<template>
  <NuxtLink
    :to="resolveRoute(to)"
    class="flex gap-1 mt-3 text-lg font-light tracking-widest text-slate-400 hover:text-white"
  >
    <!-- Left icon slot -->
    <slot name="icon-left">
      <Icon v-if="iconLeft" :name="iconLeft" size="1.25rem" class="self-center" />
    </slot>

    <!-- Default slot for button text -->
    <slot>{{ text }}</slot>

    <!-- Right icon slot -->
    <slot name="icon-right">
      <Icon v-if="iconRight" :name="iconRight" size="1.25rem" class="self-center" />
    </slot>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  // Route destination - can be a string path, route name, or route object
  to: {
    type: [String, Object],
    default: "/",
  },
  // Left icon name (from your icon library)
  iconLeft: {
    type: String,
    default: "",
  },
  // Right icon name (from your icon library)
  iconRight: {
    type: String,
    default: "",
  },
  // Button text (used if no default slot is provided)
  text: {
    type: String,
    default: "",
  },
})

// Helper function to resolve route based on input type
const resolveRoute = (route) => {
  if (typeof route === "string") {
    // If it looks like a path (starts with / or has ://), use as is
    if (route.startsWith("/") || route.includes("://")) {
      return route
    }
    // Otherwise treat as a named route
    return { name: route }
  }
  // If it's already an object, return as is
  return route
}
</script>

<style scoped>
/* You can add additional styling here if needed */
</style>
