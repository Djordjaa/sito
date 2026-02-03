 const body = document.body;
      const previewEl = document.getElementById('preview');
      const workItems = document.querySelectorAll('.work-item');

      window.addEventListener('mousemove', (e) => {
        body.style.setProperty('--cursor-x', `${e.clientX}px`);
        body.style.setProperty('--cursor-y', `${e.clientY}px`);
      });

      workItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          const imgUrl = item.getAttribute('data-img');
          previewEl.style.backgroundImage = `url(${imgUrl})`;
          previewEl.classList.add('is-visible');
        });

        item.addEventListener('mouseleave', () => {
          previewEl.classList.remove('is-visible');
        });
      });




      let particelle = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  canvas.style('z-index', '-1');
  canvas.position(0, 0);
  blendMode(SCREEN)

  let n = width / 15; 
  for (let i = 0; i < n; i++) {
    particelle.push(new Particella());
  }
}

function draw() {
  clear();

  for (let i = 0; i < particelle.length; i++) {
    particelle[i].muovi();
    particelle[i].mostra();
    
    for (let j = i + 1; j < particelle.length; j++) {
      let d = dist(particelle[i].x, particelle[i].y, particelle[j].x, particelle[j].y);
      if (d < 120) {
    
        stroke(255, 255, 255, map(d, 0, 120, 50, 0));
        line(particelle[i].x, particelle[i].y, particelle[j].x, particelle[j].y);
      }
    }
  }
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
    fill(255, 255, 255, 80);
    circle(this.x, this.y, 4);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}