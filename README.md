# Eevee-Tama (Eevee Tamagotchi)

A modern, mobile-first Tamagotchi in which you raise a pocket Eevee through a
complete life. Hatch the egg, keep four care meters healthy, evolve your pet
into one of eight Eeveelutions, dress it up, decorate its meadow, gamble in
the POKÉ CASINO, and chase the collection goal: all 9 forms, all 9 shinies,
36 medals, and both endings.

The project is a zero-dependency static web app: vanilla HTML, CSS, and
JavaScript ES modules, one canvas, no build step, no framework, no CDN. It
runs from any static file server and installs as a PWA on Android, desktop
Chrome, and iOS (add to home screen).

**Status:** complete through milestone M10. The full game is playable, the
26-scenario test suite is green on a 6-device mobile matrix, and a 3:34
full-playthrough showcase video lives in `showcase/video/`.

**Fan project:** this is a non-commercial fan project, not affiliated with
or endorsed by Nintendo, Creatures Inc., GAME FREAK, The Pokémon Company, or
Bandai. See the [Fan Project and Legal
Notice](#fan-project-and-legal-notice) at the end of this file.

---

## What it is

Player fantasy: *a real little Eevee lives in my phone, it has a
personality, I can grow all nine Eeveelutions, find the rare shinies, and
make its meadow my own.*

Core loop: hatch -> feed / pet / play / clean -> survive the day-night cycle
-> evolve -> collect -> graduate (or let it die) -> start the next life with
your POKÉDEX, medals, shop items, and settings carried over.

Feature list:

- **9 collectible forms** (Eevee + Vaporeon, Jolteon, Flareon, Espeon,
  Umbreon, Leafeon, Glaceon, Sylveon), each with a **shiny** variant, for a
  18-cell POKÉDEX.
- **4 life stages** (egg, baby, child, adult) that grow on a real-time clock,
  with a graduation ending at day 4 and a neglect death ending (tombstone).
- **4 care meters** (meal, happy, energy, health), sickness, medicine,
  furballs, and a tummy-ache rule for overfeeding snacks (4+ in a day).
- **5 pet personalities** that change favorite meal, disliked meal, favorite
  snack, lucky casino symbol, emote style, and speech bubble.
- **8 ways to evolve**: 5 evolution stones, 2 time-window snack evolutions
  (Espeon by day, Umbreon by night), and 1 automatic evolution (Sylveon).
- **Shiny rolls at 1/50** per hatch (1/25 on rare shiny days), with a golden
  SHINY banner on the evolution card and shiny dex art.
- **POKÉ CASINO** with three real games: Eevee Slots (777 jackpot + bonus
  free spin), a 12-segment Roulette, and a 4-card Card Flip.
- **Shop** with 12 items across three categories: 6 meadow decor, 4 pet
  fashion, 2 sky themes, plus monthly 50% off sale days.
- **Monthly events**: sale days (5/15/25), rare shiny days (10/20/30), and a
  ghost Eevee that drifts across the meadow on the 16th (+5 coins to catch).
- **36 medals** and a care rank (S/A/B/C) computed from how well you raised
  each pet.
- **Day/night meadow**: animated sky bands, stars and fireflies at night,
  sleep cycle with Zzz, tap-to-wake.
- **Offline catch-up**: close the app for days, return to a "While you were
  away" report (capped at 72 game-hours, meters floored at 10, so a long
  absence never kills the pet by accident).
- **Full chiptune audio**: BGM (day/night/sleep moods) and 40+ SFX are
  synthesized live with Web Audio (no audio files), plus haptics where the
  device supports them.
- **Installable PWA** with a service worker for offline play.
- No emojis anywhere in the UI; every visual is a real, style-matched asset.

## How to use it

### Quick start

Serve the `assets/ref` directory over HTTP on port 8734 (any static server
works), then open the game:

```powershell
# from the repo root
python -m http.server 8734 --directory assets/ref
# or: npx --yes serve -l 8734 assets/ref
```

- Game: `http://localhost:8734/eevee_tama/index.html`
- Best played in portrait: on a phone, or in Chrome DevTools device mode
  (the design target is the 430x932 logical size of an iPhone 15 Pro Max).
- First run shows the title screen; tap **TAP TO HATCH** to start the egg.
- On Android/desktop Chrome the PWA install prompt appears (also reachable
  via MENU > SETTINGS > INSTALL APP); on iOS use Share > Add to Home Screen.

### Controls

| Action | How |
|---|---|
| Wobble the egg | Tap the egg |
| Feed a meal or snack | **FEED** dock button, pick from the sheet (favorite items show a FAV mark) |
| Pet the Eevee | Tap the pet (or the **PET** dock button); hearts + affinity |
| Open the profile | **Long-press** the pet, or MENU > PROFILE |
| Rename the pet | PROFILE sheet > edit |
| Throw the ball | **PLAY** dock > ball |
| Play casino games | **PLAY** dock > Eevee Slots / Roulette / Card Flip |
| Clean a furball | Tap the furball, or **CLEAN** dock (cleans all) |
| Give medicine | **MEDICINE** button (appears while sick) |
| Wake the pet / skip sleep | Tap the sleeping pet |
| Catch the ghost | Tap the ghost Eevee as it drifts by (night of the 16th) |
| Buy stones, decor, fashion, skies | MENU > EVOLVE (stones) or MENU > SHOP |
| View POKÉDEX / MEDALS / SETTINGS | MENU dock > sheet |
| Reset the save | SETTINGS > RESET SAVE |

### Session and progress

- Time runs at **2 game-minutes per real second**. A full life is 4320
  game-minutes, so one Eevee lives roughly **36 real minutes** (day 1 07:00
  to day 4 07:00), shorter if you use sleep-skips and the title stays
  responsive.
- Progress persists to `localStorage` (key `eevee_tama_v1`) with autosave
  every 5 seconds plus save-on-hide. Close the app, come back, and the game
  simulates the time you were away (cap 72 game-hours) and shows the
  "While you were away" report.
- After graduation or death, the **NEW EGG** button starts the next life.
  POKÉDEX, medals, shop items, and settings persist across lives; meters,
  name, personality, and form reset.

## Setup (development)

Prerequisites:

- Any static file server (`python -m http.server`, `npx serve`, VS Code Live
  Server, or a local nginx) on port 8734.
- Node 18+ for the test suite, with Playwright + Chromium:

  ```powershell
  npm i -D playwright        # from the repo root (adds a local dev-only dep)
  npx playwright install chromium
  ```

  If you use an npx-cached Playwright instead, point `NODE_PATH` at its
  `node_modules` directory before running the tests.
- `ffmpeg` on PATH only if you want to convert the recorded `.webm` to `.mp4`.

**Important: serve `assets/ref` as the web root, not the repo root.** The
game lives at `assets/ref/eevee_tama/` and resolves every asset with `../`
paths (art in `assets/ref/prod/...`, the service worker at
`assets/ref/sw.js`, chibi art in `assets/ref/pokemonsleep/...`). Serving the
repo root breaks all of those paths.

### Test commands

All test scripts assume the server from above is running:

```powershell
node test\scenarios.js    # 26 scenarios x 6-device matrix + per-device quality gate (~2 min)
node test\video.js        # records the full-playthrough showcase -> showcase/video/*.webm (~3.5 min)
node test\shots.js        # key-state screenshots -> showcase/m9_*.png
node test\chibi_anim.js   # per-form chibi gait contact sheet (5 forms x walk cycles)
```

Useful env vars:

| Var | Effect |
|---|---|
| `TAMA_URL` | Point every test at another server (default `http://localhost:8734/eevee_tama/index.html`) |
| `DEVKEYS=iphone15` | Run the scenario suite on a subset of devices |
| `SCENOS=S03,S04` | Run only specific scenarios |

Convert a recording to the committed mp4:

```powershell
ffmpeg -i showcase\video\page@<hash>.webm -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p showcase\video\full-playthrough.mp4
```

## How the game works

### Time and growth

The clock is one counter (`total`, in game-minutes). Day 1 starts at 07:00
and each game-day is 1440 minutes; the displayed time is
`(420 + total) mod 1440`.

| Stage | Condition (game-min) | Real time at default speed |
|---|---|---|
| Egg | < 120 | day 1 07:00 to 09:00 (~1 min) |
| Baby | 120 to < 1440 | until day 2 07:00 |
| Child | 1440 to < 2880 | until day 3 07:00 |
| Adult | >= 2880 | until graduation |
| Graduation | 4320 | day 4 07:00 (end of life) |

Stage-ups fire confetti and a "grew up!" toast. The pet's drawn size grows
with stage (0.6x baby, 0.8x child, 1.0x adult).

### Care meters and survival

Four meters (meal, happy, energy, health) decay over time. While any meter
sits at 0, "zero-hours" accumulate:

- **6 zero-hours** -> the pet gets **sick** (neglect). A MEDICINE button
  appears; feeding it clears the sickness.
- While sick, **14 more zero-hours** or **health reaching 0** -> **death**
  (tombstone + R.I.P. card).
- **A 4th snack in one day** can cause a tummy-ache (a different sickness
  reason, same treatment).

Feeding a meal restores meal (+ extra for the personality's favorite meal);
snacks give happy (+ extra for the favorite snack); petting and games give
happy and affinity; cleaning furballs stops their decay; Rawst Berry and
medicine restore health.

### Sleep and day-night cycle

- At **20:00** the pet sleeps automatically if energy < 40; at **03:00**
  rest is forced regardless of energy; it wakes at **07:00**.
- Tapping a sleeping pet skips to wake-up.
- The scene renders a full day-night cycle: sky bands shift through dawn,
  day, sunset, and night, with stars, a moon, and fireflies at night. Owned
  sky themes (night/sunset) override the natural sky.

### Personality

At hatch the pet rolls one of five personalities, which drive:

| Personality | Favorite meal | Dislikes | Favorite snack | Lucky symbol |
|---|---|---|---|---|
| CHEERFUL | Sitrus | Pecha | Sweet Heart | heart |
| MELLOW | Oran | Cheri | Honey | ball |
| FEISTY | Cheri | Sitrus | Rage Candy Bar | seven |
| SLEEPY | Chesto | Cheri | Honey | ball |
| SWEET | Pecha | Chesto | Sweet Heart | ball |

The personality also sets the emote style and the speech-bubble line used in
reactions (cheer, chat, shock, worry, grumble when fed a disliked meal).

### Evolution

Evolution happens once per life and requires an **adult** pet (the stone
forms) or the right condition:

| Form | Method | Requirement |
|---|---|---|
| Vaporeon | Water Stone | adult; buy stone for 100 coins in the EVOLVE sheet |
| Jolteon | Thunder Stone | same |
| Flareon | Fire Stone | same |
| Leafeon | Leaf Stone | same |
| Glaceon | Ice Stone | same |
| Espeon | Feed a snack | between 07:00 and 12:00, affinity >= 70 |
| Umbreon | Feed a snack | between 18:00 and 20:00, affinity >= 70 |
| Sylveon | Automatic | at day 3 22:00 (game-min 3780), affinity >= 80, adult |

Each evolution plays a cinematic: white flash, dex animation, name card
(with a SHINY banner if applicable), confetti when you return to the meadow.

### Shiny and POKÉDEX

- Shiny rolls at hatch: 1/50 normally, 1/25 on a rare shiny day. The flag
  locks for the life and tints every form of that pet.
- The POKÉDEX has 9 forms x 2 variants = **18 cells** (normal + shiny per
  form). The header counts normal captures (e.g. "9/18"); captured cells
  show the dex animation, with a gold diamond for captured shinies.
- Collecting all 9 normals earns the DEX9 medal; all 18 earns DEX18.

### Affinity

Affinity (0 to 100) is the bond meter. Petting, feeding (especially
favorites), cleaning, and winning casino games raise it. It gates the three
non-stone evolutions (70/70/80) and is shown on the EVOLVE sheet and in the
profile.

### Furballs

No furballs spawn during the first 10 game-hours of a life. After that they
appear every 4 to 8 game-hours (up to 5 at once). Each uncleaned furball
drains happy and health until tapped (or cleaned via the CLEAN dock button,
which clears all of them with a sparkle burst).

### POKÉ CASINO

Coins reset to a daily free grant of **50** at each 07:00 rollover. Three
games, all sharing the seeded PRNG:

- **Eevee Slots** (1 to 3 chip bet, 1/3/5 paylines). Symbols pay 3/4/5/10/30
  x line-stake for triples (Eevee, Heart, Oran, Ball, Seven); any pair pays
  1.2x stake per line; a line containing the pet's lucky symbol pays 1.2x
  more. Three Sevens is the **JACKPOT**: big payout, confetti, a medal, and
  one bonus free spin.
- **Roulette**: a 12-segment wheel (colors and Eeveelution forms). Bet on a
  color (2x), a form (4x), or a single wheel segment (12x); the stake is the
  chip bet times the number of active bets.
- **Card Flip**: four face-down cards; pick one, all cards flip with a
  staggered 3D animation, the top card wins at 4x stake, and a tie for the
  highest card is a push (stake returned).

The pet walks over to the machine and reacts to every result: cheers on
wins, worries on losses.

### Shop and monthly events

The shop sells 12 items in three categories (coins are daily, so big
purchases happen across days or after casino wins):

- **DECOR** (6): pet bed, snowman, mushroom patch, flower patch, second
  tree, berry bush. Each appears at a fixed spot in the meadow.
- **FASHION** (4): red bow, blue scarf, leaf hat, star clip. The pet wears
  the latest equipped item.
- **SKIES** (2): twilight sky, sunset sky. Replaces the natural sky.

Monthly events (day-of-month, 1-based):

- **5 / 15 / 25**: sale day, every shop item 50% off (SALE banner).
- **10 / 20 / 30**: rare shiny day, hatch shiny odds double to 1/25.
- **16**: ghost night, a ghost Eevee drifts across the meadow after dark;
  tap it for +5 coins.

### Medals and care rank

36 medals are awarded for firsts and milestones (first bite, first pet,
stage-ups, evolutions per form, shiny catches, casino achievements, dex
progress, ghost catch, survival days, losing a pet, and more). Medals never
expire and persist across lives.

The **care rank** (S/A/B/C) is computed from care actions during a life
(feeding, petting, cleaning, medicine, avoiding sickness) and is shown on
the profile card and the graduation card.

### Endings and meta progression

Two ways a life ends:

- **Graduation** at day 4 07:00: farewell card with the pet's name and care
  rank.
- **Death** from neglect: tombstone in the meadow + "R.I.P. <NAME>" card.

Both end screens have a **NEW EGG** button. POKÉDEX captures, medals, owned
shop items, equipped fashion/theme/decor, and settings carry into the next
life.

### Offline catch-up

Every save stores `savedAt`. On load the game computes the elapsed time,
simulates it in steps (meters floored at 10 each step so the pet starves but
does not die of neglect while you are gone), and shows the "While you were
away" report: away duration, what happened (stage-ups, furballs, snacks
eaten, graduation), and the current state. The cap is 72 game-hours.

## Architecture

### Stack and data flow

Vanilla ES modules, no build step. The hybrid is deliberate: the **world is
canvas** (scene, pet, particles) and the **chrome is DOM** (HUD, dock,
sheets, toasts, cards).

```
requestAnimationFrame loop (main.js)
  -> advance the game clock by dt * rate * minPerSec
  -> state.advance(state, dtMinutes, events)   [pure simulation, no DOM]
  -> dispatch the event list (hatch, stage:adult, evo-vaporeon,
     sick:neglect, cas:jackpot, death, graduation, ...) to UI handlers
  -> scene.draw() + pet.update()/draw()
  -> throttled DOM updates (HUD ~4 Hz)
```

Key consequences:

- **`state.js` is pure.** It only reads/writes the state object and pushes
  strings into an event array. Nothing in it touches the DOM, which is what
  makes the scenario suite (pure state assertions) and the offline
  simulation possible.
- **UI reacts to events.** `main.js` translates each event into toasts,
  emotes, screen changes, or card overlays. Screens are `title`, `egg`,
  `main`, `evo`, `end`, plus the `away` report overlay and `casino`.
- **One PRNG for everything.** `prng.js` is a seeded mulberry32. Names,
  personalities, shinies, furballs, ghost nights, and every casino reel go
  through it. `rng.seed(n)` makes a run reproducible, and
  `rng.forceNext({ game: value })` queues scripted outcomes (used by the
  casino harness and the showcase video for a deterministic jackpot).
- **Time mocking.** `state.rate` (1 to 1000) multiplies the clock, and
  `state.frozen` stops it. Tests and the video use this instead of waiting.

### Module map (`assets/ref/eevee_tama/src/`)

| File | ~Lines | Responsibility |
|---|---|---|
| `config.js` | 294 | Every tunable: time, stat decay, evolution rules, food, shop, stones, personalities, names, dex, casino payouts, medals, monthly events, asset path map (`A`) |
| `state.js` | 534 | Pure simulation: `advance()` (decay, sleep, sickness, death, stage-ups, ghost, furballs, daily rollover), all actions (feed/pet/clean/medicine/evolve/shop), offline catch-up (`applyOffline`), medals, dex counts, care rank |
| `main.js` | 925 | Boot, asset preload with missing-asset guard, rAF loop, input (tap / long-press hit-testing), screen routing, sheet system (menu/profile/dex/evolve/medals/shop/settings/food/play), toasts, event dispatch, install prompt, SW registration |
| `scene.js` | 482 | Canvas scene: sky bands (day/night/theme), grass, decor placements, furballs, ghost Eevee, tombstone, egg |
| `pet.js` | 286 | Pet entity: PMD 8-direction multi-frame walks for the 4 PMD forms; procedural per-form chibi gaits (float/lope/flutter/skitter/sway) for the 5 chibi forms; idle breathing, squash-stretch, foot dust, emotes, sleep, sick tint, shiny glow |
| `casino.js` | 761 | POKÉ CASINO: slots with reel animation and line highlighting, roulette wheel, 3D card flips, chip FX, plus `spinInstant()` harness rounds for RTP parity tests |
| `audio.js` | 413 | Web Audio mixer: synthesized chiptune BGM (day/night/sleep), 40+ synthesized SFX, haptics (`navigator.vibrate`), settings-aware (sound/haptics toggles take effect live), unlock-on-first-gesture |
| `prng.js` | 45 | Seeded mulberry32 + weighted/int/pick/chance helpers + the force-outcome queue |
| `save.js` | 42 | localStorage persistence: versioned schema, hydrate with fresh-state defaults, session-only field stripping |
| `dev.js` | 208 | `window.TamaGame` test/dev API + time-mock harness (see below) |

Supporting files: `index.html` (163 lines, all screen/sheet shells),
`style.css` (576 lines, pixel UI theme, toasts, sheets, compact
`max-width: 374px` rules), `manifest.webmanifest`, `sw.js` at the web root
(network-first for shell + code, cache-first for assets, precached on cold
boot).

### Asset map (`A` in config.js)

| Prefix | Resolves to (relative to the game dir) | Contents |
|---|---|---|
| `A.scene` | `../prod/scene/` | sky tiles, grass, trees, bushes, decor art |
| `A.fx` | `../prod/fx/` | hearts, egg cracks, furballs, pet bed, tombstone |
| `A.items` | `../prod/items/` | berries, snacks, poke balls, medicine |
| `A.stones` | `../prod/stones/` | the 5 evolution stones |
| `A.dex` | `../prod/dex_anim/` | dex GIFs for the 9 forms (normal + shiny) |
| `A.particles` | `../prod/particles/` | sparkle/magic/smoke/star particles |
| `A.chibi` | `../pokemonsleep/` | chibi pet art, one PNG per form, normal + shiny |
| `A.cafe` | `../cafemix/` | profile face art |
| `A.p1` | `../tamagotchi_original/` | 1996 P1 HUD reference sprites |
| `A.boardgame` | `../prod/kenney/boardgame-pack/PNG/` | chips, boardgame icons |
| `A.cardsTint` | `cards/` (game dir) | casino card art |
| `A.fashion` / `A.logo` | `prod_art/` (game dir) | hand-crafted: fashion items, title logo, slot cabinet, medal icons |
| `A.icon` | `icon/` (game dir) | PWA icons |
| `A.audio` | `../prod/audio/` | (reserved; current audio is synthesized) |

The 4 PMD forms (Eevee, Vaporeon, Jolteon, Flareon) walk from multi-frame
8-direction sprite sheets sourced from `assets/ref/eeveelution-assets/`.
The 5 chibi forms (Espeon, Umbreon, Leafeon, Glaceon, Sylveon) are single
chibi PNGs, so `pet.js` synthesizes their gait procedurally: each has its own
frequency, squash-stretch, foot-pivot behavior, and idle flavor (Espeon
floats, Umbreon lopes with a lean, Leafeon flutters, Glaceon skitters,
Sylveon sways), plus per-form breathing and ear twitches.

### Randomness and determinism

All randomness flows through the single seeded PRNG. A complete playthrough
is reproducible with `seed(n)`; the showcase video additionally uses the
force queue to script the casino (a probed seed whose first spin is a clean
loss and second a small win, then a forced 777 jackpot, a forced roulette
segment, and a forced card deal). The casino harness (`spinInstant`)
recomputes rounds with the same draw order as the live reels, which the RTP
scenario asserts.

### Invariants for contributors

- Keep `state.js` pure (no DOM, no canvas). New rules go there; new
  visuals go in `scene.js` / `pet.js`; new UI goes in `main.js`.
- Route all new tunables through `config.js` (one file to balance the game).
- Route all new randomness through `prng.js` (never `Math.random`).
- Push an event for anything the UI must react to; do not call UI code from
  state.
- No emojis in the UI. New art must be style-matched and vision-verified
  (see Testing).
- Keep the zero-dependency promise: the game must still boot from
  `python -m http.server` with no build step.

## Repository structure

```
eevee-tamagotchi/
  README.md                 this file
  LICENSE                   MIT, scoped to the original code and hand-crafted art
  .gitignore                OS junk plus the local-only working files
  assets/
    ref/                          <-- WEB ROOT: serve this directory
      eevee_tama/                 the game
        index.html                screen/sheet/HUD shells
        style.css                 pixel UI theme
        manifest.webmanifest      PWA metadata
        src/                      10 ES modules (see module map)
        cards/                    casino card art
        icon/                     PWA icons
        prod_art/                 hand-crafted art (title, slot cabinet, medals)
      sw.js                       service worker
      prod/                       production art: scene, fx, items, stones,
                                  particles, dex_anim, font, audio, kenney source packs
      pokemonsleep/               chibi pet art (5 forms, normal + shiny)
      cafemix/                    profile face art
      eeveelution-assets/         PMD 8-direction walk sheets + emote FX
      tamagotchi_original/        1996 P1 HUD sprites (dock icons)
      serebii/                    egg art (egg_colored.png)
  test/
    scenarios.js              26-scenario quality gate (6-device matrix, ~2 min)
    video.js                  full-playthrough showcase recorder (~3.5 min)
    shots.js                  key-state screenshots
    chibi_anim.js             per-form chibi gait verifier (contact sheets)
  showcase/
    video/                    full-playthrough.mp4 (3:34)
```

The tree above is what a fresh clone contains. Working files that are not
published (research notes, source and reference art, art generator
scripts, audition pages, the old MVP build, extra screenshots, and the
raw video recording) live in the author's local copy and are listed in
`.gitignore`.

## Testing and development tools

### Quality gate

`test/scenarios.js` is the gate before any commit that touches the game. It
runs 26 scenarios (boot, hatching, feeding, petting, furballs, sleep,
sickness, evolution for every form, shiny, dex, shop, casino RTP and
forced-outcome parity, ghost, offline catch-up, persistence, UI layout)
across a 6-device mobile matrix (iPhone 15 Pro, Pixel 9, iPhone SE, Galaxy
S24, iPad Air portrait, iPhone 15 Pro landscape). Each device must meet
quality floors (fps 55 on the primary phone, 45 elsewhere, 42 landscape;
frame p95 <= 34 ms), report zero console errors, and pass all
scenario assertions. A typical full run takes about 2 minutes.

### Vision rule

Every visual change is verified with Playwright screenshots **and** an
actual look at the frames (contact sheets for anything animated). The
standing bar is "fun and mesmerizing": toasts, emotes, and confetti must
read correctly at phone scale. Close all Playwright browsers when a run
finishes.

### Dev API (`window.TamaGame`)

`dev.js` exposes the harness used by all tests and by manual play in the
console:

| Group | Methods |
|---|---|
| Read | `get()` (state snapshot), `state()` (raw), `fps()` (avg/p95/min) |
| Clock | `warp('HH:MM')`, `warpTo(gameMin)`, `addMinutes(n)`, `setDay(n)`, `rate(x)`, `freeze()`, `unfreeze()` |
| State | `setStats(meal, happy, energy, health)`, `setSick(b)`, `setSleeping(b)`, `setStage(stage)`, `setForm(form)`, `forceShiny(b)`, `setAffinity(v)`, `setName(n)`, `setPersonality(k)`, `setCoins(v)`, `addPoop(n)`, `setDex(b)`, `grantShop([keys])`, `setTheme(theme)` |
| RNG | `seed(n)`, `forceNext({ game: value })` |
| Actions | `feedMeal(key)`, `snack(key)`, `pet()`, `clean()`, `medicine()`, `giveStone(k)`, `evolveTo(form)`, `play(won)`, `coins(delta)`, `giveBall()`, `skipSleep()` |
| Lives | `newEgg(opts)`, `hatchNow()`, `newLife(opts)` |
| Offline / save | `simulateOffline(realSeconds)`, `showAway(report)`, `saveNow()`, `ageSave(msAgo)` |
| UI | `show(screen)`, `openMenu()`, `openProfile()`, `openFood()`, `openPlay()`, `openSheet(which)`, `emote(type, bubble)`, `burst(kind, n)`, `toast(msg)`, `reset()` |
| Audio | `audioUnlock()`, `setBgm(track)`, `setBgmMood(m)`, `fireEvent(name)`, `fireSfx(name, opts)` |
| Casino | `casinoSpin(game, n, opts)` (instant harness rounds, RTP parity with live reels) |

### Writing a new test

The established pattern (see `test/scenarios.js`):

```js
const T = (m, ...a) => page.evaluate(([mm, aa]) => window.TamaGame[mm](...aa), [m, a]);
// boot guard:
await waitFor(page, () => window.TamaGame && window.__G && !window.__G.booting
  && window.__G.img.missing.length === 0, 45000, 'boot');
```

Boot on a fresh profile (`localStorage.clear()` + reload), drive the game
through `T(...)` for state and Playwright mouse events for real UI, assert
on `TamaGame.get()`, and collect `pageerror` / console errors into a fail
list.

### Gotchas

- Serve `assets/ref` (not the repo root) or every `../` asset path breaks.
- Port 8734 is hardcoded as the default in all test scripts; override with
  `TAMA_URL`.
- Headless Web Audio unlocks on the first user gesture; tests tap the title
  first, and audio assertions must tolerate a suspended context.
- Test screenshots are 2x CSS pixels (deviceScaleFactor 2), so crop
  coordinates are doubled relative to the 430x932 design space.
- The HUD updates at ~4 Hz by design; assert state, not per-frame HUD text.
- Playwright teardown can leak `chrome.exe` processes on Windows; purge
  `ms-playwright` processes after runs.

## Asset sources and credits

Only the assets the game loads at runtime are published in this repo. The
main sources, in one line each:

| Source | Used for | Status |
|---|---|---|
| Original hand-crafted art | title logo, slot cabinet, medal icons, fashion items, stones, and similar | MIT, original work |
| Kenney (CC0 packs) | casino chips and boardgame icons, cards, tiles, particles, UI art, SFX and jingle sound files | CC0 |
| Google Fonts (Press Start 2P, VT323) | pixel UI fonts in `prod/font/` | SIL OFL |
| Official Pokémon artwork | dex animations in `prod/dex_anim/` | third-party, owned by Nintendo / Creatures Inc. / GAME FREAK |
| Pokémon Sleep | chibi pet sprites in `pokemonsleep/` | third-party |
| Fan-made PMD Eeveelutions pack | 8-direction walk sheets and emote FX in `eeveelution-assets/` | fan-made, third-party |
| Café ReMix | profile face art in `cafemix/` | third-party |
| 1996 P1 Tamagotchi | HUD dock icons in `tamagotchi_original/` | third-party |
| 2019 Eevee x Tamagotchi (Serebii) | egg art in `serebii/egg_colored.png` | third-party |

Per-asset source links and license notes are kept in the project's working
files and are not published. Third-party assets remain the property of
their respective owners.

## Conventions

- Commits are milestone-scoped: `M#: summary`, with a detailed body.
- The game stays zero-dependency and build-free; test tooling (Playwright)
  is dev-only.
- Only the assets the game loads at runtime are committed. Working files
  (research notes, source and reference art, art generator scripts,
  audition pages, the old MVP build, extra screenshots, and the raw video
  recording) are gitignored and kept in the author's local copy.
- This is a non-commercial fan project, with no ads and no monetization.
  See `LICENSE` for what the MIT license does and does not cover, and the
  Fan Project and Legal Notice below.

## Fan Project and Legal Notice

This is a non-commercial fan project made by a fan, for fans. It is not
affiliated with, endorsed by, sponsored by, or connected to Nintendo,
Creatures Inc., GAME FREAK, The Pokémon Company, or Bandai.

- **Original work in this repo:** the game code (all vanilla JavaScript ES
  modules, `sw.js`, and the test scripts) and the hand-crafted art (title
  logo, slot cabinet, medal icons, fashion items, stones, and similar) are
  original work, released under the MIT license in `LICENSE`.
- **Third-party assets:** the game uses assets from many sources, including
  official Pokémon artwork, fan-made sprite packs, and CC0 asset packs. The
  main sources are listed in the [Asset sources and
  credits](#asset-sources-and-credits) section above. Those assets remain
  the property of their respective owners; the MIT license in `LICENSE`
  does not claim or license them.
- **Names and likenesses:** Pokémon, Eevee, the Eeveelutions, Tamagotchi,
  and all related names, characters, images, and elements are the property
  of their respective owners. They are used here for fan use and
  identification only, with no commercial intent.
- **Removal requests:** if a rights holder asks for any asset to be
  removed, it will be removed promptly.
