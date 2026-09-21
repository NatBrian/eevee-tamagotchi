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

### M4 — Lifecycle + Dex + endings
- [ ] Egg screen (crack frames @40/75%, wobble) · stage scaling 0.6/0.8/1.0 · evolution (5 stones, Espeon 07–12 + snack, Umbreon 18–20 + snack, Sylveon d3 22:00 auto)
- [ ] Evolve cinematic (flash → sparkle → dex GIF → name card → confetti) + shiny reveal · S_DEX (18 cells, silhouettes, persistence)
- [ ] Graduation (day 4 07:00) + death (tombstone) endings
- [ ] GATE: scenarios S01–S07/S10–S11 + device matrix + vision + commit

### M5 — Poké Casino
- [ ] PIL slot cabinet (candy pixel) · `src/casino.js`: Eevee Slots (1/3/5 paylines, 777 ×30, lucky symbol ×1.2) · Eeveelution Roulette (12 slots ×2/×4/×12, canvas wheel, 3s eased) · Card Flip (4 cards, ×4, tie push, 3D flip)
- [ ] Bet/coin UI, daily free 50 chips @07:00, pet reactions at machine, casino SFX
- [ ] GATE: scenarios S15–S17 (incl. 10k-spin RTP) + device matrix + vision + commit

### M6 — Meta
- [ ] Personality roll + lucky symbol + bubbles · S_PROFILE (Café face, rename, rank S/A/B/C, stat bars)
- [ ] S_MEDALS (36) · S_SHOP (12 items; PIL: 4 fashion, berry bush, ghost Eevee) · monthly events (5/15/25 sale, 10/20/30 shiny, ghost night)
- [ ] GATE: scenarios S18–S21 + device matrix + vision + commit

### M7 — Audio + haptics
- [ ] `src/audio.js` Web Audio mixer: BGM day/night (pending user audition; placeholders NES00/NES16), full SFX map incl. casino · Vibration haptics tiers (silent degrade iOS) · settings toggles · unlock on first tap
- [ ] GATE: audio + haptic pass + device matrix + vision + commit

### M8 — Persistence + PWA
- [ ] `src/save.js` v1 (schema §8) + autosave 5s/pagehide · offline catch-up (cap 72 game-hrs, floor 10) + S_AWAY report · `sw.js` + manifest polish + install prompt · settings/reset
- [ ] GATE: scenarios S14/S20/S24 + device matrix + vision + commit

### M9 — Final pass
- [ ] `test/scenarios.js` full 25-scenario suite green on all 6 devices · title/boot + first-run tips · balance pass (RTP/decay) · full-life showcase screenshots in `showcase/` · README run instructions · final commit

## Phase 7 — Polish / future
- [ ] More faithful Tamagotchi shell skin (A/B/C button layout) + extra minigames
- [ ] Optional 3D tier (Pokedex 3D Pro) if a richer look is wanted
