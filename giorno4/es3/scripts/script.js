// ===== Cursor smoothing =====
const body = document.body;
const cursorEl = document.getElementById("cursor");
let tx = innerWidth/2, ty = innerHeight/2, cx = tx, cy = ty;

addEventListener("mousemove", (e)=>{ tx=e.clientX; ty=e.clientY; }, {passive:true});
(function tick(){
  const ease = 0.35;
  cx += (tx-cx)*ease;
  cy += (ty-cy)*ease;
  body.style.setProperty("--cursor-x", cx+"px");
  body.style.setProperty("--cursor-y", cy+"px");
  requestAnimationFrame(tick);
})();

document.addEventListener("pointerover", (e)=>{
  if (e.target.closest("button, select, input, a")) cursorEl.classList.add("is-hover");
});
document.addEventListener("pointerout", (e)=>{
  if (e.target.closest("button, select, input, a")) cursorEl.classList.remove("is-hover");
});

// ===== UI helpers =====
const $ = (id)=>document.getElementById(id);
const toastEl = $("toast");
let toastTimer=null;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toastEl.classList.remove("is-on"), 900);
}

// ===== App state (shared with sketch.js through window.APP) =====
const APP = {
  uiHover: false,

  // global
  bg: "#050505",
  palette: "violet",
  grain: 18,

  mouseField: "repulse",   // repulse | magnet | swirl | off
  fieldStrength: 0.90,

  // generator
  genMode: "network",      // network | flow | stars
  genDensity: 110,
  genScale: 110,
  genSpeed: 70,
  seedLocked: false,
  frozen: false,
  seed: Math.floor(Math.random()*1e9),

  // type
  typeSize: 92,
  gravity: 0.38,
  bounce: 0.48,
  raining: false,

  // history
  undoStack: [],
  redoStack: [],
  MAX_UNDO: 20,
};

window.APP = APP;

// ===== Tabs =====
function setTab(name){
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("is-active", t.dataset.tab===name));
  document.querySelectorAll(".panel").forEach(p => {
    p.style.display = (p.dataset.panel===name) ? "" : "none";
  });
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=> setTab(btn.dataset.tab));
});

// ===== UI hover flag =====
const ui = $("ui");
ui.addEventListener("mouseenter", ()=> APP.uiHover = true);
ui.addEventListener("mouseleave", ()=> APP.uiHover = false);

// ===== Labels =====
function syncLabels(){
  $("fieldStrengthVal").textContent = APP.fieldStrength.toFixed(2);
  $("genDensityVal").textContent = APP.genDensity;
  $("genScaleVal").textContent = APP.genScale;
  $("genSpeedVal").textContent = APP.genSpeed;
  $("typeSizeVal").textContent = APP.typeSize + "px";
  $("gravityVal").textContent = APP.gravity.toFixed(2);
  $("bounceVal").textContent = APP.bounce.toFixed(2);
}
syncLabels();

// ===== Wire controls =====
$("bg").addEventListener("input", ()=> APP.bg = $("bg").value);
$("palette").addEventListener("change", ()=> APP.palette = $("palette").value);

$("mouseField").addEventListener("change", ()=> APP.mouseField = $("mouseField").value);
$("fieldStrength").addEventListener("input", ()=>{
  APP.fieldStrength = (+$("fieldStrength").value)/100;
  syncLabels();
});

$("grain").addEventListener("input", ()=> APP.grain = +$("grain").value);

$("genMode").addEventListener("change", ()=>{
  APP.genMode = $("genMode").value;
  window.sketchPushState?.();
  toast("Generator: " + APP.genMode);
});

$("genDensity").addEventListener("input", ()=>{ APP.genDensity = +$("genDensity").value; syncLabels(); });
$("genScale").addEventListener("input", ()=>{ APP.genScale = +$("genScale").value; syncLabels(); });
$("genSpeed").addEventListener("input", ()=>{ APP.genSpeed = +$("genSpeed").value; syncLabels(); });

$("seedLock").addEventListener("click", ()=>{
  APP.seedLocked = !APP.seedLocked;
  $("seedLock").textContent = APP.seedLocked ? "Seed: locked" : "Seed: unlocked";
  toast(APP.seedLocked ? "Seed locked" : "Seed unlocked");
});

$("freezeGen").addEventListener("click", ()=>{
  APP.frozen = !APP.frozen;
  $("freezeGen").textContent = APP.frozen ? "Anim: off" : "Anim: on";
  toast(APP.frozen ? "Generator frozen" : "Generator running");
});

$("randomize").addEventListener("click", ()=>{
  if (!APP.seedLocked){
    window.sketchPushState?.();
    APP.seed = Math.floor(Math.random()*1e9);
    toast("Randomized");
  } else {
    toast("Seed locked");
  }
});

$("typeSize").addEventListener("input", ()=>{
  APP.typeSize = +$("typeSize").value;
  syncLabels();
  window.redrawType?.();
});

$("gravity").addEventListener("input", ()=>{
  APP.gravity = (+$("gravity").value)/100;
  syncLabels();
});

$("bounce").addEventListener("input", ()=>{
  APP.bounce = (+$("bounce").value)/100;
  syncLabels();
});

$("rainToggle").addEventListener("click", ()=>{
  window.sketchPushState?.();
  APP.raining = !APP.raining;
  $("rainToggle").textContent = APP.raining ? "Stop rain" : "Make it rain";
  if (APP.raining) window.activateLetters?.();
});

$("settle").addEventListener("click", ()=>{
  window.sketchPushState?.();
  window.settleLetters?.();
  toast("Settled");
});

$("scatter").addEventListener("click", ()=>{
  window.sketchPushState?.();
  window.scatterType?.();
  toast("Scattered");
});

$("placeText").addEventListener("click", ()=> window.placeTextAtCursor?.());
$("textInput").addEventListener("keydown", (e)=>{
  if(e.key==="Enter"){
    window.placeTextAtCursor?.();
    e.preventDefault();
  }
});

$("clearType").addEventListener("click", ()=>{
  window.sketchPushState?.();
  window.clearType?.();
  $("rainToggle").textContent = "Make it rain";
  toast("Type cleared");
});

$("clearAll").addEventListener("click", ()=>{
  window.sketchPushState?.();
  window.clearAll?.();
  $("rainToggle").textContent = "Make it rain";
  toast("Cleared");
});

$("undo").addEventListener("click", ()=> window.sketchUndo?.());
$("redo").addEventListener("click", ()=> window.sketchRedo?.());

$("exportPNG").addEventListener("click", ()=>{
  const scale = +$("exportScale").value;
  window.exportPoster?.(scale);
});

// presets
document.querySelectorAll(".preset").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    window.sketchPushState?.();
    const p = btn.dataset.preset;

    if (p==="editorial"){
      APP.bg = "#050505"; $("bg").value = APP.bg;
      APP.palette = "mono"; $("palette").value = APP.palette;
      APP.genMode = "flow"; $("genMode").value = APP.genMode;
      APP.grain = 22; $("grain").value = APP.grain;
      APP.mouseField = "off"; $("mouseField").value = APP.mouseField;
      APP.genDensity = 80; $("genDensity").value = APP.genDensity;
      APP.genScale = 150; $("genScale").value = APP.genScale;
      APP.genSpeed = 22; $("genSpeed").value = APP.genSpeed;
      toast("Preset: Editorial");
    }

    if (p==="cyber"){
      APP.bg = "#050505"; $("bg").value = APP.bg;
      APP.palette = "violet"; $("palette").value = APP.palette;
      APP.genMode = "network"; $("genMode").value = APP.genMode;
      APP.grain = 14; $("grain").value = APP.grain;
      APP.mouseField = "repulse"; $("mouseField").value = APP.mouseField;
      APP.genDensity = 130; $("genDensity").value = APP.genDensity;
      APP.genScale = 110; $("genScale").value = APP.genScale;
      APP.genSpeed = 85; $("genSpeed").value = APP.genSpeed;
      toast("Preset: Cyber");
    }

    if (p==="holo"){
      APP.bg = "#050505"; $("bg").value = APP.bg;
      APP.palette = "holo"; $("palette").value = APP.palette;
      APP.genMode = "stars"; $("genMode").value = APP.genMode;
      APP.grain = 18; $("grain").value = APP.grain;
      APP.mouseField = "swirl"; $("mouseField").value = APP.mouseField;
      APP.genDensity = 160; $("genDensity").value = APP.genDensity;
      APP.genScale = 140; $("genScale").value = APP.genScale;
      APP.genSpeed = 95; $("genSpeed").value = APP.genSpeed;
      toast("Preset: Holo");
    }

    if (p==="mono"){
      APP.bg = "#050505"; $("bg").value = APP.bg;
      APP.palette = "mono"; $("palette").value = APP.palette;
      APP.genMode = "network"; $("genMode").value = APP.genMode;
      APP.grain = 30; $("grain").value = APP.grain;
      APP.mouseField = "magnet"; $("mouseField").value = APP.mouseField;
      APP.genDensity = 95; $("genDensity").value = APP.genDensity;
      APP.genScale = 120; $("genScale").value = APP.genScale;
      APP.genSpeed = 45; $("genSpeed").value = APP.genSpeed;
      toast("Preset: Mono");
    }

    syncLabels();
    window.redrawType?.();
  });
});

/* global APP */

let typeLayer;
let grainLayer;

let texts = [];   // {text,x,y,size,seed}
let letters = []; // {ch,x,y,vx,vy,active,seed}
let grabbed = null;

function paletteParams(name){
  if (name==="mono") return { s:0, b:100, base:0 };
  if (name==="violet") return { s:70, b:98, base:275 };
  if (name==="holo") return { s:65, b:100, base:210 };
  return { s:75, b:100, base:110 }; // acid
}

function hexToHSB(hex){
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
  const d = mx - mn;

  let h = 0;
  if (d!==0){
    if (mx===r) h=((g-b)/d)%6;
    else if (mx===g) h=(b-r)/d + 2;
    else h=(r-g)/d + 4;
    h*=60; if (h<0) h+=360;
  }
  const s = mx===0 ? 0 : (d/mx)*100;
  const v = mx*100;
  return { h, s, b:v };
}

function pickStable(seed, alpha=80){
  const p = paletteParams(APP.palette);
  const h = (p.base + seed*37 + 30) % 360;
  return { h, s:p.s, b:p.b, a: alpha };
}

// ===== Mouse field =====
function mouseForce(x,y){
  if (APP.mouseField==="off") return {fx:0, fy:0};

  const r = 200;
  const dx = x - mouseX;
  const dy = y - mouseY;
  const d = Math.sqrt(dx*dx + dy*dy);
  if (d>r) return {fx:0, fy:0};

  const t = 1 - d/r;
  const strength = (t*t) * APP.fieldStrength * 0.95;
  const nx = dx/(d||1);
  const ny = dy/(d||1);

  if (APP.mouseField==="repulse") return { fx: nx*strength, fy: ny*strength };
  if (APP.mouseField==="magnet")  return { fx: -nx*strength, fy: -ny*strength };

  // swirl: tangenziale
  const swirl = 0.60*strength;
  return { fx: (-nx*strength*0.25) + (-ny*swirl), fy: (-ny*strength*0.25) + (nx*swirl) };
}

// ===== Generator =====
let netPoints = [];
let flowSeeds = [];
let stars = [];

function rebuildGenerator(){
  randomSeed(APP.seed);
  noiseSeed(APP.seed);

  netPoints = [];
  flowSeeds = [];
  stars = [];

  const density = APP.genDensity;

  if (APP.genMode==="network"){
    const n = Math.floor(map(density, 10,240, 30, 160));
    for (let i=0;i<n;i++){
      netPoints.push({
        x: random(width),
        y: random(height),
        vx: random(-0.35,0.35),
        vy: random(-0.35,0.35),
        seed: random(1000)
      });
    }
  }

  if (APP.genMode==="flow"){
    const n = Math.floor(map(density, 10,240, 180, 900));
    for (let i=0;i<n;i++){
      flowSeeds.push({
        x: random(width),
        y: random(height),
        t: random(1000),
        seed: random(1000)
      });
    }
  }

  if (APP.genMode==="stars"){
    const n = Math.floor(map(density, 10,240, 120, 900));
    for (let i=0;i<n;i++){
      stars.push({
        x: random(width),
        y: random(height),
        z: random(0.2, 1.0), // depth
        seed: random(1000)
      });
    }
  }
}

function drawGenerator(){
  const speed = map(APP.genSpeed, 0,200, 0, 1.9);
  const scale = map(APP.genScale, 10,220, 0.35, 1.8);

  if (APP.genMode==="network"){
    // points + connecting lines (soft)
    const linkDist = 140 * scale;
    const colP = pickStable(22, 20);
    const colL = pickStable(77, 14);

    // move
    if (!APP.frozen){
      for (const p of netPoints){
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }
    }

    // lines
    stroke(colL.h, colL.s, colL.b, colL.a);
    strokeWeight(1);
    for (let i=0;i<netPoints.length;i++){
      for (let j=i+1;j<netPoints.length;j++){
        const a = netPoints[i], b = netPoints[j];
        const d = dist(a.x,a.y,b.x,b.y);
        if (d<linkDist){
          const alpha = map(d, 0, linkDist, colL.a, 0);
          stroke(colL.h, colL.s, colL.b, alpha);
          line(a.x,a.y,b.x,b.y);
        }
      }
    }

    // points
    noStroke();
    fill(colP.h, colP.s, colP.b, 22);
    for (const p of netPoints){
      circle(p.x, p.y, 3.2);
    }
  }

  if (APP.genMode==="flow"){
    // short trails following a noise field
    const col = pickStable(120, 18);
    stroke(col.h, col.s, col.b, col.a);
    strokeWeight(1);

    const step = 18 * scale;
    const curl = 1.35 * scale;

    for (const s of flowSeeds){
      let x = s.x, y = s.y;

      const loops = 2; // keeps it light
      for (let k=0;k<loops;k++){
        const n = noise(x*0.0018*scale, y*0.0018*scale, (s.t + frameCount*0.004*speed));
        const ang = n * TWO_PI * curl;
        const nx = x + cos(ang)*step;
        const ny = y + sin(ang)*step;
        line(x,y,nx,ny);
        x = nx; y = ny;
      }

      if (!APP.frozen){
        s.x = x; s.y = y;
        if (s.x< -40) s.x = width+40;
        if (s.x> width+40) s.x = -40;
        if (s.y< -40) s.y = height+40;
        if (s.y> height+40) s.y = -40;
      }
    }
  }

  if (APP.genMode==="stars"){
    // parallax stars + slight drift
    noStroke();
    const col = pickStable(222, 28);

    for (const st of stars){
      const drift = (APP.frozen ? 0 : speed*0.35);
      st.y += drift * (0.6 + st.z);
      st.x += drift * 0.08 * (0.4 + st.z);

      if (st.y > height+10) { st.y = -10; st.x = random(width); }
      if (st.x > width+10)  { st.x = -10; st.y = random(height); }

      const sz = (1.2 + st.z*2.4) * scale;
      fill(col.h, col.s, col.b, 18 + st.z*28);
      circle(st.x, st.y, sz);
    }
  }
}

// ===== Type layer =====
function redrawType(){
  typeLayer.clear();
  typeLayer.push();
  typeLayer.textAlign(CENTER, CENTER);
  typeLayer.noStroke();

  // placed texts
  for (const t of texts){
    const col = pickStable(t.seed, 82);
    typeLayer.fill(col.h, col.s, col.b, col.a);
    typeLayer.textSize(t.size);
    typeLayer.text(t.text, t.x, t.y);
  }

  // loose letters
  const colL = pickStable(999, 86);
  typeLayer.fill(colL.h, colL.s, colL.b, colL.a);
  typeLayer.textSize(APP.typeSize);

  for (const L of letters){
    typeLayer.text(L.ch, L.x, L.y);
  }

  typeLayer.pop();
}

// expose for UI
window.redrawType = redrawType;

function activateLetters(){
  for (const L of letters){
    L.active = true;
    L.vx = random(-0.9, 0.9);
    L.vy = random(-2.2, -0.8);
  }
}
window.activateLetters = activateLetters;

function settleLetters(){
  for (const L of letters){
    L.active = false;
    L.vx = 0; L.vy = 0;
  }
  APP.raining = false;
}
window.settleLetters = settleLetters;

function scatterType(){
  for (const t of texts){
    t.x = random(80, width-80);
    t.y = random(80, height-80);
  }
  for (const L of letters){
    L.x = random(60, width-60);
    L.y = random(80, height*0.55);
    L.vx = random(-0.7,0.7);
    L.vy = random(-1.6,-0.3);
    L.active = false;
  }
  redrawType();
}
window.scatterType = scatterType;

function placeTextAtCursor(){
  const input = document.getElementById("textInput");
  const txt = (input?.value || "").trim();
  if (!txt) return;

  sketchPushState();
  texts.push({
    text: txt,
    x: mouseX,
    y: mouseY,
    size: APP.typeSize,
    seed: random(1000)
  });
  redrawType();
}
window.placeTextAtCursor = placeTextAtCursor;

function clearType(){
  texts = [];
  letters = [];
  grabbed = null;
  APP.raining = false;
  redrawType();
}
window.clearType = clearType;

function clearAll(){
  clearType();
  // keep generator, just visually resets type
}
window.clearAll = clearAll;

// ===== Physics =====
function stepLetters(){
  const g = APP.gravity;
  const bounce = APP.bounce;
  const floorY = height - 34;

  for (const L of letters){
    if (!L.active) continue;

    // mouse field
    const f = mouseForce(L.x, L.y);
    L.vx += f.fx;
    L.vy += f.fy;

    // gravity
    L.vy += g;
    L.x += L.vx;
    L.y += L.vy;

    // damping
    L.vx *= 0.992;

    // floor
    if (L.y > floorY){
      L.y = floorY;

      // bounce
      L.vy *= -bounce;

      // ✅ stop micro-jitter: snap to rest when small
      if (Math.abs(L.vy) < 0.55){
        L.vy = 0;
        L.vx *= 0.15;
        if (Math.abs(L.vx) < 0.10){
          L.vx = 0;
          L.active = false;
        }
      }
    }

    // walls
    if (L.x < 30){ L.x = 30; L.vx *= -0.75; }
    if (L.x > width-30){ L.x = width-30; L.vx *= -0.75; }
  }

  // auto stop rain when all settled
  if (letters.length && letters.every(L => !L.active)){
    APP.raining = false;
    const btn = document.getElementById("rainToggle");
    if (btn) btn.textContent = "Make it rain";
  }
}

// ===== Grab logic =====
function findNearestLetter(mx,my){
  let best=null, bestD=1e9;
  for (const L of letters){
    const d = dist(mx,my,L.x,L.y);
    if (d<bestD){ bestD=d; best=L; }
  }
  return {best, bestD};
}

function mousePressed(){
  if (APP.uiHover) return;

  // try grab
  const {best, bestD} = findNearestLetter(mouseX, mouseY);
  if (best && bestD < APP.typeSize*0.6){
    sketchPushState();
    grabbed = best;
    grabbed.active = true;
    return;
  }
}

function mouseDragged(){
  if (!grabbed) return;
  grabbed.x = mouseX;
  grabbed.y = mouseY;
  grabbed.vx = (mouseX - pmouseX) * 0.35;
  grabbed.vy = (mouseY - pmouseY) * 0.35;
}

function mouseReleased(){
  grabbed = null;
}

// ===== Typing =====
function keyTyped(){
  if (APP.uiHover) return;

  // avoid typing when in input
  const ae = document.activeElement;
  if (ae && (ae.tagName==="INPUT" || ae.tagName==="SELECT" || ae.tagName==="TEXTAREA")) return;

  if (key.length !== 1) return;

  sketchPushState();
  letters.push({
    ch: key,
    x: random(70, width-70),
    y: random(90, height*0.55),
    vx: random(-0.7,0.7),
    vy: random(-1.6,-0.3),
    active: APP.raining,         // if rain ON, it immediately falls
    seed: random(1000)
  });

  redrawType();
}

// ===== Grain overlay (cheap + pro) =====
function rebuildGrain(){
  grainLayer = createGraphics(width, height);
  grainLayer.pixelDensity(1);
  grainLayer.clear();
  grainLayer.noStroke();

  for (let i=0;i<9000;i++){
    const x = random(width);
    const y = random(height);
    grainLayer.fill(0,0,100, random(2, 8));
    grainLayer.rect(x,y,1,1);
  }
}

// ===== Export =====
function exportPoster(scale){
  const W = Math.floor(width*scale);
  const H = Math.floor(height*scale);

  const out = createGraphics(W,H);
  out.pixelDensity(1);
  out.colorMode(HSB,360,100,100,100);

  const bg = hexToHSB(APP.bg);
  out.background(bg.h, bg.s, bg.b, 100);

  // draw generator as static frame
  out.push();
  out.scale(scale);
  // re-render generator at export time
  // (we draw same frame look by calling drawGenerator() on main canvas state
  // simplest: draw the current main frame with get() would include UI cursor etc, so no.
  // We'll just re-run generator with current seed and frozen state off, but it still looks consistent.)
  // To keep it consistent, we temporarily draw generator in out:
  out.pop();

  // Quick solution: render generator on a temp graphics at screen size, then scale into out
  const tmp = createGraphics(width, height);
  tmp.pixelDensity(1);
  tmp.colorMode(HSB,360,100,100,100);
  tmp.background(bg.h, bg.s, bg.b, 100);

  // draw generator into tmp
  tmp.push();
  tmp.noFill();
  // mirror our generator drawing using p5 globals:
  // easiest: replicate minimal generator logic into tmp using tmp methods
  // We'll do a lightweight version:
  tmp.randomSeed(APP.seed);
  tmp.noiseSeed(APP.seed);

  if (APP.genMode==="network"){
    const density = APP.genDensity;
    const n = Math.floor(map(density, 10,240, 30, 160));
    const pts = [];
    for (let i=0;i<n;i++){
      pts.push({x: random(width), y: random(height)});
    }
    const scaleLocal = map(APP.genScale, 10,220, 0.35, 1.8);
    const linkDist = 140 * scaleLocal;
    const colL = pickStable(77, 14);
    tmp.stroke(colL.h, colL.s, colL.b, colL.a);
    tmp.strokeWeight(1);

    for (let i=0;i<pts.length;i++){
      for (let j=i+1;j<pts.length;j++){
        const a=pts[i], b=pts[j];
        const d = dist(a.x,a.y,b.x,b.y);
        if (d<linkDist){
          const alpha = map(d, 0, linkDist, colL.a, 0);
          tmp.stroke(colL.h, colL.s, colL.b, alpha);
          tmp.line(a.x,a.y,b.x,b.y);
        }
      }
    }
    tmp.noStroke();
    const colP = pickStable(22, 20);
    tmp.fill(colP.h,colP.s,colP.b,22);
    for (const p of pts) tmp.circle(p.x,p.y,3.2);
  }

  if (APP.genMode==="flow"){
    const density = APP.genDensity;
    const n = Math.floor(map(density, 10,240, 180, 900));
    const col = pickStable(120, 18);
    tmp.stroke(col.h,col.s,col.b,col.a);
    tmp.strokeWeight(1);

    const scaleLocal = map(APP.genScale, 10,220, 0.35, 1.8);
    const step = 18 * scaleLocal;
    const curl = 1.35 * scaleLocal;

    for (let i=0;i<n;i++){
      let x = random(width);
      let y = random(height);
      const t = random(1000);
      const loops = 2;
      for (let k=0;k<loops;k++){
        const n0 = noise(x*0.0018*scaleLocal, y*0.0018*scaleLocal, t);
        const ang = n0*TWO_PI*curl;
        const nx = x + cos(ang)*step;
        const ny = y + sin(ang)*step;
        tmp.line(x,y,nx,ny);
        x=nx; y=ny;
      }
    }
  }

  if (APP.genMode==="stars"){
    const density = APP.genDensity;
    const n = Math.floor(map(density, 10,240, 120, 900));
    const col = pickStable(222, 28);
    tmp.noStroke();
    const scaleLocal = map(APP.genScale, 10,220, 0.35, 1.8);

    for (let i=0;i<n;i++){
      const x = random(width);
      const y = random(height);
      const z = random(0.2,1.0);
      const sz = (1.2 + z*2.4) * scaleLocal;
      tmp.fill(col.h,col.s,col.b, 18 + z*28);
      tmp.circle(x,y,sz);
    }
  }

  out.image(tmp, 0,0, W,H);
  tmp.remove();

  // type layer
  const typeImg = typeLayer.get();
  out.image(typeImg, 0,0, W,H);

  // grain (scaled)
  const grainAmt = APP.grain/100;
  if (grainAmt > 0){
    out.push();
    out.tint(255, Math.floor(255*grainAmt));
    out.image(grainLayer, 0,0, W,H);
    out.pop();
  }

  save(out, "poster-lab.png");
}
window.exportPoster = exportPoster;

// ===== Undo / Redo =====
function snapshot(){
  return {
    texts: JSON.parse(JSON.stringify(texts)),
    letters: JSON.parse(JSON.stringify(letters)),
    seed: APP.seed,
    genMode: APP.genMode,
    palette: APP.palette,
    bg: APP.bg,
    grain: APP.grain,
    mouseField: APP.mouseField,
    fieldStrength: APP.fieldStrength,
    typeSize: APP.typeSize,
    gravity: APP.gravity,
    bounce: APP.bounce,
    raining: APP.raining,
    seedLocked: APP.seedLocked,
    frozen: APP.frozen,
    genDensity: APP.genDensity,
    genScale: APP.genScale,
    genSpeed: APP.genSpeed,
  };
}

function restore(s){
  texts = s.texts || [];
  letters = s.letters || [];
  grabbed = null;

  APP.seed = s.seed;
  APP.genMode = s.genMode;
  APP.palette = s.palette;
  APP.bg = s.bg;
  APP.grain = s.grain;
  APP.mouseField = s.mouseField;
  APP.fieldStrength = s.fieldStrength;
  APP.typeSize = s.typeSize;
  APP.gravity = s.gravity;
  APP.bounce = s.bounce;
  APP.raining = s.raining;
  APP.seedLocked = s.seedLocked;
  APP.frozen = s.frozen;
  APP.genDensity = s.genDensity;
  APP.genScale = s.genScale;
  APP.genSpeed = s.genSpeed;

  // sync UI (minimal)
  const bgInp = document.getElementById("bg"); if (bgInp) bgInp.value = APP.bg;
  const pal = document.getElementById("palette"); if (pal) pal.value = APP.palette;
  const gm = document.getElementById("genMode"); if (gm) gm.value = APP.genMode;
  const gr = document.getElementById("grain"); if (gr) gr.value = APP.grain;
  const mf = document.getElementById("mouseField"); if (mf) mf.value = APP.mouseField;
  const fs = document.getElementById("fieldStrength"); if (fs) fs.value = Math.round(APP.fieldStrength*100);

  const td = document.getElementById("genDensity"); if (td) td.value = APP.genDensity;
  const ts = document.getElementById("genScale"); if (ts) ts.value = APP.genScale;
  const sp = document.getElementById("genSpeed"); if (sp) sp.value = APP.genSpeed;

  const ty = document.getElementById("typeSize"); if (ty) ty.value = APP.typeSize;
  const gv = document.getElementById("gravity"); if (gv) gv.value = Math.round(APP.gravity*100);
  const bn = document.getElementById("bounce"); if (bn) bn.value = Math.round(APP.bounce*100);

  const seedBtn = document.getElementById("seedLock");
  if (seedBtn) seedBtn.textContent = APP.seedLocked ? "Seed: locked" : "Seed: unlocked";

  const frBtn = document.getElementById("freezeGen");
  if (frBtn) frBtn.textContent = APP.frozen ? "Anim: off" : "Anim: on";

  const rainBtn = document.getElementById("rainToggle");
  if (rainBtn) rainBtn.textContent = APP.raining ? "Stop rain" : "Make it rain";

  rebuildGenerator();
  rebuildGrain();
  redrawType();
}

function sketchPushState(){
  APP.undoStack.push(snapshot());
  if (APP.undoStack.length > APP.MAX_UNDO) APP.undoStack.shift();
  APP.redoStack.length = 0;
}
window.sketchPushState = sketchPushState;

function sketchUndo(){
  if (!APP.undoStack.length) return;
  APP.redoStack.push(snapshot());
  restore(APP.undoStack.pop());
}
window.sketchUndo = sketchUndo;

function sketchRedo(){
  if (!APP.redoStack.length) return;
  APP.undoStack.push(snapshot());
  restore(APP.redoStack.pop());
}
window.sketchRedo = sketchRedo;

// ===== p5 setup/draw =====
function setup(){
  const c = createCanvas(windowWidth, windowHeight);
  c.elt.style.position = "fixed";
  c.elt.style.inset = "0";
  c.elt.style.zIndex = "1";

  pixelDensity(1);
  colorMode(HSB,360,100,100,100);

  typeLayer = createGraphics(width, height);
  typeLayer.pixelDensity(1);
  typeLayer.colorMode(HSB,360,100,100,100);
  typeLayer.clear();

  rebuildGenerator();
  rebuildGrain();
  redrawType();

  // initial history point
  sketchPushState();
}

function draw(){
  const bg = hexToHSB(APP.bg);
  background(bg.h, bg.s, bg.b, 100);

  // generator
  push();
  drawGenerator();
  pop();

  // physics
  if (APP.raining && !APP.uiHover){
    stepLetters();
    redrawType();
  }

  // type
  image(typeLayer, 0,0);

  // grain overlay
  const g = APP.grain/100;
  if (g > 0){
    push();
    tint(255, Math.floor(255*g));
    image(grainLayer, 0,0);
    pop();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);

  const oldType = typeLayer.get();
  typeLayer = createGraphics(width, height);
  typeLayer.pixelDensity(1);
  typeLayer.colorMode(HSB,360,100,100,100);
  typeLayer.clear();
  typeLayer.image(oldType, 0,0);

  rebuildGenerator();
  rebuildGrain();
  redrawType();
}
