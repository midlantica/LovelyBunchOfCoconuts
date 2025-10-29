# Quote Image Generation - IMPORTANT REFERENCE

⚠️ **CRITICAL: There are TWO different image generation systems. Do NOT confuse them!**

## Copy Image Button (User-Facing Feature)

**File**: `app/composables/useSocialShare.js`

**Used By**: The "Copy Image" button in modals

- Path: `ShareButton.vue` → `useSocialShare.shareToPlatform()` → `generateShareImage()`
- Function: `generateShareImage(content, type)`
- Purpose: Generates 1600x900 PNG images for users to copy/share on social media

**When tuning font sizes for Copy Image button, edit THIS file.**

### Font Size Tuning Location in useSocialShare.js

```javascript
// Character-count-based font size adjustments
// Base range: 30px to 81px
// Adjustments based on testing specific character counts
const charCount = quoteText.length
let minFontSize = 30 * scale
let maxFontSize = 81 * scale

// ADD YOUR CHARACTER-COUNT ADJUSTMENTS HERE:
// ~130 chars (Hayek "Marxism has led to..."): needs 15% bigger
if (charCount >= 115 && charCount <= 135) {
  maxFontSize = 93 * scale // 81 * 1.15 = 93.15
}

// Calculate optimal font size using binary search
const quoteOptimalSize = calculateOptimalFontSizeBinarySearch(...)
```

---

## Modal Preview Image (Internal Display)

**File**: `app/composables/useShareImageGenerator.js`

**Used By**: Modal preview generation (internal)

- Path: `ModalQuote.vue` → `useShareImageGenerator.generateQuoteImage()`
- Function: `generateQuoteImage(quote, attribution)`
- Purpose: Generates preview images that appear IN the modal (not for Copy Image)

**This file does NOT affect the Copy Image button.**

---

## Quick Reference

| Feature           | File                        | Function               |
| ----------------- | --------------------------- | ---------------------- |
| Copy Image Button | `useSocialShare.js`         | `generateShareImage()` |
| Modal Preview     | `useShareImageGenerator.js` | `generateQuoteImage()` |

## Current Font Size Adjustments

Located in `useSocialShare.js` → `generateShareImage()` → quote section:

**Base Range**: 30px - 81px (applies to all quotes unless overridden)

**Established Curve Points** (character count → max font size):

- **~30 chars (25-40)**: 101px max (25% boost) - Spencer "All socialism involves slavery." - ✓ CONFIRMED GOOD
- **~100 chars (95-115)**: 98px max (21% boost) - C.S. Lewis "Of all tyrannies..." - ✓ CONFIRMED GOOD
- **~130 chars (116-135)**: 93px max (15% boost) - Hayek "Marxism has led to..." - ✓ CONFIRMED GOOD
- **~150 chars**: 81px (base) - Sowell "It is hard to imagine..." - ✓ CONFIRMED GOOD
- **~270 chars (200-279)**: 65px max (20% reduction) - Burke "It is with infinite caution..." - ✓ CONFIRMED GOOD
- **~335 chars (280-379)**: 60px max (26% total reduction) - Bastiat "If the natural tendencies..." - ✓ CONFIRMED GOOD
- **~400 chars (380-449)**: 52px max (36% total reduction) - NEEDS TESTING
- **~500+ chars (450+)**: 50px max (38% total reduction) - Chesterton "In the matter of reforming..." - ✓ CONFIRMED GOOD

---

## Adding New Font Size Rules

1. Count the characters in your test quote
2. Determine the desired font size adjustment (e.g., +10%, +15%, -5%)
3. Calculate the new maxFontSize: `81 * 1.15 = 93` for 15% increase
4. Add an if statement in `useSocialShare.js`:

```javascript
// ~XXX chars (Description): needs YY% bigger/smaller
if (charCount >= LOW && charCount <= HIGH) {
  maxFontSize = CALCULATED * scale
}
```

5. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
6. Test the quote with Copy Image button
