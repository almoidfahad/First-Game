import type { LocationDef, LocationId } from '../types/game'

/**
 * Twelve locations. `position` is a percentage pair used by the interactive city
 * map so the board stays responsive on every screen size.
 */
export const LOCATIONS: LocationDef[] = [
  {
    id: 'hospital',
    name: 'Hospital',
    tagline: 'St. Brigid\u2019s General',
    description:
      'Backup generators are failing ward by ward. Doctors work by torchlight and the corridors smell of antiseptic and fear.',
    icon: 'Cross',
    accent: '#ef4444',
    position: { x: 16, y: 22 },
    actions: ['explore', 'investigate', 'gatherWater', 'help', 'mission'],
    unlock: {},
    unique: 'Helping survivors here restores +4 Health to every player.',
  },
  {
    id: 'police',
    name: 'Police Station',
    tagline: 'Precinct Nine',
    description:
      'Evidence lockers, a diesel generator and a radio room nobody has keyed in weeks. The holding cells are empty and unlocked.',
    icon: 'Shield',
    accent: '#60a5fa',
    position: { x: 38, y: 14 },
    actions: ['explore', 'investigate', 'repair', 'help', 'mission'],
    unlock: {},
    unique: 'Repairs here also restore 1 Trust with the city.',
  },
  {
    id: 'power',
    name: 'Power Station',
    tagline: 'Kessler Substation',
    description:
      'The heart of the blackout. Breakers thrown, coolant cold, and a smell of ozone that never quite clears.',
    icon: 'Zap',
    accent: '#fbbf24',
    position: { x: 60, y: 19 },
    actions: ['explore', 'investigate', 'repair', 'mission'],
    unlock: {},
    unique: 'Repairing the station restores 1 Energy to the city grid.',
  },
  {
    id: 'cityhall',
    name: 'City Hall',
    tagline: 'The Rotunda',
    description:
      'Marble, candles and sealed minutes. Half the council has fled; the other half is still voting on whether the blackout is real.',
    icon: 'Landmark',
    accent: '#c4b5fd',
    position: { x: 82, y: 16 },
    actions: ['explore', 'investigate', 'help', 'trade', 'mission'],
    unlock: {},
    unique: 'Every trade brokered here also restores 1 Trust.',
  },
  {
    id: 'lab',
    name: 'Research Laboratory',
    tagline: 'Meridian Annex',
    description:
      'A private facility with its own substation, its own security and a door that was welded shut from the inside.',
    icon: 'FlaskConical',
    accent: '#38bdf8',
    position: { x: 54, y: 40 },
    actions: ['explore', 'investigate', 'repair', 'mission'],
    unlock: { clues: 1 },
    unique: 'The lab holds the technical half of every scenario.',
  },
  {
    id: 'tunnel',
    name: 'Underground Tunnel',
    tagline: 'Freight Line Zero',
    description:
      'Service tunnels that predate the city charter. Warm air moves down here, which means something down here is still running.',
    icon: 'TrainFront',
    accent: '#94a3b8',
    position: { x: 72, y: 70 },
    actions: ['explore', 'investigate', 'repair', 'mission'],
    unlock: { clues: 2, round: 3 },
    unique: 'The tunnels connect sites that have no right to be connected.',
  },
  {
    id: 'mall',
    name: 'Shopping Mall',
    tagline: 'Kestrel Arcade',
    description:
      'Shuttered shops, smashed skylights, and a food court that was restocked four hours before the lights went out.',
    icon: 'ShoppingBag',
    accent: '#f472b6',
    position: { x: 34, y: 62 },
    actions: ['explore', 'gatherFood', 'gatherWater', 'help', 'trade', 'mission'],
    unlock: {},
    unique: 'The best single source of food in the city.',
  },
  {
    id: 'water',
    name: 'Water Plant',
    tagline: 'Clearwater Works',
    description:
      'Pressure holds, for now. The filtration beds need power and the intake screens need hands.',
    icon: 'Droplets',
    accent: '#22d3ee',
    position: { x: 80, y: 50 },
    actions: ['explore', 'gatherWater', 'repair', 'mission'],
    unlock: {},
    unique: 'Gathering here yields +1 extra Water.',
  },
  {
    id: 'school',
    name: 'School',
    tagline: 'Harrow Secondary',
    description:
      'Two hundred cots in the gymnasium. Teachers running a shelter with no water, no medicine and no instructions.',
    icon: 'GraduationCap',
    accent: '#a3e635',
    position: { x: 46, y: 78 },
    actions: ['explore', 'gatherFood', 'gatherWater', 'help', 'mission'],
    unlock: {},
    unique: 'The largest shelter in the city — helping here matters most.',
  },
  {
    id: 'library',
    name: 'Old Library',
    tagline: 'Municipal Archive',
    description:
      'Paper records that survived three fires. Ledgers, planning approvals and the only paper trail the blackout left behind.',
    icon: 'BookOpen',
    accent: '#d97706',
    position: { x: 20, y: 45 },
    actions: ['explore', 'investigate', 'help', 'mission'],
    unlock: {},
    unique: 'Investigations here uncover paper trails, not physical evidence.',
  },
  {
    id: 'radio',
    name: 'Radio Tower',
    tagline: 'FM 88.1',
    description:
      'The last transmitter with a working mast. Whatever is said from this room, the whole city hears.',
    icon: 'RadioTower',
    accent: '#e879f9',
    position: { x: 62, y: 55 },
    actions: ['explore', 'investigate', 'help', 'mission'],
    unlock: { round: 3 },
    unique: 'Broadcasting here can recover Trust the rest of the city lost.',
  },
  {
    id: 'house',
    name: 'Abandoned House',
    tagline: '44 Vane Street',
    description:
      'Boarded windows, a car in the drive and mail from six weeks in the future. Nobody has come out of it since the blackout began.',
    icon: 'Home',
    accent: '#fb923c',
    position: { x: 86, y: 80 },
    actions: ['explore', 'gatherFood', 'investigate', 'mission'],
    unlock: { round: 2 },
    unique: 'Unlocks the personal side of the accident scenario.',
  },
]

export const LOCATION_MAP: Record<LocationId, LocationDef> = LOCATIONS.reduce(
  (acc, location) => {
    acc[location.id] = location
    return acc
  },
  {} as Record<LocationId, LocationDef>,
)

export function getLocation(id: LocationId): LocationDef {
  return LOCATION_MAP[id]
}

export const LOCATION_LABELS: Record<LocationId, string> = LOCATIONS.reduce(
  (acc, location) => {
    acc[location.id] = location.name
    return acc
  },
  {} as Record<LocationId, string>,
)
