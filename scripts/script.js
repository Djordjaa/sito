const CHARS = "!@#$%^&*()_+-=[]{};:,.<>/?~|\\";
const body = document.body;
const previewEl = document.getElementById('preview');
const workItems = document.querySelectorAll('.work-item');
const navbar = document.querySelector('.navbar');

let letters = [];
let fontName = 'Clash Display';
let fontSize;
let grabbed = null;
let particelle = [];
const word = "DJORDJA";
const colorTextMuted = "#8a8a8a"; 

let tx = window.innerWidth / 2;
let ty = window.innerHeight / 2;
let x = tx;
let y = ty;
let lastScrollY = window.scrollY;

window.addEventListener("mousemove", (e) => {
  tx = e.clientX;
  ty = e.clientY;
}, { passive: true });

function tick() {
  const ease = 0.35;
  x += (tx - x) * ease;
  y += (ty - y) * ease;
  body.style.setProperty("--cursor-x", `${x}px`);
  body.style.setProperty("--cursor-y", `${y}px`);
  requestAnimationFrame(tick);
}
tick();

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.position(0, 0);
  c.style("position", "fixed");
  c.style("inset", "0");
  c.style("z-index", "0"); 
  c.style("pointer-events", "auto");

  if (navbar) {
    navbar.style.position = 'relative';
    navbar.style.zIndex = '100';
  }
  
  const htmlTitle = document.querySelector('.hero-title');
  if (htmlTitle) {
    htmlTitle.style.pointerEvents = 'none';
  }

  let n = width / 15; 
  for (let i = 0; i < n; i++) {
    particelle.push(new Particella());
  }

  textFont(fontName);
  textStyle(BOLD); 
  buildLetters();
  lastScrollY = window.scrollY;
}

function buildLetters() {
  letters = [];
  fontSize = min(width * 0.18, 150); 
  textSize(fontSize);

  let spacing = fontSize * 0.05;
  let startX = width * 0.04; 
  let startY = windowHeight * 0.85; 

  let currentX = startX;

  for (let i = 0; i < word.length; i++) {
    let charWidth = textWidth(word[i]);
    
    letters.push({
      ch: word[i],
      originalY: startY, 
      homeX: currentX + charWidth / 2, 
      homeY: startY,
      x: currentX + charWidth / 2,
      y: startY,
      vx: 0,
      vy: 0
    });
    
    currentX += charWidth + spacing;
  }
}

function draw() {
  clear();

  blendMode(SCREEN);
  for (let i = 0; i < particelle.length; i++) {
    particelle[i].muovi();
    particelle[i].mostra();
    for (let j = i + 1; j < particelle.length; j++) {
      let d = dist(particelle[i].x, particelle[i].y, particelle[j].x, particelle[j].y);
      if (d < 120) {
        stroke(255, 255, 255, map(d, 0, 120, 10, 0));
        strokeWeight(1);
        line(particelle[i].x, particelle[i].y, particelle[j].x, particelle[j].y);
      }
    }
  }

  blendMode(BLEND);
  updateAndDrawText();
}

function updateAndDrawText() {
  textSize(fontSize);
  textAlign(CENTER, BASELINE);
  noStroke();
  fill(colorTextMuted); 

  const radius = fontSize * 1.5; 
  const returnSpeed = 0.2; 
  const friction = 0.5; 
  const pushForce = 5;

  let currentScrollY = window.scrollY;
  let scrollDelta = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;

  for (let L of letters) {
    
    L.y -= scrollDelta;
    L.homeY = L.originalY - currentScrollY;

    if (L !== grabbed) {
      let dx = L.x - mouseX;
      let dy = L.y - mouseY;
      let d = sqrt(dx * dx + dy * dy);

      if (d < radius) {
        let force = (1 - d / radius);
        let nx = dx / d;
        let ny = dy / d;
        L.vx += nx * force * pushForce;
        L.vy += ny * force * pushForce;
      }
    } else {
      L.vx += (mouseX - L.x) * 0.2;
      L.vy += (mouseY - L.y) * 0.2;
    }

    L.vx += (L.homeX - L.x) * returnSpeed;
    L.vy += (L.homeY - L.y) * returnSpeed;

    L.vx *= friction;
    L.vy *= friction;
    L.x += L.vx;
    L.y += L.vy;

    text(L.ch, L.x, L.y);
  }
}

function mousePressed() {
  let bestDist = fontSize; 
  let selection = null;

  for (let L of letters) {
    let d = dist(mouseX, mouseY, L.x, L.y - fontSize/3);
    if (d < bestDist) {
      bestDist = d;
      selection = L;
    }
  }

  if (selection) {
    grabbed = selection;
  }
}

function mouseReleased() {
  grabbed = null;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildLetters(); 
  lastScrollY = window.scrollY;
}

class Particella {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5);
  }
  muovi() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
  mostra() {
    noStroke();
    fill(255, 255, 255, 10);
    circle(this.x, this.y, 4);
  }
}

function decodeOnce(el, finalText, { duration = 520, fps = 30 } = {}) {
  if (el._decodeTimer) clearInterval(el._decodeTimer);
  const stepMs = Math.round(1000 / fps);
  const totalSteps = Math.max(1, Math.floor(duration / stepMs));
  let step = 0;
  el._decodeTimer = setInterval(() => {
    step++;
    const progress = step / totalSteps;
    const fixedCount = Math.floor(progress * finalText.length);
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      if (i < fixedCount) out += finalText[i];
      else out += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    el.textContent = out;
    if (step >= totalSteps) {
      clearInterval(el._decodeTimer);
      el._decodeTimer = null;
      el.textContent = finalText;
    }
  }, stepMs);
}

window.addEventListener("load", () => {
  const links = Array.from(document.querySelectorAll(".navbar a"));
  links.forEach((a) => (a.dataset.final = a.textContent.trim()));

  links.forEach((a, i) => {
    const baseDelay = 110;
    setTimeout(() => {
      decodeOnce(a, a.dataset.final, { duration: 520, fps: 30 });
    }, i * baseDelay);

    a.addEventListener("mouseenter", () => {
      decodeOnce(a, a.dataset.final, { duration: 400, fps: 30 });
    });
  });
});

workItems.forEach((item) => {
  item.style.position = 'relative';
  item.style.zIndex = '100';

  item.addEventListener('mouseenter', () => {
    const imgUrl = item.getAttribute('data-img');
    if (imgUrl && previewEl) {
        previewEl.style.backgroundImage = `url(${imgUrl})`;
        previewEl.classList.add('is-visible');
    }
  });

  item.addEventListener('mouseleave', () => {
    if (previewEl) {
        previewEl.classList.remove('is-visible');
    }
  });
});