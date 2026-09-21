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

## Phase 5 — Polish / future
- [ ] localStorage persistence (Dex + stats)
- [ ] More faithful Tamagotchi shell skin (A/B/C button layout) + minigame (Berry Catch / Dance)
- [ ] Optional 3D tier (Pokedex 3D Pro) if a richer look is wanted
- [ ] Sound: evolution jingle / hatch crack
