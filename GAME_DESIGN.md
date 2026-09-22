# GAME DESIGN: Eevee-Tama (modern mobile-first Tamagotchi)

> Design doc for the production rebuild. Mobile-first, touch-screen, portrait. Vanilla JS/HTML/CSS (zero deps), stays true to the stack.
> Research sources: RESEARCH.md S13/S14 (Eevee×Tamagotchi), S25/S26 (original P1), + 2026 survey of **Tamagotchi Uni** (2023, Bandai's modern flagship), **Tamagotchi Paradise** (2024), mobile UX best practices. Reference screenshots in `assets/ref/research/` (montage: `refs_montage.png`).

---

## 1. Vision

**A modern Eevee × Tamagotchi**: hatch an egg, raise Eevee through its life, and evolve it into one of **9 Eeveelutions**, collecting all 9 + 9 shinies across generations. Faithful to the 1996 Tamagotchi care loop and the 2019 Eevee×Tama evolution rules, but with **2026 mobile polish**: full-bleed animated meadow, personality, minigames, medals, shop, haptics, and chiptune audio. No emojis, every visual is a real, style-matched asset (see ASSET_PLAN.md).

**Player fantasy:** "I have a real little Eevee living in my phone. It has a personality. I can grow all nine Eeveelutions, find the rare shinies, and make its meadow mine."

**Session shape:** one full Eevee life ≈ **30–45 real minutes** (with sleep-skips); a "casual pass" = 10 min of check-ins per day. Dex collection is the multi-session meta.

## 2. Research takeaways (what modern Tamagotchi does right)

| Feature (Tamagotchi Uni) | Our take |
|---|---|
| Unique personality per pet; favorite foods/snacks/toys; pets refuse what they dislike | ✅ **Personality system** (5 personalities → favorite berry + snack, emote style, speech) |
| Rich animations for every interaction (feed/toy/bath/delivery) | ✅ Every action = sprite animation + emote + SFX + haptic (we have PMD idle/walk/attack/hurt/sleep + 7 emotes) |
| Minigames you actually play → earn points (rhythm, fast-food, cake factory) | ✅ **2 minigames** (Berry Catch, Eevee Dance) → Tama Coins + Happy |
| Points → Tama Mall → accessories, furniture, room decor | ✅ **Shop** (Tama Coins): meadow decor, pet fashion, UI themes |
| Milestone medals | ✅ **Medals** (~30) |
| Tama Walk (accelerometer, collect materials) | ➕ v2 (DeviceMotion API, optional) |
| Pet speaks (voices) | ➖ No licensed Pokémon voice → **emote + speech bubbles** instead (PMD emotes already exist) |
| Rooms (living/garden/bedroom/kitchen/bath) | ➖ Single rich **meadow scene** (our Kenney tiles + pet bed = "home"). Simpler = tighter |
| Adults "leave to chase dreams" (soft ending) alongside death | ✅ **Two endings**: natural life → *Graduation* (farewell scene); neglect → *Death* (tombstone) |
| Daily/monthly events (5th/15th/25th shop discounts, ghost on 15th) | ✅ **Monthly events** (cheap shop, rare shiny day, ghost Eevee easter egg) |
| 4-stage life (baby 1h / child 24h / teen 24h / adult ∞) | ✅ 3 stages (egg → baby → child → adult), matches Eevee×Tama |
| Sickness only from real neglect; snacks overuse causes tummy ache | ✅ same |

**Mobile UX rules we apply** (from mobile-game UI research):
- **Thumb zone**: primary actions in bottom dock (44px+ targets, 12px spacing). Status/clock on top (eyes go top, hands go bottom).
- **Feedback above the finger**: toasts/labels appear above the tap point, never under it.
- **Short sessions**: instant resume, offline progression, no loading screens.
- **One job per screen**, icons over text, no dead UI.
- **Haptics** on every action (light/medium/heavy tiers) where the platform allows (Vibration API).

## 3. Core loop

```
        ┌────────────── active (minutes) ──────────────┐
        │ feed meals · snacks · pet(tap) · play ·      │
        │ clean furballs · cure sickness               │
        └──────────────┬───────────────────────────────┘
                       ▼
   meters (Meal / Happy / Energy) decay in real time (incl. offline)
                       ▼
        ┌────── hour scale ──────┐
        │ sleep 20:00–07:00 · furballs appear ·
        │ stage growth · evolution windows · walking
        └──────┬─────────────────┘
               ▼
        ┌────── life scale ──────┐
        │ choose evolution path (stones / time windows /
        │ affinity) → evolve → shiny? → Dex entry →
        │ rank (S/A/B/C) → medals → coins → shop
        └──────┬─────────────────┘
               ▼
      Graduation (natural) or Death (neglect) → New Egg (Dex + medals persist)
```

## 4. Stats & decay

| Stat | Range | Decay (per game-hr) | Restored by |
|---|---|---|---|
| **Meal** | 0–100 | −4 | Meals (berries, +30–40), Snacks (+12) |
| **Happy** | 0–100 | −3 | Petting (+6), minigames (+15–25), favorite food (+2×), clean scene, toy |
| **Energy** | 0–100 | −5 | Sleep (full restore 20:00–07:00); Chesto berry small boost |
| **Health** (hidden) | 0–100 | drops while any stat = 0, per furball (−2), over-snacking (−3/snack >3/day) | Rawst berry (+25), medicine (full), time |
| **Cleanliness** | derived | furballs 0–5 on scene | Cleaning (tap furball) |

**Time scale:** 1 game-hour = **30 real seconds** (2 game-min/sec). Life ≈ 30–45 min (egg 60 s, baby day 1, child day 2, adult ≥ day 2, Sylveon at day 3+22:00). **Sleep-skip**: tap during sleep → morning (keeps sessions tight).

**Consequences (faithful):**
- Any stat at 0 for 6 consecutive game-hrs → **sick** (medicine icon, sad emote, needs medicine or Rawst)
- Sick + 14 zero-hours → **death** (tombstone)
- 5 furballs → Happy decay ×2 + "dirty" penalty
- 3+ snacks/day → tummy ache (sick chance), the Uni rule
- Neglect while offline: meters floor at 10 (no death while away); **"While You Were Away"** report on return

**Personality** (rolled at hatch, shown on profile):
| Personality | Fave meal | Fave snack | Emote style | Bubble |
|---|---|---|---|---|
| Cheerful | Sitrus | Sweet Heart | cheer | "Eevee!" |
| Mellow | Oran | Honey | chat | "Eeve~" |
| Feisty | Cheri | Rage Candy Bar | shock | "Bark!" |
| Sleepy | Chesto | Honey | doze/worry | "Zzz…" |
| Sweet | Pecha | Sweet Heart | cheer + hearts | "Moe!" |
(Rawst = health berry, nobody's favorite. Fave = +2× Happy on feed; disliked meal = grumble emote, −Happy.)

## 5. Evolution system (faithful Eevee×Tama + Pokémon)

At **adult** (or later), the pet can evolve **once** per life:
- **Water Stone** → Vaporeon · **Thunder Stone** → Jolteon · **Fire Stone** → Flareon (instant, any time)
- **Leaf Stone** → Leafeon · **Ice Stone** → Glaceon (instant)
- **Espeon**: Day window **07:00–12:00** + snack while affinity high
- **Umbreon**: Night window **18:00–20:00** + snack while affinity high
- **Sylveon**: affinity ≥ threshold after **Day 3, 22:00** (auto)
- **Shiny**: 1/50 per egg (decided at hatch, revealed at evolution)
- **Affinity** = f(meals on time, petting, sickness-free, clean scene)

**Pokédex**: 18 cells (9 normal + 9 shiny), animated GIF sprites, silhouette until caught. 18/18 = **Eevee Master** medal. Persists across eggs (localStorage).

## 6. Screens (mobile portrait, max-width 480px)

1. **Title**, logo + "TAP TO HATCH" + Day 1 07:00 (boot jingle)
2. **Egg**, meadow + egg (2 crack frames, wobble on tap), progress ring
3. **Main Care** (the home, ~90% of play):
   - Full-bleed scene: sky → far meadow → grass band → decor (tree/tufts/mushroom/bed/snowman) → pet → FX
   - **Top HUD**: Day + clock (Press Start 2P), stage chip, 3 stat pips (P1-style icons: meal/fork-knife, happy/heart, energy/bolt) + alert icons (poop/sick)
   - **Bottom dock** (thumb zone, 5 chunky circular buttons): 🍓 Feed · 🎾 Play · ❤️ Pet · 🧹 Clean · ⚙️ More, *icons drawn from our art (berry art, ball, pixel heart, P1 bathroom icon, gear); labels in VT323*
   - Tap pet = pet (hearts), tap furball = clean (sparkles), long-press pet = profile
   - Day/night: sky tile swap + blue overlay + stars + firefly particles
4. **Food menu** (bottom sheet): 5 meal berries + Rawst (health) + 4 snacks; art + name + effect + fave/disk markers
5. **Play = Poké Casino**: Eevee Slots · Eeveelution Roulette · Card Flip (Eevee sits with you and reacts) · Give Ball (toy → play anim, +Happy)
6. **Pokédex**: 3×3 + 3×3 shiny grid (animated GIFs, silhouettes, count "7/18")
7. **Profile**: Café ReMix face, name (auto + rename), personality, stage, age, stats detail, care **Rank S/A/B/C**, medals count
8. **Medals**: scroll list (earned = color, locked = silhouette)
9. **Shop**: Tama Coins; meadow decor / pet fashion / UI themes
10. **Evolution cinematic**: scene flash → dex GIF reveal → name + form card (+SHINY banner) → fanfare + confetti particles
11. **Endings**: Graduation (Eevee waves, walks into sunset, farewell card) / Death (tombstone, R.I.P., "New Egg")
12. **While You Were Away** (offline report): what happened, current state, one-tap actions
13. **Settings**: sound on/off, haptics on/off, reset, about

## 7. Minigames: **Poké Casino** (touch, 10–30 s, win/lose → coins + Happy)

"Play" = a **Poké Casino** corner (arcade vibe, faithful to the Pokémon Game Corners). Eevee joins you: sits beside the machine, cheers on wins (cheer emote), worries on losses (worry emote). Playing itself counts as *play* (+Happy); wins → **Tama Coins** + bonus Happy; losses → small +Happy (it's fun). **Daily free chips** so the pet never runs dry.

1. **Eevee Slots** (Celadon/Goldenrod Game Corner, Gen 1–3), the flagship
   - 3 reels; bet 1–3 chips (activates 1 / 3 / 5 paylines)
   - Symbols (all official art): **7 · Poké Ball · Oran Berry · Sweet Heart · Eevee face**
   - Payouts (Game Corner style): 777 = **JACKPOT ×30** (confetti + bonus spin) · 3 balls ×10 · 3 berries ×5 · 3 hearts ×4 · 3 Eevee ×3 · any pair ×1.5
   - One-tap SPIN, 2 s reel spin, chip-lay + chips-collide SFX
   - Personality twist: each personality has a **lucky symbol** (+20% payout when it lands)
2. **Eeveelution Roulette** (Mauville Game Corner, Ruby/Sapphire)
   - 12-slot wheel = 4 Eeveelutions (Vaporeon/Jolteon/Flareon/Espeon) × 3 colors (red/blue/green); the ball = a **Poké Ball**
   - Bets by tap: color ×2 · Eeveelution ×4 · exact slot ×12
   - Pet reacts harder if it was its *future evolution* form
   - Canvas-drawn wheel, 3 s eased spin (no new art: colored segments + chibi faces)
3. **Card Flip** (Goldenrod Game Corner, Gen 2)
   - 4 face-down cards (Kenney cards), bet on one, **highest rank wins** (A>K>…>2, tie = push)
   - Type-themed suits: ♥ Fire · ♦ Water · ♣ Grass · ♠ Thunder
   - 3-tap flow: place chip → card-flip reveal animation → payout

All three: full-bleed, single-thumb, big hitboxes, no text mid-play, result card with coins. **Casino medals**: Lucky Eevee (net +100 chips) · Jackpot (777) · High Roller (500 coins in one session).

## 8. Meta & retention

- **Tama Coins**: minigame scores, care milestones, daily return bonus → Shop
- **Medals (~30)**: first hatch · first adult · first death · each Eeveelution ×9 · each shiny ×9 · Dex 9/9 · Dex 18/18 (Eevee Master) · Clean Freak (100 furballs) · Foodie (100 meals) · Minigame Master (500 pts) · 3 lives · 7 days · 30 days
- **Monthly events**: 5th/15th/25th shop 50% off · 10th/20th/30th shiny day (1/25) · 15th-of-even-months: ghost Eevee visits at night (easter egg)
- **Care Rank (S/A/B/C)** per life, shown at evolution + profile
- **Offline**: time advances, meters floor at 10, report on return

## 9. Audio & haptics

- **BGM**: day loop (cheerful NES jingle), night loop (calm), from Kenney Music Jingles (pick at audition, `preview_audio.html`)
- **SFX**: feed crunch · pet bong+heart · furball drop · clean sparkle · sick error · medicine · UI click · evolution fanfare · death dirge · hatch crack
- **Pet "voice"**: emote + speech bubble (no licensed Pokémon audio)
- **Haptics** (Vibration API): light = tap/dock, medium = feed/clean/minigame hit, heavy pattern = evolve, long = death
- Mute + haptic toggles in Settings; audio starts on first tap (autoplay policy)

## 10. Art direction & scene composition

- **Layer stack (back→front)**: sky tile → far meadow strip (parallax-ish) → grass band (4 grass tiles repeat) → decor (tree, tufts ×4, bush, mushroom, snowman, pet bed, positions per seed) → pet + FX → foreground edge
- **Pet**: PMD sprites ~2.5× scale, walks within grass band (x-axis wander), soft ellipse shadow, emotes pop above head; chibi forms for Espeon/Umbreon/Leafeon/Glaceon/Sylveon (native shinies); PMD forms get hue-rotate shiny filter
- **Night**: darkened sky tile + 20% blue multiply overlay on scene + star dots + firefly particles
- **UI**: candy-pixel style, rounded chunky buttons, pixel borders, pastel palette (sky #aee3ff, cream #fff3d6, pink #ffb3c8, grass green), Press Start 2P labels + VT323 body; panels = 9-slice pixel frames (Kenney UI pack ref)
- **Furball** (PIL) for poop · **pixel heart** (PIL) for petting · Kenney transparent particles for sparkle/clean/evolve · **tombstone** for death · **egg cracks** for hatch
- **Casino furniture**: Kenney Boardgame Pack chips/dice/cards (flat vector, UI layer, fine next to pixel world) · **slot cabinet** = PIL pixel art in candy style (3-reel window, marquee, lever) · **roulette wheel** = canvas (12 colored segments + 4 chibi faces) · slot symbols = official item art (4 balls, Oran, Sweet Heart, Eevee face)

## 11. Tech stack & technical plan

**Stack: vanilla JS (ES modules, zero deps, no build step) + HTML5 Canvas 2D + CSS, packaged as a PWA.**

### Rendering split (the core decision)
- **Canvas 2D = the world**: meadow layers, pet sprite, particles, slot reels, roulette wheel, card tables, cinematics. One canvas, one rAF loop. Render load is modest (1 pet + ~15 decor sprites + ≤100 particles) → 60 fps with huge headroom.
- **DOM/CSS = the UI chrome**: HUD, bottom dock, bottom sheets, toasts, Pokédex grid, menus. DOM wins for text (Press Start 2P / VT323 stays crisp), accessible targets, and safe-area handling. Canvas wins for sprites/particles/rotation. Hybrid = best of both.

### Why not a framework/engine
| Option | Verdict |
|---|---|
| **Phaser 3** | Capable (tweens, particles, scale manager) but ~1 MB + its own scene architecture for a scene this small; would fight the DOM-UI layer. Rejected |
| **Godot 4 / Unity WebGL** | Multi-MB browser builds, slow cold start, weak PWA/touch integration. Wrong tool for a web-first game (kept as future port target) |
| **React/Vue + canvas** | Framework churn for a single-screen game, zero benefit over plain ES modules. Rejected |
| **Vanilla + Canvas** | ✅ Tiny, fast, offline by default, hosts anywhere, full control, logic stays portable |

### Fits ANY mobile resolution
- **Fixed logical design space**: design at **430×932 CSS px** (modern 19.5:9 phone). World canvas scales **uniformly (cover)** to fill any screen; UI laid out with `100dvh` + `env(safe-area-inset-*)`. Extreme ratios (foldables, tablets, 21:9) get letterbox bands, never distortion.
- **Crisp pixel art at any DPI**: canvas backed at `devicePixelRatio` (cap 3×), sprites drawn with `imageSmoothingEnabled = false`, CSS `image-rendering: pixelated`.
- **Portrait-locked** (`@media (orientation: landscape)` → "please rotate" interstitial), `viewport-fit=cover` for notches, home-indicator safe area on the dock.

### Touch controls
- **Pointer Events** everywhere (unifies touch/mouse/pen), `touch-action: none` on canvas, `user-select: none`, no 300 ms delay, no double-tap zoom.
- One tiny input layer classifies **tap / long-press (350 ms) / drag**, no library.
- Targets ≥ 48 px, ≥ 12 px spacing; **feedback appears above the finger**, never under it.
- **Haptics**: Vibration API (Android/Chrome); degrades silently on iOS (no API).

### Other mobile features (PWA)
- **Installable to home screen**: manifest + 192/512 icons + maskable icon + splash color → feels like a native app
- **Offline-first**: everything local (already true, zero CDN), add a service worker to cache the app shell
- **Instant resume + offline time catch-up** (the Tamagotchi essence) via `visibilitychange`/`pagehide` timestamps
- **Fullscreen** API on demand, **Screen Wake Lock** while playing (Android), pull-to-refresh disabled (`overscroll-behavior: none`)
- **Audio unlock on first tap** (iOS autoplay policy); optional Web Push "Eevee is hungry!" later (needs a hosted origin)

### Module layout (no build step, plain ES modules over HTTP)
```
index.html · style.css
src/main.js     boot, asset preload (per-form lazy: PMD has ~900 files, load active form ≈60)
src/game.js     state machine, rAF loop, delta-time, offline catch-up, dev API
src/scene.js    layer composer (static layers pre-rendered to offscreen canvases; pet + FX animate)
src/casino.js   slots / roulette / card flip (canvas boards + tweens)
src/ui.js       DOM: dock, sheets, toasts, dex, profile, shop
src/audio.js    Web Audio mixer (Kenney oggs), BGM day/night, haptics bridge
src/save.js     versioned localStorage
```
- **Perf**: pre-rendered static scene layers (re-render only on day/night/decor change), sprite cache, single rAF, delta-time; no GC spikes (object pools for particles)
- **Tests/showcase**: Playwright mobile viewports (iPhone 15 Pro, Pixel 9, iPad) + `window.TamaGame` dev API (freeze/warp/cheats)
- **Future**: wrap in Capacitor for App Store/Play if ever wanted (same code)

## 12. Build order (production rebuild)

| # | Milestone | Screens/systems |
|---|---|---|
| 1 | Scene + pet | meadow composer, day/night, PMD wander, emotes, shadow |
| 2 | HUD + dock | top HUD, 5-button dock, toasts, food menu w/ item art |
| 3 | Care loop | stats/decay, feed/snack, petting hearts, furball + clean, sick + medicine, Rawst |
| 4 | Lifecycle | egg cracks/hatch, stages, sleep + skip, evolution cinematics, Dex (GIFs), shiny |
| 5 | Poké Casino | Eevee Slots (PIL cabinet), Eeveelution Roulette (canvas), Card Flip, coins |
| 6 | Meta | personality, profile, medals, shop + decor/fashion, rank |
| 7 | Audio/haptics | BGM day/night, all SFX, vibration |
| 8 | Offline + persistence | save v2, offline catch-up, report screen |
| 9 | Endings + polish | graduation, death, monthly events, settings, final pass |

## 13. Decisions

| # | Decision | Status |
|---|---|---|
| 1 | **Minigames** | ✅ **CONFIRMED: Poké Casino** (Eevee Slots + Eeveelution Roulette + Card Flip), classic casino formats = easy to build, Pokémon Game Corner lore, Kenney assets secured |
| 2 | **Pacing** | 1 life ≈ 30–45 real min (1 game-hr = 30 s), default unless user says otherwise |
| 3 | **Endings** | Both: natural → Graduation; neglect → Death (tombstone), default |
| 4 | **Meta scope v1** | Full: personality + Poké Casino + shop + medals, default |
| 5 | **Pet naming** | Auto-generated cute name + optional rename in profile, default |
