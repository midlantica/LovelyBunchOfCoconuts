<!-- components/TheHeader.vue -->
<template>
  <header class="bg-slate-900 pt-4 pb-1">
    <div class="flex flex-col gap-[0.5vw]">
      <!-- Top row: Icons and logo -->
      <div
        class="items-center gap-[1vw] grid grid-cols-[1fr_auto_1fr] grid-rows-1"
      >
        <img
          src="@/assets/icons/npc_icon_lg.svg"
          alt="NPC"
          class="ml-auto w-[8vw] min-w-[2rem] max-w-[3.25rem] object-contain"
        />

        <a href="/" class="flex justify-center no-underline">
          <img
            src="@/assets/icons/WakeUpNPC.svg"
            alt="Wake up NPC"
            class="h-[8vw] min-h-[2rem] max-h-[3.25rem] object-contain"
          />
        </a>

        <img
          src="@/assets/icons/player_icon_lg.svg"
          alt="Player"
          class="mr-auto w-[8vw] min-w-[2rem] max-w-[3.25rem] object-contain"
        />
      </div>

      <!-- Bottom row: Tagline text -->
      <div class="flex justify-center">
        <p
          class="w-full font-light text-[clamp(1.3rem,3.6vw,1.45rem)] text-white/80 text-center leading-snug tracking-[.1rem]"
        >
          Everything the Left touches it destroys.
        </p>
      </div>
    </div>
  </header>
</template>
