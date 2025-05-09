# Claims

This folder contains claim translations displayed on the website.

## How to Add a New Claim Translation

1. Create a new file with a `.md` extension
2. Use a descriptive filename (e.g., `climate-policy-claim.md`)
3. Copy the template below and fill in your claim details

## Template

```md
---
title: "Short Title for the Claim"
original: "The original claim text goes here"
translation: "The translated or clarified version goes here"
date: "YYYY-MM-DD"
tags: ["relevant", "tags", "here"]
---

Any additional context or notes about the claim can go here (optional).
```

## Required Fields

- `title`: A short, descriptive title for the claim
- `original`: The original claim text
- `translation`: The translated or clarified version of the claim
- `date`: The date you're adding this claim (format: YYYY-MM-DD)

## Optional Fields

- `tags`: Keywords related to the claim (helps with searching)
- `source`: Where the original claim came from
- `author`: Who made the original claim

## Example

```md
---
title: "Climate Policy Impact"
original: "Climate policies will destroy the economy and jobs."
translation: "Well-designed climate policies can create new jobs in renewable energy while phasing out fossil fuel jobs over time."
date: "2023-04-30"
tags: ["climate", "economy", "policy"]
source: "Common political talking point"
---

This claim oversimplifies the economic impacts of climate policy by focusing only on potential job losses while ignoring job creation in new sectors.
```
