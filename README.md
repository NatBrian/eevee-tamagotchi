# Eevee Tamagotchi

A Tamagotchi-style pet-care game centered on **Eevee** and its evolutions.
You raise a pet Eevee, keep it happy/healthy, and work toward collecting **all Eeveelutions**
and their **shiny** variants.

## Goal

- Care for a pet Eevee (feed, pet, play, keep clean).
- Multiple evolutions to collect.
- Collect the **shiny** version of each form.
- Rich, versatile pet animations: `idle`, `walking`, `happy`, `sad`, `angry`,
  `eating`, `petting`, `shitting/poop`, `sleep`, `evolving`, etc.

## Requirements (asset side)

- **Forms needed:** Eevee + 8 evolutions = 9 base forms
  - Eevee, Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon, Sylveon
- **Shiny** variant of each (runtime color-swap or pre-made art — either acceptable).
- **Animation states** (versatile): idle, walking, happy, sad, angry, eating, petting,
  poop/shitting, sleep, evolve, hurt, run, jump, sit, etc.
- Style: **any** (2D pixel, 2D illustrated, 3D rigged) — pick the best/consistent set.
- License: **free is fine, ripping/stealing is OK** — no budget, don't stress licenses,
  but note them anyway.
- Engine: **flexible / TBD** (web, Godot, Unity, or other).

## Repository layout

```
eevee-tamagotchi/
  README.md        <- this file (project overview + requirements)
  TODO.md          <- active task list for the research/build
  RESEARCH.md      <- search log + findings (the "never search twice" file)
  notes/           <- deeper research notes, per-asset writeups
  assets/
    2d/            <- 2D sprite sheets / frames
    3d/            <- 3D models (glb/fbx)
    ref/           <- reference screenshots captured during research
    downloaded/    <- raw downloaded asset files
```

## Conventions

- Every web search is logged in `RESEARCH.md` (query, tool, results) so work is never repeated.
- Every candidate asset is logged with: name, source URL, style, formats, animation states, license, and a status.
- Statuses: `NEW`, `REVIEWING`, `SHORTLIST`, `REJECTED`, `CHOSEN`.
