// Simple, extensible synonyms/antonyms map (lowercase keys)
// Add more terms as needed. Keep lists short to avoid noise.
export const THESAURUS = {
  equality: [
    'egalitarianism',
    'equal rights',
    'social equality',
    'equity',
    'equal opportunity',
  ],
  liberty: ['freedom', 'individualism', 'civil liberties', 'personal freedom'],
  freedom: ['liberty', 'individualism', 'free speech'],
  speech: ['free speech', 'expression', 'freedom of expression'],
  capitalism: [
    'free market',
    'freedom',
    'market economy',
    'private enterprise',
  ],
  socialism: ['collectivism', 'state ownership', 'planned economy'],
  collectivism: ['socialism', 'communalism'],
  redistribution: ['wealth redistribution', 'reparations'],
  justice: ['social justice', 'equity'],
  meritocracy: ['merit', 'achievement-based'],
  patriotism: ['national pride', 'love of country'],
  authoritarianism: ['state control', 'centralized power'],
  decentralization: ['federalism', 'subsidiarity', 'local control'],
  rights: ['natural rights', 'human rights', 'civil rights'],
  property: ['property rights', 'private property'],
  market: ['free market', 'capitalism', 'market economy'],
  revolution: ['radical change', 'uprising'],
  equalityBeforeTheLaw: ['rule of law', 'equal protection'],
}

export function expandQueryTerms(q = '') {
  const key = String(q).trim().toLowerCase()
  if (!key) return []
  const extras = THESAURUS[key] || []
  return [key, ...extras.map((s) => String(s).toLowerCase())]
}
