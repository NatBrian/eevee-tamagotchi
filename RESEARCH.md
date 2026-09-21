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
| S19 | 2026-09-21 | hound | "Eevee Tamagotchi ROM / PMD eevee / MUGEN sprite sheet" | Spriters Resource PMD Eevee (CF-walled); **TamaPoke**; **itch.io ArcherZenmi → GitHub `ArcherZenmi/Eeveelution-Assets`** |
| S20 | 2026-09-21 | shell clone + vision | `ArcherZenmi/Eeveelution-Assets` (918 files) | Cloned to `assets/ref/eeveelution-assets/`. **4 forms × 8 dirs × (idle 6f / move 7f / attack 6f / hurt 3f) + sleep + 7 emotes + evolution items.** Vision-verified (`preview_pmd.html`) |
| S21 | 2026-09-21 | hound + Playwright | 5-game asset sweep: Amie / Refresh / Sleep / Café ReMix / Pokopia | **Serebii Pokémon Sleep section**; Bulbagarden Sleep sprites (1,860 files); Café ReMix Fandom (Eevee star); Pokopia NOT dataminable (Switch 2/2026) |
| S22 | 2026-09-21 | shell download + vision | Serebii Pokémon Sleep — all 9 Eeveelutions | **All 9 × normal+shiny sleep-style sprites downloaded + vision-verified** (`assets/ref/pokemonsleep/`, `preview_pokemonsleep.html`). 492×448 PNGs, native shinies |
| S23 | 2026-09-21 | Playwright + vision | Café ReMix Fandom `Eevee Male` + Category:Sprites assets | Full-body 3D Eevee (800×1039) + 3 bust expression frames (Eevee01–03). Full in-game set = r/PokemonCafeMix **Discord "mega repository"** (split layers). Vision-verified (`preview_cafemix.html`) |
| S24 | 2026-09-21 | hound | Pokopia datamine / GitHub / API | **Cannot be datamined yet** (Switch 2 exclusive 2026 + keycard encryption). Only `pokopiapi` (data, no art) + screenshots. All 8 evolutions collectable in-game |
| S25 | 2026-09-21 | hound + fetch + vision | Original 1996 Tamagotchi mechanics (tamagotchi.fandom) | **Verified core loop**: egg → 5min → Baby → 65min Child → 3yr Teen → 6yr Adult; care = hungry/happy meters, games > snacks, response time (poop/sickness/lights); teen/adult form = f(f care quality); A/B/C buttons; status icons (meal, happiness, medicine, lights, ghost, poop, eating, mood) |
| S26 | 2026-09-21 | hound + shell + vision | **agg23/fpga-tamagotchi** (FPGA P1 core) | **Authentic original-Tamagotchi assets**: full P1 spritesheet + extracted transparent status icons (food=fork&knife, bathroom=duck/toilet, lights, medicine, game, attention, discipline, status) + backgrounds → `assets/ref/tamagotchi_original/` (verified `preview_tamaresearch.html`) |
| S27 | 2026-09-21 | shell download | PokeAPI showdown GIFs × 9 (dex 133-136,196,197,470,471,700) | **Evolution-cinematic animated GIFs** (25-frame front-facing battle anim, all 9) → `assets/ref/showdown/{id}.gif` |
| S28 | 2026-09-21 | shell HEAD + PokeAPI | PokeAPI official **item art** (berries/candy) | Naming fix: URLs use **hyphens** (`oran-berry.png`), verified via `/api/v2/item/{id}` `sprites.default`. Downloaded 10: oran/sitrus/cheri/chesto/pecha/rawst berries + rare-candy, sweet-heart, honey, rage-candy-bar → `assets/ref/prod/items/`. Gen-8 Eeveelution candies = no official art (empty `sprites.default`). Vision-verified ✓ |
| S29 | 2026-09-21 | shell download + vision | PokeAPI **gen-V animated sprites** (BW, front-facing, animated GIF) | All 18 exist: 9 normal + 9 shiny (133,134,135,136,196,197,470,471,700) → `assets/ref/prod/dex_anim/`. Vision-verified: shiny palettes clearly distinct ✓ — chosen for Dex cells (better than showdown GIFs: all forms present incl. Sylveon) |
| S30 | 2026-09-21 | kenney.nl + shell + vision | **Kenney CC0 packs**: Pixel Platformer v1.2, Pixel Platformer Food Expansion, Pixel UI Pack, fonts (Press Start 2P OFL, VT323 OFL) | → `assets/ref/prod/kenney/` + `prod/font/`. All tilemaps cropped to individual tiles (`prod/kenney_tiles/`). Scene picks verified at 6x zoom: grass_top_0-3, dirt, tree (conifer), tuft_0/1, bush, plant, mushroom, snowman, ground_edge, sky_day/sunset, meadow_far_0/1; **sky_night = PIL-darkened sky_day** (pack has no night sky). Rejected first-pass picks (torch as tree, crates as bushes, ground-tile "hearts") — lesson: pick tiles at ≥6x zoom. Food expansion = 112 food tiles (backup meals) ✓ |
| S31 | 2026-09-21 | PIL hand-craft + vision | Custom art in PMD palette: furball ×2, petbed, tombstone (R.I.P. in Press Start 2P), egg crack ×2, leaf/ice stone recolors (HSV shift of PMD water stone), pixel heart (outline + highlight) | → `assets/ref/prod/fx/` + `prod/stones/`. All vision-verified against PMD style ✓. Guarantees style consistency where no matching free asset existed (poop = Eevee×Tama furball) |
| S32 | 2026-09-21 | kenney.nl + shell | **Kenney audio (CC0)**: Interface Sounds (103), Music Jingles (85: NES/HIT/PIZZI/SAX/STEEL ×17), RPG Audio (55), Particle Pack (VFX) | → `assets/ref/prod/audio/` + `prod/particles/` (12 transparent PNGs: spark/star/magic/circle/smoke/twirl/symbol incl. white heart). RPG Audio **rejected** (medieval foley, wrong vibe). NES jingles = chiptune BGM/jingle candidates; **audition page**: `assets/ref/preview_audio.html` (selection pending user) |
| S33 | 2026-09-21 | hound/fetch | Café ReMix extra Eevee expression frames (Fandom wiki) | **SKIPPED**: Fandom wiki 403/404 (scraping blocked, subdomain moved); Serebii `cafemix/pokemon/eevee.shtml` has only 1 render (already have it). Existing 3 frames + full render are enough for the portrait card |

---

## ★ TOP PICK (VISION-VERIFIED) — PMD Eeveelutions (ArcherZenmi/Eeveelution-Assets)

> Cloned to `assets/ref/eeveelution-assets/`. **Viewed every animation + emote with vision** (`assets/ref/preview_pmd.html`).
> This is the strongest 2D source for **"various animations + emotions"**.

- **Source:** `github.com/ArcherZenmi/Eeveelution-Assets` (PMD art, Godot-ready, .tscn + .gd scripts).
- **Per form: 8 directions × (idle 6f / walk 7f / attack 6f / hurt 3f) + sleep 2f** — genuine varied body animation.
- **Emotes (shared, overlay on any form):** cheer(happy), worry(sad), shock(angry/upset), confused(?), surprise(!), water(sweat), chat(bubble).
- **Evolution items:** water_stone.png, thunder_stone.png, fire_stone.png (fits the evolve mechanic).
- **Forms in repo (4):** Eevee, Vaporeon, Jolteon, Flareon.
- **Vision-verified mapping to our states:**
  | Our state | PMD asset | Verified |
  |-----------|-----------|----------|
  | idle | idle (6f) | ✅ |
  | walking | move/walk (7f ×8 dir) | ✅ |
  | happy | cheer emote | ✅ |
  | sad | worry emote | ✅ |
  | angry | shock emote | ✅ |
  | sleep | sleep (2f) | ✅ |
  | (bonus) attack / hurt / confused / surprise / sweat / chat | — | ✅ |
  | eating | **compose** (food sprite + chomp) | ⬜ |
  | petting | **compose** (hand + cheer) | ⬜ |
  | poop/shit | **compose** (poop sprite + clean) | ⬜ |
  | shiny | **recolor** (or find PMD shiny palette) | ⬜ |
- **Gaps:** only 4 forms — need **Espeon, Umbreon, Leafeon, Glaceon, Sylveon** in same PMD style (Rescue Team DX / Explorers of Sky).
- **Why it wins for "various animations":** real pre-made body animation (not composed) + real emotes + evolution items, all Godot-ready.

---

## GAME ASSET RESEARCH — Amie / Refresh / Sleep / Café ReMix / Pokopia

User asked to mine assets from these 5 games. Per-game findings (all **viewed with vision** where files were obtainable):

| Game | Eevee + 9 evos? | Animation variety | Where the assets live | Accessible now? |
|------|-----------------|-------------------|-----------------------|-----------------|
| **Pokémon Sleep** (2023, mobile) | ✅ all 9 | Sleep pose (4-frame loop in-game) | **Serebii** `serebii.net/pokemonsleep/pokemon/{id}.png` + `/shiny/{id}.png` (492×448); Bulbagarden (1,860 files); in-game 3D | ✅ **YES — all 9 × normal+shiny downloaded + verified** |
| **Pokémon Café ReMix** (2021, mobile/Switch) | Eevee is the STAR (staff); other evos appear | High (walk, cook, serve, clean, many expressions) | Fandom wiki (full-body + a few frames); **r/PokemonCafeMix Discord "mega repository"** (split layers); Unity APK AssetBundles | ⚠️ Partial (Fandom) / full set needs Discord or APK extract |
| **Pokémon Amie** (feature, XY→SV) | ✅ Eevee in every gen | High (pet, feed, play, idle/walk/run/sleep/affection) — 3D chibi | Main-series **ROMs** (3D chibi models); Serebii screenshots; Spriters Resource (CF-walled) | ⚠️ Extract from ROM (3D) |
| **Pokémon Refresh** (2023, mobile) | Likely (Eevee playable) | Medium (café activities: eat/nap/play/train) | Unity APK/IPA | ⚠️ No clean dump found yet; needs APK extract |
| **Pokémon Pokopia** (2026, **Switch 2**) | ✅ all 8 evos collectable | High (raise/sleep/eat/work/play) — very Tamagotchi-like | Switch 2 NSP/ROM | ❌ **NOT dataminable yet** (Switch 2 exclusive + keycard encryption); screenshots only |

**Key takeaways:**
- **Pokémon Sleep is the clean win** for *base art + native shinies of all 9* — 492×448 PNGs, consistent 3D-chibi style, correct shiny palettes. Already on disk: `assets/ref/pokemonsleep/` + `preview_pokemonsleep.html`.
- **Café ReMix** is the best *Eevee expression/animation* source (Eevee is the star) but the complete set needs the Discord mega-repo or an APK extract, and it centers on Eevee rather than all 9.
- **Pokopia** is the most on-theme (a literal Pokémon Tamagotchi with all 9 evos) but its assets can't be extracted yet — use it as **design inspiration**, not an asset source, for now.
- **Amie** offers real 3D-chibi "petting/feeding" animation from the main series ROMs (extractable, but 3D and per-generation).

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

## Recommendation (updated — user prioritized "various animations")
- **Best for "various animations + emotions" (2D): PMD (ArcherZenmi repo, VISION-VERIFIED above).** Real pre-made body animation (idle/walk×8/attack/hurt/sleep) + emotes (happy/sad/angry/confused/surprise/sweat/chat) + evolution items, Godot-ready. **Action:** source the 5 missing forms (Espeon, Umbreon, Leafeon, Glaceon, Sylveon) in the same PMD style; compose eating/petting/poop; recolor for shinies.
- **Best for base art + native shinies: GROUP 1 (PokeAPI 2D).** Only source with native shinies for all 9 at high res — use for shiny palettes / "collection" sprites / a polished alternate look.
- **NEW — cleanest all-9 + shiny chibi set: Pokémon Sleep (Serebii).** 492×448 PNGs, one consistent 3D-chibi style, **correct native shinies for all 9** (already on disk). Great as a "collection"/idle base or to feed a recolor pipeline; only a sleep/stand pose though.
- **Best for max flexibility / modern: GROUP 3 (3D Pokedex 3D Pro).** Fully animatable; 8 forms (need Sylveon).
- **Best for authentic Tamagotchi design: GROUP 2 (Eevee × Tamagotchi).** Real care/evolution mechanics to copy (hunger/happiness hearts, furball=poop, Berry Catch, 8-way evolve).
- **Likely winning combo:** **PMD sprites (animations+emotions) + Eevee×Tamagotchi care/evolution rules + PokeAPI shiny palettes** → Tamagotchi with genuine varied animation, authentic mechanics, and collectible shinies.

## Verified assets on disk (`assets/ref/`)
- `pokeapi/` — Eevee official-artwork, home, showdown GIF, front, Vaporeon, Sylveon
- `pokeapi_shiny/` — all 9 × {normal, shiny} official-artwork
- **`pokemonsleep/` — all 9 × {normal, shiny} Sleep-Style sprites (492×448, Serebii) + `preview_pokemonsleep.html`**
- **`cafemix/` — Café ReMix Eevee full-body + 3 expression frames + `preview_cafemix.html`**
- **`eeveelution-assets/` — PMD sprites (4 forms × 8 dirs × 4 states + sleep) + 7 emotes + evolution items + `preview_pmd.html`**
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

---

## ★ TAMAGOTCHI RESEARCH (mechanics verified with images)

**Original 1996 Tamagotchi (tamagotchi.fandom.com, vision-verified screenshots + `agg23/fpga-tamagotchi` sprites):**
- Egg appears → hatches after ~5 min → **Baby → Child (65 min) → Teen (3 yr) → Adult (6 yr)**.
- Which teen/adult you get = **quality of care**: hungry + happy meters (fill before empty), games > snacks (games keep weight low), response time (cleaning poo, curing sickness, lights out), discipline.
- Screen language: pet wanders a small screen; **status icons**: meal (fork & knife), happiness (heart), medicine (sick), lights (sleep), ghost (mystery), **poop/toilet**, eating (pac-man), mood face. A/B/C buttons + hidden reset. Neglect → sickness → death.

**Eevee × Tamagotchi (Bandai Nano, JP 2019) — the design we copied** (Serebii, already logged S13/S14):
- Egg → Eevee (baby grows) → **8-way evolution at 10pm**: Vaporeon (water + poor care), Jolteon (lightning), Flareon (fire), Leafeon (grass), Glaceon (ice), **Espeon (snacks 7-12am)**, **Umbreon (snacks 6-8pm)**, **Sylveon (default at 72h)**.
- Feed meal (4 to full) / snack (happiness); **furball = poop** (clean w/ A); invisible hearts (food −1/hr, happiness −1/50min); C = mood; wake 7am / sleep 8pm; minigames Berry Catch + Dance; special forms Ditto/Costume/Rocket/Pop Star.
- Official sprite set on disk (`assets/ref/serebii/`): egg, Eevee, Eevee-feed pose, games, all 9 evolutions, 3 special forms.

**New assets found for the sim:**
- `assets/ref/tamagotchi_original/` — authentic **P1 spritesheet + status icons** (food, bathroom/poop, lights, medicine, game, attention) from the FPGA P1 core → used for the HUD icons.
- `assets/ref/showdown/` — **9 PokeAPI showdown GIFs** → used as the evolution/hatch cinematics.
- `assets/ref/serebii/egg_colored.png` — the official Eevee×Tamagotchi egg, flood-fill de-boxed + recolored cream/brown (PIL, `make_egg.py`) → egg stage.

---

## ✅ SIMULATION BUILT — "Eevee-Tama" (proof the found assets power a Tamagotchi)

**Location:** `assets/ref/tamagotchi_sim/` (`index.html` + `style.css` + `game.js`, vanilla JS — **no framework, no build step**; engine-flexible, logic ports to Godot/Unity later).
**Run:** `http://localhost:8734/tamagotchi_sim/index.html` (server serves `assets/ref/` on port 8734). Dev API: `window.TamaGame` (feedMeal/snack/pet/play/clean/giveStone/warp/warpTo/forceShiny/newEgg/freeze/pose helpers).

**Faithful Tamagotchi loop implemented:**
1. **Egg** (2 game-hr, official egg sprite, wobble) → hatch cinematic (Eevee showdown GIF + flash).
2. **Growth stages**: Baby (0-1d) → Child (1-2d) → Adult (2d+) — scale/stage tracked; Adult unlocks evolution.
3. **Stats**: Meal / Happy / Energy (decay hourly; meals +40, snacks +8/+10, pet +12, play +18/−20⚡).
4. **Poop (furball)**: meals 45% chance → furballs appear (max 3), happiness decays faster; clean button or click.
5. **Day/night**: 8pm-7am → screen darkens, pet auto-sleeps on the pet bed (Zzz); wake 7am.
6. **Mood/emotes**: PMD emotes over head (cheer/worry/shock/water/confused/surprise/chat) driven by lowest stat + random.
7. **Sickness → death**: stat at 0 for 6h → sick (medicine icon, green tint, hurt frames); 14h → death (tombstone + **New Egg** button; **Dex persists across runs**).
8. **Evolution** (Adult Eevee): 5 stones (Water/Thunder/Fire/Leaf/Ice) + **Espeon (snack 7-12am)** + **Umbreon (snack 6-8pm)** + **Sylveon (72h @10pm)** → flash + **showdown GIF cinematic** + log.
9. **Shiny**: 1/50 per evolution (dev `forceShiny`); PMD forms = hue-shift + ✨, chibi forms = **native Pokémon Sleep shiny art**.
10. **Dex**: 9 forms (silhouette until collected, ✦ shiny badge, count x/9).

**Asset → feature mapping (all found assets in use):**
| Feature | Asset source |
|---|---|
| Eevee/Vaporeon/Jolteon/Flareon body (idle/walk×8/attack/hurt/sleep) | **PMD** (ArcherZenmi repo) — true frame animation |
| Espeon/Umbreon/Leafeon/Glaceon/Sylveon body + shinies | **Pokémon Sleep chibis** (Serebii) + bob/hop motion |
| Egg stage | Eevee×Tamagotchi official egg (Serebii) → `egg_colored.png` (PIL) |
| Emotes (happy/sad/angry/sweat/...) | PMD `pmd_effects/` (7 emote sets) |
| Café ReMix reaction portrait (pet/snack) | Fandom Café ReMix Eevee frames (`eevee01/02.webp`) |
| Evolution + hatch cinematics | PokeAPI **showdown GIFs** × 9 |
| HUD status icons (meal/poop/lights/medicine) | **authentic P1 Tamagotchi icons** (fpga-tamagotchi) |
| Evolution stones | PMD stone sprites (water/thunder/fire) + leaf/ice glyphs |
| Dex portraits | PokeAPI official-artwork (all 9 × normal/shiny) |
| Care/evolution rules | Eevee × Tamagotchi (Bandai Nano) mechanics |

**Showcase captured (Playwright, `tama_s*.png` in repo root):** egg → hatch cinematic → baby + cheer → **eating** (attack lunge + food) → **poop** (furballs + sweat emote + ×2 HUD) → **petting** (Café ReMix portrait) → **night sleep** (Zzz, dark, bed) → Vaporeon **evolution cinematic** → Vaporeon idle → Vaporeon **PMD sleep sprite** → Jolteon (walk) → Flareon (attack + surprise) → Espeon **morning-snack cinematic** → Umbreon **evening-snack** → Leafeon → **shiny Glaceon** (cinematic + native shiny chibi) → Sylveon **72h auto-evolve** → **sick** (hurt frames, medicine icon) → **death** (tombstone) → **final: egg + full 9/9 Dex with shiny badge** (`tama_s22_final_dex.png`).

**Bugs found & fixed during build:** decimal clock/log timestamps; warp `Math.round` stopping short of hour boundaries (→ `ceil`); stale evolution/hatch timers leaking across `newEgg` (token guards); `beginSleep/wakeUp` orphaning in-progress food; **`renderPet` empty-class-token crash on sleeping chibi** (killed the game loop — now guarded + loop wrapped in try/catch); egg white background (PIL flood-fill).

**Time scale:** 1 game-hour = 8 real seconds (1 day ≈ 3.2 min; full egg→death run ≈ 15 min). Dev warp keeps stats healthy by default (`warp(h, healthy)`).
