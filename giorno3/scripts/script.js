      // Grid background settings
      const CELL_SIZE = 40;
      const COLOR_R = 32;
      const COLOR_G = 120;
      const COLOR_B = 233;
      const STARTING_ALPHA = 200;
      const BACKGROUND_COLOR = 31;
      const PROB_OF_NEIGHBOR = 0.5;
      const AMT_FADE_PER_FRAME = 5;

      let colorWithAlpha;
      let numRows;
      let numCols;
      let currentRow = -2;
      let currentCol = -2;
      let allNeighbors = [];

      const FONT_NAME = 'Bitcount Grid Double';

      let word = 'Djordja';
      let letters = [];
      let fontSize;
      let grabbed = null;

      async function setup() {
        createCanvas(windowWidth, windowHeight);

        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        if (document.fonts && document.fonts.load) {
          await document.fonts.load(`400 16px "${FONT_NAME}"`);
        }

        colorWithAlpha = color(COLOR_R, COLOR_G, COLOR_B, STARTING_ALPHA);
        noFill();
        stroke(colorWithAlpha);
        strokeWeight(1);
        numRows = Math.ceil(windowHeight / CELL_SIZE);
        numCols = Math.ceil(windowWidth / CELL_SIZE);

        textFont(FONT_NAME);
        textAlign(LEFT, BOTTOM);
        textStyle(NORMAL);
        buildLetters();
      }

      function buildLetters() {
        letters = [];

        fontSize = max(90, min(260, width * 0.22));
        textSize(fontSize);

        let total = 0;
        let w = [];

        for (let ch of word) {
          let cw = textWidth(ch);
          w.push(cw);
          total += cw;
        }

        total += (word.length - 1) * fontSize * 0.05;

        const margin = 70;
        let x = margin;
        let y = height;

        for (let i = 0; i < word.length; i++) {
          let cx = x + w[i] / 2;

          letters.push({
            ch: word[i],
            i,
            homeX: cx,
            homeY: y,
            x: cx,
            y: y,
            halfW: w[i] / 2,
            vx: random(-1, 1),
            vy: random(-1, 1),
          });

          x += w[i] + fontSize * 0.05;
        }
      }

      function findNearestLetter(mx, my) {
        let best = null;
        let bestD = Infinity;

        for (let L of letters) {
          let d = dist(mx, my, L.x, L.y);
          if (d < bestD) {
            bestD = d;
            best = L;
          }
        }
        return { best, bestD };
      }

      function mousePressed() {
        const { best, bestD } = findNearestLetter(mouseX, mouseY);
        if (best && bestD < fontSize * 0.6) grabbed = best;
      }

      function mouseReleased() {
        grabbed = null;
      }

      function draw() {
        background(BACKGROUND_COLOR);

        // Grid background
        noFill();
        let row = floor(mouseY / CELL_SIZE);
        let col = floor(mouseX / CELL_SIZE);

        if (row !== currentRow || col !== currentCol) {
          currentRow = row;
          currentCol = col;
          allNeighbors.push(...getRandomNeighbors(row, col));
        }

        let x = col * CELL_SIZE;
        let y = row * CELL_SIZE;

        stroke(colorWithAlpha);
        rect(x, y, CELL_SIZE, CELL_SIZE);

        for (let neighbor of allNeighbors) {
          let neighborX = neighbor.col * CELL_SIZE;
          let neighborY = neighbor.row * CELL_SIZE;
          neighbor.opacity = max(0, neighbor.opacity - AMT_FADE_PER_FRAME);
          stroke(COLOR_R, COLOR_G, COLOR_B, neighbor.opacity);
          rect(neighborX, neighborY, CELL_SIZE, CELL_SIZE);
        }
        allNeighbors = allNeighbors.filter((neighbor) => neighbor.opacity > 0);

        const radius = fontSize * 1.8;
        const push = 7.5;
        const spring = 0.04;
        const damp = 0.88;

        textSize(fontSize);
        textFont(FONT_NAME);
        textAlign(LEFT, BOTTOM);
        textStyle(NORMAL);

        for (let L of letters) {
          if (L !== grabbed) {
            let dx = L.x - mouseX;
            let dy = L.y - mouseY;
            let d = sqrt(dx * dx + dy * dy);

            if (d < radius) {
              let force = (1 - d / radius) ** 2;
              let nx = dx / (d || 1);
              let ny = dy / (d || 1);
              L.vx += nx * force * push;
              L.vy += ny * force * push;
            }
          }

          if (L === grabbed) {
            const follow = 0.22; // 0.15–0.30
            L.vx += (mouseX - L.x) * follow;
            L.vy += (mouseY - L.y) * follow;
          }

          L.vx += (L.homeX - L.x) * spring;
          L.vy += (L.homeY - L.y) * spring;

          L.vx *= damp;
          L.vy *= damp;
          L.x += L.vx;
          L.y += L.vy;

          colorMode(HSB, 360, 100, 100, 100);

          const baseHue = 215;
          const hueJitter = 20 * sin(frameCount * 0.03 + L.i);
          const hue = baseHue + hueJitter;

          const dMouse = dist(mouseX, mouseY, L.x, L.y);
          const prox = constrain(1 - dMouse / (fontSize * 2.2), 0, 1);

          const shimmer = 90 + 30 * sin(frameCount * 0.08 + L.x * 0.012);
          const sat = 85;
          const bri = shimmer + prox * 20;

          const glowA = L === grabbed ? 35 : 22;

          noStroke();

          fill(hue, sat, 100, glowA);
          text(L.ch, L.x - 2 - L.halfW, L.y);
          text(L.ch, L.x + 2 - L.halfW, L.y);
          text(L.ch, L.x - L.halfW, L.y - 2);

          fill(hue, sat, bri, 95);
          text(L.ch, L.x - L.halfW, L.y);

          colorMode(RGB, 255);
        }
      }

      function getRandomNeighbors(row, col) {
        let neighbors = [];

        for (let dRow = -1; dRow <= 1; dRow++) {
          for (let dCol = -1; dCol <= 1; dCol++) {
            let neighborRow = row + dRow;
            let neighborCol = col + dCol;
            let isCurrentCell = dRow === 0 && dCol === 0;
            let isInBounds =
              neighborRow >= 0 &&
              neighborRow < numRows &&
              neighborCol >= 0 &&
              neighborCol < numCols;

            if (!isCurrentCell && isInBounds && Math.random() < PROB_OF_NEIGHBOR) {
              neighbors.push({
                row: neighborRow,
                col: neighborCol,
                opacity: 255,
              });
            }
          }
        }

        return neighbors;
      }

      function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        numRows = Math.ceil(windowHeight / CELL_SIZE);
        numCols = Math.ceil(windowWidth / CELL_SIZE);
        buildLetters();
      }
