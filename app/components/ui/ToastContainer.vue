<template>
  <Teleport to="body">
    <div
      v-if="toasts.length"
      class="pointer-events-none fixed top-5 right-5 z-[9999] flex flex-col gap-2"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-5 py-3 text-sm text-white shadow-lg shadow-black/30"
          @click="dismissToast(toast.id)"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  // @ts-expect-error useToast is auto-imported by Nuxt at runtime
  const { toasts, dismissToast } = useToast()
</script>
