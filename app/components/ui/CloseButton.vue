<template>
  <button
    @click="$emit('click')"
    class="close-button group border-seagull-600/30 absolute top-[26px] right-[26px] z-9999 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-t bg-slate-900 pt-1.5 hover:cursor-pointer! focus:outline-none sm:flex"
    aria-label="Close"
    type="button"
  >
    <Icon
      name="heroicons:x-mark-solid"
      size="1.5rem"
      class="close-icon transition-colors"
    />
  </button>
</template>

<style scoped>
  .close-icon {
    color: hsl(0 0% 70% / 1);
  }

  .close-button:hover .close-icon {
    color: hsl(0 0% 100% / 1);
  }
</style>
