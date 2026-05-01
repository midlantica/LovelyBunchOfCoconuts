<script setup>
  import { ref } from 'vue'

  const isHovered = ref(false)
</script>

<template>
  <div class="w-full max-w-107.5 transition-all duration-300 ease-out">
    <img src="/LovelyBunchOfCoconuts2.png" alt="" />
  </div>
</template>

<style scoped>
  svg {
    cursor: pointer !important;
    min-height: 72px;
    display: block;
    contain: layout;
  }

  [class^='icon'] {
    transform: translateY(-10px);
  }

  .middle {
    transform: translateY(5px);
  }

  /* Target the byline group for hover effects */
  .byline {
    transition: all 0.6s ease-in-out;
  }

  /* Smooth transitions for both text elements */
  .everythingText,
  .npcText {
    transition:
      transform 0.6s ease-in-out,
      opacity 0.6s ease-in-out;
  }

  /* Position both text elements absolutely within the byline group */
  .byline {
    position: relative;
  }

  .everythingText,
  .npcText {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transition: opacity 0.6s ease-in-out;
  }

  /* Initial state - everythingText visible, npcText hidden */
  .everythingText {
    opacity: 1;
    z-index: 2;
  }

  .npcText {
    opacity: 0;
    z-index: 1;
    transform: translateY(-25px);
  }

  /* Hover effect - simple fade swap */
  .lboc-logo:hover .everythingText {
    opacity: 0;
    z-index: 1;
  }

  .lboc-logo:hover .npcText {
    opacity: 1;
    z-index: 2;
  }
</style>
