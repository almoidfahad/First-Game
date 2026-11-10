import type { DecisionCard } from '../../types/game'

/** 16 decision cards. Each option has an affordable cost and real effects. */
export const DECISION_CARDS: DecisionCard[] = [
  {
    id: 'dc-last-generator',
    title: 'The Last Generator',
    prompt:
      'At 2 a.m. the hospital\u2019s generator dies. Twenty patients are on oxygen. Whatever you do next will be remembered by this city.',
    options: [
      {
        id: 'dc-last-generator-a',
        label: 'Restore power to the hospital',
        detail: 'Divert the district feed. The rest of the block goes dark, but the ward survives.',
        tone: 'bold',
        cost: { energy: 1 },
        effects: [
          { kind: 'resource', resource: 'trust', amount: 2 },
          { kind: 'health', amount: 5, target: 'all' },
        ],
      },
      {
        id: 'dc-last-generator-b',
        label: 'Broadcast a civilian warning',
        detail: 'Tell people the ward is failing and ask for generators. Honest, but slow.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 1 },
          { kind: 'resource', resource: 'energy', amount: -1 },
        ],
      },
      {
        id: 'dc-last-generator-c',
        label: 'Suppress the report until dawn',
        detail: 'No panic tonight. No truth either.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -2 },
          { kind: 'resource', resource: 'energy', amount: 1 },
        ],
      },
    ],
  },
  {
    id: 'dc-rationing',
    title: 'Water Rationing',
    prompt: 'Clearwater is down to a day of pressure. The district wants a number and wants it now.',
    options: [
      {
        id: 'dc-rationing-a',
        label: 'Strict rationing — two litres each',
        detail: 'Orderly, unpopular, sustainable.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -1 },
          { kind: 'resource', resource: 'water', amount: 1 },
        ],
      },
      {
        id: 'dc-rationing-b',
        label: 'Open the reservoir',
        detail: 'Everyone drinks tonight. Tomorrow becomes someone else\u2019s problem.',
        tone: 'bold',
        effects: [
          { kind: 'resource', resource: 'water', amount: -2 },
          { kind: 'resource', resource: 'trust', amount: 2 },
        ],
      },
      {
        id: 'dc-rationing-c',
        label: 'Sell water to the highest bidder',
        detail: 'Funds the grid. Costs you the street.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'water', amount: -1 },
          { kind: 'resource', resource: 'energy', amount: 2 },
          { kind: 'resource', resource: 'trust', amount: -2 },
        ],
      },
    ],
  },
  {
    id: 'dc-scavengers',
    title: 'The Scavenger Trial',
    prompt: 'Three looters were caught with medical stock. One is fifteen years old.',
    options: [
      {
        id: 'dc-scavengers-a',
        label: 'Release them with a warning',
        detail: 'The city needs hands more than it needs punishment.',
        tone: 'cautious',
        effects: [{ kind: 'resource', resource: 'trust', amount: 1 }],
      },
      {
        id: 'dc-scavengers-b',
        label: 'Sentence them to repair duty',
        detail: 'Put them on the mall shutters and the substation lines.',
        tone: 'bold',
        effects: [
          { kind: 'infrastructure', locationId: 'mall', amount: 1 },
          { kind: 'resource', resource: 'trust', amount: -1 },
        ],
      },
      {
        id: 'dc-scavengers-c',
        label: 'Hand them to the militia',
        detail: 'Order restored, at a price.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'energy', amount: 1 },
          { kind: 'resource', resource: 'trust', amount: -2 },
        ],
      },
    ],
  },
  {
    id: 'dc-lab-door',
    title: 'The Sealed Laboratory',
    prompt: 'Meridian Annex is welded shut from the inside, and the seal is warm.',
    options: [
      {
        id: 'dc-lab-door-a',
        label: 'Breach the lab now',
        detail: 'Whatever is in there has been waiting long enough.',
        tone: 'risky',
        cost: { energy: 1 },
        effects: [
          { kind: 'unlock', locationId: 'lab' },
          { kind: 'resource', resource: 'energy', amount: -1 },
          { kind: 'health', amount: -3, target: 'all' },
        ],
      },
      {
        id: 'dc-lab-door-b',
        label: 'Send a drone first',
        detail: 'Slow, careful, and it keeps everyone breathing.',
        tone: 'cautious',
        cost: { energy: 1 },
        effects: [
          { kind: 'unlock', locationId: 'lab' },
          { kind: 'resource', resource: 'trust', amount: 1 },
        ],
      },
      {
        id: 'dc-lab-door-c',
        label: 'Seal it and walk away',
        detail: 'Not everything sealed is a threat. Some things are warnings.',
        tone: 'risky',
        effects: [{ kind: 'resource', resource: 'trust', amount: -1 }],
      },
    ],
  },
  {
    id: 'dc-go-public',
    title: 'Go Public',
    prompt: 'You have enough to break the story. The question is whether the city can survive hearing it.',
    options: [
      {
        id: 'dc-go-public-a',
        label: 'Broadcast everything',
        detail: 'Truth on air, costs and all.',
        tone: 'bold',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 2 },
          { kind: 'resource', resource: 'energy', amount: -1 },
        ],
      },
      {
        id: 'dc-go-public-b',
        label: 'Hold the story',
        detail: 'Keep the transmitter warm and the city calm.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -1 },
          { kind: 'resource', resource: 'energy', amount: 1 },
        ],
      },
      {
        id: 'dc-go-public-c',
        label: 'Trade the story for access',
        detail: 'A keycard is worth more than a headline.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'energy', amount: 2 },
          { kind: 'resource', resource: 'trust', amount: -1 },
        ],
      },
    ],
  },
  {
    id: 'dc-triage',
    title: 'Triage at St. Brigid\u2019s',
    prompt: 'Two patients, one ventilator. The queue behind them is forty people long.',
    options: [
      {
        id: 'dc-triage-a',
        label: 'Treat the youngest first',
        detail: 'Years of life, not status.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 2 },
          { kind: 'health', amount: 4, target: 'all' },
        ],
      },
      {
        id: 'dc-triage-b',
        label: 'Treat the officials first',
        detail: 'They control the remaining fuel.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'energy', amount: 1 },
          { kind: 'resource', resource: 'trust', amount: -2 },
        ],
      },
      {
        id: 'dc-triage-c',
        label: 'Evacuate the whole ward',
        detail: 'Move everyone to the school and start again.',
        tone: 'bold',
        cost: { water: 1 },
        effects: [
          { kind: 'resource', resource: 'trust', amount: 1 },
          { kind: 'health', amount: 6, target: 'all' },
        ],
      },
    ],
  },
  {
    id: 'dc-cityhall',
    title: 'Hold or Evacuate',
    prompt: 'City Hall has its own generator and no intention of sharing it.',
    options: [
      {
        id: 'dc-cityhall-a',
        label: 'Hold the building',
        detail: 'Make the Rotunda the command post it was designed to be.',
        tone: 'bold',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 1 },
          { kind: 'infrastructure', locationId: 'cityhall', amount: 1 },
        ],
      },
      {
        id: 'dc-cityhall-b',
        label: 'Evacuate to the school',
        detail: 'One shelter, one chain of command.',
        tone: 'cautious',
        cost: { energy: 1 },
        effects: [
          { kind: 'health', amount: 5, target: 'all' },
          { kind: 'resource', resource: 'trust', amount: 1 },
        ],
      },
      {
        id: 'dc-cityhall-c',
        label: 'Abandon it',
        detail: 'Strip the generator and leave the marble to the dark.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -2 },
          { kind: 'resource', resource: 'energy', amount: 2 },
        ],
      },
    ],
  },
  {
    id: 'dc-tunnel',
    title: 'Seal the Tunnel',
    prompt: 'Warm air is moving up from Freight Line Zero. The service door is open.',
    options: [
      {
        id: 'dc-tunnel-a',
        label: 'Seal it',
        detail: 'Pour concrete and hope the warmth finds another way out.',
        tone: 'cautious',
        effects: [
          { kind: 'infrastructure', locationId: 'tunnel', amount: 1 },
          { kind: 'resource', resource: 'energy', amount: -1 },
        ],
      },
      {
        id: 'dc-tunnel-b',
        label: 'Send a team down',
        detail: 'Two volunteers, one torch, no map.',
        tone: 'risky',
        effects: [
          { kind: 'health', amount: -6, target: 'all' },
          { kind: 'unlock', locationId: 'tunnel' },
        ],
      },
      {
        id: 'dc-tunnel-c',
        label: 'Leave it open as a shelter',
        detail: 'It is warm, it is dry, and it is not yours.',
        tone: 'bold',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 1 },
          { kind: 'resource', resource: 'water', amount: -1 },
        ],
      },
    ],
  },
  {
    id: 'dc-school',
    title: 'The School Shelter',
    prompt: 'Two hundred cots in a gymnasium, one working tap, and a head teacher holding the keys.',
    options: [
      {
        id: 'dc-school-a',
        label: 'Open the school fully',
        detail: 'Every cot, every classroom, every child.',
        tone: 'bold',
        cost: { food: 1 },
        effects: [
          { kind: 'resource', resource: 'trust', amount: 2 },
          { kind: 'health', amount: 4, target: 'all' },
        ],
      },
      {
        id: 'dc-school-b',
        label: 'Keep it closed',
        detail: 'A shelter you cannot supply is a grave with better lighting.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -2 },
          { kind: 'resource', resource: 'food', amount: 1 },
        ],
      },
      {
        id: 'dc-school-c',
        label: 'Charge for entry',
        detail: 'Supplies for the shelter, and no illusions about it.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'food', amount: 2 },
          { kind: 'resource', resource: 'trust', amount: -2 },
        ],
      },
    ],
  },
  {
    id: 'dc-mall',
    title: 'Distribution at Kestrel',
    prompt: 'The arcade\u2019s stockroom is open. Everyone has a claim and everyone has a reason.',
    options: [
      {
        id: 'dc-mall-a',
        label: 'Share everything equally',
        detail: 'Half rations for all, no exceptions.',
        tone: 'bold',
        effects: [
          { kind: 'resource', resource: 'food', amount: -2 },
          { kind: 'resource', resource: 'trust', amount: 3 },
        ],
      },
      {
        id: 'dc-mall-b',
        label: 'Prioritise the workers',
        detail: 'People who keep the city running eat first.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 1 },
          { kind: 'resource', resource: 'food', amount: -1 },
        ],
      },
      {
        id: 'dc-mall-c',
        label: 'Stockpile in the back',
        detail: 'Someone has to think about week two.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'food', amount: 1 },
          { kind: 'resource', resource: 'trust', amount: -2 },
        ],
      },
    ],
  },
  {
    id: 'dc-archive',
    title: 'The Archive',
    prompt: 'Filing cabinets, forty years of approvals and a lamp with a charged battery.',
    options: [
      {
        id: 'dc-archive-a',
        label: 'Protect the archive',
        detail: 'Records are the only thing the blackout cannot destroy.',
        tone: 'cautious',
        cost: { energy: 1 },
        effects: [
          { kind: 'resource', resource: 'trust', amount: 1 },
          { kind: 'item', itemId: 'notebook' },
        ],
      },
      {
        id: 'dc-archive-b',
        label: 'Burn the records',
        detail: 'Some paperwork is worth more as ash.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -2 },
          { kind: 'resource', resource: 'energy', amount: 1 },
        ],
      },
      {
        id: 'dc-archive-c',
        label: 'Digitise what you can',
        detail: 'A laptop, a battery and three hours of scanning.',
        tone: 'bold',
        cost: { energy: 1 },
        effects: [
          { kind: 'resource', resource: 'trust', amount: 2 },
          { kind: 'item', itemId: 'battery' },
        ],
      },
    ],
  },
  {
    id: 'dc-house',
    title: '44 Vane Street',
    prompt: 'The house has power. Nothing else on the street does. There is a car in the drive and mail in the box.',
    options: [
      {
        id: 'dc-house-a',
        label: 'Search the house',
        detail: 'Doors unlock from the inside.',
        tone: 'bold',
        effects: [
          { kind: 'unlock', locationId: 'house' },
          { kind: 'health', amount: -3, target: 'all' },
          { kind: 'item', itemId: 'medkit' },
        ],
      },
      {
        id: 'dc-house-b',
        label: 'Watch it from a distance',
        detail: 'Note who comes and goes. Nobody does.',
        tone: 'cautious',
        effects: [
          { kind: 'unlock', locationId: 'house' },
          { kind: 'resource', resource: 'trust', amount: 1 },
        ],
      },
      {
        id: 'dc-house-c',
        label: 'Board it up',
        detail: 'Whatever is in there, keep it in there.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -1 },
          { kind: 'infrastructure', locationId: 'house', amount: 1 },
        ],
      },
    ],
  },
  {
    id: 'dc-grid',
    title: 'Restart the Grid',
    prompt: 'Nadia has a plan to bring Kessler back. It involves closing a breaker that has never been closed.',
    options: [
      {
        id: 'dc-grid-a',
        label: 'Full restart — risk the surge',
        detail: 'Everything at once, and pray the grid holds.',
        tone: 'risky',
        cost: { energy: 1 },
        effects: [
          { kind: 'infrastructure', locationId: 'power', amount: 2 },
          { kind: 'health', amount: -5, target: 'all' },
          { kind: 'resource', resource: 'energy', amount: 2 },
        ],
      },
      {
        id: 'dc-grid-b',
        label: 'Staged restart',
        detail: 'Section by section, all night, by hand.',
        tone: 'cautious',
        cost: { energy: 1 },
        effects: [
          { kind: 'infrastructure', locationId: 'power', amount: 1 },
          { kind: 'resource', resource: 'trust', amount: 1 },
        ],
      },
      {
        id: 'dc-grid-c',
        label: 'Delay until morning',
        detail: 'The grid is not the only thing that needs to survive tonight.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -1 },
          { kind: 'resource', resource: 'energy', amount: 1 },
        ],
      },
    ],
  },
  {
    id: 'dc-curfew',
    title: 'Curfew or Freedom',
    prompt: 'The watch wants authority. The streets want air. Both of them are armed.',
    options: [
      {
        id: 'dc-curfew-a',
        label: 'Extend the curfew',
        detail: 'Order for another night.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -1 },
          { kind: 'infrastructure', locationId: 'police', amount: 1 },
        ],
      },
      {
        id: 'dc-curfew-b',
        label: 'Lift it',
        detail: 'Let people move, let them find each other.',
        tone: 'bold',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 2 },
          { kind: 'health', amount: -2, target: 'all' },
        ],
      },
      {
        id: 'dc-curfew-c',
        label: 'Arm the neighbourhood watch',
        detail: 'Trust the street with the street.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'energy', amount: 1 },
          { kind: 'resource', resource: 'trust', amount: -1 },
        ],
      },
    ],
  },
  {
    id: 'dc-evidence',
    title: 'The Evidence',
    prompt: 'You are holding proof of what happened. Where it goes decides what the city does with it.',
    options: [
      {
        id: 'dc-evidence-a',
        label: 'Hand it to the press',
        detail: 'The whole city hears it, including the people responsible.',
        tone: 'bold',
        effects: [
          { kind: 'resource', resource: 'trust', amount: 2 },
          { kind: 'resource', resource: 'energy', amount: -1 },
        ],
      },
      {
        id: 'dc-evidence-b',
        label: 'Give it to the police',
        detail: 'Evidence chain, evidence handler, evidence lockup.',
        tone: 'cautious',
        effects: [
          { kind: 'infrastructure', locationId: 'police', amount: 1 },
          { kind: 'resource', resource: 'trust', amount: 1 },
        ],
      },
      {
        id: 'dc-evidence-c',
        label: 'Keep it hidden',
        detail: 'A secret is leverage. Leverage is survival.',
        tone: 'risky',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -1 },
          { kind: 'item', itemId: 'notebook' },
        ],
      },
    ],
  },
  {
    id: 'dc-before-dawn',
    title: 'Before Dawn',
    prompt: 'The last night of the blackout. Whatever is left in the stores decides who sees the sun.',
    options: [
      {
        id: 'dc-before-dawn-a',
        label: 'Spend the reserves on the city',
        detail: 'Empty the stores, fill the shelters, take the risk.',
        tone: 'bold',
        cost: { food: 1, water: 1 },
        effects: [
          { kind: 'resource', resource: 'trust', amount: 3 },
          { kind: 'health', amount: 6, target: 'all' },
        ],
      },
      {
        id: 'dc-before-dawn-b',
        label: 'Conserve and wait',
        detail: 'Hold the last of everything for the people still standing.',
        tone: 'cautious',
        effects: [
          { kind: 'resource', resource: 'trust', amount: -1 },
          { kind: 'resource', resource: 'energy', amount: 1 },
        ],
      },
      {
        id: 'dc-before-dawn-c',
        label: 'Take what you need and run',
        detail: 'The city is a lost cause. People are not.',
        tone: 'risky',
        effects: [
          { kind: 'health', amount: 10, target: 'active' },
          { kind: 'resource', resource: 'trust', amount: -3 },
        ],
      },
    ],
  },
]

export const DECISION_MAP: Record<string, DecisionCard> = DECISION_CARDS.reduce(
  (acc, card) => {
    acc[card.id] = card
    return acc
  },
  {} as Record<string, DecisionCard>,
)

export function getDecisionOption(cardId: string, optionId: string) {
  return DECISION_MAP[cardId]?.options.find((option) => option.id === optionId)
}
