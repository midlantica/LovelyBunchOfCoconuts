#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes the production build to identify large files and optimization opportunities
 */

const fs = require('fs')
const path = require('path')

const OUTPUT_DIR = path.join(__dirname, '..', '.output', 'public')

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (e) {
    return 0
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function analyzeDirectory(dir, results = [], prefix = '') {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`)
    return results
  }

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      analyzeDirectory(filePath, results, prefix + file + '/')
    } else {
      const size = stat.size
      const ext = path.extname(file)
      results.push({
        path: prefix + file,
        size,
        ext,
        type: getFileType(ext),
      })
    }
  }

  return results
}

function getFileType(ext) {
  const types = {
    '.js': 'JavaScript',
    '.css': 'CSS',
    '.wasm': 'WebAssembly',
    '.json': 'JSON',
    '.txt': 'Text',
    '.html': 'HTML',
    '.svg': 'SVG',
    '.png': 'PNG',
    '.jpg': 'JPEG',
    '.jpeg': 'JPEG',
    '.webp': 'WebP',
    '.avif': 'AVIF',
    '.gif': 'GIF',
    '.ico': 'Icon',
    '.woff': 'Font',
    '.woff2': 'Font',
    '.ttf': 'Font',
    '.eot': 'Font',
  }
  return types[ext] || 'Other'
}

function groupByType(files) {
  const groups = {}

  for (const file of files) {
    if (!groups[file.type]) {
      groups[file.type] = {
        files: [],
        totalSize: 0,
        count: 0,
      }
    }
    groups[file.type].files.push(file)
    groups[file.type].totalSize += file.size
    groups[file.type].count++
  }

  return groups
}

function main() {
  console.log('🔍 Analyzing bundle sizes...\n')

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error('❌ Build output not found. Run `pnpm run build` first.\n')
    process.exit(1)
  }

  const files = analyzeDirectory(OUTPUT_DIR)
  const groups = groupByType(files)

  // Sort files by size
  files.sort((a, b) => b.size - a.size)

  // Print summary by type
  console.log('📊 Summary by File Type:\n')
  console.log('Type'.padEnd(20) + 'Count'.padEnd(10) + 'Total Size')
  console.log('-'.repeat(50))

  const sortedTypes = Object.entries(groups).sort(
    (a, b) => b[1].totalSize - a[1].totalSize
  )

  let totalSize = 0
  for (const [type, data] of sortedTypes) {
    console.log(
      type.padEnd(20) +
        data.count.toString().padEnd(10) +
        formatBytes(data.totalSize)
    )
    totalSize += data.totalSize
  }

  console.log('-'.repeat(50))
  console.log('TOTAL'.padEnd(30) + formatBytes(totalSize))

  // Print largest files
  console.log('\n\n📦 Top 20 Largest Files:\n')
  console.log('Size'.padEnd(12) + 'Type'.padEnd(15) + 'Path')
  console.log('-'.repeat(80))

  for (let i = 0; i < Math.min(20, files.length); i++) {
    const file = files[i]
    console.log(
      formatBytes(file.size).padEnd(12) +
        file.type.padEnd(15) +
        file.path.substring(0, 50)
    )
  }

  // Identify optimization opportunities
  console.log('\n\n💡 Optimization Opportunities:\n')

  // Check for WASM files
  const wasmFiles = files.filter((f) => f.ext === '.wasm')
  if (wasmFiles.length > 0) {
    console.log('⚠️  WebAssembly files detected:')
    wasmFiles.forEach((f) => {
      console.log(`   - ${f.path} (${formatBytes(f.size)})`)
    })
    console.log(
      '   → Consider lazy loading WASM files or removing if not needed\n'
    )
  }

  // Check for large JS files
  const largeJS = files.filter((f) => f.ext === '.js' && f.size > 100000)
  if (largeJS.length > 0) {
    console.log('⚠️  Large JavaScript files (>100KB):')
    largeJS.forEach((f) => {
      console.log(`   - ${f.path} (${formatBytes(f.size)})`)
    })
    console.log('   → Consider code splitting and tree shaking\n')
  }

  // Check for SQL dumps
  const sqlDumps = files.filter((f) => f.path.includes('sql_dump'))
  if (sqlDumps.length > 0) {
    console.log('⚠️  SQL dump files detected:')
    sqlDumps.forEach((f) => {
      console.log(`   - ${f.path} (${formatBytes(f.size)})`)
    })
    console.log('   → Consider using JSON API endpoints instead\n')
  }

  // Check for uncompressed images
  const images = files.filter((f) => ['.png', '.jpg', '.jpeg'].includes(f.ext))
  if (images.length > 0) {
    const totalImageSize = images.reduce((sum, f) => sum + f.size, 0)
    console.log(
      `⚠️  ${images.length} uncompressed images (${formatBytes(totalImageSize)} total)`
    )
    console.log('   → Consider converting to WebP/AVIF format\n')
  }

  // Check for duplicate files
  const filesByName = {}
  for (const file of files) {
    const name = path.basename(file.path)
    if (!filesByName[name]) {
      filesByName[name] = []
    }
    filesByName[name].push(file)
  }

  const duplicates = Object.entries(filesByName).filter(
    ([, files]) => files.length > 1
  )
  if (duplicates.length > 0) {
    console.log('⚠️  Potential duplicate files:')
    duplicates.slice(0, 5).forEach(([name, files]) => {
      console.log(`   - ${name} (${files.length} copies)`)
    })
    if (duplicates.length > 5) {
      console.log(`   ... and ${duplicates.length - 5} more`)
    }
    console.log()
  }

  console.log('\n✅ Analysis complete!\n')
}

main()
