import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const grifts = [
  {
    filename: 'democratic-socialism.md',
    title: 'Democratic Socialism',
    grift: 'Democratic Socialism',
    decode: 'Socialism',
  },
  {
    filename: 'toxic-masculinity.md',
    title: 'Toxic Masculinity',
    grift: 'Toxic Masculinity',
    decode: 'Straight White Male',
  },
  {
    filename: 'political-correctness.md',
    title: 'Political Correctness',
    grift: 'Political Correctness',
    decode: 'Controlling Speech',
  },
  {
    filename: 'assault-weapon.md',
    title: 'Assault Weapon',
    grift: 'Assault Weapon',
    decode: 'Any Gun',
  },
  {
    filename: 'identify-as.md',
    title: 'Identify as',
    grift: 'Identify as',
    decode: 'Pretending to be',
  },
  {
    filename: 'pro-choice.md',
    title: 'Pro-Choice',
    grift: 'Pro-Choice',
    decode: 'Legalized Murder',
  },
  {
    filename: 'undocumented.md',
    title: 'Undocumented',
    grift: 'Undocumented',
    decode: 'Illegal or New Voter',
  },
  {
    filename: 'news-reporting.md',
    title: 'News Reporting',
    grift: 'News Reporting',
    decode: 'Leftist Talking Points',
  },
  {
    filename: 'climate-change.md',
    title: 'Climate Change',
    grift: 'Climate Change',
    decode: 'Another Tax Opportunity',
  },
  {
    filename: 'inequality.md',
    title: 'Inequality',
    grift: 'Inequality',
    decode: 'Your money should be theirs',
  },
  {
    filename: 'racist-fascist-nazi.md',
    title: 'Racist, Fascist, Nazi',
    grift: 'Racist, Fascist, Nazi',
    decode: 'Anybody who disagrees with leftists',
  },
]

function createMarkdownContent(grift, decode, title) {
  return `---
title: '${title}'
grift: '${grift}'
decode: '${decode}'
---
## "${grift}"
## ${decode}
`
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../content/grifts')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Generate all markdown files
grifts.forEach((item) => {
  const content = createMarkdownContent(item.grift, item.decode, item.title)
  const filepath = path.join(outputDir, item.filename)
  fs.writeFileSync(filepath, content, 'utf8')
  console.log(`✓ Created: ${item.filename}`)
})

console.log(
  `\n✓ Successfully generated all ${grifts.length} markdown files in 'content/grifts/' directory!`
)
