<template>
  <!-- Compatibility wrapper: forwards all props/listeners to LikeButton -->
  <LikeButton v-bind="$attrs" />
</template>

<script setup>
// No props/emits; rely on fallthrough to forward to inner component
</script>
