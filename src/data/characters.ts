import type { Character, CharacterAbilityMods, CharacterId } from '../types/game'

const baseMods: CharacterAbilityMods = {
  gatherBonus: 0,
  repairEnergyCost: 1,
  repairGain: 1,
  investigateBonus: 0,
  helpTrustBonus: 0,
  trustLossReduction: 0,
  damageReduction: 0,
  survivalHeal: 0,
  labEnergy: false,
}

const mods = (patch: Partial<CharacterAbilityMods>): CharacterAbilityMods => ({ ...baseMods, ...patch })

/**
 * The eight playable characters. Every `mods` value is consumed by the engine
 * (actions, effects or survival), so no ability is decorative.
 */
export const CHARACTERS: Character[] = [
  {
    id: 'leader',
    name: 'Adrian Cross',
    title: 'The Leader',
    biography:
      "A district organiser who kept three neighbourhoods fed during the flood of '18. People follow Cross because Cross shows up first and leaves last.",
    ability: {
      name: 'Team Builder',
      description: '+1 Trust whenever you help survivors or open shelter to civilians.',
    },
    mods: mods({ helpTrustBonus: 1 }),
    strength: 'Command presence steadies the city.',
    weakness: 'Cannot act alone — needs a crowd to be effective.',
    attributes: { force: 3, wits: 3, empathy: 5, resilience: 3 },
    portrait: { accent: '#38bdf8', glyph: 'Shield' },
  },
  {
    id: 'engineer',
    name: 'Nadia Rahman',
    title: 'The Engineer',
    biography:
      'She maintained the substation on Kessler Street for eleven years and knows every cable by touch. If the grid can be brought back, Rahman is the one holding the spanner.',
    ability: {
      name: 'Grid Whisperer',
      description: 'Repairs cost no Energy and restore 2 integrity instead of 1.',
    },
    mods: mods({ repairEnergyCost: 0, repairGain: 2 }),
    strength: 'Turns wreckage into working infrastructure.',
    weakness: 'Blunt with people; trust gains come slower.',
    attributes: { force: 3, wits: 5, empathy: 2, resilience: 4 },
    portrait: { accent: '#fbbf24', glyph: 'Wrench' },
  },
  {
    id: 'detective',
    name: 'Elias Kane',
    title: 'The Detective',
    biography:
      'Homicide, then internal affairs, then nothing. Kane still carries the case file nobody would sign and reads a crime scene like a confession.',
    ability: {
      name: 'Chain of Evidence',
      description: 'Investigations add double progress toward mystery clues.',
    },
    mods: mods({ investigateBonus: 1 }),
    strength: 'Finds the thread that connects two unrelated facts.',
    weakness: 'Obsessive; neglects food and water when close to the truth.',
    attributes: { force: 3, wits: 5, empathy: 2, resilience: 3 },
    portrait: { accent: '#a78bfa', glyph: 'Search' },
  },
  {
    id: 'doctor',
    name: 'Dr. Imani Cole',
    title: 'The Doctor',
    biography:
      'Emergency physician at St. Brigid\u2019s, on hour nineteen of a shift that never ended. She has triaged in war zones and does not flinch at a dying generator.',
    ability: {
      name: 'Triage Protocol',
      description: 'All survivors regain 6 Health each Survival phase and take 2 less damage.',
    },
    mods: mods({ survivalHeal: 6, damageReduction: 2 }),
    strength: 'Keeps people alive far past the point they should be.',
    weakness: 'Refuses to abandon patients, even doomed ones.',
    attributes: { force: 2, wits: 4, empathy: 5, resilience: 4 },
    portrait: { accent: '#22c55e', glyph: 'HeartPulse' },
  },
  {
    id: 'survivor',
    name: 'Bex Ortiz',
    title: 'The Survivor',
    biography:
      'Grew up in the tunnels under the old freight yard and has never once trusted a locked door. Ortiz can find calories in a city everyone else calls empty.',
    ability: {
      name: 'Scavenger',
      description: 'Every gathering action produces +1 extra unit.',
    },
    mods: mods({ gatherBonus: 1 }),
    strength: 'Unmatched at turning ruins into supplies.',
    weakness: 'Shares nothing without a reason.',
    attributes: { force: 4, wits: 4, empathy: 2, resilience: 5 },
    portrait: { accent: '#f97316', glyph: 'Compass' },
  },
  {
    id: 'scientist',
    name: 'Dr. Yusuf Alvi',
    title: 'The Scientist',
    biography:
      'Physicist, whistleblower, reluctant fugitive. Alvi signed the original feasibility report and has spent two years trying to unsign it.',
    ability: {
      name: 'Field Analysis',
      description: 'Investigating the Research Lab also restores 1 Energy and adds +1 progress.',
    },
    mods: mods({ labEnergy: true, investigateBonus: 1 }),
    strength: 'Understands what the city was actually built to do.',
    weakness: 'Physically fragile under stress.',
    attributes: { force: 1, wits: 5, empathy: 3, resilience: 2 },
    portrait: { accent: '#38bdf8', glyph: 'FlaskConical' },
  },
  {
    id: 'journalist',
    name: 'Talia Grey',
    title: 'The Journalist',
    biography:
      'She ran the last independent desk in the city and published the story that got the grid budget frozen. The blackout made her the most trusted voice left on air.',
    ability: {
      name: 'Public Voice',
      description: 'All Trust losses are reduced by 1 (never below zero).',
    },
    mods: mods({ trustLossReduction: 1 }),
    strength: 'Can calm a panicking district with one broadcast.',
    weakness: 'Wanted by whoever caused the blackout.',
    attributes: { force: 2, wits: 5, empathy: 4, resilience: 3 },
    portrait: { accent: '#e879f9', glyph: 'Newspaper' },
  },
  {
    id: 'security',
    name: 'Sgt. Marcus Reed',
    title: 'The Security Officer',
    biography:
      'Fifteen years on the night shift at Precinct Nine. When the radios died, Reed was the only officer who stayed at his post instead of going home to guard his own street.',
    ability: {
      name: 'Shield Wall',
      description: 'Incoming damage from events and shortfalls is reduced by 4.',
    },
    mods: mods({ damageReduction: 4 }),
    strength: 'Absorbs chaos so others can work.',
    weakness: 'Bound by procedure in a city without any.',
    attributes: { force: 5, wits: 2, empathy: 3, resilience: 5 },
    portrait: { accent: '#60a5fa', glyph: 'ShieldAlert' },
  },
]

export const CHARACTER_MAP: Record<CharacterId, Character> = CHARACTERS.reduce(
  (acc, character) => {
    acc[character.id] = character
    return acc
  },
  {} as Record<CharacterId, Character>,
)

export function getCharacter(id: CharacterId): Character {
  return CHARACTER_MAP[id]
}

export const CHARACTER_IDS: CharacterId[] = CHARACTERS.map((c) => c.id)
