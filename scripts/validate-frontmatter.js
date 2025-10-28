#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const PROBLEMATIC_CHARS = {
  '\u2014': 'em-dash (use regular hyphen - instead)',
  '\u2013': 'en-dash (use regular hyphen - instead)',
  '\u2018': "smart quote (use straight quote ' instead)",
  '\u2019': "smart quote (use straight quote ' instead)",
  '\u201C': 'smart quote (use straight quote " instead)',
  '\u201D': 'smart quote (use straight quote " instead)',
}

function validateFrontmatter(contentDir, exitOnError = false) {
  const fullPath = path.join(process.cwd(), contentDir)

  if (!fs.existsSync(fullPath)) {
    console.log(`Directory ${contentDir} does not exist`)
    return { valid: true, issues: [] }
  }

  const markdownFiles = fs
    .readdirSync(fullPath)
    .filter(
      (file) => file.endsWith('.md') && !file.toLowerCase().includes('readme')
    )
    .filter((file) => !file.startsWith('_'))

  const issues = []
  let totalFiles = 0
  let filesWithIssues = 0

  console.log(`\n🔍 Validating frontmatter in ${contentDir}...`)

  for (const file of markdownFiles) {
    totalFiles++
    const filePath = path.join(fullPath, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const fileIssues = []

    // Extract just the frontmatter for checking
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!frontmatterMatch) {
      fileIssues.push({
        file,
        issue: 'No valid frontmatter found',
        line: 0,
      })
    } else {
      const frontmatter = frontmatterMatch[1]
      const lines = frontmatter.split('\n')

      // Check each line for problematic characters
      lines.forEach((line, lineIndex) => {
        for (const [char, description] of Object.entries(PROBLEMATIC_CHARS)) {
          if (line.includes(char)) {
            const actualLine = lineIndex + 2 // +2 because we're inside --- markers
            fileIssues.push({
              file,
              issue: `Found ${description}`,
              line: actualLine,
              content: line.trim(),
              char: char,
            })
          }
        }
      })

      // Try to parse with gray-matter to catch other YAML issues
      try {
        matter(content)
      } catch (error) {
        fileIssues.push({
          file,
          issue: `YAML parsing error: ${error.message}`,
          line: error.mark?.line || 0,
        })
      }
    }

    if (fileIssues.length > 0) {
      filesWithIssues++
      issues.push(...fileIssues)

      console.log(`\n❌ ${file}:`)
      fileIssues.forEach((issue) => {
        console.log(`   Line ${issue.line}: ${issue.issue}`)
        if (issue.content) {
          console.log(`   "${issue.content}"`)
        }
      })
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Total files: ${totalFiles}`)
  console.log(`   Files with issues: ${filesWithIssues}`)
  console.log(`   Total issues: ${issues.length}`)

  const valid = issues.length === 0

  if (valid) {
    console.log(`\n✅ All frontmatter is valid!`)
  } else {
    console.log(
      `\n⚠️  Found ${issues.length} issue(s) in ${filesWithIssues} file(s)`
    )

    if (exitOnError) {
      console.log(`\n❌ Build failed due to frontmatter validation errors`)
      process.exit(1)
    }
  }

  return { valid, issues, filesChecked: totalFiles, filesWithIssues }
}

// Run validation
const args = process.argv.slice(2)
const exitOnError =
  args.includes('--exit-on-error') || args.includes('--strict')
const contentDir = args.find((arg) => !arg.startsWith('--')) || 'content/grifts'

validateFrontmatter(contentDir, exitOnError)
