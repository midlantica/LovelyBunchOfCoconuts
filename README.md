# WakeUpNPC

A visually-strict, content-driven Nuxt 3 wall for claims, quotes, and memes.

## 🚀 Overview

WakeUpNPC2 is a Nuxt 3-powered content wall that curates political claims, quotes, and memes in a strict, repeating visual pattern. It’s designed for maximum visual consistency, even with unbalanced or randomized content. The project leverages Nuxt Content v3, progressive loading, and a robust transformation pipeline.

## ✨ Features

Strict Content Wall Pattern:
[ claim | claim ] → [ ---quote--- ] → [ meme | meme ] → [ ---quote--- ] (repeats)
Pattern never breaks, even if content is unbalanced
Progressive Loading:
Fast initial load, infinite scroll, and SSR hydration
Content Types:
Claims, Quotes, Memes (with YouTube video support)
Smart Fallbacks:
Graceful substitution if a content type runs out
Search & Filtering:
Real-time, dash/underscore-insensitive search
Image & Markdown Automation:
Scripts for image optimization and markdown generation
Modern UI:
Responsive, accessible, and visually consistent

## 🏗️ Architecture

Nuxt 3 + Nuxt Content v3
Pattern Engine: interleaveContent.js (single source of layout truth)
Content Cache: useContentCache.js (reactive, SSR-friendly)
Wall Components:
ClaimPanel, QuotePanel, MemePanel, TheWall
Infinite Scroll:
useInfiniteScroll.js
Image Processing:
Scripts in scripts for batch optimization and markdown creation
🛠️ Getting Started

1. Install dependencies
2. Run the development server
   Visit http://localhost:3000 to view the app.

3. Process Images & Markdown (optional)
   🧩 Content Structure
   claims — Markdown files for claims
   quotes — Markdown files for quotes
   memes — Markdown files for memes (images or YouTube videos)
   memes — Meme images (auto-processed)

## 🧑‍💻 Development

Format code:
Lint & fix:
Custom scripts: See README.md for details

## 📦 Build & Deploy

Build for production:
Preview production build:
Deploy:
See Nuxt deployment docs

## 📝 Project Conventions

Single pattern engine: Only use interleaveContent.js for wall layout
No individual claim/meme types: Only claimPair, quote, memeRow in the pattern
Ignore files/folders starting with \_
SSR state via useState()
Content loaded once, cached reactively

## 🤝 Contributing

PRs and suggestions are welcome! Please follow the project’s conventions and check the scripts/README for automation tips.

## 📚 More Info

Nuxt Documentation
Nuxt Content
Tailwind CSS
© WakeUpNPC2, 2025
