# WakeUpNPC Ad System Implementation Guide

## Overview

This document outlines the advertising system for WakeUpNPC, designed to seamlessly integrate ads into the Wall pattern while maintaining user experience.

## Ad Specifications

### Ad Sizes

- **Small Ads** (Claims-sized): 400×300px
- **Large Ads** (Quotes-sized): 800×400px

### File Structure

```
content/ads/
├── ad-small-1.jpg
├── ad-small-2.jpg
├── ad-small-3.jpg
├── ad-small-4.jpg
├── ad-large-1.jpg
├── ad-large-2.jpg
├── ad-large-3.jpg
└── ad-large-4.jpg
```

## Implementation Strategy

### 1. Ad Integration Pattern

The ads will be integrated into the existing Wall pattern:

- Small ads replace Claims panels
- Large ads replace Quotes panels
- Memes remain unaffected

### 2. Frequency Algorithm

```javascript
// Example frequency configuration
const adConfig = {
  enabled: true,
  frequency: {
    small: 0.1, // 10% chance for small ad
    large: 0.08, // 8% chance for large ad
  },
  rotation: 'random', // or 'sequential'
  maxPerPage: 3,
}
```

### 3. Ad Selection Logic

```javascript
function shouldShowAd(type, index) {
  const frequency = adConfig.frequency[type]
  const seed = generateSeed(index)
  return Math.random(seed) < frequency
}

function selectAd(type) {
  const adCount = type === 'small' ? 4 : 4
  const adIndex = Math.floor(Math.random() * adCount) + 1
  return `/ads/ad-${type}-${adIndex}.jpg`
}
```

## Implementation Steps

### Step 1: Generate Dummy Ads

1. Open `scripts/generate-ad-images.html` in a browser
2. Click "Generate & Download All Ad Images"
3. Save all images to `content/ads/`

### Step 2: Create Ad Component

Create `app/components/wall/AdPanel.vue`:

```vue
<template>
  <div class="ad-panel" :class="`ad-${size}`">
    <img :src="adImage" :alt="adAlt" />
    <span class="ad-label">Advertisement</span>
  </div>
</template>

<script setup>
  const props = defineProps({
    size: String, // 'small' or 'large'
    index: Number,
  })

  const adImage = computed(() => {
    // Logic to select ad image
  })
</script>
```

### Step 3: Modify Wall Component

Update `app/components/wall/TheWall.vue` to include ad logic:

```javascript
// In the content interleaving logic
function interleaveWithAds(content) {
  return content.map((item, index) => {
    if (shouldShowAd(item.type, index)) {
      return {
        type: 'ad',
        size: item.type === 'claim' ? 'small' : 'large',
        index,
      }
    }
    return item
  })
}
```

### Step 4: Add Ad Tracking

Implement impression and click tracking:

```javascript
// composables/useAdTracking.js
export const useAdTracking = () => {
  const trackImpression = (adId) => {
    // Send to analytics
    console.log('Ad impression:', adId)
  }

  const trackClick = (adId) => {
    // Send to analytics
    console.log('Ad click:', adId)
  }

  return { trackImpression, trackClick }
}
```

## Testing

### Local Testing

1. Place dummy ads in `content/ads/`
2. Set `adConfig.enabled = true`
3. Adjust frequency values to test different scenarios
4. Monitor console for tracking events

### A/B Testing

```javascript
const testVariants = {
  control: { frequency: { small: 0, large: 0 } },
  variant_a: { frequency: { small: 0.1, large: 0.08 } },
  variant_b: { frequency: { small: 0.15, large: 0.12 } },
}
```

## Advertiser Guidelines

### Creative Requirements

- **File Format**: JPG or PNG
- **File Size**: Max 500KB
- **Resolution**: 72-150 DPI
- **Color Mode**: RGB

### Content Guidelines

- No auto-play video/audio
- Clear "Advertisement" label
- Relevant to audience interests
- No misleading claims

### Prohibited Content

- Adult content
- Illegal products/services
- Hate speech
- Misleading news

## Revenue Models

### CPM (Cost Per Thousand Impressions)

- Premium slots: $25-40 CPM
- Standard slots: $15-25 CPM
- Budget slots: $8-15 CPM

### CPC (Cost Per Click)

- Premium: $0.50-1.00 per click
- Standard: $0.25-0.50 per click
- Budget: $0.10-0.25 per click

### Flat Rate Monthly

- Starter: $250/month (15k impressions)
- Standard: $1,000/month (50k impressions)
- Premium: $2,500/month (100k impressions)

## Analytics & Reporting

### Key Metrics

- **Impressions**: Total ad views
- **CTR**: Click-through rate
- **RPM**: Revenue per thousand impressions
- **Fill Rate**: Percentage of ad slots filled

### Reporting Dashboard

```javascript
// Example metrics structure
const adMetrics = {
  daily: {
    impressions: 5420,
    clicks: 87,
    ctr: 1.6,
    revenue: 135.5,
  },
  monthly: {
    impressions: 162600,
    clicks: 2604,
    ctr: 1.6,
    revenue: 4065.0,
  },
}
```

## Future Enhancements

### Phase 1 (Months 1-3)

- [ ] Basic ad rotation
- [ ] Impression tracking
- [ ] Manual ad management

### Phase 2 (Months 4-6)

- [ ] Click tracking
- [ ] A/B testing framework
- [ ] Basic reporting dashboard

### Phase 3 (Months 7-12)

- [ ] Self-service portal
- [ ] Automated billing
- [ ] Advanced targeting
- [ ] Real-time bidding

## Support & Maintenance

### Common Issues

1. **Ads not showing**: Check frequency settings and file paths
2. **Performance impact**: Optimize image sizes and lazy loading
3. **Tracking failures**: Verify analytics integration

### Contact

For advertiser inquiries: [Create contact form]
For technical support: [Create support system]

## Conclusion

The ad system is designed to be:

- **Non-intrusive**: Maintains user experience
- **Scalable**: Easy to add more advertisers
- **Measurable**: Clear metrics and reporting
- **Profitable**: Multiple revenue models

Remember: The goal is to monetize while maintaining the site's integrity and user trust.
