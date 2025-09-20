#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')

// Create dummy ad images
const ads = [
  // Small ads (378x378)
  {
    name: 'ad-small-1.png',
    width: 378,
    height: 378,
    text: 'Ad 1',
    bg: '#4A5568',
  },
  {
    name: 'ad-small-2.png',
    width: 378,
    height: 378,
    text: 'Ad 2',
    bg: '#2D3748',
  },
  {
    name: 'ad-small-3.png',
    width: 378,
    height: 378,
    text: 'Ad 3',
    bg: '#1A202C',
  },

  // Large ads (768x100)
  {
    name: 'ad-large-1.png',
    width: 768,
    height: 100,
    text: 'Large Ad 1',
    bg: '#4A5568',
  },
  {
    name: 'ad-large-2.png',
    width: 768,
    height: 100,
    text: 'Large Ad 2',
    bg: '#2D3748',
  },
  {
    name: 'ad-large-3.png',
    width: 768,
    height: 100,
    text: 'Large Ad 3',
    bg: '#1A202C',
  },
]

const adsDir = path.join(__dirname, '../public/ads')

ads.forEach((ad) => {
  const canvas = createCanvas(ad.width, ad.height)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = ad.bg
  ctx.fillRect(0, 0, ad.width, ad.height)

  // Text
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(ad.text, ad.width / 2, ad.height / 2)

  // Save
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(adsDir, ad.name), buffer)
  console.log(`Created ${ad.name}`)
})

console.log('All dummy ads created!')
