#!/usr/bin/env node

import path from 'path'
import { fileURLToPath } from 'url'
import { processImages } from './utils/imageProcessing.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)

const subdirName = args[0]
const targetDir = subdirName
  ? path.join(__dirname, '..', 'public', 'memes', subdirName)
  : path.join(__dirname, '..', 'public', 'memes')

const displayPath = subdirName ? `public/memes/${subdirName}` : 'public/memes'
console.log(`Processing images in: ${displayPath}`)

processImages(targetDir)
  .then(() => {
    console.log('Image processing complete.')
  })
  .catch((err) => {
    console.error('Image processing failed:', err)
    process.exit(1)
  })
