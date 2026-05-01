// Lightweight term relations used to expand search queries.
// Keys are lowercase; phrase keys use spaces.
// Keep lists short to reduce noise.
export const TERM_RELATIONS = {
  // Comedian name aliases / common references
  'benny hill': ['hill', 'benny', 'slapstick', 'bbc'],
  'douglas adams': ['adams', 'hitchhiker', 'hitchhikers guide', 'galaxy', 'ford prefect'],
  'eric morecambe': ['morecambe', 'morecambe and wise', 'ernie wise'],
  'french & saunders': ['french', 'saunders', 'dawn french', 'jennifer saunders', 'absolutely fabulous', 'ab fab'],
  'graham chapman': ['chapman', 'monty python', 'python'],
  'john cleese': ['cleese', 'fawlty towers', 'fawlty', 'monty python', 'python', 'basil'],
  'oscar wilde': ['wilde', 'importance of being earnest', 'dorian gray', 'wit'],
  'p.g. wodehouse': ['wodehouse', 'jeeves', 'wooster', 'bertie', 'pg wodehouse'],
  'peter sellers': ['sellers', 'pink panther', 'inspector clouseau', 'dr strangelove'],
  'rowan atkinson': ['atkinson', 'mr bean', 'bean', 'blackadder', 'edmund blackadder'],
  'spike milligan': ['milligan', 'goon show', 'goons'],
  'stephen fry': ['fry', 'fry and laurie', 'jeeves', 'qi'],
  'the two ronnies': ['two ronnies', 'ronnie barker', 'ronnie corbett', 'barker', 'corbett'],
  'tony hancock': ['hancock', 'hancocks half hour', 'half hour'],
  'victoria wood': ['wood', 'dinnerladies', 'acorn antiques'],

  // Shorthand lookups (so typing just a surname still works)
  hill: ['benny hill'],
  cleese: ['john cleese', 'fawlty towers', 'monty python'],
  atkinson: ['rowan atkinson', 'mr bean', 'blackadder'],
  wilde: ['oscar wilde'],
  wodehouse: ['p.g. wodehouse', 'jeeves', 'wooster'],
  python: ['monty python', 'john cleese', 'graham chapman'],
  'monty python': ['john cleese', 'graham chapman', 'python'],
  blackadder: ['rowan atkinson', 'blackadder'],
  'mr bean': ['rowan atkinson', 'bean'],
  'fawlty towers': ['john cleese', 'fawlty'],
  'goon show': ['spike milligan', 'goons'],
  jeeves: ['p.g. wodehouse', 'stephen fry'],

  // Content type keywords for filtering
  grifts: ['grift', 'statement', 'assertion', 'position'],
  grift: ['grifts', 'statement', 'assertion', 'position'],
  quotes: ['quote', 'quotation', 'saying', 'citation'],
  quote: ['quotes', 'quotation', 'saying', 'citation'],
  memes: ['meme', 'image', 'picture', 'graphic'],
  meme: ['memes', 'image', 'picture', 'graphic'],
  posts: ['post', 'article', 'blog'],
  post: ['posts', 'article', 'blog'],
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
