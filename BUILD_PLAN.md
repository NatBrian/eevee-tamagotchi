# BUILD PLAN — Eevee-Tama production build (concrete)

> Companion to GAME_DESIGN.md. Everything is concrete: exact numbers, file paths, screen layouts, and per-milestone acceptance gates.
> **Quality gate (standing rule):** after EVERY milestone, test with Playwright (3 mobile viewports: iPhone 15 Pro 393×852, Pixel 9 412×915, iPhone SE 375×667 + landscape check) and **vision-review every screenshot** for: no overflow/misalignment, crisp pixel art, spacing/typography, animation fluidity (60 fps via dev API FPS readout), and "fun/mesmerizing" feel. Iterate until it passes, then commit.

## 0. Deliverable

- Production app: **`assets/ref/eevee_tama/`** (served at `http://localhost:8734/eevee_tama/`)
  - `index.html` · `style.css` · `manifest.webmanifest` · `sw.js`
  - `src/main.js` (boot, screen router) · `config.js` (ALL data tables) · `state.js` (tick machine + **seeded PRNG**) · `scene.js` (canvas compositor) · `pet.js` (sprites + wander AI) · `casino.js` · `ui.js` (DOM) · `audio.js` (Web Audio + haptics) · `save.js` · `dev.js` (**TamaGame test/dev API — the time-mock harness**)
  - `test/scenarios.js` (25-scenario suite, run in-page via Playwright)
- MVP `tamagotchi_sim/` stays untouched (reference). Repo commits per milestone.

## 1. Time & stats (exact)

- **1 game-hour = 30 real seconds** (2 game-min/s). `total` = game-min since Day 1 07:00.
- Stages: **Egg** 0–120 (60 s) · **Baby** 120–1440 · **Child** 1440–2880 · **Adult** ≥2880 (adult at 24 real-min) · Sylveon day 3 22:00 (total 3780) · **Graduation day 4 07:00 (total 4320, life ≈ 36 real-min)** per GAME_DESIGN.md line 74/100
- Sleep: 20:00–07:00 auto (if energy < 40 at 20:00, else forced rest at 03:00). **Tap during sleep → skip to 07:00.**

| Stat | Decay/game-hr | Sources |
|---|---|---|
| Meal 0–100 | −4 | Meal +34 (fave +8 / disliked +17) · Rawst +20 meal +25 health |
| Happy 0–100 | −3 (−6 while sick) | Pet +6 (1.5 s cd; >10 pets/30 s → +2 each) · Minigame win +15 / loss +8 · Clean +4 · Furball spawn −2 |
| Energy 0–100 | −5 | Sleep → 100 at 07:00 · Chesto +10 |
| Health 0–100 (hidden) | −2/hr while any stat = 0 | Furball −2 each · Snack #4+/day −3 · Rawst +25 · Medicine = full |
| Sickness | after **6 zero-hours** (guaranteed) | Cure: medicine or Rawst. Death: sick + **14 zero-hours** |
| Furballs | 1 per 4–8 awake game-hrs, max 5 on scene | 10-game-hr grace after hatch; none while sleeping; 5 on scene = Happy decay ×2 |

**Affinity** (0–100, starts 50): +1 meal when Meal ≥30 · +0.5 pet (cap +10/day) · +2 minigame win · −3 sickness · −1 per furball (cap −5/day).
**Evolution (adult, once per life):** stones → Vaporeon/Jolteon/Flareon/Leafeon/Glaceon (instant) · **Espeon** = 07:00–12:00 + affinity ≥70 + snack · **Umbreon** = 18:00–20:00 + affinity ≥70 + snack · **Sylveon** = age ≥4320 + 22:00 + affinity ≥80 (auto).
**Shiny:** 1/50 at hatch; tinted from hatch (PMD `hue-rotate(150deg) saturate(1.35)`; chibis use native shiny art).
**Care rank:** S = no sickness + Happy avg ≥85 + all 3 stages reached · A = no sickness · B = ≤1 sickness · C otherwise.

## 2. Personalities (rolled at hatch)

| Key | Fave meal | Fave snack | Lucky slot symbol | Emote | Bubble |
|---|---|---|---|---|---|
| cheerful | Sitrus | Sweet Heart | Sweet Heart | cheer | "Eevee!" |
| mellow | Oran | Honey | Poké Ball | chat | "Eeve~" |
| feisty | Cheri | Rage Candy Bar | 7 | shock | "Bark!" |
| sleepy | Chesto | Honey | Great Ball | worry/doze | "Zzz…" |
| sweet | Pecha | Sweet Heart | Ultra Ball | cheer+hearts | "Moe!" |

Rawst = health berry (nobody's fave). Names (20): Mochi, Biscuit, Coco, Pudding, Sakura, Tofu, Fluffy, Ash, Pepper, Maple, Cocoa, Clover, Dango, Honey, Miso, Piko, Riko, Tama, Yuki, Zephyr.

## 3. Poké Casino (exact)

1 currency = **Tama Coins** (chips). **Daily free 50** at each 07:00.

**Eevee Slots** — 3 reels, bet 1/2/3 → 1/3/5 paylines (3 horizontal + 2 diagonals). Symbols (per-reel weights): 7 8% · Poké Ball 16% · Oran 24% · Sweet Heart 24% · Eevee face 28% (house edge ≈ small; pet-friendly). Three-of: 7 **×30** · ball **×10** · oran **×5** · heart **×4** · eevee **×3**; pair on a line **×1.5** (min 1); personality lucky symbol in three-of → **×1.2**. Reels stop staggered 0.5/0.9/1.3 s; jackpot = confetti + fanfare + bonus free spin.

**Eeveelution Roulette** — 12 slots = Vaporeon/Jolteon/Flareon/Espeon × red/blue/green. One coin. Bets: color **×2** · Eeveelution **×4** · exact slot **×12**. Canvas wheel, 3 s eased spin, Poké Ball lands (RNG pre-rolled). Landed form = pet's actual/future form → big cheer emote.

**Card Flip** — 4 unique random cards (Kenney 52). Bet one. Highest rank **×4**, tie = push. Suits themed: ♥ Fire · ♦ Water · ♣ Grass · ♠ Thunder. 3D flip reveal, staggered 0.25 s.

SFX: bet = chip-lay · spin = card-slide/chips-collide · win = confirmation+coin · soft loss = error (low vol) · jackpot = bong + fanfare. Medals: Lucky Eevee (net +100 all-time) · Jackpot (a 777 line) · High Roller (net +500 one session).

## 4. Shop & medals

**Shop (12):** Decor — snowman 100 · mushroom patch 80 · flower patch 80 · second tree 120 · berry bush 150 (PIL recolor) · Fashion (PIL pixel, worn by pet) — red bow 100 · blue scarf 120 · leaf hat 150 · star clip 200 · Themes — night 100 · sunset 100 (sky/accent recolor).
**Medals (36):** hatch · meal1 · pet10 · clean10 · meals50 · game1 · spins10 · lucky · jackpot · highroller · evo-any · 9× evolution · 9× shiny · dex9 · dex18 (Eevee Master) · adult · death1 · lives3 · rankS · day7 · day30.
**Monthly events:** 5/15/25 shop 50% off · 10/20/30 shiny day (1/25) · 15th of even months: ghost Eevee visits at night.

## 5. Scene layout (430 logical width, canvas full-bleed 430×932)

- Sky band y 0–390 (sky tile stretched, 3 variants day/sunset/night) · far meadow y 390–470 (meadow_far tiles, seeded) · grass band y 470–932 (grass_top ×4 tiling + dirt edge)
- Decor (seeded positions): tree (260, 470) · tufts ×4 (50–380, 500–560) · bush (90, 640) · mushroom (330, 700) · pet bed (120, 780) · snowman (370, 800)
- **Pet** wanders x 60–370, y 540–840; depth scale 0.85→1.15 by y; PMD forms ~92 px tall @1.0, chibis ~110 px; shadow ellipse; faces movement dir (8-dir PMD)
- Night: sky_night + 20% blue multiply + 40 star dots + 6 firefly particles
- UI: HUD top (safe-top + 8 px) · dock bottom (5 × 58 px buttons, 12 px above safe-inset) · toasts y 110 · sheets max 72dvh

## 6. Screens

S_TITLE (logo + TAP TO HATCH) · S_EGG (egg 120 px @ (215,620), crack frames @40/75%, wobble on tap) · S_MAIN (above) · S_FOOD (bottom sheet: 6 meals + Rawst [HEALTH tag] + 4 snacks, art + fave ★) · S_PLAY (3 casino tiles + Give Ball) · S_CASINO (board canvas + coins top + bet/SPIN bottom) · S_DEX (3×6 grid, 116 px cells, silhouettes, tap → detail card + SHINY banner) · S_PROFILE (Café face 220 px, name+rename, personality, rank, stat bars, medals) · S_MEDALS (list) · S_SHOP (3 tabs) · S_AWAY ("While You Were Away" report) · S_EVOLVE (flash → sparkle → dex GIF → name card → confetti) · S_END-graduation (sunset, walks off, farewell card) / S_END-death (tombstone, R.I.P. card, New Egg) · S_SETTINGS (sound, haptics, reset, about)

## 7. State machine (state.js)

```
TITLE → EGG(120) → ALIVE {awake | asleep | sick}
ALIVE --evolve--> EVOLVE(cinematic) → ALIVE(evolved form)
ALIVE --age ≥ 4320 (day 4 07:00)--> GRADUATION
ALIVE --neglect--> DEATH
{GRADUATION, DEATH} → (dex/medals/coins settle) → EGG (new life, Dex+medals persist)

tick(dt): advanceClock → decay → furballs → sleep → sick → stage → evolve → render
events: feed(meal|snack) · pet · clean · play(game) · medicine · giveStone(k) · skipSleep · newEgg
```

## 8. Save (save.js, localStorage `eevee_tama_v1`)

```json
{ "v":1, "savedAt": ms, "total": 3120, "form":"eevee", "shiny":false, "stage":"adult",
  "stats":{"meal":80,"happy":92,"energy":60,"health":100}, "sick":false, "sleeping":false,
  "pet":{"name":"Mochi","personality":"cheerful","affinity":66}, "furballs":1,
  "day":{"snacks":1,"coins":50,"coinsDate":"D1"},
  "dex":{"133n":1,"133s":0,"134n":1,"134s":0,...}, "medals":{"hatch":1,"meal1":1},
  "shop":{"owned":["snowman"],"equippedDecor":["snowman"],"fashion":null,"theme":"day"},
  "life":{"meals":12,"pets":40,"wins":5,"spinCount":12,"netCoins":34,"sickCount":0,"maxHappy":100,"stageUp":true},
  "allTime":{"lives":2,"meals":80,"furballs":14,"firstSeen": ms},
  "settings":{"sound":true,"haptics":true} }
```
Autosave every 5 s + `pagehide`/`visibilitychange`. **Offline catch-up:** elapsed real s × 2 game-min, cap 72 game-hrs, meters floor 10 (no death away), generate S_AWAY report.

## 9. Milestones (each ends with the Playwright+vision quality gate + commit)

| # | Milestone | Concrete tasks |
|---|---|---|
| **M1** | Scene + pet | index/style/manifest skeleton · scene.js compositor (pre-rendered static layers, day/night, stars/fireflies) · pet.js (PMD loader: 4 forms × 8 dirs × {idle 6, move 7, attack 6, hurt 3}; chibi loader: 9×2; wander AI; shadow; depth scale) · emote pops (7 emotes: cheer 6f, worry 7f, shock 12f, confused 27f, surprise 25f, water 7f, chat 8f) · dev API v2 (freeze/warpTo/setForm/renderAll/fps) · **PIL: title logo, PWA icons 192/512** |
| **M2** | HUD + dock + food | HUD DOM (Day/clock/stage chip, stat pips w/ P1 icons, alert badges) · dock (5 btns: Oran art, Poké Ball, pixel heart, P1 bathroom, gear) · toast system · S_FOOD sheet · feed/snack actions + eat anim (item in front + crunch + emote) · real-time decay loop |
| **M3** | Mess/sick/sleep | furballs (spawn/clean/sparkles) · sickness (P1 medicine icon, sad emote) · **PIL: medicine bottle** + medicine action · sleep (pet bed, Zzz float, night scene, skip-to-morning) · death conditions |
| **M4** | Lifecycle + Dex + endings | egg screen (crack frames, wobble) · stage scaling (baby 0.6×, child 0.8×, adult 1.0×) · evolution (5 stones, 2 windows, Sylveon auto) + cinematic (flash/sparkle/dex GIF/confetti) · shiny reveal · S_DEX (18 cells, GIFs, silhouettes, persistence) · graduation + death endings |
| **M5** | Poké Casino | casino.js: slots (**PIL: slot cabinet**), roulette (canvas wheel + chibi faces), card flip (Kenney cards, 3D flip) · bet/coin UI · pet reactions at machine · daily free chips · casino SFX wiring |
| **M6** | Meta | personality roll + lucky symbol · S_PROFILE (+rename, rank) · S_MEDALS (36) · S_SHOP (12 items; **PIL: 4 fashion items, berry bush, ghost Eevee**) · monthly events |
| **M7** | Audio + haptics | audio.js (Web Audio mixer; BGM day/night from selected jingles; full SFX map incl. casino) · haptics bridge (Vibration API tiers) · settings toggles · audio unlock on first tap |
| **M8** | Persistence + PWA | save.js v1 (schema §8) + autosave · offline catch-up + S_AWAY · sw.js + manifest polish + install prompt · settings/reset |
| **M9** | Final pass | title/boot, first-run context tips, balance pass (RTP/decay), Playwright regression (3 viewports + landscape), full-life showcase screenshots, README run instructions, final commit |

## 10. PIL assets still to craft

slot cabinet (candy pixel, ~300×260) · medicine bottle · 4 fashion items (bow/scarf/leaf hat/star clip) · berry bush (bush recolor) · ghost Eevee (PMD alpha+hue) · title logo · PWA icons 192/512 + maskable. All vision-verified on contact sheets first.

## 11. Risks & mitigations

- **iOS Safari gaps**: no Vibration API (degrade silently), no wake lock (skip), audio unlock (handled on first tap), `dvh` (iOS 15.4+ — fine)
- **PMD per-form frame quirks** (sleep only vaporeon/jolteon/flareon): pet.js falls back to idle + Zzz for eevee
- **18 dex GIFs weight** (~2–4 MB): lazy-load only when S_DEX opens; cache
- **Pixel crispness at arbitrary DPI**: DPR-capped canvas (3×) + nearest-neighbor; verify in gate
- **User audio picks pending**: M7 uses placeholders (NES00 day / NES16 night / NES01 evolve) until audition done

## 12. Testing protocol (standing rule — every milestone)

### 12.1 Time mocking & determinism (dev API = test harness, `src/dev.js`)
All randomness (shiny roll, furball timing, personality, names, casino reels, roulette ball, card draw, monthly-event rolls) flows through **one seeded PRNG (mulberry32)** → every scenario is reproducible. `window.TamaGame` exposes:
- **Clock**: `warp(hhmm)` / `warpTo(absGameMin)` (jump to any time) · `setDay(n)` (monthly events) · `rate(x)` 1–1000× (watch fast-forward live) · `freeze()/unfreeze()` (stable state for screenshots)
- **State**: `setStats(meal,happy,energy,health)` · `setSick(b)` · `setSleeping(b)` · `setStage/setForm` · `forceShiny(b)` · `addPoop(n)` · `evolveTo(form)` · `giveStone(k)` · `newEgg()`
- **RNG**: `seed(n)` · `forceNext({ spin:[a,b,c], roulette:slotIdx, cards:[r1..r4], shiny:bool })`
- **Readout**: `get()` (full state JSON for assertions) · `fps()` (avg + p95 frame ms, rolling 2 s) · `screenshots` are taken with `freeze()` on

### 12.2 Scenario suite (`test/scenarios.js` — run in-page via Playwright `evaluate`)
Each scenario = setup (dev API) → action → **assert on `get()` + DOM** → screenshot evidence → PASS/FAIL. Green board required before a milestone commits.

| # | Scenario (time-gated ones use clock mock) |
|---|---|
| S01 | Egg → hatch at 120 (crack frames at 40/75%, wobble on tap) |
| S02 | Baby→Child→Adult via `warpTo(1440/2880)`; stage scaling 0.6/0.8/1.0 |
| S03 | Each stone → correct form + cinematic + dex cell (×5) |
| S04 | **Espeon**: `warp(10:05)` + affinity 70 + snack → Espeon |
| S05 | **Umbreon**: `warp(19:00)` + affinity 70 + snack → Umbreon |
| S06 | **Sylveon**: `warpTo(day3 22:00)` + affinity 80 → auto Sylveon |
| S07 | Shiny: `seed(1)` + `forceShiny(true)` → tinted Eevee + shiny dex cell |
| S08 | Neglect: stats 0 for 6 game-hrs → sick → medicine → cured |
| S09 | Over-snack: 4 snacks/day → tummy-ache roll (seeded) |
| S10 | Death: sick + 14 zero-hrs → tombstone → New Egg → **dex persists** |
| S11 | Graduation: `warpTo(day4 07:00)` healthy → farewell scene |
| S12 | Furballs: spawn to max 5, clean each, dirty ×2 decay, grace after hatch |
| S13 | Sleep: 20:00 auto (energy <40), Zzz + night scene, tap-skip → 07:00, energy 100 |
| S14 | **Offline**: `savedAt −12h` → reload → catch-up ≤ cap, meters floored 10, S_AWAY report correct |
| S15 | Slots: `seed(42)`, 10 000 simulated spins → RTP within 85–98%; `forceNext([7,7,7])` → ×30 + confetti + bonus spin; lucky-symbol ×1.2 per personality |
| S16 | Roulette: forced color/form/slot wins → ×2/×4/×12; pet reaction on own form |
| S17 | Card Flip: forced highest → ×4; forced tie → push/refund |
| S18 | **Monthly events**: `setDay(5)` shop 50% off · `setDay(10)` shiny 1/25 · `setDay(16)` ghost Eevee at night |
| S19 | Medals: trigger each of the 36 (scripted state paths) |
| S20 | Shop: buy/equip each item; coins deduct; persists across reload |
| S21 | Personality: fave meal +8, disliked +17, lucky symbol, bubble text |
| S22 | Daily free 50 coins at 07:00 (not before/after) |
| S23 | Rename + care rank S (no sickness, Happy avg ≥85) |
| S24 | Reload mid-life (all 9 screens) → state byte-identical |
| S25 | Dock/sheet touch flows: tap feed→meal, long-press pet→profile, tap furball→clean, casino SPIN — via Playwright `touchscreen` |

### 12.3 Playwright device matrix (MCP) — "correct mobile resolutions"
| Device | Viewport | DPR | Browser | Purpose |
|---|---|---|---|---|
| iPhone 15 Pro | 393×852 | 3 | mobile Safari | primary |
| Pixel 9 | 412×915 | 2.625 | Chrome | tall/edge |
| iPhone SE | 375×667 | 2 | mobile Safari | short/min-height |
| Galaxy S24 | 360×780 | 3 | Chrome | min-width edge |
| iPad Air (portrait) | 820×1180 | 2 | Safari | letterbox check |
| iPhone 15 Pro **landscape** | 852×393 | 3 | mobile Safari | rotate interstitial |

Every screen of a milestone is screenshotted on **all six**; the three phone sizes are the pixel-perfect gate.

### 12.4 Automated quality assertions (per screen × per device, fail = bug)
- No horizontal overflow: `scrollWidth ≤ clientWidth`; nothing clipped (element rects inside viewport)
- All assets loaded: every `<img>` `naturalWidth > 0`; canvas not blank
- Fonts: `document.fonts.check('12px PressStart2P')` && `document.fonts.check('16px VT323')`
- Console: **zero errors / uncaught exceptions** during the scenario run
- Touch targets: dock & sheet buttons ≥ 48 px, gaps ≥ 12 px (computed-style scan)
- **Fluidity**: `fps()` avg ≥ 55 and p95 frame ≤ 33 ms during walk cycle AND slot spin AND roulette spin
- Pixel crispness: pet-sprite edge spot-check — no half-alpha bleed (nearest-neighbor intact)
- Safe areas: HUD top ≥ `safe-area-inset-top`, dock bottom ≥ `safe-area-inset-bottom`
- No dead ends: every screen reachable has a visible back/close/continue

### 12.5 UI/UX perfection checklist (vision review pass/fail, per screen)
Alignment & spacing (no crowding, consistent 8 px rhythm) · pixel art crisp at all 6 viewports · palette harmonious with PMD/soft pastels, day/night both readable · typography: Press Start 2P labels / VT323 body, no tiny text (<14 px) · motion: 150–300 ms tweens, snappy, no jank, feedback **above the finger** · icons consistent (our art, no emojis) · sheets/toasts never cover the pet or dock · every action has visual + audio + haptic feedback · "fun/mesmerizing" gut check: would you screenshot it?

### 12.6 Flow (per milestone)
1. Build milestone code.
2. Run `test/scenarios.js` (all applicable scenarios) in iPhone-15 context → green board.
3. Device-matrix screenshots of every screen + 2 in-motion captures (walk, casino spin) → **vision review** against 12.4 + 12.5.
4. Iterate until green **and** beautiful → commit with the screenshot evidence in `showcase/`.
5. M9 = full regression of all 25 scenarios × all 6 devices.
