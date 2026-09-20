# RESEARCH LOG — Eevee Tamagotchi Assets

> **Rule:** every web search and every candidate asset gets logged here so we never
> search the same thing twice. Update this file as you go.

## Status legend
`NEW` not inspected · `REVIEWING` inspecting · `SHORTLIST` strong · `REJECTED` ruled out · `CHOSEN` selected

## Requirements recap
- 9 forms: Eevee, Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon, Sylveon
- **Shiny** variant of each
- Animation states: idle, walking, happy, sad, angry, eating, petting, poop/shitting, sleep, evolve (+ extras)
- Any style (2D/3D), free OK, ripping OK, engine flexible
- **Pick the best; log everything; view assets with vision**

### National Dex IDs (VERIFIED via pokeapi.co — NOTE: Espeon=196, Umbreon=197)
| Form | Dex # | | Form | Dex # |
|------|-------|-|------|-------|
| Eevee | 133 | | Umbreon | **197** |
| Vaporeon | 134 | | Leafeon | 470 |
| Jolteon | 135 | | Glaceon | 471 |
| Flareon | 136 | | Sylveon | 700 |
| Espeon | **196** | | | |

---

## Search log

| # | Date | Tool | Query / Target | Result summary |
|---|------|------|----------------|----------------|
| S1 | 2026-09-21 | hound | "Eevee all evolutions sprite sheet pixel art" | Reddit OC Eeveelution pixel art; Pinterest 8-frame walk/4-idle; neural.love AI mega |
| S2 | 2026-09-21 | hound | "Eevee 3D model rigged animations" | turbosquid, **free3d (6 rigged, 5 animated cartoon)**, cgtrader, renderhub |
| S3 | 2026-09-21 | hound | "Eevee evolution sprite pack itch.io" | **itch.io "Pokémon Eeveelution Assets (Godot)"** (PMD art), badges |
| S4 | 2026-09-21 | hound | "opengameart eevee sprite" | pokesprites.com; reddit Gen2 |
| S5 | 2026-09-21 | hound | "pokemon animated sprite sheet walk idle attack" | generic only |
| S6 | 2026-09-21 | hound | "tamagotchi pet sprite sheet happy sad angry eat poop sleep" | tamagotchi.fandom galleries |
| S7 | 2026-09-21 | hound | "Bulbapedia Eevee shiny sprites" | **pokestats.gg, pokemondb.net** (→ discovered PokeAPI raw) |
| S8 | 2026-09-21 | hound | "Eeveelution sprite sheet all nine" | pokesprites; etsy |
| S9 | 2026-09-21 | hound | "eevee pixel art sprite sheet multiple frames" | generic |
| S10 | 2026-09-21 | hound fetch | pokesprites / pokestats / pokemondb | **PokeAPI raw sprite repo** = clean direct PNG/GIF URLs (all forms+shiny+animated) |
| S11 | 2026-09-21 | hound (site) | itch.io Eeveelution pack; sketchfab Eevee; deviantart Eevee sheet | **DeviantArt "Eevee Tamagotchi Sprite Sheet"**; sketchfab animated Eevee + "pokedex 3d pro eeveelutions" |
| S12 | 2026-09-21 | hound fetch | DeviantArt ShrimpBisque sheet | recolored official **Eevee × Tamagotchi** 24x24 chibi (all 9) |
| S13 | 2026-09-21 | hound | "Eevee Tamagotchi" / ROM / Bandai | **Real product: Eevee × Tamagotchi** (Bandai Nano, JP 2019). Serebii + Bulbapedia + Fandom + NintendoSoup |
| S14 | 2026-09-21 | hound fetch + Playwright | serebii.net/virtualpet/eeveetamagotchi | **Full official sprite set** (all 9 + egg + Ditto/Costume/Rocket Eevee) + complete gameplay + evolution chart |
| S15 | 2026-09-21 | hound + vision | tumblr/Facebook colorized sets | Perler-bead photo (palette ref only); device photos |
| S16 | 2026-09-21 | hound + vision | PokeAPI shiny coverage (all 9) | **All 9 × normal+shiny official-artwork verified** (caught Espeon/Umbreon ID bug) |
| S17 | 2026-09-21 | hound + Playwright | sketchfab pokedex 3d pro eeveelutions | **8 consistent CC-BY animated 3D models** (no Sylveon). CC Attribution, low-poly |
| S18 | 2026-09-21 | hound | pokegotchi; complete 2D pet pack; PMD eeveelutions | **pokegotchi** (PokeAPI-based tamagotchi = proof of concept); **PMD Eeveelutions HD (DeviantArt)** + PMD emotes |

---

## TOP 3 USABLE ASSET GROUPS (each = complete Eevee + various-action animation)

### ✅ GROUP 1 — "Classic Pokémon" (PokeAPI official 2D) — **RECOMMENDED**
- **Source:** `https://github.com/PokeAPI/sprites` (raw: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites`)
- **Completeness:** ALL 9 forms × {normal, shiny} × {front, back, female} — **verified visually + by file size**. Plus animated battle GIFs.
- **Style tiers available (all 9 forms):**
  - `pokemon/{id}.png` — classic pixel front (small)
  - `pokemon/other/official-artwork/{id}.png` — **high-res (~512px) clean, transparent** (best for polished look)
  - `pokemon/other/home/{id}.png` — 3D "Home" render, transparent
  - `pokemon/other/dream-world/{id}.png` — soft illustration
  - `pokemon/other/showdown/{id}.gif` — **animated** (idle + battle move), shiny + back variants
  - per-gen: `pokemon/versions/generation-{I..IX}/...`
- **Shiny:** ✅ native official shiny sprites for all 9 (e.g. shiny Eevee = cream, shiny Umbreon = tan).
- **Actions:** idle/walk (showdown GIF or bob+flip), battle moves; **happy/sad/angry/eating/petting/poop/sleep/evolve = synthesized** via overlays + transforms (hearts, tears, anger mark, food+chomp, hand, poop sprite, Zzz, flash).
- **Proof it works:** `github.com/wenjietee/pokegotchi` is a real Tamagotchi built entirely on PokeAPI.
- **License:** free to rip (Nintendo art; user OK with ripping).
- **Pros:** most complete, consistent, high-quality, native shinies, proven, trivial to script a bulk rip.
- **Cons:** not chibi-Tamagotchi style; emotion/behavior frames must be composed.
- **Effort:** MEDIUM (bulk-rip + animation/overlay layer).

### ✅ GROUP 2 — "Eevee × Tamagotchi" (authentic chibi 2D)
- **Source:** the **real Eevee × Tamagotchi** (Bandai Tamagotchi Nano, JP 2019). Serebii page: `serebii.net/virtualpet/eeveetamagotchi`
- **Completeness:** all 9 forms + **egg** + 3 special forms (Ditto Eevee, Costume Eevee, Team Rocket Eevee; also "Pop Star Eevee" per NintendoSoup).
- **Sprites (monochrome 24x24 base, color on-device):** Serebii has `eevee.png, vaporeon.png, jolteon.png, flareon.png, espeon.png, umbreon.png, leafeon.png, glaceon.png, sylveon.png, egg.png, dittoeevee.png, costumeeevee.png, rocketeevee.png` (ripped to `assets/ref/serebii/`).
- **Colored version:** DeviantArt **ShrimpBisque "Eevee Tamagotchi Sprite Sheet"** (all 9 colored chibi) — ripped to `assets/ref/deviantart/`. Palette refs: Facebook Perler photo, device photos.
- **Authentic behavior set (to copy as game design):** feed meal (4 to full) / snack (happiness); **furball = poop** (clean w/ A btn); invisible hearts (food -1/hr, happiness -1/50min); C btn shows mood (swirl=hungry, circle=unhappy, smile+closer=happy); wake 7am / sleep 8pm (evolutions 10pm); 2 minigames (Berry Catch, Dance); **8-way evolution** (Vaporeon=Water icon+poor care, Jolteon=Lightning, Flareon=Fire, Leafeon=Grass, Glaceon=Ice, Espeon=snacks 7-12am, Umbreon=snacks 6-8pm, Sylveon=default 72h); special: Ditto (poor care), Costume (dance a lot), Rocket (poor care+snacks+no games), Pop Star.
- **Actions:** idle, walk, happy, sad, eat, furball/poop, sleep, evolve (authentic); petting via overlay.
- **Shiny:** not in original → add by recolor.
- **Pros:** the most faithful "Eevee Tamagotchi"; real evolution/care mechanics to implement; authentic chibi look.
- **Cons:** base is monochrome (must colorize); limited pose count (it's a Nano); no native shinies; sources scattered.
- **Effort:** MEDIUM-HIGH (assemble mono set + colorize + add shinies).

### ✅ GROUP 3 — "3D Eeveelutions" (Pokedex 3D Pro, 3D)
- **Source:** Sketchfab **"pokedex 3d pro eeveelutions"** by *seth the yutyrannus* (@slang107123456789).
- **Completeness:** **8 consistent animated low-poly 3D models** (Eevee + Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon). **Missing Sylveon** (add a matching one).
- **Model URLs (all same author/style):**
  - Eevee `sketchfab.com/3d-models/pokedex-3d-pro-eevee-08d0e011acc64f92b77045384a4fbc3b`
  - Vaporeon `.../pokedex-3d-pro-vaporeon-a0eea1c4b9584af5b49fa26855d39343`
  - Jolteon `.../pokedex-3d-pro-jolteon-1b9171b6c27547a1bdc9902ef92512c0`
  - Flareon `.../pokedex-3d-pro-flareon-c809b5ce54224bc1a660e943f681a822`
  - Espeon `.../pokedex-3d-pro-espeon-6e839167f75c47129d03dc0802d838d6`
  - Umbreon `.../pokedex-3d-pro-umbreon-8fda51cf8e664142ae6f037b68993fcb`
  - Leafeon `.../pokedex-3d-pro-leafeon-49bb156c9e33401a9a73b63e48bd935f`
  - Glaceon `.../pokedex-3d-pro-glaceon-5c54cd2360f247eb9b976ddec6a478ca`
- **Specs (Eevee):** 4.9k tris / 2.6k verts (game-ready low-poly), **License: CC Attribution (free, credit author)**, animated.
- **Actions:** fully versatile via skeletal animation (idle, walk, happy, sad, angry, eat, pet, sleep, evolve) — author/assign clips in-engine; overlays for fx.
- **Shiny:** material/tint recolor.
- **Pros:** most versatile animation; modern 3D look; free (CC-BY); consistent set.
- **Cons:** missing Sylveon; 3D pipeline is more work; verify bundled animation clips at download.
- **Effort:** HIGHER (3D engine + rig/animation).
- **Alt 3D sources:** free3d.com (6 rigged cartoon Eevee .blend, 5 animated), turbosquid (51k Eevee models), cgtrader (free filter), sketchfab prozip "Eevee with Animation".

### 🎁 BONUS GROUP 4 — "PMD Chibi" (Pokémon Mystery Dungeon 2D)
- **Source:** PMD (Rescue Team) chibi 3/4-view sprites + **built-in emote effects** (hearts, sweat, anger, Zzz).
- **Leads:** itch.io "Pokémon Eeveelution Assets (Godot)" by ArcherZenmi (`eeveelution_sprites.zip` = PMD sprites + `pmd_effects.zip` = emote SFX+fx, $4.99, art from PMD); DeviantArt **GuyroMaster "PMD Eevee and Eeveelutions (all in HD colors)"**; reddit r/MysteryDungeon "ALL EEVEELUTIONS, ASSEMBLE!"; tumblr PMD Eevee walk animations.
- **Why:** official chibi art with **expressions built in** = great for a 2D pet with personality; emotes cover happy/sad/angry natively.
- **Cons:** shinies not native; assemble from PMD games.
- **Effort:** MEDIUM.

---

## Recommendation
- **Default / best overall: GROUP 1 (PokeAPI 2D).** It's the only group that natively covers **all 9 forms AND all 9 shinies** at high quality, is trivially rip-able in bulk, and is proven by `pokegotchi`. Compose the emotion/behavior states (hearts, tears, anger, food, poop, Zzz, evolve-flash) on top.
- **If you want the authentic Tamagotchi feel: GROUP 2** (use its real care/evolution mechanics as the game design; colorize the chibi sprites).
- **If you want max animation flexibility / modern look: GROUP 3** (3D).
- **Hybrid idea:** GROUP 1 base + GROUP 2's evolution/care rules + PMD emotes (GROUP 4) for expressions.

## Verified assets on disk (`assets/ref/`)
- `pokeapi/` — Eevee official-artwork, home, showdown GIF, front, Vaporeon, Sylveon
- `pokeapi_shiny/` — all 9 × {normal, shiny} official-artwork
- `serebii/` — 15 official Eevee × Tamagotchi monochrome sprites (9 forms + egg + 3 special + feed/games)
- `deviantart/` — colored Eevee Tamagotchi sheet + device GIFs
- `tumblr/`, `sketchfab/`, `facebook_colorized_eeveelutions.jpg` — refs

## Next (Phase 2 — Acquisition)
- [ ] Pick group(s) + style tier(s)
- [ ] Bulk-rip chosen assets into `assets/2d/` & `assets/3d/`
- [ ] Verify 3D animation clips (download Pokedex 3D Pro Eevee, inspect clips)
- [ ] Find a matching 3D Sylveon (if using Group 3)
- [ ] Gather/author overlay FX (hearts, tears, anger, Zzz, poop, food, evolve-flash)
- [ ] Colorize chibi set (if using Group 2)
