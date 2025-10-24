<template>
  <li>
    <NuxtLink
      :to="to"
      @click="$emit('click')"
      class="flex items-center gap-2 rounded-none py-1.5 pr-4 pl-5 text-base transition-colors hover:bg-slate-800 hover:text-white"
    >
      <span class="ml-auto tracking-widest uppercase">{{ label }}</span>
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
