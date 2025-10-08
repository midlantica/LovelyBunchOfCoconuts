# WakeUpNPC Advertising System [COMPLETED]

> **Status**: ✅ Implementation Complete - Reference Document

## Overview

The advertising system seamlessly integrates ads into the Wall pattern while maintaining user experience. This document serves as a reference for the completed implementation.

---

## Ad Specifications

### Ad Sizes

- **Square Ads**: 378x378px (appears in meme slots)
- **Horizontal Ads**: 768x100px max height (appears in quote slots)

### Current Implementation

- Images stored in `/public/ads/`
- Metadata in `/public/content-ads.json`
- Type distribution: 70% Square, 30% Horizontal
- Global interval: Ad every 10 content items

---

## Ad Management

### File Structure

```
/public/ads/
├── advertiser-name-square.jpg
├── advertiser-name-horizontal.png
└── ...

/content/ads/
├── advertiser-1.md
└── ... (Markdown CMS for ad campaigns)
```

### Content Folder Options

1. **Keep `/content/ads/`** (Recommended): Use markdown as simple CMS
   - Edit ad metadata easily
   - Run `node scripts/regenerate-content-json.js` to update JSON
2. **Remove it**: Directly edit `/public/content-ads.json`

---

## Frequency & Pricing

### Weight-Based Frequency Model

```javascript
// In content-ads.json:
{
  "id": "advertiser-1-square",
  "advertiser": "Company Name",
  "campaign": "Holiday Sale",
  "image": "/ads/company-holiday-square.jpg",
  "link": "https://company.com/sale",
  "size": "square",
  "weight": 10,        // Relative frequency
  "active": true,
  "startDate": "2025-09-01",
  "endDate": "2025-12-31"
}
```

### Pricing Tiers

**Square Ads (378x378)**

- Premium (weight 30+): $500/month
- Standard (weight 15-29): $300/month
- Basic (weight 5-14): $150/month

**Horizontal Ads (768x100)**

- Premium (weight 30+): $750/month
- Standard (weight 15-29): $450/month
- Basic (weight 5-14): $225/month

### Alternative Models

- **CPM**: $8-40 per thousand impressions
- **CPC**: $0.10-1.00 per click
- **Flat Rate**: $250-2,500/month based on guaranteed impressions

---

## Target Advertisers

### Tier 1 - Direct Alignment

- Conservative news outlets (Daily Wire, Blaze, Epoch Times)
- Right-leaning podcasts/YouTube channels
- Conservative book publishers
- Patriotic merchandise companies
- Free speech platforms (Rumble, Truth Social)

### Tier 2 - Lifestyle Alignment

- Outdoor/hunting gear
- Tactical equipment
- Prepper supplies
- Homeschooling resources
- Men's lifestyle brands

### Tier 3 - General Conservative

- Political campaigns
- Think tanks (Heritage, AEI, Hoover)
- Legal defense funds
- Veterans organizations

---

## Sales Pitch Points

- "Native advertising that doesn't interrupt content flow"
- "Reaches engaged conservative audience"
- "Subtle integration maintains user experience"
- "Performance metrics available"
- Start with free trial month to establish value

---

## Technical Implementation

### Ad Selection Logic

```javascript
function shouldShowAd(type, index) {
  const frequency = adConfig.frequency[type]
  return Math.random() < frequency
}

function selectAd(type) {
  const ads = getActiveAdsByType(type)
  return weightedRandomSelection(ads)
}
```

### Key Metrics

- **Impressions**: Total ad views
- **CTR**: Click-through rate
- **RPM**: Revenue per thousand impressions
- **Fill Rate**: Percentage of ad slots filled

---

## Creative Guidelines

### Requirements

- **File Format**: JPG or PNG
- **File Size**: Max 500KB
- **Resolution**: 72-150 DPI
- **Color Mode**: RGB

### Prohibited Content

- Adult content
- Illegal products/services
- Hate speech
- Misleading news

---

## Implementation Tips

1. **Start Conservative**: Begin with ads every 15-20 items
2. **A/B Test**: Try different intervals and measure engagement
3. **Cap Frequency**: Never show same ad twice in a row
4. **House Ads**: Create your own for newsletter signup, merch, donations

---

## Testing Completed

✅ Dummy ad generation script working
✅ Ad rotation system implemented
✅ Visual integration matches Wall pattern
✅ Mobile responsive
✅ Performance impact minimal

---

_Document Status: Complete and archived for reference_
_Last Updated: January 2025_
