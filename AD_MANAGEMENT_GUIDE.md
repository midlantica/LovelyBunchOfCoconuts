# Ad Management Guide for WakeUpNPC

## Ad Terminology

- **Square Ads**: 378x378px ads that appear in meme slots
- **Horizontal Ads**: 768x100px (max height) ads that appear in quote slots

## Current Setup

### Ad Storage

- **Images**: Store in `/public/ads/` (e.g., `advertiser-name-square.jpg`, `advertiser-name-horizontal.png`)
- **Metadata**: Keep in `/public/content-ads.json` for ad configuration

### Content Folder

The `/content/ads/` folder is currently used to generate the JSON file. You have two options:

1. **Keep it** (Recommended): Use markdown files as a simple CMS for managing ad campaigns

   - Easy to edit ad metadata (advertiser name, campaign, link, frequency)
   - Run `node scripts/regenerate-content-json.js` to update the JSON

2. **Remove it**: Directly edit `/public/content-ads.json`
   - More direct but less user-friendly
   - Risk of JSON syntax errors

## Ad Frequency Management

### Current System

- **Global Interval**: Show an ad every N content items (currently 10)
- **Type Distribution**: 70% Square Ads, 30% Horizontal Ads

### Recommended Frequency Model

```javascript
// In content-ads.json or ad markdown files:
{
  "id": "advertiser-1-square",
  "advertiser": "Company Name",
  "campaign": "Holiday Sale",
  "image": "/ads/company-holiday-square.jpg",
  "link": "https://company.com/sale",
  "size": "square",  // or "horizontal"
  "weight": 10,      // Relative frequency (higher = more often)
  "active": true,
  "startDate": "2025-09-01",  // Optional
  "endDate": "2025-12-31"     // Optional
}
```

### Weight-Based Frequency Algorithm

Instead of equal random selection, use weights:

**Example Distribution:**

- Advertiser A (Premium): weight 30 → Shows ~30% of the time
- Advertiser B (Standard): weight 20 → Shows ~20% of the time
- Advertiser C (Basic): weight 10 → Shows ~10% of the time
- House Ads (Your own): weight 40 → Shows ~40% of the time

### Pricing Tiers

Based on weight/frequency:

**Square Ads (378x378)**

- Premium (weight 30+): $500/month
- Standard (weight 15-29): $300/month
- Basic (weight 5-14): $150/month

**Horizontal Ads (768x100)**

- Premium (weight 30+): $750/month (more prominent)
- Standard (weight 15-29): $450/month
- Basic (weight 5-14): $225/month

### Implementation Tips

1. **Start Conservative**: Begin with ads every 15-20 items to not overwhelm users
2. **A/B Test**: Try different intervals and measure engagement
3. **Cap Frequency**: Never show the same ad twice in a row
4. **House Ads**: Create your own ads for:
   - Newsletter signup
   - Merchandise
   - Donation appeals
   - Partner content

## Quick Start for Real Ads

1. Get advertiser images:

   ```bash
   # Square: 378x378px
   # Horizontal: 768x100px (or smaller, will scale)
   ```

2. Save images to `/public/ads/`:

   ```
   /public/ads/
   ├── heritage-foundation-square.jpg
   ├── heritage-foundation-horizontal.jpg
   ├── daily-wire-square.jpg
   └── daily-wire-horizontal.jpg
   ```

3. Update `/content/ads/` markdown files or directly edit JSON

4. Regenerate if using markdown:
   ```bash
   node scripts/regenerate-content-json.js
   ```

## Approaching Conservative Advertisers

### Target Organizations

- Think tanks (Heritage Foundation, AEI, Hoover Institution)
- Conservative media (Daily Wire, Blaze Media, Epoch Times)
- Political merchandise companies
- Book publishers (Regnery, Encounter Books)
- Podcast networks
- Event organizers (CPAC, Turning Point USA)

### Pitch Points

- "Native advertising that doesn't interrupt content flow"
- "Reaches engaged conservative audience"
- "Subtle integration maintains user experience"
- "Performance metrics available"

### Start Small

- Offer free trial month to establish value
- Create case studies from early advertisers
- Build testimonials

Would you like me to implement the weight-based frequency system in the useAds composable?
