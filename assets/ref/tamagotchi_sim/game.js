/* Eevee-Tama — Tamagotchi MVP
 * Assets: PMD (ArcherZenmi) · Pokémon Sleep (Serebii) · Café ReMix (Fandom) · PokeAPI · Eevee×Tamagotchi rules (Serebii)
 */
"use strict";

// ---------------- paths ----------------
const PMD    = "../eeveelution-assets/eeveelution_sprites/";
const EMOTE  = "../eeveelution-assets/pmd_effects/";
const CHIBI  = "../pokemonsleep/";
const ART    = "../pokeapi_shiny/";
const GIF    = "../showdown/";
const SERE   = "../serebii/";
const CAFE   = "../cafemix/";
const P1ICON = "../tamagotchi_original/";

const DIRS   = ["down","down left","down right","left","right","up","up left","up right"];
const BODY_ST = ["idle","move","attack","hurt"];
const EMOTE_FRAMES = { cheer:2, worry:2, shock:2, confused:10, surprise:5, water:3, chat:3 };

const FORMS = {
  eevee:    { name:"Eevee",    dex:133, pmd:true  },
  vaporeon: { name:"Vaporeon", dex:134, pmd:true  },
  jolteon:  { name:"Jolteon",  dex:135, pmd:true  },
  flareon:  { name:"Flareon",  dex:136, pmd:true  },
  espeon:   { name:"Espeon",   dex:196, pmd:false },
  umbreon:  { name:"Umbreon",  dex:197, pmd:false },
  leafeon:  { name:"Leafeon",  dex:470, pmd:false },
  glaceon:  { name:"Glaceon",  dex:471, pmd:false },
  sylveon:  { name:"Sylveon",  dex:700, pmd:false },
};
const DEX_ORDER = ["eevee","vaporeon","jolteon","flareon","espeon","umbreon","leafeon","glaceon","sylveon"];

const STONES = {
  water:   { to:"vaporeon", img: PMD+"vaporeon/water_stone.png",   label:"Water Stone" },
  thunder: { to:"jolteon",  img: PMD+"jolteon/thunder_stone.png",  label:"Thunder Stone" },
  fire:    { to:"flareon",  img: PMD+"flareon/fire_stone.png",     label:"Fire Stone" },
  leaf:    { to:"leafeon",  img: null, label:"Leaf Stone" },
  ice:     { to:"glaceon",  img: null, label:"Ice Stone" },
};

// ---------------- tuning ----------------
const HOUR_MS   = 8000;      // 1 game-hour = 8 real seconds
const HATCH_MIN = 120;       // egg hatches after 2 game-hours
const BABY_MAX  = 1440;      // 1 day
const CHILD_MAX = 2880;      // 2 days
const SYLVEON_MIN = 4320;    // 72h
const SICK_HOURS  = 6;
const DEAD_HOURS  = 14;
const ROOM = { w:480, h:340, x0:50, x1:430, y0:90, y1:300 };
const RUG  = { x:375, y:255 };
const FRAME_MS = { idle:550, move:190, attack:210, hurt:320, sleep:650 };

// ---------------- state ----------------
let S = freshState();
function freshState(){
  return {
    stage:"egg", form:"eevee", shiny:false,
    total:0, lastHour:0,            // game-minutes since 7:00 day 1
    hatchAt: HATCH_MIN,
    full:80, happy:80, energy:90,
    zeroHours:0, sick:false, dead:false,
    sleeping:false,
    poops:[], poopTimers:[],
    collected:{},
    forceShiny:false,
    framesReady:false,
    busy:null,
    frozen:false,
  };
}
for (const f of DEX_ORDER) S.collected[f] = { n:false, s:false };

// ---------------- dom ----------------
const $ = s => document.querySelector(s);
const petWrap = $("#pet-wrap"), petImg = $("#pet-img"), emoteBox = $("#emote"),
      zzz = $("#zzz"), portrait = $("#portrait"),
      nightOv = $("#night-overlay"), flash = $("#flash"),
      evoOv = $("#evo-overlay"), evoImg = $("#evo-img"), evoLabel = $("#evo-label"),
      deathOv = $("#death-overlay"), fxLayer = $("#fx-layer");
emoteBox.innerHTML = "<img alt='' >";
const emoteImg = emoteBox.querySelector("img");

// ---------------- frame cache ----------------
const frameCache = {};            // form -> "dir|state" -> [urls]
const emoteUrls  = {};
let sleepHas = {};
function imgOk(url){ return new Promise(r=>{ const im=new Image(); im.onload=()=>r(true); im.onerror=()=>r(false); im.src=url; }); }
async function probe(base, max=14){
  const out=[];
  for (let n=1;n<=max;n++){ if (await imgOk(base+n+".png")) out.push(base+n+".png"); else break; }
  return out;
}
async function preloadEmotes(){
  for (const [name,n] of Object.entries(EMOTE_FRAMES)) emoteUrls[name] = await probe(EMOTE+name+"/", n+2);
}
async function preloadSleep(){
  for (const f of Object.keys(FORMS)) sleepHas[f] = await probe(PMD+f+"/sleep/", 6);
}
async function preloadForm(form){
  const c = {};
  const jobs = [];
  for (const d of DIRS) for (const st of BODY_ST) jobs.push(probe(PMD+form+"/"+d+"/"+st+"/").then(fr=>c[d+"|"+st]=fr));
  await Promise.all(jobs);
  frameCache[form] = c;
  S.framesReady = true;
}
function curFrames(form, dir, state){
  if (!S.framesReady || !FORMS[form].pmd) return null;
  return frameCache[form]?.[dir+"|"+state] || null;
}

// ---------------- clock ----------------
const minutesOfDay = () => (7*60 + S.total) % 1440;
const dayOf        = () => Math.floor((7*60 + S.total) / 1440) + 1;
const ageMin       = () => Math.max(0, S.total - S.hatchAt);
const isNight      = () => { const m = minutesOfDay(); return m >= 20*60 || m < 7*60; };
const stageOf = () => S.stage;
function stageName(){
  if (S.form !== "eevee") return "Adult";
  const a = ageMin();
  return S.stage==="egg" ? "Egg" : a < BABY_MAX ? "Baby" : a < CHILD_MAX ? "Child" : "Adult";
}

function advanceClock(dm){
  S.total += dm;
  while (S.total - S.lastHour >= 60){ S.lastHour += 60; onHour(); }
}

function onHour(){
  if (S.dead) return;
  const m = minutesOfDay();
  if (S.stage !== "egg"){
    S.full   = clamp(S.full - 8);
    S.happy  = clamp(S.happy - (3 + 4*S.poops.length + (S.full<=0 ? 6 : 0)));
    S.energy = clamp(S.energy + (S.sleeping ? 30 : -5));
    if (S.full<=0 || S.happy<=0) S.zeroHours++; else S.zeroHours = 0;
    if (!S.sick && S.zeroHours >= SICK_HOURS){ S.sick = true; log("is feeling sick! Take care of it.", "bad"); }
    if (S.sick && S.zeroHours === 0 && S.full > 50 && S.happy > 50){ S.sick = false; log("has recovered!", "good"); }
    if (S.sick && S.zeroHours >= DEAD_HOURS) return die();
    // poops
    for (const t of S.poopTimers) if (S.total >= t.at && !t.done){ t.done = true; addPoop(); }
    S.poopTimers = S.poopTimers.filter(t => !t.done);
    // growth
    if (S.form === "eevee"){
      const a = ageMin();
      if (S.stage === "baby" && a >= BABY_MAX){ S.stage = "child"; log("grew into a Child! (bigger now)", "good"); showEmote("surprise"); }
      if (S.stage === "child" && a >= CHILD_MAX){ S.stage = "adult"; log("is now an Adult — it can evolve!", "good"); showEmote("cheer"); }
    }
    if (!S.sleeping && !S.busy && Math.random() < 0.12) moodEmote();
  }
  // Sylveon at 10pm after 72h
  if (S.form==="eevee" && S.stage==="adult" && ageMin()>=SYLVEON_MIN && m>=22*60 && m<23*60) evolve("sylveon");
  renderAll();
}

function clamp(v){ return Math.max(0, Math.min(100, v)); }

// ---------------- pet AI ----------------
let px = 240, py = 200, facing = "down", animState = "idle", frameIdx = 0, frameAccum = 0,
    idleUntil = 0, walkTarget = null, lastT = performance.now();

function pickTarget(){
  return { x: ROOM.x0 + Math.random()*(ROOM.x1-ROOM.x0), y: ROOM.y0 + Math.random()*(ROOM.y1-ROOM.y0) };
}
function dirFromDelta(dx, dy){
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < 6 && ay < 6) return null;
  if (ax*1.8 <= ay) return dy > 0 ? "down" : "up";
  if (ay*1.8 <= ax) return dx > 0 ? "right" : "left";
  const v = dy > 0 ? "down" : "up";
  return v + (dx > 0 ? " right" : " left");
}

function tickAI(){
  if (S.dead || S.stage === "egg") return;
  if (S.busy){ tickBusy(); return; }
  if (S.sleeping){ animState = "sleep"; swapFrame(); return; }
  const now = performance.now();
  if (walkTarget){
    const dx = walkTarget.x - px, dy = walkTarget.y - py;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5){ walkTarget = null; idleUntil = now + 1500 + Math.random()*4500; animState = "idle"; }
    else {
      px += dx/ (Math.hypot(dx,dy)) * 1.15;
      py += dy/ (Math.hypot(dx,dy)) * 1.15;
      const d = dirFromDelta(dx, dy);
      if (d) facing = d;
      animState = "move";
    }
  } else if (now >= idleUntil){
    walkTarget = pickTarget();
  }
  swapFrame();
}

function swapFrame(){
  frameAccum += 100;
  const need = FRAME_MS[animState] || 400;
  if (frameAccum < need) return;
  frameAccum = 0; frameIdx++;
}

// ---------------- busy actions ----------------
function setBusy(type, dur, opts={}){
  S.busy = { type, t0: performance.now(), dur, opts };
}
function tickBusy(){
  const b = S.busy, t = performance.now() - b.t0;
  if (b.type === "eat"){
    const food = b.opts.foodEl;
    if (food){
      const dx = parseFloat(food.dataset.x) - px, dy = parseFloat(food.dataset.y) - py;
      const d = dirFromDelta(dx*2, dy*2); if (d) facing = d;
    }
    animState = "attack";
    if (t >= b.dur){
      if (food) food.remove();
      S.full = clamp(S.full + 40);
      S.busy = null; animState = "idle"; idleUntil = performance.now() + 1200;
      showEmote("cheer");
      log("ate the meal. +Meal", "good");
      if (Math.random() < 0.45) S.poopTimers.push({ at: S.total + 120 + Math.random()*180, done:false });
    }
  } else if (b.type === "play"){
    animState = "attack";
    if (t >= b.dur){
      S.busy = null; animState = "idle"; idleUntil = performance.now() + 1000;
      showEmote("surprise");
      log("played and had a blast! +Happy", "good");
    }
  } else if (b.type === "sleepMove"){
    // walk toward rug while sleeping flag is set
    const dx = RUG.x - px, dy = RUG.y - py;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6){ S.busy = null; animState = "sleep"; }
    else {
      px += dx/ (Math.hypot(dx,dy)) * 1.15;
      py += dy/ (Math.hypot(dx,dy)) * 1.15;
      const d = dirFromDelta(dx,dy); if (d) facing = d;
      animState = "move";
    }
  }
}

// ---------------- actions ----------------
function guard(msg){
  if (S.dead) return false;
  if (S.stage === "egg"){ log(msg); return false; }
  if (S.sleeping){ log("It's asleep… shhh."); return false; }
  return true;
}
function doMeal(){
  if (!guard("You can't feed an egg. Maybe warm it?")) return;
  if (S.full >= 100){ log("is full!"); return; }
  const fx = px + 34, fy = py + 8;
  const el = document.createElement("div");
  el.className = "food"; el.textContent = "🍙"; el.dataset.x = fx; el.dataset.y = fy;
  el.style.left = fx+"px"; el.style.top = (fy-20)+"px";
  fxLayer.appendChild(el);
  setBusy("eat", 2400, { foodEl: el });
}
function doSnack(){
  if (!guard("Snacks need a hatched Eevee.")) return;
  S.happy = clamp(S.happy + 8); S.full = clamp(S.full + 10);
  if (S.form === "eevee") showPortrait("eevee02");
  showEmote("chat");
  log("munched a snack. +Happy", "good");
  // time-window evolutions
  if (S.form === "eevee" && S.stage === "adult" && ageMin() >= BABY_MAX){
    const h = minutesOfDay()/60;
    if (h >= 7 && h < 12) return evolve("espeon");
    if (h >= 18 && h < 20) return evolve("umbreon");
  }
}
function doPet(){
  if (!guard("The egg wobbles softly.")) return;
  S.happy = clamp(S.happy + 12);
  if (S.form === "eevee") showPortrait("eevee01");
  showEmote("cheer");
  log("was petted and wiggled happily!", "good");
}
function doPlay(){
  if (!guard("An egg can't play yet.")) return;
  if (S.energy < 20){ log("is too tired to play."); showEmote("worry"); return; }
  S.energy = clamp(S.energy - 20); S.happy = clamp(S.happy + 18);
  setBusy("play", 2200);
}
function doClean(){
  if (S.dead) return;
  if (!S.poops.length){ log("Nothing to clean."); return; }
  const n = S.poops.length;
  for (const p of S.poops) p.remove();
  S.poops = [];
  S.happy = clamp(S.happy + 4);
  log("cleaned up the mess. +Happy", "good");
  renderAll();
}
function addPoop(){
  if (S.poops.length >= 3) return;
  const el = document.createElement("div");
  el.className = "poop";
  el.style.left = (80 + Math.random()*(ROOM.w-160)) + "px";
  el.style.top  = (110 + Math.random()*(ROOM.h-170)) + "px";
  el.onclick = () => { el.remove(); S.poops = S.poops.filter(x=>x!==el); S.happy = clamp(S.happy+2); log("squeaked a poop. +Happy", "good"); renderAll(); };
  fxLayer.appendChild(el);
  S.poops.push(el);
  log("left a furball (poop)! Clean it up.", "bad");
}

function giveStone(k){
  if (S.dead || S.stage === "egg") return;
  const st = STONES[k];
  if (S.form !== "eevee" || S.stage !== "adult"){ log("That only works on an adult Eevee."); return; }
  log("used the " + st.label + "…", "good");
  setTimeout(()=>evolve(st.to), 500);
}

// ---------------- portrait / emote ----------------
let portraitTimer = null;
function showPortrait(file){
  portrait.querySelector("img")?.remove();
  const im = new Image(); im.src = CAFE + file + ".webp";
  portrait.appendChild(im);
  portrait.style.display = "block";
  clearInterval(portraitTimer);
  const t0 = performance.now();
  portraitTimer = setInterval(()=>{
    if (!S.frozen && performance.now() - t0 > 1700){ portrait.style.display = "none"; clearInterval(portraitTimer); }
  }, 200);
}
// real-time delay that re-arms while the game is frozen (keeps showcase states visible)
function delayWhileFrozen(ms, cb){
  setTimeout(function go(){
    if (S.frozen) setTimeout(go, 300); else cb();
  }, ms);
}
let emoteTimer = null;
function showEmote(name, dur=2200){
  const urls = emoteUrls[name]; if (!urls || !urls.length) return;
  emoteBox.style.display = "block";
  clearInterval(emoteTimer);
  let i = 0; emoteImg.src = urls[0];
  emoteTimer = setInterval(()=>{ if(!S.frozen){ i = (i+1)%urls.length; emoteImg.src = urls[i]; } }, 240);
  delayWhileFrozen(dur, ()=>{ emoteBox.style.display = "none"; clearInterval(emoteTimer); });
}
function moodEmote(){
  if (S.sick) return showEmote("worry");
  if (S.full < 25) return showEmote("shock");
  if (S.happy < 30) return showEmote("worry");
  if (S.poops.length >= 2) return showEmote("water");
  if (S.energy < 20) return showEmote("confused");
  return showEmote(Math.random() < 0.5 ? "cheer" : "chat");
}

// ---------------- sleep / death / hatch ----------------
function clearFood(){ const el = fxLayer.querySelector(".food"); if (el) el.remove(); }
function beginSleep(){
  if (S.sleeping || S.dead || S.stage === "egg") return;
  S.sleeping = true; S.busy = null; clearFood();
  nightOv.classList.add("on");
  log("curled up for the night. (lights out)");
  px = RUG.x - 20; py = RUG.y + 10; facing = "down";
  animState = "sleep"; frameIdx = 0;
  renderAll();
}
function wakeUp(){
  if (!S.sleeping) return;
  S.sleeping = false; S.busy = null; clearFood();
  nightOv.classList.remove("on");
  px = RUG.x + 40; py = RUG.y + 30;
  animState = "idle"; idleUntil = performance.now() + 1500;
  log("woke up! Good morning.", "good");
  renderAll();
}
function hatch(){
  S.stage = "baby"; S.busy = null;
  flashSeq(()=>{
    evoOv.style.display = "flex";
    evoImg.src = GIF + "133.gif";
    evoLabel.textContent = "Eevee hatched!";
  });
  delayWhileFrozen(2600, ()=>{
    if (S.stage === "egg" || S.dead) return; // stale: a new egg replaced this run
    evoOv.style.display = "none";
    log("hatched! A tiny Eevee stares at you.", "good");
    showEmote("cheer", 2600);
    markCollected("eevee");
    renderAll();
  });
}
function die(){
  S.dead = true; S.busy = null;
  log("…faded away. Take better care next time.", "bad");
  deathOv.style.display = "flex";
  renderAll();
}
function newEgg(fullReset){
  const keep = fullReset ? {} : S.collected;
  S = freshState();
  for (const f of DEX_ORDER) S.collected[f] = keep[f] || { n:false, s:false };
  deathOv.style.display = "none";
  nightOv.classList.remove("on");
  fxLayer.innerHTML = "";
  px = 240; py = 200; facing = "down"; animState = "idle";
  if (FORMS.eevee.pmd) preloadForm("eevee").then(()=>S.framesReady = true);
  S.framesReady = false;
  log("A new egg appeared! (Day 1, 7:00)");
  renderAll();
}

// ---------------- evolution ----------------
function flashSeq(cb){
  flash.style.transition = "opacity .25s"; flash.style.opacity = ".9";
  setTimeout(()=>{ flash.style.opacity = "0"; cb && cb(); }, 350);
}
function evolve(target){
  if (S.dead || S.evoBusy || S.stage === "egg") return;
  S.evoBusy = true;
  const f = FORMS[target];
  const shiny = S.forceShiny || Math.random() < 1/50;
  S.forceShiny = false;
  flashSeq(()=>{
    evoOv.style.display = "flex";
    evoImg.src = GIF + f.dex + ".gif";
    evoLabel.textContent = (shiny ? "✨ SHINY " : "") + f.name + "!";
  });
  delayWhileFrozen(2700, ()=>{
    if (!S.evoBusy) return; // stale: a new egg replaced this run
    S.form = target; S.shiny = shiny; S.stage = "adult";
    S.evoBusy = false; S.busy = null; animState = "idle";
    idleUntil = performance.now() + 1500;
    markCollected(target, shiny);
    log("evolved into " + f.name + "!" + (shiny ? " It's SHINY!" : ""), "good");
    evoOv.style.display = "none";
    if (f.pmd) preloadForm(target);
    showEmote("cheer", 2600);
    renderAll();
  });
}
function markCollected(form, shiny){
  S.collected[form] = S.collected[form] || { n:false, s:false };
  S.collected[form].n = true;
  if (shiny) S.collected[form].s = true;
}

// ---------------- render ----------------
function renderAll(){ renderPet(); renderHUD(); renderStats(); renderPetInfo(); renderDex(); }

function renderPet(){
  petWrap.style.transform = `translate(${px}px, ${py}px)`;
  const f = FORMS[S.form];
  petImg.classList.remove("chibi","eggimg","chibi-mode");
  petWrap.classList.remove("wob","bob","hop","sickfx","shinyfx","chibi-mode");

  if (S.stage === "egg"){
    petWrap.style.display = "block";
    petImg.src = SERE + "egg_colored.png";
    petImg.classList.add("eggimg");
    petWrap.classList.add("wob");
    return;
  }
  if (S.dead){ petWrap.style.display = "none"; return; }
  petWrap.style.display = "block";

  if (f.pmd){
    let urls = null;
    let state = animState;
    if (S.sleeping && sleepHas[S.form]?.length){ urls = sleepHas[S.form]; }
    else urls = curFrames(S.form, facing, state === "sleep" ? "idle" : state);
    if (urls && urls.length) petImg.src = urls[frameIdx % urls.length];
    if (S.shiny) petWrap.classList.add("shinyfx");
  } else {
    petImg.classList.add("chibi","chibi-mode");
    petImg.src = CHIBI + S.form + "_" + (S.shiny ? "shiny" : "normal") + ".png";
    if (walkTarget && !S.sleeping) petWrap.classList.add("bob");
    if (S.busy?.type === "play") petWrap.classList.add("hop");
  }
  if (S.sleeping && !walkTarget) petWrap.classList.remove("bob");
  if (S.sick && !S.shiny) petWrap.classList.add("sickfx");
  if (S.busy?.type === "play" && !f.pmd) petWrap.classList.add("hop");
  zzz.style.display = (S.sleeping && !S.busy) ? "block" : "none";
}

function renderHUD(){
  const m = Math.floor(minutesOfDay());
  const hh = String(Math.floor(m/60)).padStart(2,"0"), mm = String(m%60).padStart(2,"0");
  $("#clock").textContent = `Day ${dayOf()} · ${hh}:${mm} ${isNight() ? "🌙" : "☀️"}`;
  let icons = "";
  icons += `<span class="ic"><img src="${P1ICON}source_food.png" alt="meal">${Math.round(S.full)}</span>`;
  icons += `<span class="ic">💛 ${Math.round(S.happy)}</span>`;
  icons += `<span class="ic">⚡ ${Math.round(S.energy)}</span>`;
  if (S.poops.length) icons += `<span class="ic" title="poop"><img src="${P1ICON}source_bathroom.png" alt="poop">×${S.poops.length}</span>`;
  if (isNight()) icons += `<span class="ic" title="lights out"><img src="${P1ICON}source_lights.png" alt="lights"></span>`;
  if (S.sick) icons += `<span class="ic" title="sick"><img src="${P1ICON}source_medicine.png" alt="sick"></span>`;
  $("#stat-icons").innerHTML = icons;
  $("#nameplate").textContent = S.dead
    ? "💤 …"
    : (S.form==="eevee" ? "Eevee" : FORMS[S.form].name) + " · " + stageName() + (S.shiny ? " ✨" : "");
}

function renderStats(){
  $("#bar-meal").style.width = S.full + "%";
  $("#bar-happy").style.width = S.happy + "%";
  $("#bar-energy").style.width = S.energy + "%";
  const flags = [];
  if (S.sick) flags.push("🤒 sick");
  if (S.poops.length) flags.push(`💩 ×${S.poops.length}`);
  if (S.sleeping) flags.push("😴 sleeping");
  if (S.full < 25) flags.push("hungry!");
  if (S.happy < 30) flags.push("unhappy");
  $("#flags").textContent = flags.join("  ·  ");
}

function renderPetInfo(){
  const f = FORMS[S.form];
  const a = ageMin();
  const d = Math.floor(a/1440), h = Math.floor((a%1440)/60);
  $("#pet-info").innerHTML = S.dead
    ? "<b>gone…</b> press 🥚 New Egg"
    : `<b>${f.name}${S.shiny?" <span style='color:#f5d76a'>✨ shiny</span>":""}</b><br>
       Stage: <b>${stageName()}</b> · Age: ${d}d ${h}h<br>
       Form: ${f.pmd ? "PMD sprites (full 8-dir animation)" : "Pokémon Sleep chibi"}<br>
       Next: ${nextStepHint()}`;
}
function nextStepHint(){
  if (S.stage === "egg") return "hatches in " + Math.max(0, Math.ceil(HATCH_MIN - S.total)) + " game-min";
  if (S.form === "eevee") {
    if (S.stage !== "adult") return "evolves after 1 day of age";
    return "give a stone · snack 7–12am = Espeon · 6–8pm = Umbreon · 72h = Sylveon";
  }
  return "collected! (new egg for more)";
}

function renderDex(){
  const box = $("#dex"); box.innerHTML = "";
  let count = 0;
  for (const id of DEX_ORDER){
    const c = S.collected[id];
    if (c.n) count++;
    const cell = document.createElement("div");
    cell.className = "dex-cell" + (c.n ? "" : " unk") + (c.s ? " has-shiny" : "");
    cell.innerHTML = `<img src="${ART}${id}_${c.s ? "shiny" : "normal"}.png" alt="${FORMS[id].name}">
      <div class="nm">${FORMS[id].name}</div><div class="shiny">✦ shiny</div>`;
    box.appendChild(cell);
  }
  $("#dex-count").textContent = `— ${count}/9 forms`;
}

// ---------------- log ----------------
function log(msg, kind){
  const li = document.createElement("li");
  const m = minutesOfDay();
  const t = `D${dayOf()} ${String(Math.floor(m/60)).padStart(2,"0")}:${String(Math.floor(m%60)).padStart(2,"0")}`;
  li.innerHTML = `<span class="t">${t}</span>${msg}`;
  if (kind === "good") li.style.color = "#9fe0b0";
  if (kind === "bad") li.style.color = "#f0a0a0";
  const ul = $("#log");
  ul.prepend(li);
  while (ul.children.length > 40) ul.lastChild.remove();
}

// ---------------- wiring ----------------
document.querySelectorAll("#buttons button").forEach(b=>{
  b.onclick = () => ({ meal:doMeal, snack:doSnack, pet:doPet, play:doPlay, clean:doClean })[b.dataset.act]();
});
document.querySelectorAll("#stones .stone").forEach(b=> b.onclick = ()=>giveStone(b.dataset.stone));
document.querySelectorAll("#cheats button").forEach(b=>{
  b.onclick = () => {
    const c = b.dataset.cheat;
    if (c === "warp1") advanceClock(60);
    if (c === "warp6") advanceClock(360);
    if (c === "warp24") advanceClock(1440);
    if (c === "shiny"){ S.forceShiny = true; log("✨ next evolution forced shiny (dev)", "good"); }
    if (c === "reset") newEgg(true);
    renderAll();
  };
});
$("#new-egg-btn").onclick = () => newEgg(false);

// ---------------- main loop ----------------
function loop(){
  try{
    const now = performance.now();
    const dm = (now - lastT) / HOUR_MS * 60;
    lastT = now;
    if (S.frozen){ return; }
    if (!S.dead){
      advanceClock(dm);
      if (S.stage === "egg" && S.total >= S.hatchAt) hatch();
      if (S.stage !== "egg"){
        if (isNight() && !S.sleeping) beginSleep();
        else if (!isNight() && S.sleeping) wakeUp();
      }
      tickAI();
      renderAll();
    }
  }catch(err){ console.error("loop error:", err); }
}

// ---------------- dev API (for Playwright) ----------------
function healthyClamp(){
  if (S.dead) return;
  S.full = Math.max(S.full, 55);
  S.happy = Math.max(S.happy, 55);
  S.energy = Math.max(S.energy, 55);
  S.zeroHours = 0; S.sick = false;
}
window.TamaGame = {
  get S(){ return S; },
  feedMeal: doMeal, snack: doSnack, pet: doPet, play: doPlay, clean: doClean,
  giveStone,
  // advance h game-hours; healthy=true keeps stats from emptying during long skips
  warp: (h, healthy=true) => {
    const steps = Math.max(0, Math.ceil(h*60));
    for (let i=0;i<steps;i++){ advanceClock(1); if (healthy && i%60===0) healthyClamp(); }
    if (healthy) healthyClamp();
    renderAll();
  },
  warpTo: (absMin, healthy=true) => { TamaGame.warp(Math.max(0, absMin - S.total)/60, healthy); },
  forceShiny: ()=>{ S.forceShiny = true; },
  evolveTo: f => evolve(f),
  addPoop,
  newEgg: ()=>newEgg(false),
  freeze: ()=>{ S.frozen = true; renderAll(); },
  unfreeze: ()=>{ S.frozen = false; },
  // --- precise showcase control (freeze + pose) ---
  renderAll,
  setFacing: d => { facing = d; renderAll(); },
  setAnim: s => { animState = s; frameIdx = 0; renderAll(); },
  setPos: (x,y) => { px=x; py=y; renderAll(); },
  setStats: (full, happy, energy) => { S.full=full; S.happy=happy; S.energy=energy; renderAll(); },
  setStage: st => { S.stage=st; renderAll(); },
  setForm: f => { S.form=f; if(!FORMS[f].pmd) S.framesReady=false; preloadFormSafe(f); renderAll(); },
  showEmoteNow: (name, dur=60000) => showEmote(name, dur),
  setNight: on => { nightOv.classList.toggle("on", on); S.sleeping = on; animState = on?"sleep":"idle"; renderAll(); },
  setSick: on => { S.sick=on; renderAll(); },
};
async function preloadFormSafe(f){ if (FORMS[f]?.pmd){ await preloadForm(f); } else { S.framesReady=true; } }

// ---------------- boot ----------------
(async function boot(){
  log("A mysterious egg sits on the meadow. Day 1, 7:00.");
  await preloadEmotes();
  await preloadSleep();
  await preloadForm("eevee");
  renderAll();
  setInterval(loop, 100);
})();
