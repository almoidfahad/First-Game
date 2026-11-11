# Shadow City — The Last Light

An offline-first **mystery · survival · strategy** game for 1–4 players. Eight rounds, five phases per round, four scenarios, twelve districts and three endings that are earned by real game state — not chosen from a menu.

> Make decisions. Uncover the truth. Survive the darkness.

Built with React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, Dexie (IndexedDB) and a Workbox service worker. Every asset is bundled: no network calls, no accounts, no telemetry.

---

## Feature overview

| Area | What is implemented |
| --- | --- |
| Screens | Main Menu, New Campaign, Interactive City Board, Real-time Exploration, Survivor Dashboard, Story & Decision, Ending & Report, Card Library, Save Slots, Rules, Settings |
| Campaign | 8 rounds × 5 phases (Event → Decision → Action → Mystery → Survival), 2 Action Points per survivor per round |
| Content | 8 characters, 12 locations, 4 scenarios, 20 events, 16 decisions, 12 clue cards, 8 secret missions, 12 items |
| Resources | Food, Water, Energy (city cap 20/20/12) and Trust (cap 10), consumed every survival phase |
| Characters | Unique ability modifiers that the engine actually applies (gathering, repair cost/gain, investigation, trust, damage reduction, survival healing) |
| Real-time movement | Canvas 2D city scene, keyboard/touch movement, walk/run animation, building collision and character-specific stamina |
| Secrets | One hidden mission per character, with progress, rewards and a pass-and-play privacy gate in local multiplayer |
| Endings | Bright, Broken and Dark, computed from infrastructure, survivors, health, trust, evidence and difficulty threshold |
| Saves | Autosave after every action + five manual slots, schema versioning, migration, corrupt-save quarantine, JSON export/import |
| Offline | Installable PWA; app shell and all assets precached by Workbox |
| Reports | Rules, character sheets, card collection and end-of-campaign report via a dedicated print stylesheet — use **Print → Save as PDF** |
| Accessibility | Keyboard-reachable controls, skip link, labelled dialogs that close on Escape, live regions, 90–125% text scaling, reduced-motion and high-contrast modes, non-colour status cues |

## Getting started

Requires **Node.js 20 or newer** and npm.

```bash
npm install
npm run dev        # Open the local URL printed by Vite (usually http://127.0.0.1:5173)
```

Production build and local preview:

```bash
npm run build      # tsc --noEmit && vite build
npm run preview    # http://127.0.0.1:4173
```

The PWA service worker is generated for production builds (`dist/sw.js`); the dev server intentionally runs without it.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server starting at port 5173; if busy, Vite selects the next available port and prints its URL |
| `npm run build` | Type-check, then production build with PWA manifest and service worker |
| `npm run preview` | Serve the production build on port 4173 |
| `npm run typecheck` | `tsc --noEmit` (strict, no unused locals) |
| `npm test` | Vitest unit + rendering suite |
| `npm run test:e2e` | Playwright smoke tests (browsers must be installed first) |
| `npm run icons` | Regenerate the PNG icon set from `scripts/generate-icons.mjs` |

## How a round works

1. **Event** — a seeded event card resolves immediately and is written to the chronicle.
2. **Decision** — one dilemma with 2–3 options. Costs are checked against the real resources; consequences apply at once and are permanent.
3. **Action** — survivors take turns spending 2 AP on the map: explore, gather food/water, repair, investigate, help survivors, trade or work on a secret mission. Location rules are enforced (sealed districts, energy costs, full stores, full infrastructure).
4. **Mystery** — any clue whose investigation threshold has been reached is revealed, missions advance and dependent locations unlock.
5. **Survival** — 1 Food, 1 Water and 1 Energy are consumed; shortfalls damage health and trust, and an energy shortfall degrades infrastructure. Then the next round begins.

Clues are scenario-specific. Recovering all three reveals the hidden truth and the scenario's revelation. A clue from a different scenario can never leak into the current campaign.

### Endings

| Ending | Requirement (evaluated by `evaluateEnding`) |
| --- | --- |
| **The Bright Future** | Difficulty score threshold (66/72/78), all three clues, every survivor alive, average infrastructure ≥ 2, Trust ≥ 4 |
| **The Broken City** | At least one survivor, score ≥ 40, reached at least round 4 |
| **The Dark Ending** | No survivors, collapsed Trust, or a failing city score |

The score is shown broken down by infrastructure (30), survivors (25), health (15), Trust (10) and evidence (20).

## Saves and data safety

- Storage: IndexedDB via Dexie (`shadowcity` database, `saves` and `settings` stores).
- Autosave is written after every action; manual slots are `slot-1` … `slot-5`.
- Each record carries `schemaVersion`. Loading runs structural validation and a migration pipeline; a save from a newer version is rejected rather than guessed at.
- Invalid records are marked `corrupt`, moved out of listings and never loaded.
- **Export** writes a readable JSON file; **Import** validates the whole record before writing it. Export a backup before clearing browser data.

## Project structure

```
src/
  components/   UI primitives, HUD, city map, phase controls, privacy gate, art
  data/         characters, locations, scenarios and the card pack + validator
  database/     Dexie schema
  engine/       deterministic RNG, effects, actions, phases, endings
  pages/        the game screens, including real-time exploration
  services/     saves, procedural audio, PWA registration, printable reports
  store/        Zustand game and settings stores
  styles/       Tailwind layers, theme, accessibility modes, print stylesheet
  types/        shared domain model
tests/
  unit/         content, engine, saves, exploration movement
  rendering.test.tsx
  e2e/          Playwright smoke path
scripts/        PNG icon generator (no image dependency)
```

### Determinism

Randomness is a pure function of an integer cursor stored in the game state (mulberry32). Event and decision decks are shuffled from the seed at campaign creation. Reloading a save therefore continues the same sequence, and tests can assert exact outcomes.

### Art and audio

Portraits, the skyline and the icon set are generated from code (SVG/CSS and a zlib PNG encoder), so the game has no external media assets. Music and interface sounds are synthesised with the Web Audio API after the first user gesture. Offline playback works; audio can be muted or mixed in Settings.

## Testing

```bash
npm test          # 45 tests: content integrity, engine, saves, movement and UI wiring
npm run typecheck
npm run build
```

The committed suite covers:

- content counts and structural validation (8/12/4/20/16/12/8/12);
- resource/health/infrastructure clamping;
- action legality (phase, sealed districts, full stores, repair caps, trade validation);
- the full phase cycle, survival consumption/decay, final-round ending, unresolved-decision guard;
- multiplayer turn hand-off before round resolution;
- clue discovery, scenario isolation and location unlocks;
- deterministic decks for identical seeds;
- all three endings, including the "every survivor alive" requirement;
- save write/read/list/delete, schema guard, corrupt-save quarantine, export shape;
- menu navigation and starting a real campaign through the UI.

### End-to-end tests

`tests/e2e/smoke.spec.ts` drives a real Chromium session: menu → new campaign → decision → action → next round, plus sealed-district checks. Playwright needs its browser binary once:

```bash
npx playwright install chromium
npm run test:e2e
```

**Status in this workspace:** the browsers were not downloaded, so the E2E suite has not been executed here. The unit, rendering, type-check and production-build gates all pass.

## Known limitations

- Local multiplayer is pass-and-play on one device; there is no networked multiplayer.
- English is the only shipped locale (the copy and settings layer is locale-ready).
- Report export uses the browser print dialogue ("Save as PDF"); no PDF binary is generated directly.
- Procedural audio requires a user gesture and is absent in browsers without Web Audio.
- Playwright E2E is unverified in this environment (see above).

## Credits

Icons by [Lucide](https://lucide.dev). All game content, characters and scenarios are original to this project. No external fonts or images are fetched at runtime.
