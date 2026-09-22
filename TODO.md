# TODO — Eevee Tamagotchi (asset research + build)

## Phase 0 — Setup
- [x] Create project folder + git repo (`eevee-tamagotchi/`)
- [x] Create README, TODO, RESEARCH log
- [x] Define requirements (9 forms, shinies, animation states, any style, free OK)

## Phase 1 — Research (find the best assets) — DONE
- [x] Search: official Pokémon sprites (PokeAPI raw repo — all 9 + shinies, verified)
- [x] Search: Eevee × Tamagotchi (real product) — full official sprite set + care/evolution mechanics
- [x] Search: 3D rigged/animated Eevee (Sketchfab "pokedex 3d pro eeveelutions", free3d, turbosquid)
- [x] Search: itch.io / DeviantArt / PMD fan packs
- [x] Search: generic pet/tamagotchi + "holy grail" single pack (none exists — combine sources)
- [x] Inspect asset pages with Playwright + view every asset with vision
- [x] Log all candidates to RESEARCH.md (18 searches, 4 groups)
- [x] Shortlist: **Top 3 usable groups** (PokeAPI 2D / Eevee×Tamagotchi chibi / 3D Pokedex) + PMD bonus
- [x] **DECIDE: which group(s) + style tier to use** → winning combo: **PMD (4 animated forms + 7 emote sets + stones) + Pokémon Sleep chibis (5 static forms + native shinies) + Café ReMix Eevee faces + PokeAPI art/showdown GIFs + original P1 Tamagotchi HUD icons + Eevee×Tamagotchi care rules** (see RESEARCH.md "SIMULATION BUILT")

## Phase 2 — Acquisition
- [x] Pick group(s) + style tier(s) (see RESEARCH.md Top 3)
- [x] Bulk-rip chosen 2D assets into `assets/ref/` (PMD sprites, Sleep chibis, Cafe ReMix, PokeAPI art, Serebii Eevee×Tama, P1 icons, showdown GIFs)
- [x] (skipped) 3D models — 2D is sufficient for the MVP; Pokedex-3D-kept as a future option
- [x] Gather/author overlay FX: hearts, tears, anger mark, Zzz, poop, food, hand, evolve-flash (PMD emotes + emoji food/poop + GIF cinematics)
- [x] Colorize chibi set + add shinies (PIL `make_egg.py` for egg; native Sleep shinies + PMD hue-rotate for others)
- [x] Verify each form has the needed states (fill-gaps list — see RESEARCH.md mapping table)

## Phase 3 — Gap filling
- [x] Identify missing animation states (esp. `poop`, `petting`, `evolve`)
- [x] Plan how to cover gaps (runtime color-swap for shinies, composite poses, small custom art) → all covered by the combo above

## Phase 4 — MVP Build (vanilla web, no framework) — DONE
- [x] Pick engine/framework → **vanilla JS + HTML/CSS, zero deps, no build step** (fastest path; logic ports to Godot/Unity later)
- [x] Set up project (`assets/ref/tamagotchi_sim/`)
- [x] Wire pet state machine (egg/baby/child/adult, idle/walk, eat/play/pet/clean, sleep, sick, dead)
- [x] Evolution + shiny collection system (5 stones + Espeon/Umbreon time-window snacks + 72h Sylveon; 1/50 shiny; 9-cell Dex persists across eggs)
- [x] Showcase driven via Playwright: full lifecycle captured (`tama_s01`–`tama_s22`, final = egg + 9/9 Dex + shiny badge)
- [ ] Save/progress persistence (Dex is in-memory per session — could add localStorage next)

## Phase 5 — Production asset gather — DONE
> Driven by **ASSET_PLAN.md** (categories A–I); every batch vision-verified against PMD/Sleep style (contact sheets: `preview_prod*.html`, `preview_fx.html`, `preview_scene6x.html`, `preview_tilezoom.html`). Research: RESEARCH.md S28–S33.
- [x] Write asset TODO list (ASSET_PLAN.md, categories A–I)
- [x] PokeAPI official item art: 6 berries + 4 snacks (`prod/items/`) — vision-verified
- [x] PokeAPI gen-V animated Dex sprites 9+9 shiny (`prod/dex_anim/`) — vision-verified
- [x] Kenney CC0: Pixel Platformer scene tiles (grass/sky/meadow/tree/tufts/mushroom/…), Food Expansion, UI Pack, fonts Press Start 2P + VT323 (`prod/kenney/`, `prod/scene/`, `prod/font/`) — vision-verified at 6x
- [x] Hand-crafted PMD-palette art: furball, petbed, tombstone, egg cracks, leaf/ice stones, pixel heart (`prod/fx/`, `prod/stones/`) — vision-verified
- [x] Kenney audio: Interface Sounds + Music Jingles (NES chiptune), Particle Pack VFX (`prod/audio/`, `prod/particles/`) — RPG Audio rejected
- [ ] User audio audition via `preview_audio.html` → lock BGM (day/night) + jingles + SFX mapping

## Phase 6 — Production rebuild (IN PROGRESS) — `assets/ref/eevee_tama/`
> Plan: **BUILD_PLAN.md** (numbers, layouts, milestones). Testing protocol: BUILD_PLAN §12 (time-mock dev API, 25-scenario suite, 6-device Playwright matrix, automated assertions, vision review every milestone).

### M1 — Scene + pet ✅
- [x] App skeleton: `index.html` (430×932 logical, cover-fit, safe-area, portrait, viewport-fit=cover) · `style.css` (Press Start 2P + VT323) · `manifest.webmanifest`
- [x] `src/scene.js` — canvas compositor: pre-rendered static meadow (banded sky day/sunset/night + sun/moon + far meadow + organic tuft field), night stars + fireflies, 1 big blit/frame, DPR-capped 3× nearest-neighbor
- [x] `src/pet.js` — PMD loader (4 forms × 8 dirs; real counts idle 2/move 3/attack 2/hurt 1) + chibi loader (9×2) + wander AI (8-dir) + shadow + depth scale 0.85–1.15 + emote pops + cached shiny tint (offscreen, no per-frame ctx.filter)
- [x] Dev API v2 (`src/dev.js`): freeze/warpTo/setForm/rate/fps/get (time-mock harness)
- [x] PIL: title logo + PWA icons 192/512 (contact-sheet verified)
- [x] GATE: scenario smoke (title→egg→hatch→main, day/sunset/night, all forms, shiny, emotes) + 6-device screenshots (no overflow, rotate-hint in landscape) + vision review + 60fps/0 errors

### M2 — HUD + dock + food ✅
- [x] HUD DOM (Day/clock/stage chip, stat pips w/ P1 icons, low-stat flash) · dock (5 btn: FEED/PLAY/PET/CLEAN/MENU) · toast system · furball count badge on CLEAN btn + compact SICK badge
- [x] S_FOOD sheet (6 berries + Rawst [HEALTH] + 4 snacks, fave ★) · feed/snack actions + eat anim (startEat, no method/prop collision) + real-time decay loop
- [x] MENU sheet (PROFILE/POKÉDEX/MEDALS/SHOP/SETTINGS — no dead ends) · MEDALS (36, gold-star icon) · SHOP (buyShop, coin deduct, crate fallback for M5/M6 art) · SETTINGS (sound/haptics/reset) · pet bed decor renders (aspect-correct, no double-draw)
- [x] GATE: food/badge/menu/shop/settings/dex smoke + 6-device matrix (no overflow, 58–59fps, 0 errors) + vision + commit

### M3 — Mess / sick / sleep ✅
- [x] Furballs (spawn 4–8h, max 5, individual tap-clean + dock clean-all, dirty ×2 decay at max, count badge on CLEAN btn)
- [x] Sickness: 6 zero-hrs → sick (worry-drop emote, health decay) · PIL medicine bottle + floating MEDICINE button w/ SICK badge (moved out of HUD to prevent chip wrap) → cures, health 100
- [x] Sleep: 20:00 auto (energy<40), pet-bed rest spot, Zzz float, night scene, tap-skip → next 07:00 (fixed wake-at-00:00 bug; dailyRoll is level-based so midnight crossing safe)
- [x] Death: 14h sick or health 0 → tombstone + R.I.P. dialog + NEW EGG → egg screen
- [x] GATE: S08–S13 flows (sick/med/sleep/skip/death/fur-clean/neglect-sick) + 6-device matrix (59–60fps, 0 errors, no overflow) + vision + commit

### M4 — Lifecycle + Dex + endings ✅
- [x] Egg screen (crack frames @40/75%, wobble) · stage scaling 0.6/0.8/1.0 · evolution (5 stones, Espeon 07–12 + snack, Umbreon 18–20 + snack, Sylveon d3 22:00 auto)
- [x] Player stone economy: EVOLVE sheet (MENU row) — buy 5 stones @100 coins, USE (guard toasts: not-adult / already-evolved), affinity chip, time-window info; `buyStone`/`useStone` in state.js
- [x] Evolve cinematic (flash → sparkle → dex GIF → name card → YAY → confetti) + SHINY reveal (gold banner + shiny GIF + sh-<form> medal) · per-form evo-<form> medals · dex entries on evolve (fixed: evolveTo was never called in-game — `evolve:` event slice off-by-one `'evolve:'.length`=7; unified consume+evolveTo into state.js `tick()`)
- [x] S_DEX (18 cells, silhouettes, persistence) · chip-stage shows form name after evolve · setScreen forces HUD refresh (stale prev-life chip on instant end fixed)
- [x] Graduation (day 4 07:00, care-rank card) + death (tombstone, R.I.P.) endings · NEW EGG restart
- [x] Regenerated all 5 evolution stones (PIL `make_stones.py`): consistent 44×44 pixel gems from the water-gem template (leaf/ice had black bgs, fire was a sliver) — vision-verified
- [x] GATE: S01–S07/S10–S11 flows (stone→Vaporeon, shiny, Espeon 09:01, Umbreon 19:01, Sylveon auto d3 22:00, graduation rank S) + 6-device matrix on evolved Vaporeon (60fps / p95 ~17ms, 0 errors, no overflow, sheet fits 360px) + vision + commit

### M5 — Poké Casino ✅
- [x] PIL slot cabinet (candy pixel, `prod_art/slot_cabinet.png`) · 53 pixel playing cards (`cards/`, 4 unique: A♥fire K♦water Q♣grass J♠thunder + back)
- [x] `src/casino.js`: Eevee Slots (bet 1–3 → 1/3/5 paylines, 777 ×30, pair ×1.4, lucky ×1.2, staggered reel stops) · Eeveelution Roulette (12 slots, color×2/form×4/slot×12 bets, canvas wheel + pre-rolled ball, 3s eased) · Card Flip (4 unique, tap-pick, 3D flip, highest ×4, tie=push)
- [x] Bet/coin UI (BACK/tabs/bet/spin/msg), NOT-ENOUGH-COINS guard, pet takes machine spot + win/lose/jackpot reactions, toasts offset for casino; `casinoSpin` dev harness
- [x] GATE: 10k-spin RTP (slots ~1.02–1.10, rt color .69/form 1.02/slot .99, cards .99) + forced 777 & forced roulette + 6-device matrix (60fps, no overflow, 0 errors) + vision + commit

### M6 — Meta ✅
- [x] Personality lucky symbol wired to slots (×1.2 per personality; RTP shifts 0.85–1.04 across personalities) · bubbles/fave/dislike verified (42/17/34)
- [x] S_PROFILE: Café ReMix Eevee face (220px), inline rename (input+SAVE, persisted), personality/stage/rank chips, stat bars
- [x] Medals now awardable: jackpot (777, +free spin per S15), death1, rankS · GIVE BALL toy (arcing Poké Ball, +10 Happy, +2 bond)
- [x] S_SHOP art: 4 fashion (bow/scarf/leaf hat/star clip, rendered on pet), berry bush (scene decor), ghost Eevee (spectral, drifts at night on qualifying days, tap → +5 coins)
- [x] Monthly events: 5/15/25 sale 50% off (banner + strike-through + half-price purchase verified), 10/20/30 shiny 1/25, ghost night (0-based dom0=15 & even month0 → setDay(16) per S18)
- [x] GATE: S18/S21 via setDay + forced ghost + 10k-spin per-personality RTP + sale purchase + rename + 6-device matrix (59–60fps, p95 ~17ms, no overflow, 0 errors) + vision + commit

### M7 — Audio + haptics ✅
- [x] `src/audio.js` Web Audio mixer: unlock on first tap (iOS gesture), master→compressor, lazy-decoded SFX buffers (42 Kenney files, all decode-verified), dynamics-compressor limiter
- [x] BGM day/night: **procedural chiptune loops** (all 55 jingles are <2 s stingers, so ogg looping was unsuitable — day = 92bpm C-major square+triangle, night = 64bpm A-minor music-box w/ echo; `CFG.AUDIO.tracks[key].file` accepts an ogg pick later via echo-tail seamless loop). Crossfade on day/night change; mood ducking (title 0.55 / casino 0.6 / sleep 0.35)
- [x] Full SFX map incl. casino: every game event → sfx + haptic tier (fed/pet/clean/furball/sick/medicine/sleep/woke/hatch/stage/evolve/death/graduation/medal/buy/stone/coins/ball/ghost·in/out/cas spin·pick·jackpot·push; chip-lay on bet changes; 4 card flips with dedupe; bong+fanfare on 777) · universal tap feedback (any button → click + 6 ms buzz)
- [x] Vibration haptics tiers (silent degrade on iOS — `navigator.vibrate` feature-detected) · settings SOUND/HAPTICS toggles live (master gain ramp, test buzz)
- [x] `preview_audio.html` audition page repaired (real subdir paths, bong_002 removed, +RPG foley section)
- [x] GATE: unlock/day→night crossfade/sleep ducking/42-SFX decode/32-event fire + card-flip ×4 + settings gains + 6-device matrix w/ BGM (59–60fps, p95 ~17ms, no overflow, 0 errors) + commit

### M8 — Persistence + PWA ✅
- [x] `src/save.js` v1 (schema §8, hydrate w/ fresh-state defaults, strips session-only fields) + autosave 5s/pagehide/hidden (title-backdrop clobber fixed) · offline catch-up on CONTINUE (real s × 2 game-min, cap 72 game-hrs, meters floored 10 every step → no death away, actual-consumed-time report) + S_AWAY overlay (items / away-time / now line / OK → main or end screen) · `sw.js` (shell+code network-first, assets cache-first, precached cold-boot) + manifest polish (id/lang/prefer_related_applications) + install prompt (beforeinstallprompt → INSTALL row in settings, iOS hint) + settings ABOUT row
- [x] GATE: S14 (savedAt −12h → reload → CONTINUE: capped catch-up, meters floored exactly 10, S_AWAY "Your pet graduated!" + "Away 18h 30m · Now Day 4 07:01", OK → farewell screen) · S20 (all 12 shop items bought+equipped, coins 9999→8609, all persist across reload) · S24 (state byte-identical across reload from main / casino / food-sheet-open) · SW offline boot (0/286 assets missing, save resumes from localStorage) · install-prompt wiring · 6-device matrix 60fps / p95 16.8ms, no overflow, fonts, 60px dock targets, 0 errors · bug found+fixed: HUD rightmost meter clipped at 360px → compact @media (max-width:374px) rule · vision pass (title/CONTINUE, S_AWAY i15+gs24, settings i15+SE, offline main, 6 devices, landscape interstitial) + commit

### M9 — Final pass
- [x] First-run tips: `state.tips` (persisted, once-per-id gold TIP toasts) — hatch, first furball, first sick, first natural sleep, stage:adult, first casino open + no-save title hint (`state.js`/`save.js`/`main.js`/`style.css`)
- [x] Dev API: `openSheet(which)` / `showAway(report)` (`dev.js`) + `window.__CFG` debug hook
- [x] Balance pass: slots pair 1.4→1.2 (`config.js`) + removed win `Math.round` (fractional coins, rounded displays) → bet-1 RTP 88.4–94.7% across personalities, inside S15's 85–98% band
- [x] Casino harness parity: live card re-deal + `spinInstant` honor `forceNext({cards:[…], roulette:n})` (`casino.js`)
- [x] Chibi-form animation: espeon/umbreon/leafeon/glaceon/sylveon were static single frames (PMD 8-dir art only exists for 4 forms) → runtime walk-hop + face-direction mirror + idle/sleep breathing in `pet.js`; `chibiPx` 110→90 (`config.js`) so evolved chibi forms no longer out-scale the PMD forms
- [x] `test/scenarios.js` — 25 scenarios × 6 devices + quality gate green (26/26 on all 6 devices; initial Q-gate fluidity fails traced to ~31 leaked headless browsers from earlier capture runs → purged, clean re-run all green)
- [x] `test/video.js` — full-playthrough showcase video (webm→mp4 3:09; timeline + 0.5s dense + full-res frame-verified: title→egg→hatch→care→lapses, casino, 9-form animated chibi tour, dex/profile/medals/ghost/shop all clean, HUD clock monotonic — fixed ghost-beat backward warp 21:30→23:30 — away report "Away 7h 30m · Now Day 4 07:26", clean graduation → new egg → dex → title)
- [x] Refresh `showcase/` screenshots (22 shots `m9_01`–`m9_22`: full life incl. first-run tips, casino, evolutions, away report, graduation, new egg — vision-verified)
- [x] README "How to run" + repo layout
- [x] Final commit

### M9.1 — Per-form chibi gaits + showcase video fixes ✅
- [x] The 5 chibi forms shared "the same static animation" (PMD 8-dir art only exists for eevee/flareon/jolteon/vaporeon) → per-form procedural gaits via `CFG.CHIBI_ANIM` (`config.js`): espeon **float** (slow hover-bob), umbreon **lope** (springy bounce), leafeon **flutter** (quick light steps), glaceon **skitter** (fast tiny hops), sylveon **sway** (gentle side-to-side sway); each with own breathHz/breathAmp + idle ear-twitch timing; squash-stretch on landings, foot dust, foot pivot, shadow shrink while airborne (`pet.js` walkChibi/idleChibi/resetChibi) + idle personality chatter wired (`main.js` `G.pet.fx`)
- [x] `test/chibi_anim.js` — standing per-form gait contact-sheet verifier (all 5 gaits distinct, vision-verified)
- [x] Bug found via frame-level verification of the showcase video's final beat: `hatchNow` on an egg with total < eggEnd force-sets stage='baby', but the next tick's stage check reverted it to 'egg' (`stageOf(total<120)='egg'`) and fired a spurious `'stage:egg'` "grew up!" toast under the roll-1 name, then the subsequent `warpTo` natural-hatched a second time (roll-2 name) → two-name toast stack (run9: "Riko grew up!" + "It's Ash!"; the egg-stage `s.stage !== 'egg'` guard also swallowed "It's Riko!", and `startEgg` medal carryover suppressed the medal toasts). Fix: `STAGE_RANK` progression guard in the `advance()` stage check — stage only moves forward, a hatched pet never regresses to egg (`state.js`)
- [x] Showcase video shop-beat fix (`test/video.js`): natural coin flow lands ~55 at the shop so both purchases silently failed (runs 6–8) → top coins to 300 before the shop + `scrollIntoView` on the SKIES row (sheet body is scrollable; `tapEl` is a raw layout-coord click that missed below-the-fold)
- [x] Q-gate `DEVKEYS=iphone15` 26/26 green (123 s) after the stage fix · fps 60 / p95 16.8
- [x] Re-recorded showcase video (run10, 3:09, 0 console errors) — frame-verified end-to-end: opening (title→egg→hatch Tofu→FEED→dusk→night zzz→sick), casino roulette, 9-form chibi tour (incl. SHINY Glaceon), dex 9/18, profile, medals, ghost +5 coins, **shop payoff on screen: 300→180 Blue Scarf OWNED + Sunset Sky OWNED**, away "Away 7h 30m · Now Day 4 07:27" over sunset sky (scarf on Sylveon, MEDAL · S-Rank Care), clean graduation → new egg → **single-name hatch cascade** (stage-revert fix) → dex 9/18 over sunset sky → title outro (fresh day sky, theme reset)

### M10 — FINAL showcase video (full game, all interactions)
- [x] `test/video.js` rebuilt as a 26-beat, 3-act playthrough covering every game system:
  - **Act 1 (life 1):** title → egg wobble → hatch → meal → **snack** → pet → ball → **furball tap-clean + dock CLEAN button** → night sleep (Zzz) + wake → **child** → sick + medicine → **adult** → casino (**deterministic seed-probed LOSS "SO CLOSE…"** → small WIN → **bet 3** → 777 JACKPOT + free spin + medal → roulette win → card flip) → Vaporeon cinematic → tour of all 7 remaining forms (incl. SHINY Glaceon; Umbreon rolled a natural 1/50 shiny this run) → dex 9/18 → **long-press profile + rename** → medals → ghost Eevee +5 → **shop: decor (snowman) + fashion (scarf) + sky (sunset)** → away report → **GRADUATION (rank S)**
  - **Act 2 (life 2):** new egg → hatch → neglect → **SICK (all meters 0, badge + MEDICINE button)** → **DEATH (tombstone + "R.I.P." card)** — the second ending
  - **Act 3 (life 3):** new egg → hatch + **single-name adult cascade** → final dex → **SETTINGS (sound toggle, install/about/reset rows)** → reset → title outro
- [x] Casino determinism: in-page PRNG seed probe via `spinInstant` parity (9 weighted draws/round, identical to live reels) finds a seed whose round 1 is a clean loss and round 2 a small win (this run: seed 10)
- [x] Re-recorded `showcase/video/full-playthrough.mp4` (**3:34**, 0 console errors) — frame-verified end to end (27-frame grid + full-res spot checks: snack eat, SO CLOSE loss, WIN +2, 777 WIN +18, Umbreon SHINY card, renamed profile "Biscuit" RANK A, snowman in meadow, sunset shop, away/graduation, R.I.P. card + tombstone, adult cascade, final dex 9/18 w/ shiny badges, settings, title)
- [x] Q-gate `DEVKEYS=iphone15` 26/26 green (125 s) — no game-code changes (video script only)

## Phase 7 — Polish / future
- [ ] More faithful Tamagotchi shell skin (A/B/C button layout) + extra minigames
- [ ] Optional 3D tier (Pokedex 3D Pro) if a richer look is wanted
