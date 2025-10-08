<!-- components/Button.vue -->
<template>
  <component
    :is="componentType"
    :to="to ? resolveRoute(to) : undefined"
    :type="to ? undefined : 'button'"
    @click="to ? undefined : $emit('click')"
    class="flex gap-1 hover:bg-slate-950 border border-slate-400/40 hover:border-white/70 rounded-md font-100 text-slate-300/80 hover:text-white uppercase tracking-widest transition-all duration-200"
    :class="[
      sizeClasses,
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
    // Size variant
    size: {
      type: String,
      default: '', // base size
      validator: (value) =>
        ['xl', 'lg', '', 'sm', 'xs', 'badge'].includes(value),
    },
    // Disabled state
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const componentType = computed(() => {
    return props.to ? resolveComponent('NuxtLink') : 'button'
  })

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'xl':
        return 'px-6 py-3 text-lg gap-2'
      case 'lg':
        return 'px-4 py-2 text-base gap-2'
      case 'sm':
        return 'px-1.5 py-0.5 text-xs gap-1'
      case 'xs':
        return 'px-1 py-0.25 text-xs gap-0.5'
      case 'badge':
        return 'px-1 py-0.5 text-[10px] gap-0.5'
      default: // base
        return 'px-2.5 pt-1 pb-1.25 text-xs gap-1'
    }
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
