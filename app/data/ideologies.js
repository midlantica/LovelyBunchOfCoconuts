// Ideologies grouped by category for easier management
export const ideologyGroups = {
  Freedom: [
    'Individualism',
    'Limited Government',
    'Free Markets',
    'Responsibility',
    'Rule of Law',
    'Property Rights',
    'Free Speech',
    'Tradition',
    'Capitalism',
    'Self-Reliance',
    'Constitutionalism',
    'Meritocracy',
    'Religious Liberty',
    'Voluntary Exchange',
    'Natural Rights',
    'Decentralization',
    'Patriotism',
    'Freedom',
    'Pro-Life',
    'Conservativism',
  ],
  Collectivism: [
    'Authoritarianism',
    'Class',
    'Collectivism',
    'Social Equality',
    'State Ownership',
    'Redistribution',
    'Proletariat',
    'Central Planning',
    'Social Justice',
    'Utilitarianism',
    'Solidarity',
    'Abolition of Property',
    'Revolution',
    'Egalitarianism',
    'State Control',
    'Anti-Capitalism',
    'Welfare',
    'Dialectical Materialism',
    'Progressive Change',
    'Centralized Power',
    'Fascism',
    'Socialism',
    'Communism',
    'Marxism',
    'Maoism',
    'Progressive',
    'Equality',
    'LGBT',
    'Abortion',
  ],
}

// Convert grouped structure to flat array format for backward compatibility
let idCounter = 1
export const ideologies = []

for (const [group, terms] of Object.entries(ideologyGroups)) {
  for (const term of terms) {
    ideologies.push({
      id: idCounter++,
      term,
      group,
    })
  }
}

// Helper function to add new terms
export function addTerm(group, term) {
  if (!ideologyGroups[group]) {
    ideologyGroups[group] = []
  }
  ideologyGroups[group].push(term)

  // Rebuild the flat array
  ideologies.length = 0
  idCounter = 1
  for (const [g, terms] of Object.entries(ideologyGroups)) {
    for (const t of terms) {
      ideologies.push({
        id: idCounter++,
        term: t,
        group: g,
      })
    }
  }
}

// Helper function to get all terms for a specific group
export function getTermsByGroup(group) {
  return ideologyGroups[group] || []
}

// Helper function to get all groups
export function getGroups() {
  return Object.keys(ideologyGroups)
}
