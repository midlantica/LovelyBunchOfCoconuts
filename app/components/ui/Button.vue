<!-- components/Button.vue -->
<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to ? resolveRoute(to) : undefined"
    :type="to ? undefined : 'button'"
    @click="to ? undefined : $emit('click')"
    class="flex gap-1 hover:bg-slate-950 px-2.5 pt-1 pb-1.25 border border-slate-400/40 hover:border-white/70 rounded-md font-light text-slate-300/80 hover:text-white text-xs uppercase tracking-widest transition-all duration-200"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      $attrs.class,
    ]"
    :disabled="disabled"
  >
    <!-- Left icon slot -->
    <slot name="icon-left">
      <Icon v-if="iconLeft" :name="iconLeft" size="1rem" class="self-center" />
    </slot>

    <!-- Default slot for button text -->
    <slot>{{ text }}</slot>

    <!-- Right icon slot -->
    <slot name="icon-right">
      <Icon
        v-if="iconRight"
        :name="iconRight"
        size="1rem"
        class="self-center"
      />
    </slot>
  </component>
</template>

<script setup>
  const props = defineProps({
    // Route destination - can be a string path, route name, or route object
    to: {
      type: [String, Object],
      default: null,
    },
    // Left icon name (from your icon library)
    iconLeft: {
      type: String,
      default: '',
    },
    // Right icon name (from your icon library)
    iconRight: {
      type: String,
      default: '',
    },
    // Button text (used if no default slot is provided)
    text: {
      type: String,
      default: '',
    },
    // Disabled state
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['click'])

  // Helper function to resolve route based on input type
  const resolveRoute = (route) => {
    if (typeof route === 'string') {
      // If it looks like a path (starts with / or has ://), use as is
      if (route.startsWith('/') || route.includes('://')) {
        return route
      }
      // Otherwise treat as a named route
      return { name: route }
    }
    // If it's already an object, return as is
    return route
  }
</script>
