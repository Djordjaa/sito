const istruzioni = document.querySelector('.istruzioni');
      const blockChar = document.querySelector('.block-char');
      const resetButton = document.querySelector('.reset');

      let letters = [];
      let rainMode = false;

      const gravity = 0.15;
      const bounce = 0.55;

      const usedCells = new Set();

      function pickSpawnGrid() {
        const margin = 40;
        const cell = 140;
        const usableH = height * 0.85;

        const cols = Math.floor((width - margin * 2) / cell);
        const rows = Math.floor((usableH - margin) / cell);

        if (cols < 1 || rows < 1) {
          return {
            x: random(margin, width - margin),
            y: random(margin, usableH),
          };
        }

        for (let tries = 0; tries < 60; tries++) {
          const c = Math.floor(random(cols));
          const r = Math.floor(random(rows));
          const id = `${c},${r}`;

          if (!usedCells.has(id)) {
            usedCells.add(id);

            const x = margin + c * cell + cell / 2 + random(-cell * 0.28, cell * 0.28);
            const y = margin + r * cell + cell / 2 + random(-cell * 0.28, cell * 0.28);
            return { x, y };
          }
        }

        return {
          x: random(margin, width - margin),
          y: random(margin, usableH),
        };
      }

      function setup() {
        createCanvas(windowWidth, windowHeight);
        textSize(60);
        fill(255);
        textAlign(CENTER, CENTER);

        blockChar.addEventListener('click', () => {
          rainMode = !rainMode;
          blockChar.textContent = rainMode ? 'Stop rain' : 'Make it rain';
        });

        resetButton.addEventListener('click', () => {
          letters = [];
          usedCells.clear();
          rainMode = false;
          blockChar.textContent = 'Make it rain';
          istruzioni.style.opacity = 1;
        });
      }

      function keyTyped() {
        if (key.length !== 1) return;

        const pos = pickSpawnGrid();

        letters.push({
          char: key,
          x: pos.x,
          y: pos.y,
          vx: random(-0.6, 0.6),
          vy: random(-1.5, -0.3),
        });

        istruzioni.style.opacity = 0;
      }

      function draw() {
        background(0);

        for (let L of letters) {
          if (rainMode) {
            L.vy += gravity;
            L.x += L.vx;
            L.y += L.vy;

            L.vx *= 0.995;

            const floorY = height - 30;
            if (L.y > floorY) {
              L.y = floorY;
              L.vy *= -bounce;

              if (abs(L.vy) < 0.8) {
                L.vy = 0;
                L.vx = 0;
              }
            }

            if (L.x < 30) {
              L.x = 30;
              L.vx *= -0.8;
            }
            if (L.x > width - 30) {
              L.x = width - 30;
              L.vx *= -0.8;
            }
          }

          text(L.char, L.x, L.y);
        }
      }

      function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        usedCells.clear();
      }