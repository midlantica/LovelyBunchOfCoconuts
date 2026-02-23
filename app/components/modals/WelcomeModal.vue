<template>
  <teleport to="#modal-root">
    <transition
      enter-active-class="modal-enter-active"
      enter-from-class="modal-enter-from"
      enter-to-class="modal-enter-to"
      leave-active-class="modal-leave-active"
      leave-from-class="modal-leave-from"
      leave-to-class="modal-leave-to"
    >
      <div
        v-if="show"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center overscroll-contain"
        @click.self="handleBackdropClick"
      >
        <div class="welcome-modal-background card" @click="handleClose">
          <!-- Close button -->
          <UiCloseButton
            class="welcome-modal-close-button"
            @click="handleClose"
          />

          <!-- Top copy section -->
          <div class="welcome-modal-top-section">
            <!-- Header -->
            <div class="welcome-modal-header">
              <h1 class="welcome-modal-h1">Hi there! Are you an NPC?</h1>
              <IconsNpcIcon class="welcome-modal-npc-icon" />
            </div>

            <!-- Intro paragraphs -->
            <p class="welcome-modal-paragraph">
              NPCs — <span class="underlined-text">N</span>on&#8209;<span
                class="underlined-text"
                >P</span
              >layer <span class="underlined-text">C</span>haracters from games
              — are caught in the Leftist echo chamber. It's time to wake them
              up!
            </p>

            <p class="welcome-modal-paragraph relative">
              WakeUpNPC is a gold mine of anti&#8209;Leftist Memes, Quotes,
              and&nbsp;<span class="underlined-text"
                >Leftist Grifts<IconsArrowRight
                  :size="20"
                  class="relative -top-0.5 mx-0.5 inline-block text-slate-100"
                />Decoded</span
              >.
            </p>
          </div>

          <!-- Mid section with image (includes labels and arrows) -->
          <div class="welcome-modal-mid-section">
            <div class="welcome-modal-image-panel">
              <img
                src="/welcome-modal-image.svg"
                alt="Claim-Translation Example"
                width="590"
                height="280"
                loading="eager"
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['close'])
  const injectedClose = inject('closeModal', null)
  const modalGuardUntil = useState('modalGuardUntil', () => 0)

  const handleClose = () => {
    modalGuardUntil.value = Date.now() + 150
    emit('close')
    if (injectedClose) {
      requestAnimationFrame(() => {
        if (props.show) injectedClose()
      })
    }
  }

  const handleBackdropClick = (e) => {
    e.stopPropagation()
    handleClose()
  }

  function handleEscape(e) {
    if (props.show && (e.key === 'Escape' || e.key === ' ')) {
      e.stopPropagation()
      handleClose()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEscape, true)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape, true)
  })

  // Prevent background page scroll while modal is open
  watch(
    () => props.show,
    (open) => {
      if (import.meta.client) {
        const root = document.documentElement
        if (open) {
          root.style.overflow = 'hidden'
        } else {
          root.style.overflow = ''
        }
      }
    },
    { immediate: true }
  )
</script>

<style>
  /* Unscoped style for CSS variable */
  :root {
    --welcome-modal-body-font-size: clamp(0.9rem, 1.5rem, 2rem);
  }
</style>

<style scoped>
  .welcome-modal-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .welcome-modal-background {
    position: relative;
    width: 590px;
    max-width: 590px;
    background: linear-gradient(
      180deg,
      #1e2d42 0%,
      #1e2d42 43.06%,
      #0e1620 115.06%
    );
    border-radius: 16px;
    padding: 30px 2.2rem 25px;
    color: #ffffff;
    font-family: 'Barlow Condensed', sans-serif;
    overflow: visible;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0rem;
  }

  @media (max-width: 640px) {
    .welcome-modal-background {
      width: 100%;
      max-width: 100%;
      border-radius: 0;
    }
  }

  /* Close button positioning and styling override */
  .welcome-modal-close-button {
    position: absolute;
    top: 3px;
    right: 3px;
    z-index: 10;
    padding-top: 0 !important;
    background-color: hsl(215.68deg 38.14% 19.02%) !important;
  }

  .welcome-modal-close-button:hover {
    color: white !important;
    cursor: pointer;
  }

  /* Top section */
  .welcome-modal-top-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .welcome-modal-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .welcome-modal-h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 300;
    font-size: clamp(2rem, 2.5vw, 3rem);
    font-style: normal;
    line-height: 1;
    color: #fff;
    text-align: right;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.85);
    margin: 0;
    /* letter-spacing: -0.0005em; */
  }

  .welcome-modal-npc-icon {
    flex-shrink: 0;
    width: 2.5rem;
    margin-left: 0.15rem;
  }

  .welcome-modal-paragraph {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 100;
    font-size: var(--welcome-modal-body-font-size);
    font-style: normal;
    line-height: 1.35;
    /* letter-spacing: 0.0001rem; */
    text-align: center;
    color: #fff;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.85);
    width: clamp(300px, 55ch, 100%);
    margin: 0;
  }

  .underlined-text {
    text-decoration-line: underline;
    text-decoration-style: solid;
    -webkit-text-decoration-skip-ink: none;
    text-decoration-skip-ink: none;
    text-decoration-thickness: 8%;
    text-underline-offset: -2%;
    text-underline-position: from-font;
    text-decoration-color: #ffffffb5;
  }

  /* Mid section with image (includes labels and arrows in image) */
  .welcome-modal-mid-section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0.75rem 0 0.75rem 0;
  }

  .welcome-modal-image-panel {
    max-width: 100%;
    height: auto;
  }

  .welcome-modal-image-panel img {
    max-width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 473 / 178;
  }

  /* Bottom explanation */
  .welcome-modal-explanation {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 100;
    font-size: var(--welcome-modal-body-font-size);
    font-style: normal;
    line-height: 1.35;
    letter-spacing: 0.02788rem;
    text-align: center;
    color: #fff;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.85);
    width: clamp(300px, 55ch, 100%);
    margin: 0;
  }

  /* Explanation line control - two lines at 640px and above */

  /* .explanation-line-1 {
    margin-right: 0.5rem;
  } */

  @media (min-width: 411px) {
    .explanation-line-1,
    .explanation-line-2 {
      display: block;
    }
  }

  /* Natural flow on very small screens */
  @media (max-width: 410px) {
    .explanation-line-1,
    .explanation-line-2 {
      display: inline;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 978px) and (min-width: 641px) {
    .welcome-modal-background {
      padding: 30px 1.5rem 35px;
    }

    .welcome-modal-paragraph,
    .welcome-modal-explanation {
      width: clamp(49ch, 50ch, 2rem);
    }
  }

  @media (max-width: 640px) {
    .welcome-modal-close-button {
      display: none;
    }

    .welcome-modal-background {
      padding: 30px 1.5rem 20x;
    }
  }

  @media (max-width: 450px) {
    .welcome-modal-background {
      padding: 25px 1rem 20px;
    }

    .welcome-modal-h1 {
      font-size: clamp(1.3rem, 5vw, 1.5rem);
    }

    .welcome-modal-paragraph,
    .welcome-modal-explanation {
      font-size: clamp(1rem, 3.5vw, 1.1rem);
      line-height: 1.3;
    }
  }

  /* Modal overlay and transitions */
  .modal-overlay {
    background-color: rgba(0, 0, 0, 0.8);
    transition: background-color 300ms ease-out;
  }

  .modal-enter-active {
    transition: all 300ms ease-out;
  }

  .modal-leave-active {
    transition: all 200ms ease-in;
  }

  .modal-enter-from {
    opacity: 0;
    transform: scale(0.95);
  }

  .modal-enter-to {
    opacity: 1;
    transform: scale(1);
  }

  .modal-leave-from {
    opacity: 1;
    transform: scale(1);
  }

  .modal-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }
</style>
