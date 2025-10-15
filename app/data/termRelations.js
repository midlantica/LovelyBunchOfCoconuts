// Lightweight term relations used to expand search queries.
// Keys are lowercase; phrase keys use spaces.
// Keep lists short to reduce noise.
export const TERM_RELATIONS = {
  'pro-life': [
    'right to life',
    'abortion',
    'reproductive rights',
    'choice',
    'my body my choice',
    'body',
    'baby',
    'pro life',
  ],
  equality: [
    'egalitarianism',
    'equal rights',
    'social equality',
    'equity',
    'equal opportunity',
  ],
  conservatism: ['traditionalism', 'right-wing', 'change', 'revolution'],
  liberty: [
    'freedom',
    'individualism',
    'individual',
    'civil liberties',
    'personal freedom',
  ],
  individual: [
    'freedom',
    'individualism',
    'civil liberties',
    'personal freedom',
  ],
  individualism: [
    'freedom',
    'individual',
    'civil liberties',
    'personal freedom',
  ],
  freedom: ['liberty', 'individualism', 'individual', 'free speech'],
  speech: ['free speech', 'expression', 'freedom of expression'],
  capitalism: [
    'free market',
    'free markets',
    'freedom',
    'market economy',
    'private enterprise',
    'hayek',
    'mises',
    'capitalism',
    'capitalist',
    'capital',
  ],
  // Support phrase keys in lowercase with spaces
  'free markets': [
    'capitalism',
    'freedom',
    'market economy',
    'private enterprise',
    'free market',
  ],
  socialism: [
    'collectivism',
    'state ownership',
    'planned economy',
    'maoism',
    'maoist',
    'mao',
    'fascism',
    'fascist',
    'nazism',
    'nazi',
  ],
  maoism: [
    'collectivism',
    'state ownership',
    'planned economy',
    'socialism',
    'fascism',
    'mao',
    'maoist',
  ],
  collectivism: [
    'socialism',
    'communism',
    'communalism',
    'maoism',
    'collectivism',
    'fascism',
    'marxism',
    'nazism',
  ],
  redistribution: ['wealth redistribution', 'reparations'],
  justice: ['social justice', 'equity'],
  meritocracy: ['merit', 'achievement'],
  patriotism: ['national pride', 'love of country'],
  authoritarianism: ['state control', 'centralized power'],
  decentralization: ['federalism', 'subsidiarity', 'local control'],
  rights: ['natural rights', 'human rights', 'civil rights'],
  property: ['property rights', 'private property'],
  market: ['free market', 'capitalism', 'market economy', 'meritocracy'],
  revolution: [
    'radical change',
    'uprising',
    'rebellion',
    'insurrection',
    'destruction',
  ],
  // Prefer space-normalized, lowercase keys for phrases
  'equality before the law': ['rule of law', 'equal protection'],
  axis: ['axes', 'spectrum'],
  sex: ['sexist', 'gender'],
  conservativism: [
    'conservative',
    'traditionalist',
    'right-wing',
    'stability',
    'revolution',
    'Burke',
  ],
  // Content type keywords for filtering
  grifts: ['grift', 'statement', 'assertion', 'position'],
  grift: ['grifts', 'statement', 'assertion', 'position'],
  quotes: ['quote', 'quotation', 'saying', 'citation'],
  quote: ['quotes', 'quotation', 'saying', 'citation'],
  memes: ['meme', 'image', 'picture', 'graphic'],
  meme: ['memes', 'image', 'picture', 'graphic'],
}

export function expandSearchTerms(q = '') {
  const raw = String(q).trim().toLowerCase()
  if (!raw) return []
  // Normalize hyphens/underscores to spaces and collapse whitespace
  const norm = raw.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()

  // Lookup using normalized form; fall back to raw if needed
  const extras = TERM_RELATIONS[norm] || TERM_RELATIONS[raw] || []
  const out = new Set([norm, ...extras.map((s) => String(s).toLowerCase())])
  return Array.from(out)
}
