<!-- components/TheHeader.vue -->
<template>
  <header class="bg-slate-900 pt-4 pb-2">
    <div
      class="items-center gap-x-2 gap-y-0 md:gap-x-6 grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] md:grid-rows-1 auto-rows-auto"
    >
      <img
        src="@/assets/icons/npc_icon_lg.svg"
        alt="NPC"
        class="order-1 ml-auto w-12 sm:w-16 md:w-20 object-contain"
      />

      <a
        href="/"
        class="order-3 md:order-2 col-span-2 md:col-span-1 mt-3 no-underline"
      >
        <div class="place-items-center gap-1 grid auto-rows-auto text-center">
          <img
            src="@/assets/icons/WakeUpNPC.svg"
            alt="WakeUpNPC"
            class="place-items-center px-4 w-full max-w-xs sm:max-w-sm object-contain"
          />

          <p
            class="px-4 font-light text-white text-base sm:text-base md:text-lg leading-snug tracking-widest"
          >
            Everything the Left touches it destroys.
          </p>
        </div>
      </a>

      <img
        src="@/assets/icons/player_icon_lg.svg"
        alt="Player"
        class="order-2 md:order-3 mr-auto w-12 sm:w-16 md:w-20 object-contain"
      />
    </div>
  </header>
</template>
