import type { ItemCard } from '../../types/game'

/** 12 item cards. Items are consumed from the dashboard and apply real effects. */
export const ITEM_CARDS: ItemCard[] = [
  {
    id: 'medkit',
    title: 'Field Medkit',
    description: 'Dressings, saline and a sealed painkiller pack. Restores 20 Health.',
    rarity: 'uncommon',
    effect: { kind: 'heal', amount: 20 },
  },
  {
    id: 'rations',
    title: 'Ration Pack',
    description: 'Two days of dense calories in a foil pouch.',
    rarity: 'common',
    effect: { kind: 'food', amount: 2 },
  },
  {
    id: 'watercan',
    title: 'Water Can',
    description: 'Ten litres, sealed and clean.',
    rarity: 'common',
    effect: { kind: 'water', amount: 2 },
  },
  {
    id: 'battery',
    title: 'Deep-Cycle Battery',
    description: 'Heavy, charged and worth its weight.',
    rarity: 'uncommon',
    effect: { kind: 'energy', amount: 2 },
  },
  {
    id: 'flares',
    title: 'Road Flares',
    description: 'Light where there is none. Reassurance in a canister.',
    rarity: 'common',
    effect: { kind: 'trust', amount: 1 },
  },
  {
    id: 'radiounit',
    title: 'Hand Radio',
    description: 'A working short-range set. Restores 2 Trust.',
    rarity: 'rare',
    effect: { kind: 'trust', amount: 2 },
  },
  {
    id: 'filter',
    title: 'Water Filter',
    description: 'Ceramic gravity filter. Clean water on demand.',
    rarity: 'uncommon',
    effect: { kind: 'water', amount: 3 },
  },
  {
    id: 'toolbelt',
    title: 'Toolbelt',
    description: 'Spanners, tape and a working multimeter.',
    rarity: 'common',
    effect: { kind: 'energy', amount: 1 },
  },
  {
    id: 'notebook',
    title: 'Case Notebook',
    description: 'Statements, times and a list of names nobody else has.',
    rarity: 'uncommon',
    effect: { kind: 'trust', amount: 1 },
  },
  {
    id: 'sedative',
    title: 'Sedative Vial',
    description: 'For the injured, and for the panicking.',
    rarity: 'uncommon',
    effect: { kind: 'heal', amount: 10 },
  },
  {
    id: 'hazmat',
    title: 'Hazmat Patch Kit',
    description: 'Seals a suit, seals a wound, buys an hour.',
    rarity: 'rare',
    effect: { kind: 'heal', amount: 15 },
  },
  {
    id: 'jerrycan',
    title: 'Jerrycan',
    description: 'Diesel for a generator nobody has claimed yet.',
    rarity: 'uncommon',
    effect: { kind: 'energy', amount: 1 },
  },
]

export const ITEM_MAP: Record<string, ItemCard> = ITEM_CARDS.reduce(
  (acc, card) => {
    acc[card.id] = card
    return acc
  },
  {} as Record<string, ItemCard>,
)
