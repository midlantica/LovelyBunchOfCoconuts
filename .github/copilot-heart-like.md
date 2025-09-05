Got it—adding a heart/like is a solid idea; here’s how to make it clean, accessible, and low-risk now, with room to evolve.

Checklist

Placement: heart at far-left of share shelf; heart overlay top-right on wall cards.
Visual: outline heart (white + 1–2px shadow) → solid red when liked; smooth 150–200ms fade/scale.
State/IDs: stable per-item key; SSR-safe client persistence; optimistic updates.
A11y/UX: aria-pressed, aria-label, keyboard focus, large tap target, no layout shift.
Events: prevent like click from opening the modal; hover-only overlay on desktop; always-visible or tap-reveal on touch.
Notes and gotchas

IDs: Use content \_path as the like key (e.g., /claim/foo, /quote/bar, /meme/cat/dog). It’s stable and already unique.
Persistence v1: localStorage with Nuxt useState to keep UI reactive across the app. SSR guards (import.meta.client) are required. This gives per-browser likes and a local count; later swap for a backend count.
Backend later: Add /api/likes/{type}/{slug} GET/POST with a KV/DB (Netlify KV, Supabase, etc.). Keep the client optimistic and reconcile on response to avoid flicker.
Interaction: On wall cards, the heart button must stopPropagation so clicking it doesn’t open the modal. Reserve the overlay hit target (at least 36–40px) and keep it above the card via z-index.
Responsiveness: On desktop, show the heart on hover/focus. On touch, either always show the heart or reveal it after the first tap with a short timeout.
Counts: Wall cards show count to the left of the heart; in modals to the right of the heart. Reserve space so numbers don’t shift layout when they appear.
Minimal implementation plan

Composable useLikes: isLiked(id), getCount(id), toggleLike(id) with localStorage; optimistic increment/decrement.
Share shelf: Add a left-aligned heart + count, push Twitter/Facebook to the right with justify-between. Use heroicons:heart (outline) and heroicons:heart-20-solid when liked.
Wall cards (ClaimPanel, QuotePanel, MemePanel): Add an absolute top-right heart button with count; show on hover/focus; click stops card’s onClick.
Accessibility: aria-pressed on the heart; aria-label “Like [title]”; keyboard focus ring.
Want me to wire the composable and drop in the heart button for share shelf + all three wall panels (local-only first), then we can decide on a backend for global counts?

Pausing now; I’ll queue up the like/heart feature for morning with a tight plan.

Checklist for morning

Composable: add useLikes (SSR-safe, localStorage) with isLiked(id), getCount(id), toggleLike(id). Key by item.\_path (fallback: derived from slug).
Share shelf: in UiShareButton (ShareButton.vue), add a left-aligned heart + count; push share icons right (justify-between). Modal count appears to the right of the heart.
Wall cards: add a top-right, slightly inset heart overlay + count to ClaimPanel, QuotePanel, MemePanel. Show on hover/focus (desktop), always visible or tap-reveal on touch. Use @click.stop to avoid opening modal.
Icons/visuals: outline heart heroicons:heart (white, 1–2px text-shadow) → solid red heroicons:heart-20-solid when liked; 150–200ms fade/scale; 36–40px hit target; z-10+.
A11y: aria-pressed, aria-label “Like [title]”, focus ring, keyboard support.
Verification: lint/fix, quick smoke in modals and wall; ensure no layout shift when counts appear.
Notes

Local-only counts first; easy to swap to server API later for global totals.
Using \_path ensures stable IDs across wall and modals.
Ping “go” in the morning and I’ll implement and run lint right after.
