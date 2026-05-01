// Acts grouped by category — covers comedians, duos, and shows equally.
export const actGroups = {
  Acts: [
    'Benny Hill',
    'Douglas Adams',
    'Eric Morecambe',
    'French & Saunders',
    'Graham Chapman',
    'John Cleese',
    'Oscar Wilde',
    'P.G. Wodehouse',
    'Peter Sellers',
    'Rowan Atkinson',
    'Spike Milligan',
    'Stephen Fry',
    'The Two Ronnies',
    'Tony Hancock',
    'Victoria Wood',
  ],
}

// Convert grouped structure to flat array format
let idCounter = 1
export const acts = []

for (const [group, names] of Object.entries(actGroups)) {
  for (const name of names) {
    acts.push({
      id: idCounter++,
      term: name,
      group,
    })
  }
}

// Helper function to add new acts
export function addAct(group, name) {
  if (!actGroups[group]) {
    actGroups[group] = []
  }
  actGroups[group].push(name)

  // Rebuild the flat array
  acts.length = 0
  idCounter = 1
  for (const [g, names] of Object.entries(actGroups)) {
    for (const n of names) {
      acts.push({
        id: idCounter++,
        term: n,
        group: g,
      })
    }
  }
}

// Helper function to get all names for a specific group
export function getActsByGroup(group) {
  return actGroups[group] || []
}

// Helper function to get all groups
export function getGroups() {
  return Object.keys(actGroups)
}
