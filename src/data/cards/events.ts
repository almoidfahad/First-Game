import type { EventCard } from '../../types/game'

/** 20 event cards, drawn in a seeded order — one per round. */
export const EVENT_CARDS: EventCard[] = [
  {
    id: 'ev-01',
    title: 'The Blackout Deepens',
    subtitle: 'Grid failure — sector four',
    text: 'The last working transformer on Kessler Street trips. Three more blocks go dark and the city\u2019s confidence goes with them.',
    rarity: 'common',
    alert: 'critical',
    effects: [
      { kind: 'resource', resource: 'energy', amount: -1 },
      { kind: 'resource', resource: 'trust', amount: -1 },
    ],
  },
  {
    id: 'ev-02',
    title: 'Hospital Overflow',
    subtitle: 'St. Brigid\u2019s is out of beds',
    text: 'Casualties are being treated in the car park. They need water far more than they need medicine.',
    rarity: 'common',
    alert: 'warning',
    effects: [
      { kind: 'resource', resource: 'water', amount: -1 },
      { kind: 'resource', resource: 'trust', amount: 1 },
    ],
  },
  {
    id: 'ev-03',
    title: 'Looting at the Mall',
    subtitle: 'Kestrel Arcade breached',
    text: 'A crowd breaks the shutters at the arcade. Half of them are taking food; the other half are taking everything.',
    rarity: 'common',
    alert: 'warning',
    effects: [
      { kind: 'resource', resource: 'food', amount: -1 },
      { kind: 'resource', resource: 'trust', amount: -1 },
      { kind: 'health', amount: -3, target: 'all' },
    ],
  },
  {
    id: 'ev-04',
    title: 'Static on Every Band',
    subtitle: 'No signal',
    text: 'Every frequency is dead air except one that plays a single tone, over and over. Nobody knows where it comes from.',
    rarity: 'common',
    alert: 'calm',
    effects: [{ kind: 'item', itemId: 'flares' }],
  },
  {
    id: 'ev-05',
    title: 'The Voice on 88.1',
    subtitle: 'A broadcast from the tower',
    text: 'A calm voice reads out shelter addresses and a single instruction: stay above the fourth floor. The tower is still transmitting.',
    rarity: 'uncommon',
    alert: 'calm',
    effects: [
      { kind: 'resource', resource: 'trust', amount: 1 },
      { kind: 'unlock', locationId: 'radio' },
    ],
  },
  {
    id: 'ev-06',
    title: 'Generator Fumes',
    subtitle: 'Carbon monoxide — basement level',
    text: 'The diesel generator in the police basement vents into a stairwell. Two officers are found unconscious.',
    rarity: 'uncommon',
    alert: 'warning',
    effects: [
      { kind: 'health', amount: -5, target: 'all' },
      { kind: 'resource', resource: 'energy', amount: 1 },
    ],
  },
  {
    id: 'ev-07',
    title: 'Ration Riot',
    subtitle: 'Food queue turns violent',
    text: 'A rumour spreads that the ration depot is holding back stock. It is true. The queue does not care about the difference.',
    rarity: 'rare',
    alert: 'critical',
    effects: [
      { kind: 'resource', resource: 'trust', amount: -2 },
      { kind: 'resource', resource: 'food', amount: -1 },
    ],
  },
  {
    id: 'ev-08',
    title: 'Pharmacy Cache',
    subtitle: 'Sealed supplies recovered',
    text: 'A back room at St. Brigid\u2019s still has intact dressings, saline and a case of painkillers nobody has logged.',
    rarity: 'uncommon',
    alert: 'calm',
    effects: [
      { kind: 'item', itemId: 'medkit' },
      { kind: 'resource', resource: 'water', amount: 1 },
    ],
  },
  {
    id: 'ev-09',
    title: 'Rain Over the District',
    subtitle: 'Clean water, uncounted',
    text: 'The first rain in nine days comes down hard on the flat roofs. Anyone with a bucket is suddenly rich.',
    rarity: 'common',
    alert: 'calm',
    effects: [{ kind: 'resource', resource: 'water', amount: 2 }],
  },
  {
    id: 'ev-10',
    title: 'Cold Snap',
    subtitle: 'Temperature falling',
    text: 'The blackout killed the heating. Overnight the city drops below freezing and the shelters run out of blankets.',
    rarity: 'common',
    alert: 'warning',
    effects: [
      { kind: 'health', amount: -4, target: 'all' },
      { kind: 'resource', resource: 'food', amount: -1 },
    ],
  },
  {
    id: 'ev-11',
    title: 'Surge in the Subgrid',
    subtitle: 'Uncontrolled feedback',
    text: 'A backfeed from the Annex blows a row of breakers but dumps usable charge into the district batteries.',
    rarity: 'uncommon',
    alert: 'warning',
    effects: [
      { kind: 'resource', resource: 'energy', amount: 2 },
      { kind: 'infrastructure', locationId: 'lab', amount: -1 },
    ],
  },
  {
    id: 'ev-12',
    title: 'Curfew Declared',
    subtitle: 'Movement restricted',
    text: 'The remaining council members impose a curfew over the whole district. It restores order and costs electricity to enforce.',
    rarity: 'common',
    alert: 'warning',
    effects: [
      { kind: 'resource', resource: 'trust', amount: -1 },
      { kind: 'resource', resource: 'energy', amount: 1 },
    ],
  },
  {
    id: 'ev-13',
    title: 'Missing Persons',
    subtitle: 'Seventeen unaccounted for',
    text: 'Names go up on the hospital wall faster than anyone can cross them off. Two of the names belong to volunteers.',
    rarity: 'rare',
    alert: 'critical',
    effects: [
      { kind: 'resource', resource: 'trust', amount: -1 },
      { kind: 'health', amount: -4, target: 'all' },
    ],
  },
  {
    id: 'ev-14',
    title: 'Underground Tremor',
    subtitle: 'Freight Line Zero',
    text: 'A low shudder rolls under the streets. The tunnel\u2019s service door has been pushed outward by something below.',
    rarity: 'uncommon',
    alert: 'warning',
    effects: [
      { kind: 'infrastructure', locationId: 'tunnel', amount: -1 },
      { kind: 'unlock', locationId: 'tunnel' },
    ],
  },
  {
    id: 'ev-15',
    title: 'A Signal From Below',
    subtitle: 'Pattern detected',
    text: 'A repeating pulse under the Annex, eleven seconds apart. It is not interference — it is a heartbeat with a schedule.',
    rarity: 'uncommon',
    alert: 'calm',
    effects: [
      { kind: 'resource', resource: 'trust', amount: 1 },
      { kind: 'resource', resource: 'energy', amount: 1 },
    ],
  },
  {
    id: 'ev-16',
    title: 'The Library Cache',
    subtitle: 'Archive basement opened',
    text: 'A caretaker opens the basement of the Old Library. Inside: planning files, a working lamp and a notebook somebody hid on purpose.',
    rarity: 'uncommon',
    alert: 'calm',
    effects: [
      { kind: 'item', itemId: 'notebook' },
      { kind: 'resource', resource: 'trust', amount: 1 },
    ],
  },
  {
    id: 'ev-17',
    title: 'Panic Broadcast',
    subtitle: 'Unauthorised transmission',
    text: 'Someone hijacks the emergency band to announce that the city is being abandoned. Half the shelters empty in an hour.',
    rarity: 'rare',
    alert: 'critical',
    effects: [
      { kind: 'resource', resource: 'trust', amount: -2 },
      { kind: 'unlock', locationId: 'radio' },
    ],
  },
  {
    id: 'ev-18',
    title: 'Volunteer Medics',
    subtitle: 'Reinforcements from the north',
    text: 'A team of off-duty nurses arrives with clean water and a working defibrillator. They ask only for somewhere to sleep.',
    rarity: 'uncommon',
    alert: 'calm',
    effects: [
      { kind: 'health', amount: 8, target: 'all' },
      { kind: 'resource', resource: 'water', amount: 1 },
    ],
  },
  {
    id: 'ev-19',
    title: 'Sabotage at the Water Plant',
    subtitle: 'Clearwater Works compromised',
    text: 'Intake screens are cut and the chlorine room is padlocked from the outside. This was not the blackout doing its work.',
    rarity: 'rare',
    alert: 'critical',
    effects: [
      { kind: 'infrastructure', locationId: 'water', amount: -1 },
      { kind: 'resource', resource: 'water', amount: -1 },
    ],
  },
  {
    id: 'ev-20',
    title: 'The Last Generator',
    subtitle: 'Hospital reserve fails',
    text: 'At 2 a.m. the hospital\u2019s backup generator dies. Twenty patients are on oxygen and the reserve is measured in minutes.',
    rarity: 'rare',
    alert: 'critical',
    effects: [
      { kind: 'resource', resource: 'energy', amount: -1 },
      { kind: 'infrastructure', locationId: 'power', amount: -1 },
      { kind: 'resource', resource: 'trust', amount: -1 },
    ],
  },
]

export const EVENT_MAP: Record<string, EventCard> = EVENT_CARDS.reduce(
  (acc, card) => {
    acc[card.id] = card
    return acc
  },
  {} as Record<string, EventCard>,
)
