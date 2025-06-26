<!-- pages/memes/[...slug].vue -->
<!-- This page is now obsolete, as meme details are shown in a modal. -->
<template>
  <div class="py-12 text-white text-center">
    <h1>Meme detail is now shown in a modal.</h1>
    <p>Return to the main wall to view memes.</p>
  </div>
</template>

<script setup>
// No-op
</script>

<style>
/* Basic styling for the markdown content */
.prose p {
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
}
.prose h2 {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 300;
}
.prose h3 {
  font-size: 1.25rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
}
.prose img {
  margin: 1.5rem auto;
  border-radius: 0.375rem;
  max-width: 100%;
}
</style>
