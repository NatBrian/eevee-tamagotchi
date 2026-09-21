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

## How to run

The game is a **zero-dependency static web app** (vanilla ES modules, no build step) at
`assets/ref/eevee_tama/`. Serve the **repo root** over HTTP and open the game:

```powershell
# from the repo root — any static file server on port 8734
python -m http.server 8734
# or: npx --yes serve -l 8734 .
```

- Game: `http://localhost:8734/eevee_tama/index.html`
- Best in a phone (portrait) or Chrome DevTools device mode; it's an installable PWA.
- Progress persists to `localStorage`; time away is caught up when you return (capped at 72 game-hours).

### Test suite + showcase video

```powershell
# needs the server above + Playwright with Chromium
# (npx-cached playwright: set NODE_PATH to the _npx cache dir, or just `npm i -D playwright`)
node test\scenarios.js   # 25 scenarios × 6 mobile devices + per-device quality gate
node test\video.js       # full-playthrough recording → showcase/video/*.webm (convert w/ ffmpeg)
node test\shots.js       # key-state screenshots → showcase/m9_*.png
```

`SCENOS=S03,S04` and `DEVKEYS=iphone15,s24` env vars filter the scenario suite;
`TAMA_URL` points it at a different server.

## Repository layout

```
eevee-tamagotchi/
  README.md        <- this file
  TODO.md          <- milestone task list
  BUILD_PLAN.md    <- game spec, numbers, milestones, §12 testing protocol
  ASSET_PLAN.md    <- production asset categories A–I
  RESEARCH.md      <- search log + findings (the "never search twice" file)
  showcase/        <- verified screenshots + full-playthrough video/
  test/            <- scenarios.js (25-scenario suite) · video.js (playthrough recorder)
  assets/
    2d/  3d/  downloaded/   <- raw research-era assets
    ref/
      eevee_tama/          <- THE GAME (index.html, style.css, src/*.js, sw.js, manifest)
      prod/                <- production assets (kenney/scene/fx/items/stones/dex_anim/audio/…)
      prod_art/            <- hand-crafted art (title, icons, slot cabinet, medallions)
      tamagotchi_original/ <- original P1 Tamagotchi HUD reference sprites
      eevee_tama + tamagotchi_sim/  <- earlier reference builds
    notes/                 <- per-asset research writeups
```

## Conventions

- Every web search is logged in `RESEARCH.md` (query, tool, results) so work is never repeated.
- Every candidate asset is logged with: name, source URL, style, formats, animation states, license, and a status.
- Statuses: `NEW`, `REVIEWING`, `SHORTLIST`, `REJECTED`, `CHOSEN`.
