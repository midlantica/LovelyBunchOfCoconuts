import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const claims = [
  {
    filename: 'democratic-socialism.md',
    title: 'Democratic Socialism',
    claim: 'Democratic Socialism',
    translation: 'Socialism',
  },
  {
    filename: 'toxic-masculinity.md',
    title: 'Toxic Masculinity',
    claim: 'Toxic Masculinity',
    translation: 'Straight White Male',
  },
  {
    filename: 'political-correctness.md',
    title: 'Political Correctness',
    claim: 'Political Correctness',
    translation: 'Controlling Speech',
  },
  {
    filename: 'assault-weapon.md',
    title: 'Assault Weapon',
    claim: 'Assault Weapon',
    translation: 'Any Gun',
  },
  {
    filename: 'identify-as.md',
    title: 'Identify as',
    claim: 'Identify as',
    translation: 'Pretending to be',
  },
  {
    filename: 'pro-choice.md',
    title: 'Pro-Choice',
    claim: 'Pro-Choice',
    translation: 'Legalized Murder',
  },
  {
    filename: 'undocumented.md',
    title: 'Undocumented',
    claim: 'Undocumented',
    translation: 'Illegal or New Voter',
  },
  {
    filename: 'news-reporting.md',
    title: 'News Reporting',
    claim: 'News Reporting',
    translation: 'Leftist Talking Points',
  },
  {
    filename: 'climate-change.md',
    title: 'Climate Change',
    claim: 'Climate Change',
    translation: 'Another Tax Opportunity',
  },
  {
    filename: 'inequality.md',
    title: 'Inequality',
    claim: 'Inequality',
    translation: 'Your money should be theirs',
  },
  {
    filename: 'racist-fascist-nazi.md',
    title: 'Racist, Fascist, Nazi',
    claim: 'Racist, Fascist, Nazi',
    translation: 'Anybody who disagrees with leftists',
  },
]

function createMarkdownContent(claim, translation, title) {
  return `---
title: '${title}'
claim: '${claim}'
translation: '${translation}'
---
## "${claim}"
## ${translation}
`
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../content/claims')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Generate all markdown files
claims.forEach((item) => {
  const content = createMarkdownContent(
    item.claim,
    item.translation,
    item.title
  )
  const filepath = path.join(outputDir, item.filename)
  fs.writeFileSync(filepath, content, 'utf8')
  console.log(`✓ Created: ${item.filename}`)
})

console.log(
  `\n✓ Successfully generated all ${claims.length} markdown files in 'content/claims/' directory!`
)
