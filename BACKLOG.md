# Project Backlog (Local Source of Truth)

Single file fallback so work does NOT disappear if GitHub Project automations misbehave. Treat this as canonical; sync to Issues/Project when convenient.

Legend: 
- [A] Active / in progress
- [N] Next up (ready)
- [Q] Queued / Icebox (not ready)
- [D] Done (recent wins)

Move items upward as they mature. Keep titles issue-friendly; when you promote one to a GitHub Issue, append its issue number here.

---
## 1. Active [A]
- Deterministic ad slot injection (decorate pattern with optional meme ad placeholders) — PHASE 1
- Ad inventory composable (`useAdInventory`) returning stable seeded picks + basic placeholder styling

## 2. Next Up [N]
- URL `?seed=` parameter support (shareable wall ordering)
- Deterministic infinite scroll slices (persist initial slice boundaries under seed)
- Unit tests for `interleaveContent` (baseline before ad decoration) — focus: pattern integrity, fallback behavior, seeding determinism
- Add debug panel (dev only) showing counts, seed, pattern log toggle
- Accessibility pass: color contrast, focus order, aria-labels on interactive logo reseed button
- Share image generator enhancements: add quote preview option

## 3. Queue / Icebox [Q]
- Ad impression tracking stub (no network; console log w/ seed + ad id)
- Lightweight analytics event queue (localStorage buffer)
- Backfill content counts endpoint (server route for quick stats)
- Performance budget: bundle size guard + lazy loading audit for large meme images
- Offline / low-data mode toggle (suppress meme images until click)
- Search highlight in results (emphasis without breaking layout)
- Modal deep-linking for claims/quotes/memes with `#id` fragment
- Sitemap generation script for static claim/quote/meme pages
- Dark mode theme (opt-in, respects OS preference)

## 4. Recently Done [D]
(Keep last ~10; prune older.)
- Seeded shuffle with masthead reseed
- Multi-line quote heading (<br> / newline handling)
- Unified image processing (single 800px long side policy)
- Issue templates scaffolded
- ESLint config ignore adjustments

---
## Workflow: How To Use This File
1. Capture FIRST here. If something pops into your head, drop it under Queue.
2. Promote: When you want to focus next, move item to Next Up; when you actually start, move to Active.
3. Externalize selectively: Only create a GitHub Issue when collaboration, discussion, or tracking across systems is needed. Note issue number.
4. Sync cadence (suggested): At end of day run a quick diff (git diff) and push. Weekly: open issues for any Active items still ongoing if not already.

### Rapid Promotion Template (copy/paste into Issue if created)
Title: <same as backlog line>
Body:
- Context:
- Acceptance Criteria:
- Test Plan:
- Out of Scope:

Then add issue number to this file.

---
## GitHub Project Instability: Mitigation Notes
If items "disappear":
- Check if they became Draft Issues (Project side panel → Drafts). Convert to issues.
- Verify board filter (top-right filter bar) is blank / expected.
- Ensure your logged-in user still has access; reloading while signed out hides private items.
- Disable/inspect any workflow automation rules that may auto-archive on field change.
- Classic Projects (old format) are more stable; consider migrating if instability persists.
- Always keep this BACKLOG.md updated before relying on automations.

---
## Possible Micro-Scripts (Future)
- `scripts/sync-backlog.js` to create/update GitHub Issues for [A]/[N] items missing issue numbers.
- CI check to warn if an [A] line lacks an issue number after 72h.

(Deferred until base ad features land.)

---
## Editing Guidelines
- One task per line; imperative mood ("Add", "Implement", "Support").
- Avoid trailing commentary; keep explanations for an issue body.
- Keep file small & living; prune Done section periodically.

---
End of file.
