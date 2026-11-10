import type { MissionCard } from '../../types/game'

/** 8 secret mission cards, one dealt to each character. */
export const MISSION_CARDS: MissionCard[] = [
  {
    id: 'ms-rally',
    title: 'Rally the Districts',
    briefing:
      'Ordinary people are waiting for someone to tell them what to do. Help two shelters hold together.',
    objective: { kind: 'help', target: 2 },
    reward: [{ kind: 'resource', resource: 'trust', amount: 2 }],
  },
  {
    id: 'ms-substation',
    title: 'Restore the Substation',
    briefing:
      'Bring Kessler back on your own terms. Two repairs at the Power Station and the district breathes again.',
    objective: { kind: 'repair', target: 2, locationId: 'power' },
    reward: [
      { kind: 'resource', resource: 'energy', amount: 3 },
      { kind: 'resource', resource: 'trust', amount: 1 },
    ],
  },
  {
    id: 'ms-file',
    title: 'Close the File',
    briefing:
      'One clean piece of evidence is all it takes. Recover a mystery clue before the city stops caring.',
    objective: { kind: 'clue', target: 1 },
    reward: [
      { kind: 'resource', resource: 'trust', amount: 2 },
      { kind: 'item', itemId: 'notebook' },
    ],
  },
  {
    id: 'ms-field-hospital',
    title: 'Field Hospital',
    briefing:
      'St. Brigid\u2019s cannot hold. Help two shifts there and keep the ward breathing until dawn.',
    objective: { kind: 'help', target: 2, locationId: 'hospital' },
    reward: [{ kind: 'health', amount: 20, target: 'all' }],
  },
  {
    id: 'ms-stockpile',
    title: 'Stockpile',
    briefing:
      'The city runs on calories. Gather food twice from the ruins before someone else gets there first.',
    objective: { kind: 'gatherFood', target: 2 },
    reward: [
      { kind: 'resource', resource: 'food', amount: 2 },
      { kind: 'resource', resource: 'water', amount: 2 },
    ],
  },
  {
    id: 'ms-samples',
    title: 'Lab Samples',
    briefing:
      'The Annex holds the truth in sealed trays. Investigate the Research Lab twice.',
    objective: { kind: 'investigate', target: 2, locationId: 'lab' },
    reward: [
      { kind: 'resource', resource: 'energy', amount: 2 },
      { kind: 'item', itemId: 'battery' },
    ],
  },
  {
    id: 'ms-record',
    title: 'The Public Record',
    briefing:
      'No broadcast, no accountability. Investigate twice anywhere in the city and put it on the record.',
    objective: { kind: 'investigate', target: 2 },
    reward: [{ kind: 'resource', resource: 'trust', amount: 3 }],
  },
  {
    id: 'ms-hold-line',
    title: 'Hold the Line',
    briefing:
      'Precinct Nine is the last organised building in the district. Repair it once and keep the lights on.',
    objective: { kind: 'repair', target: 1, locationId: 'police' },
    reward: [
      { kind: 'resource', resource: 'trust', amount: 1 },
      { kind: 'resource', resource: 'energy', amount: 1 },
    ],
  },
]

export const MISSION_MAP: Record<string, MissionCard> = MISSION_CARDS.reduce(
  (acc, card) => {
    acc[card.id] = card
    return acc
  },
  {} as Record<string, MissionCard>,
)

/** Each character draws their signature mission. */
export const CHARACTER_MISSION: Record<string, string> = {
  leader: 'ms-rally',
  engineer: 'ms-substation',
  detective: 'ms-file',
  doctor: 'ms-field-hospital',
  survivor: 'ms-stockpile',
  scientist: 'ms-samples',
  journalist: 'ms-record',
  security: 'ms-hold-line',
}
