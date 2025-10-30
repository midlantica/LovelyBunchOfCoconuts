f
<template>
  <div
    class="card relative flex w-full cursor-pointer! flex-col transition-all duration-300 hover:scale-105 hover:border sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
  >
    <div class="flex-1 p-4">
      <h3 class="font-300 mb-1 text-center text-2xl uppercase">
        {{ tier }}
      </h3>
      <div
        class="font-300 text-seagull-100 text-center text-4xl tracking-widest"
      >
        ${{ price }}
      </div>
      <div
        class="font-100 mb-4 text-center text-lg tracking-wider text-slate-200 uppercase"
        :class="periodClass"
      >
        {{ period }}
      </div>
      <div class="flex flex-col gap-0">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="font-100 px-2 py-1.5 text-center text-lg tracking-wide text-slate-300"
          :class="index % 2 === 0 ? 'bg-seagull-400/10 rounded-md' : ''"
        >
          {{ feature }}
        </div>
      </div>
    </div>
    <div class="p-0">
      <UiButton
        to="/about"
        text="Get Started"
        size="lg"
        variant="primary"
        class="w-full rounded-t-none rounded-b-md"
      />
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    tier: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      default: 'per month',
    },
    periodClass: {
      type: String,
      default: '',
    },
    features: {
      type: Array,
      required: true,
    },
  })
</script>
