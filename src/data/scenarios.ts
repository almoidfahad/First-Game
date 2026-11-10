import type { ClueDef, ScenarioDef, ScenarioId } from '../types/game'

/**
 * Four mysteries. Clues are authored per scenario and each one has a fixed
 * location and investigation threshold, so a playthrough can never surface a
 * contradictory set of evidence.
 */
export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'experiment',
    codename: 'HOLLOW SUN',
    title: 'A Secret Scientific Experiment',
    logline:
      'Meridian Annex was running a fusion test the city never approved. The blackout is the containment shadow of that test.',
    hiddenTruth:
      'Dr. Alvi\u2019s team pulled 40% of the city\u2019s grid into a cold-fusion containment field. The field failed at 02:14 and the grid has been feeding a dead machine ever since. City Hall signed the exemption in secret.',
    revelation:
      'The city was never attacked. It was borrowed — drained to keep a machine alive that was already dead. The switch that ends the blackout is inside the Annex, and it needs a human hand to turn it.',
    accent: '#38bdf8',
    leadLocations: ['lab', 'hospital', 'power'],
  },
  {
    id: 'cyber',
    codename: 'GHOST GRID',
    title: 'A Cyberattack on the Power Infrastructure',
    logline:
      'The substation did not fail. It was told to fail, by something already inside its firmware.',
    hiddenTruth:
      'A dormant intrusion package was planted during last year\u2019s maintenance contract. It is not stealing power — it is holding the grid hostage while someone negotiates a ransom with the city\u2019s insurers.',
    revelation:
      'The attacker never wanted the lights off. They wanted the payout for turning them back on. The kill-switch is a signed firmware image sitting in the tunnel junction box, and the city has been negotiating with its own saboteur.',
    accent: '#22d3ee',
    leadLocations: ['power', 'radio', 'tunnel'],
  },
  {
    id: 'conspiracy',
    codename: 'QUIET ACCORD',
    title: 'A Government Conspiracy',
    logline:
      'The blackout was scheduled. The minutes are sealed, the witness list is missing, and the ledger was redacted by hand.',
    hiddenTruth:
      'The provincial government cut the city off deliberately to force an evacuation ahead of a land acquisition. Every sealed minute references a demurrage clause that pays the province for abandoned infrastructure.',
    revelation:
      'The darkness was a purchase order. The city is not being rescued because it is being repossessed. The Accord names every official who signed, and the only copy that matters is in the Old Library.',
    accent: '#a78bfa',
    leadLocations: ['cityhall', 'police', 'library'],
  },
  {
    id: 'accident',
    codename: 'VAULT NINE',
    title: 'An Accident in an Abandoned Laboratory',
    logline:
      'Vault Nine was decommissioned in 1998. The tunnel under it is still warm, and the house on Vane Street is still receiving mail.',
    hiddenTruth:
      'A sealed chemical vault cracked during illegal demolition work. The crew died in the tunnel; a containment team moved the survivors into 44 Vane Street and then never came back for them.',
    revelation:
      'Nobody caused the blackout — the vault did, by cooking the substation\u2019s coolant lines from below. The people in the house have been waiting six weeks for an evacuation that was cancelled to protect a demolition contract.',
    accent: '#fb923c',
    leadLocations: ['tunnel', 'house', 'school'],
  },
]

export const SCENARIO_MAP: Record<ScenarioId, ScenarioDef> = SCENARIOS.reduce(
  (acc, scenario) => {
    acc[scenario.id] = scenario
    return acc
  },
  {} as Record<ScenarioId, ScenarioDef>,
)

export function getScenario(id: ScenarioId): ScenarioDef {
  return SCENARIO_MAP[id]
}

export const CLUES: ClueDef[] = [
  // HOLLOW SUN
  {
    id: 'cl-fusion-log',
    scenarioId: 'experiment',
    title: 'Containment Log 02:14',
    text: 'A lab printout: containment field collapse at 02:14:07, grid draw 412 MW, coolant temperature rising. Someone annotated the margin — "tell them it was a fault".',
    locationId: 'lab',
    threshold: 1,
    order: 1,
  },
  {
    id: 'cl-radiation-burns',
    scenarioId: 'experiment',
    title: 'Burns That Don\u2019t Match',
    text: 'Eleven patients from the Annex district show flash burns with no fire reported. The triage notes all say the same thing: bright light, then dark.',
    locationId: 'hospital',
    threshold: 2,
    order: 2,
  },
  {
    id: 'cl-grid-draw',
    scenarioId: 'experiment',
    title: 'The Missing 412 Megawatts',
    text: 'The substation\u2019s last telemetry shows full draw continuing after the breakers were thrown. The power is going somewhere. The cable heads north, under the Annex.',
    locationId: 'power',
    threshold: 2,
    order: 3,
  },
  // GHOST GRID
  {
    id: 'cl-firmware',
    scenarioId: 'cyber',
    title: 'Firmware Signature',
    text: 'A maintenance image signed with a municipality that does not exist. Written six months ago, activated on the night of the blackout.',
    locationId: 'power',
    threshold: 1,
    order: 1,
  },
  {
    id: 'cl-encrypted-broadcast',
    scenarioId: 'cyber',
    title: 'The 88.1 Carrier',
    text: 'A burst transmission every eleven minutes on the radio tower\u2019s dead carrier wave. It is a handshake, waiting for a reply.',
    locationId: 'radio',
    threshold: 2,
    order: 2,
  },
  {
    id: 'cl-fiber-tap',
    scenarioId: 'cyber',
    title: 'Fiber Tap',
    text: 'A spliced junction box in the tunnel, still warm: the intruder had physical access, not just a keyboard. Insurance paperwork is taped inside the lid.',
    locationId: 'tunnel',
    threshold: 2,
    order: 3,
  },
  // QUIET ACCORD
  {
    id: 'cl-sealed-minutes',
    scenarioId: 'conspiracy',
    title: 'Minutes, Sealed',
    text: 'Council minutes from three weeks ago, still in shrink wrap. Item 7: "Continuity Event — implementation at provincial discretion."',
    locationId: 'cityhall',
    threshold: 1,
    order: 1,
  },
  {
    id: 'cl-witness-list',
    scenarioId: 'conspiracy',
    title: 'The Witness List',
    text: 'Fourteen names, eleven crossed out in the same pen. The three survivors are all on the city payroll and none of them will answer a door.',
    locationId: 'police',
    threshold: 2,
    order: 2,
  },
  {
    id: 'cl-redacted-ledger',
    scenarioId: 'conspiracy',
    title: 'The Demurrage Clause',
    text: 'A ledger page with a clause paying the province for "abandoned infrastructure transfer". The redactions lift under a torch: the city was valued at 2.4 billion.',
    locationId: 'library',
    threshold: 2,
    order: 3,
  },
  // VAULT NINE
  {
    id: 'cl-melting-door',
    scenarioId: 'accident',
    title: 'The Door That Melted',
    text: 'Vault Nine\u2019s door did not rust. It slumped. The tunnel bore beside it is warm to the touch and the concrete has gone glassy.',
    locationId: 'tunnel',
    threshold: 1,
    order: 1,
  },
  {
    id: 'cl-containment-suit',
    scenarioId: 'accident',
    title: 'A Suit With A Name',
    text: '44 Vane Street: a containment suit hung by the door with the name "M. ORTIZ" stencilled inside. The same surname as one of your own people.',
    locationId: 'house',
    threshold: 2,
    order: 2,
  },
  {
    id: 'cl-survivor-testimony',
    scenarioId: 'accident',
    title: 'Six Weeks of Mail',
    text: 'Children at Harrow Secondary describe a "warm rain" under the school boiler room. One of them has date-stamped letters from a future that has not happened.',
    locationId: 'school',
    threshold: 2,
    order: 3,
  },
]

export const CLUE_MAP: Record<string, ClueDef> = CLUES.reduce(
  (acc, clue) => {
    acc[clue.id] = clue
    return acc
  },
  {} as Record<string, ClueDef>,
)

export function getClueIdsForScenario(scenarioId: ScenarioId): string[] {
  return CLUES.filter((clue) => clue.scenarioId === scenarioId)
    .sort((a, b) => a.order - b.order)
    .map((clue) => clue.id)
}
