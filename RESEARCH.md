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
