# TODO — Eevee Tamagotchi (asset research + build)

## Phase 0 — Setup
- [x] Create project folder + git repo (`eevee-tamagotchi/`)
- [x] Create README, TODO, RESEARCH log
- [x] Define requirements (9 forms, shinies, animation states, any style, free OK)

## Phase 1 — Research (find the best assets)
- [ ] Search: official Bulbapedia Pokémon sprites (all Eeveelutions + shinies, per-gen)
- [ ] Search: 2D sprite-sheet packs (pixel art) with multiple animation states
- [ ] Search: itch.io / OpenGameArt free Pokémon / Eevee packs
- [ ] Search: 3D rigged Eevee / Pokémon models (glb/fbx) with animations (Sketchfab, CGTrader, Quaternius, CraftPix)
- [ ] Search: "Eevee evolution" complete art sets / fan packs
- [ ] Search: generic "pet / tamagotchi" sprite packs that can be reskinned (idle/walk/happy/sad/angry/eating/poop)
- [ ] Inspect promising image/asset pages with Playwright (verify quality + available states)
- [ ] For each candidate: log to RESEARCH.md (name, URL, style, formats, states, license, status)
- [ ] Shortlist 2-3 best options per form-set (or one master set)
- [ ] Decide final asset strategy (single consistent set vs. mix)

## Phase 2 — Acquisition
- [ ] Download / rip chosen assets into `assets/downloaded/`
- [ ] Organize into `assets/2d/` and `assets/3d/`
- [ ] Capture reference screenshots into `assets/ref/`
- [ ] Verify each form has the needed animation states (fill gaps list)

## Phase 3 — Gap filling
- [ ] Identify missing animation states (esp. `poop`, `petting`, `evolve`)
- [ ] Plan how to cover gaps (runtime color-swap for shinies, composite poses, small custom art)

## Phase 4 — Build (later, after assets)
- [ ] Pick engine/framework
- [ ] Set up project
- [ ] Wire pet state machine (idle/hungry/sad/dirty/angry/happy + actions)
- [ ] Evolution + shiny collection system
- [ ] Save/progress persistence
