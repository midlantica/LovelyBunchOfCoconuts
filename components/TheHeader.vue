<!-- components/TheHeader.vue -->
<template>
  <header class="pt-4 pb-2 bg-slate-900">
    <div
      class="grid grid-cols-2 auto-rows-auto items-center gap-x-2 gap-y-0 md:grid-cols-[1fr_auto_1fr] md:grid-rows-1 md:gap-x-6"
    >
      <img
        src="@/assets/icons/npc_icon_lg.svg"
        alt="NPC"
        class="ml-auto w-12 object-contain order-1 md:w-20 sm:w-16"
      />

      <a href="/" class="order-3 col-span-2 mt-3 no-underline md:order-2 md:col-span-1">
        <div class="grid auto-rows-auto place-items-center gap-1 text-center">
          <img
            src="@/assets/icons/WakeUpNPC.svg"
            alt="WakeUpNPC"
            class="w-full max-w-xs object-contain place-items-center px-4 sm:max-w-sm"
          />

          <p
            class="px-4 text-base font-light tracking-widest leading-snug text-white md:text-lg sm:text-base"
          >
            Everything the Left touches it destroys.
          </p>
        </div>
      </a>

      <img
        src="@/assets/icons/player_icon_lg.svg"
        alt="Player"
        class="mr-auto w-12 object-contain order-2 md:w-20 md:order-3 sm:w-16"
      />
    </div>
  </header>
</template>
