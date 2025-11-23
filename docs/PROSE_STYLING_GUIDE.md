# Prose Styling Guide for WakeUpNPC

## The Problem

The `@tailwindcss/typography` plugin generates `.prose` styles that are difficult to override because:

1. They use `:where()` pseudo-class selectors (0 specificity)
2. They're applied in Tailwind's layer system
3. Styles in `@layer base` have LOWER specificity than the typography plugin

## The Solution

**ALWAYS place prose overrides OUTSIDE of `@layer` blocks** in `app/assets/css/styles.css`

### ✅ CORRECT Way to Override Prose Styles

```css
/* Place at the END of styles.css, OUTSIDE any @layer blocks */

/* Override prose links */
.prose :where(a):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  font-weight: 300 !important;
  text-decoration: underline !important;
  text-decoration-color: #6dd3ff73 !important;
  text-decoration-style: dotted !important;
  text-underline-offset: 6px !important;
}

/* Override prose strong tags */
.prose
  :where(strong):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  font-weight: 300 !important;
}
```

### ❌ WRONG Way (Will Not Work)

```css
@layer base {
  /* This will NOT work - too low specificity */
  .prose a {
    font-weight: 300;
  }
}
```

## Key Rules

1. **Location**: Place prose overrides at the END of `styles.css`, OUTSIDE all `@layer` blocks
2. **Selector Pattern**: Match the exact `:where()` selector pattern from Tailwind Typography
3. **!important**: Use `!important` to ensure your styles win
4. **Specificity**: The selector pattern is: `.prose :where(element):not(:where([class~='not-prose'], [class~='not-prose'] *))`

## Common Prose Elements to Override

```css
/* Links */
.prose :where(a):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  /* your styles */
}

/* Strong/Bold */
.prose
  :where(strong):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  /* your styles */
}

/* Paragraphs */
.prose :where(p):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  /* your styles */
}

/* Headings */
.prose :where(h1):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  /* your styles */
}

/* Lists */
.prose :where(ul):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  /* your styles */
}

.prose :where(li):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
  /* your styles */
}
```

## Why This Works

1. **Layer Order**: Styles outside `@layer` blocks have higher specificity than layered styles
2. **Selector Matching**: Using the same `:where()` pattern ensures we're targeting the exact same elements
3. **!important**: Guarantees our styles override any conflicting rules

## References

- [Tailwind Typography Plugin Docs](https://tailwindcss.com/docs/typography-plugin)
- [Tailwind CSS Layers](https://tailwindcss.com/docs/adding-custom-styles#using-css-and-layer)
- [CSS :where() Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)

## Current Prose Overrides in This Project

See the bottom of `app/assets/css/styles.css` for all current prose overrides. They are clearly marked with a comment block:

```css
/* ============================================================================
   PROSE OVERRIDES - MUST BE OUTSIDE @layer FOR PROPER SPECIFICITY
   ========================================================================== */
```

## Quick Checklist for Adding New Prose Overrides

- [ ] Place at END of `styles.css`
- [ ] OUTSIDE any `@layer` blocks
- [ ] Use exact `:where()` selector pattern
- [ ] Add `!important` to properties
- [ ] Test in browser DevTools to verify override works
- [ ] Add comment explaining what you're overriding and why
