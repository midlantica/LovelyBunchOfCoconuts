#!/usr/bin/env node
/**
 * Scraper for readsowell.com/quotes
 * Fetches all Thomas Sowell quotes and saves each as a markdown file
 * Output: content/scraped-quotes/Thomas-Sowell/<slug>.md
 *
 * Strategy:
 * 1. Load /quotes page, click "Load More" until all quotes are visible
 * 2. Collect all /quotes/<slug> links
 * 3. Visit each individual quote page to get clean text + attribution
 * 4. Write markdown files
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUTPUT_DIR = path.join(__dirname, '..', 'content', 'scraped-quotes', 'Thomas-Sowell')
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

function toTitle(text) {
  const words = text
    .replace(/["\u201c\u201d\u2018\u2019]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ')
  return words.endsWith(',') ? words.slice(0, -1) : words
}

function cleanQuoteText(text) {
  return text
    .replace(/^\u201c/, '')
    .replace(/\u201d$/, '')
    .replace(/^"/, '')
    .replace(/"$/, '')
    .trim()
}

async function scrapeAllQuotes() {
  console.log('Launching browser...')
  const browser = await chromium.launch({ headless: true })

  // ── PHASE 1: Collect all quote slugs from the listing page ──────────────
  console.log('Phase 1: Collecting quote slugs from /quotes listing page...')
  const page = await browser.newPage()

  await page.goto('https://www.readsowell.com/quotes', {
    waitUntil: 'load',
    timeout: 60000,
  })

  // Wait for the page to hydrate - look for quote links
  console.log('Waiting for page to hydrate...')
  await page.waitForSelector('a[href^="/quotes/"]', { timeout: 30000 })

  let clickCount = 0
  const maxClicks = 25

  while (clickCount < maxClicks) {
    // Look for "Load More" button
    const loadMoreBtn = await page.$('button:has-text("Load More")')
    if (!loadMoreBtn) {
      console.log('No more "Load More" button. All quotes loaded.')
      break
    }

    const currentLinks = await page.$$eval('a[href^="/quotes/"]', (els) =>
      els.map((a) => a.getAttribute('href')).filter((h) => h && h !== '/quotes' && !h.includes('?') && h.split('/').length === 3)
    )
    console.log(`Links so far: ${[...new Set(currentLinks)].length}. Clicking "Load More"...`)

    await loadMoreBtn.scrollIntoViewIfNeeded()
    await loadMoreBtn.click()

    // Wait for new links to appear
    const prevCount = [...new Set(currentLinks)].length
    await page.waitForFunction(
      (prev) => {
        const links = Array.from(document.querySelectorAll('a[href^="/quotes/"]'))
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && h !== '/quotes' && !h.includes('?') && h.split('/').length === 3)
        return [...new Set(links)].length > prev
      },
      prevCount,
      { timeout: 15000 }
    ).catch(() => console.log('Timeout waiting for new links, continuing...'))

    await page.waitForTimeout(800)
    clickCount++
  }

  // Collect all unique quote slugs
  const allLinks = await page.$$eval('a[href^="/quotes/"]', (els) =>
    els.map((a) => a.getAttribute('href')).filter((h) => h && h !== '/quotes' && !h.includes('?') && h.split('/').length === 3)
  )
  const uniqueSlugs = [...new Set(allLinks)].map((l) => l.replace('/quotes/', ''))
  console.log(`\nFound ${uniqueSlugs.length} unique quote slugs`)

  await page.close()

  // ── PHASE 2: Visit each individual quote page ────────────────────────────
  console.log('\nPhase 2: Fetching individual quote pages...')
  const page2 = await browser.newPage()

  const allQuoteData = []
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < uniqueSlugs.length; i++) {
    const slug = uniqueSlugs[i]
    const url = `https://www.readsowell.com/quotes/${slug}`

    try {
      process.stdout.write(`[${i + 1}/${uniqueSlugs.length}] ${slug} ... `)

      await page2.goto(url, { waitUntil: 'load', timeout: 30000 })

      // Wait for content to appear - look for the quote text area
      await page2.waitForSelector('main', { timeout: 10000 }).catch(() => {})
      await page2.waitForTimeout(500)

      const data = await page2.evaluate(() => {
        // Try blockquote first
        const blockquote = document.querySelector('blockquote')
        let quoteText = blockquote?.textContent?.trim() || ''

        // Fallback: look for large italic text or heading with quote
        if (!quoteText) {
          const h1 = document.querySelector('h1')
          quoteText = h1?.textContent?.trim() || ''
        }

        // Get body text for attribution parsing
        const bodyText = document.body.innerText || ''

        // Parse attribution: look for em dash pattern
        // Pattern: — Book Title (Year), § Section
        const sourceMatch = bodyText.match(/[—–]\s*\n?\s*([^\n(]+?)(?:\s*\((\d{4})\))?(?:\s*,\s*§?\s*([^\n]+))?\n/)
        const source = sourceMatch?.[1]?.trim() || ''
        const year = sourceMatch?.[2] || ''
        const section = sourceMatch?.[3]?.trim() || ''

        // Try JSON-LD structured data
        let structuredQuote = ''
        let structuredSource = ''
        document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
          try {
            const parsed = JSON.parse(s.textContent)
            const items = parsed['@graph'] ? parsed['@graph'] : [parsed]
            items.forEach((item) => {
              if (item['@type'] === 'Quotation' || item['@type'] === 'Quote') {
                structuredQuote = item.text || item.description || ''
                structuredSource = item.isPartOf?.name || item.author?.name || ''
              }
            })
          } catch (e) {}
        })

        // Use structured data if available and better
        if (structuredQuote && structuredQuote.length > quoteText.length) {
          quoteText = structuredQuote
        }

        // Get meta description as another fallback
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''

        return {
          quoteText,
          source,
          year,
          section,
          metaDesc,
          bodySnippet: bodyText.substring(0, 500),
        }
      })

      if (data.quoteText) {
        process.stdout.write(`✓\n`)
        allQuoteData.push({ slug, ...data })
        successCount++
      } else {
        // Try to extract from meta description
        const metaQuote = data.metaDesc.replace(/^"/, '').replace(/".*$/, '').trim()
        if (metaQuote.length > 20) {
          process.stdout.write(`✓ (meta)\n`)
          allQuoteData.push({ slug, quoteText: metaQuote, source: data.source, year: data.year, section: data.section })
          successCount++
        } else {
          process.stdout.write(`✗ (no text)\n`)
          errorCount++
        }
      }

      // Polite delay
      await page2.waitForTimeout(200)
    } catch (err) {
      process.stdout.write(`✗ ERROR: ${err.message.substring(0, 60)}\n`)
      errorCount++
    }
  }

  await browser.close()
  console.log(`\nFetched: ${successCount} ok, ${errorCount} errors`)

  // ── PHASE 3: Write markdown files ───────────────────────────────────────
  console.log('\nPhase 3: Writing markdown files...')
  let filesCreated = 0
  let filesSkipped = 0

  for (const quote of allQuoteData) {
    if (!quote.quoteText || quote.quoteText.length < 10) {
      filesSkipped++
      continue
    }

    const cleanText = cleanQuoteText(quote.quoteText)
    const title = toTitle(cleanText)

    // Build attribution
    let attribution = 'Thomas Sowell'
    if (quote.source) {
      attribution += `, *${quote.source}*`
      if (quote.year) attribution += ` (${quote.year})`
      if (quote.section) attribution += `, ${quote.section}`
    }

    const markdown = `---
title: '${title.replace(/'/g, "''")}'
---

## "${cleanText}"

${attribution}
`

    const filepath = path.join(OUTPUT_DIR, `${quote.slug}.md`)
    fs.writeFileSync(filepath, markdown, 'utf8')
    filesCreated++
  }

  console.log(`\n✅ Done!`)
  console.log(`   Created: ${filesCreated} markdown files`)
  console.log(`   Skipped: ${filesSkipped}`)
  console.log(`   Output:  ${OUTPUT_DIR}`)
}

scrapeAllQuotes().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
