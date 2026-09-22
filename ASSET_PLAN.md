# ASSET PLAN: Production-tier Eevee-Tama (no emojis, all real assets)

> Every visual/audio surface of the game, categorized. Status: `TODO` / `GOT` (downloaded + vision-verified) / `SKIPPED` (reason).
> Production assets live in `assets/ref/prod/` (inside the HTTP root, served at `http://localhost:8734/prod/...`). Research logged in RESEARCH.md (S28+).
> **Vision rule:** every candidate batch was rendered into a contact sheet (`preview_prod*.html`, `preview_fx.html`, `preview_scene6x.html`) and checked with vision against the PMD/Sleep style before keeping.

## A. Pet sprites
| Item | Source | Status |
|---|---|---|
| 9 forms body anim (PMD ×4: idle/walk×8/attack/hurt/sleep + 7 emotes) | ArcherZenmi PMD repo | GOT (existing, `assets/ref/eeveelution-assets/`) |
| 5 chibi forms + native shinies (Espeon/Umbreon/Leafeon/Glaceon/Sylveon) | Pokémon Sleep chibis | GOT (existing, `assets/ref/pokemonsleep/`) |
| **Animated Dex sprites** (9 + 9 shiny) | PokeAPI gen-V animated GIFs | GOT (`prod/dex_anim/{133..700}.gif` + `shiny_*.gif`) |
| More Cafe ReMix reaction faces (happy/surprised/sad/sleepy) for portrait card | Fandom Café ReMix | SKIPPED, Fandom blocks scraping (403), Serebii has 1 render only; existing 3 frames + full-body render cover the portrait card (CSS filters for mood) |

## B. Food & items (replace 🍙 emoji)
| Item | Source | Status |
|---|---|---|
| Meals ×6: Oran/Sitrus/Cheri/Chesto/Pecha/Rawst berries | PokeAPI official item art | GOT (`prod/items/*-berry.png`) |
| Snacks ×4: Rare Candy, Sweet Heart, Honey, Rage Candy Bar | PokeAPI official item art | GOT (`prod/items/`), Gen-8 Eevee candies have NO official art (API `sprites.default` empty) |
| Stones: water/thunder/fire + **leaf/ice** | PMD originals + PIL hue-recolor | GOT (`prod/stones/` 5 stones) |
| Food crumbs / eat particles | derive from item art | TODO (in-engine: scale/rotate item art) |
| Pixel food/sweets backup pack | Kenney Pixel Platformer Food Expansion | GOT (`prod/kenney_tiles/food/`, 112 tiles) |

## C. Poop & mess (replace 💩 emoji)
| Item | Source | Status |
|---|---|---|
| Furball/poop sprite (Eevee×Tama style) | PIL hand-asset, PMD brown palette | GOT (`prod/fx/furball.png`, `furball_small.png`) |
| Clean sparkle FX | Kenney Particle Pack (transparent) | GOT (`prod/particles/spark_01/02.png`, `circle_01/03.png`) |

## D. FX & emotes (replace emoji FX)
| Item | Source | Status |
|---|---|---|
| Hearts (petting) | PIL pixel heart (dark outline, PMD style) + Kenney white heart symbol | GOT (`prod/fx/heart.png`, `heart_2x.png`, `prod/particles/symbol_01.png`) |
| Zzz (sleep) | pixel font text + CSS float (no emoji) | TODO (in-engine) |
| Sparkle/evolve aura, stars, magic | Kenney Particle Pack (transparent) | GOT (`prod/particles/` spark/star/magic/twirl/smoke) |
| PMD emotes (cheer/worry/shock/water/confused/surprise/chat) | PMD pmd_effects | GOT (existing) |

## E. Environment (replace CSS gradient + ellipse rug)
| Item | Source | Status |
|---|---|---|
| Day meadow (pixel tiles) | Kenney Pixel Platformer, cropped + 6x vision-verified | GOT (`prod/scene/`: sky_day, meadow_far_0/1, grass_top_0-3, dirt, tree, tuft_0/1, bush, plant, mushroom, snowman, ground_edge) |
| Night variant | PIL-darkened sky + in-engine overlay | GOT (`prod/scene/sky_night.png`) |
| Pixel pet bed (for sleep) | PIL hand-asset (pastel rim + cushion) | GOT (`prod/fx/petbed.png`) |
| Clouds / leaves / petals particles | CSS + particle pack | GOT (in-engine; sky tiles already carry clouds) |

## F. Device & UI (the "high tier" core)
| Item | Source | Status |
|---|---|---|
| Handheld shell (eggshell plastic, screen bezel, clip), CSS/SVG craft | in-engine | TODO |
| Action buttons w/ icons: Meal (berry), Snack (candy), Play (P1 game icon), Pet (heart), Clean (P1 bathroom), Medicine (P1), Lights (P1) | found art + P1 icons | TODO (art ready: `prod/items/`, `prod/fx/heart.png`, `assets/ref/tamagotchi_original/`) |
| Status bars (Meal/Happy/Energy) with P1-style icons | in-engine + P1 icons | TODO |
| Notification strip (mood icons) | P1 status icons | GOT (existing) |
| **Pixel fonts**: Press Start 2P (HUD) + VT323 (log) | Google Fonts (OFL) | GOT (`prod/font/`, both render-verified) |
| Panels: log, Dex, buttons, consistent pixel theme | in-engine (Kenney UI Pack = reference) | TODO (`prod/kenney/pixel-ui-pack/` downloaded) |

## G. Dex & portraits
| Item | Source | Status |
|---|---|---|
| Dex cell sprites (animated) | PokeAPI gen-V animated GIFs | GOT (`prod/dex_anim/`) |
| Official artwork normal+shiny | PokeAPI | GOT (existing, `assets/ref/pokeapi_shiny/`) |
| Portrait frames (Café ReMix) ×3 + full render | Fandom wiki | GOT (existing, `assets/ref/cafemix/`) |

## H. Sound (audition pending, `preview_audio.html`)
| Item | Source | Status |
|---|---|---|
| UI click / button press | Kenney Interface Sounds (CC0) | GOT (`prod/audio/interface-sounds/`, 103 files) |
| Action SFX: eat, pet, clean, poop, sick | Kenney Interface Sounds | GOT (pick from pack) |
| Evolution jingle + hatch crack + death | Kenney Music Jingles (CC0) | GOT (`prod/audio/music-jingles/`, 85 jingles: NES/HIT/PIZZI/SAX/STEEL ×17) |
| BGM: day + night loop | Kenney Music Jingles (NES = chiptune) | GOT (selection pending user audition) |
| (rejected) Kenney RPG Audio | medieval foley, wrong vibe | SKIPPED |

## I. Screens
| Item | Source | Status |
|---|---|---|
| Egg crack frames (2) | PIL over official egg | GOT (`prod/fx/egg_crack1.png`, `egg_crack2.png`) |
| Death/tombstone sprite | PIL (Press Start 2P "R.I.P." engraving) | GOT (`prod/fx/tombstone.png`) |
| Title/boot splash (optional) | in-engine | TODO |

## J. Poké Casino (minigames)
| Item | Source | Status |
|---|---|---|
| Poker chips (bet UI, 5 colors + side + stack) | Kenney Boardgame Pack (CC0) | GOT (`prod/kenney/boardgame-pack/PNG/Chips/`) |
| Dice 1–6 (red + white), future Lucky Dice | Kenney Boardgame Pack | GOT (`prod/kenney/boardgame-pack/PNG/Dice/`) |
| Playing cards full 52 + backs (Card Flip) | Kenney Boardgame Pack | GOT (`prod/kenney/boardgame-pack/PNG/Cards/`) |
| Slot symbols: 4 official Poké Balls + Oran + Sweet Heart + Eevee face | PokeAPI item art + Café ReMix | GOT (`prod/items/*-ball.png` + existing) |
| Casino SFX (chips/dice/cards, 58+14 files) | Kenney Casino Audio + Boardgame Pack (CC0) | GOT (`prod/audio/casino-audio/`, boardgame oggs) |
| Slot cabinet sprite (3-reel, candy pixel style) | PIL hand-asset | TODO |
| Roulette wheel (12 segments + chibi faces) | canvas + existing chibis | TODO (in-engine) |
