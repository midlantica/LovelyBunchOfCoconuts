<!-- layouts/default.vue -->
<template>
  <div class="grid-rows-[auto_1fr_auto] h-screen grid gap-3 bg-slate-950">
    <TheHeader class="w-full sticky top-0 left-0 z-10" />
    <main class="mx-auto w-full max-w-screen-md overflow-y-auto gap-3 px-4">
      <slot />
    </main>
    <TheFooter class="w-full" />
  </div>
</template>

<script setup></script>
