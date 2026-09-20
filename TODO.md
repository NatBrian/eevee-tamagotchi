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
- [ ] **DECIDE: which group(s) + style tier to use** ← user decision

## Phase 2 — Acquisition
- [ ] Pick group(s) + style tier(s) (see RESEARCH.md Top 3)
- [ ] Bulk-rip chosen 2D assets into `assets/2d/` (script the PokeAPI/Serebii/DeviantArt downloads)
- [ ] Bulk-rip/3D models into `assets/3d/` (if Group 3)
- [ ] Verify 3D animation clips (download Pokedex 3D Pro Eevee, inspect clips)
- [ ] Find matching 3D Sylveon (if Group 3)
- [ ] Gather/author overlay FX: hearts, tears, anger mark, Zzz, poop, food, hand, evolve-flash
- [ ] Colorize chibi set + add shinies (if Group 2)
- [ ] Verify each form has the needed states (fill-gaps list)

## Phase 3 — Gap filling
- [ ] Identify missing animation states (esp. `poop`, `petting`, `evolve`)
- [ ] Plan how to cover gaps (runtime color-swap for shinies, composite poses, small custom art)

## Phase 4 — Build (later, after assets)
- [ ] Pick engine/framework
- [ ] Set up project
- [ ] Wire pet state machine (idle/hungry/sad/dirty/angry/happy + actions)
- [ ] Evolution + shiny collection system
- [ ] Save/progress persistence
