<template>
  <li>
    <NuxtLink
      :to="to"
      @click="$emit('click')"
      class="flex items-center gap-2 hover:bg-slate-900 py-1.5 pr-4 pl-5 rounded-md hover:text-seagull-200/80 text-base transition-colors"
    >
      <span class="ml-auto uppercase tracking-widest">{{ label }}</span>
    </NuxtLink>
  </li>
</template>

<script setup>
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

<style scoped></style>
