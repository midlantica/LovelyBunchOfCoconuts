<!-- components/Button.vue -->
<template>
  <component
    :is="componentType"
    :to="to ? resolveRoute(to) : undefined"
    :type="to ? undefined : 'button'"
    @click="to ? undefined : $emit('click')"
    class="flex justify-center items-center gap-1 font-400! uppercase tracking-wider transition-all duration-200"
    :class="[
      sizeClasses,
      variantClasses,
      props.variant === 'default'
        ? 'bg-white hoverbg-seagull-200: border border-seagull-950 text-seagull-950'
        : '',
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
        ['xl', 'lg', '', 'base', 'sm', 'xs', 'badge'].includes(value),
    },
    // Variant type
    variant: {
      type: String,
      default: 'default',
      validator: (value) =>
        [
          'default',
          'primary',
          'secondary',
          'tertiary',
          'outline',
          'outline-dark',
          'custom',
        ].includes(value),
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

  const variantClasses = computed(() => {
    switch (props.variant) {
      case 'primary':
        return 'bg-seagull-400! hover:bg-seagull-600! text-seagull-900! hover:text-white! border-0! font-400!'
      case 'secondary':
        return 'bg-seagull-800! hover:bg-seagull-900! !text-seagull-50 hover:text-white! border-0! font-400!'
      case 'tertiary':
        return 'bg-slate-300! hover:bg-slate-400! !text-slate-950 hover:!text-slate-900 border-0! font-400!'
      case 'outline':
        return '!bg-transparent hover:!bg-white/20 text-black! border-0! ring-1 ring-black/50 hover:ring-2 hover:ring-black font-400!'
      case 'outline-dark':
        return '!bg-transparent hover:!bg-white/20 text-white! border-0! ring-1 ring-white/50 hover:ring-2 hover:ring-white font-400!'
      case 'custom':
        return 'font-400! border-0!' // Custom variant: only structural styles, parent controls colors
      default:
        return 'font-400!' // Explicit font-400 for default variant
    }
  })

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'xl':
        return 'px-6 pt-2.5 pb-3 text-lg gap-2 rounded-xl'
      case 'lg':
        return 'px-4 pt-1.5 pb-2 text-base gap-2 rounded-lg'
      case 'sm':
        return 'px-1.5 pt-0.25 pb-0.5 text-xs gap-1 rounded-sm'
      case 'xs':
        return 'px-1 pt-0.2 pb-0.25 text-xs gap-0.5 rounded-sm'
      case 'badge':
        return 'px-1 pt-0.25 pb-0.5 text-[10px] gap-0.5 rounded-sm'
      case 'base':
      case '':
      default: // base - handles both 'base' and '' (empty string)
        return 'px-2.5 pt-1 pb-1.25 text-xs gap-1 rounded-md'
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
