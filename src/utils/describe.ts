import { ITEM_MAP } from '../data/cards/items'
import { LOCATION_MAP } from '../data/locations'
import { RESOURCE_META } from '../engine/config'
import type { Effect } from '../types/game'

export function describeEffect(effect: Effect): string {
  switch (effect.kind) {
    case 'resource': {
      const label = RESOURCE_META[effect.resource].label
      return `${effect.amount > 0 ? '+' : ''}${effect.amount} ${label}`
    }
    case 'health':
      return `${effect.amount > 0 ? '+' : ''}${effect.amount} Health${effect.target === 'all' ? ' (all)' : ''}`
    case 'infrastructure':
      return `${LOCATION_MAP[effect.locationId].name} integrity ${effect.amount > 0 ? '+' : ''}${effect.amount}`
    case 'unlock':
      return `Unlocks ${LOCATION_MAP[effect.locationId].name}`
    case 'clue':
      return 'Reveals a clue'
    case 'item':
      return `Gain ${ITEM_MAP[effect.itemId]?.title ?? 'item'}${effect.amount && effect.amount > 1 ? ` ×${effect.amount}` : ''}`
    case 'ap':
      return `${effect.amount > 0 ? '+' : ''}${effect.amount} Action Point`
    case 'mission':
      return `Mission progress +${effect.amount}`
    default:
      return ''
  }
}

export function describeEffects(effects: Effect[]): string {
  return effects.map(describeEffect).filter(Boolean).join(' · ')
}
