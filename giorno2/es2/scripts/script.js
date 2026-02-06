 let pg;
      let bgColor = "#050505";
      let paintingEnabled = true;

      const ui = {
        root: null,
        brush: null,
        shape: null,
        size: null,
        grid: null,
        opacity: null,
        sizeVal: null,
        gridVal: null,
        opVal: null,
        colorMode: null,
        bg: null,
        mirror: null,
        mirrorAxis: null,
        applyBg: null,
        clear: null,
        save: null,
      };

      function setup() {
        createCanvas(windowWidth, windowHeight);
        pixelDensity(1);
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();

        pg = createGraphics(windowWidth, windowHeight);
        pg.pixelDensity(1);
        pg.colorMode(HSB, 360, 100, 100, 100);
        pg.background(hexToHSB(bgColor).h, 10, 5, 100);

        hookUI();
        updateLabels();
      }

      function hookUI() {
        ui.root = document.getElementById("ui");
        ui.brush = document.getElementById("brush");
        ui.shape = document.getElementById("shape");
        ui.size = document.getElementById("size");
        ui.grid = document.getElementById("grid");
        ui.opacity = document.getElementById("opacity");
        ui.sizeVal = document.getElementById("sizeVal");
        ui.gridVal = document.getElementById("gridVal");
        ui.opVal = document.getElementById("opVal");
        ui.colorMode = document.getElementById("colorMode");
        ui.bg = document.getElementById("bg");
        ui.mirror = document.getElementById("mirror");
        ui.mirrorAxis = document.getElementById("mirrorAxis");
        ui.applyBg = document.getElementById("applyBg");
        ui.clear = document.getElementById("clear");
        ui.save = document.getElementById("save");

        ui.root.addEventListener("mouseenter", () => (paintingEnabled = false));
        ui.root.addEventListener("mouseleave", () => (paintingEnabled = true));

        ["input", "change"].forEach(evt => {
          ui.size.addEventListener(evt, updateLabels);
          ui.grid.addEventListener(evt, updateLabels);
          ui.opacity.addEventListener(evt, updateLabels);
        });

        ui.bg.addEventListener("input", () => {
          bgColor = ui.bg.value;
        });

        ui.mirror.addEventListener("change", () => {
          ui.mirrorAxis.disabled = !ui.mirror.checked;
        });

        ui.applyBg.addEventListener("click", () => {
          const old = pg;
          pg = createGraphics(windowWidth, windowHeight);
          pg.pixelDensity(1);
          pg.colorMode(HSB, 360, 100, 100, 100);

          const c = hexToHSB(bgColor);
          pg.background(c.h, c.s, c.b, 100);
          pg.image(old, 0, 0);
        });

        ui.clear.addEventListener("click", () => {
          const c = hexToHSB(bgColor);
          pg.background(c.h, c.s, c.b, 100);
        });

        ui.save.addEventListener("click", () => {
          saveCanvas(pg, "painter", "png");
        });
      }

      function updateLabels() {
        ui.sizeVal.textContent = ui.size.value;
        ui.gridVal.textContent = ui.grid.value;
        ui.opVal.textContent = ui.opacity.value + "%";
      }

      function draw() {
        const c = hexToHSB(bgColor);
        background(c.h, c.s, c.b, 100);

        image(pg, 0, 0);

        drawCursorPreview();
      }

      function drawCursorPreview() {
        const brush = ui.brush.value;
        const shape = ui.shape.value;
        const size = +ui.size.value;
        const grid = +ui.grid.value;

        const x = brush === "pixel" ? snap(mouseX, grid) : mouseX;
        const y = brush === "pixel" ? snap(mouseY, grid) : mouseY;

        noFill();
        stroke(0, 0, 100, 35);
        strokeWeight(1);

        if (brush === "pixel") {
          rectMode(CENTER);
          rect(x, y, grid, grid);
        } else {
          if (shape === "square") {
            rectMode(CENTER);
            rect(x, y, size, size);
          } else {
            ellipse(x, y, size, size);
          }
        }

        noStroke();
      }

      function mousePressed() { paintIfAllowed(); }
      function mouseDragged() { paintIfAllowed(); }

      function paintIfAllowed() {
        if (!paintingEnabled) return;
        if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

        const brush = ui.brush.value;
        const shape = ui.shape.value;
        const size = +ui.size.value;
        const grid = +ui.grid.value;
        const alpha = +ui.opacity.value;

        const erasing = keyIsDown(SHIFT);
        const colorModeSel = ui.colorMode.value;

        const col = pickBrushColor(colorModeSel, erasing, alpha);

        const doMirror = ui.mirror.checked;
        const axis = ui.mirrorAxis.value;

        const baseX = brush === "pixel" ? snap(mouseX, grid) : mouseX;
        const baseY = brush === "pixel" ? snap(mouseY, grid) : mouseY;

        paintBrush(brush, shape, baseX, baseY, size, grid, col);

        if (doMirror) {
          const mx = width - baseX;
          const my = height - baseY;

          if (axis === "x") paintBrush(brush, shape, mx, baseY, size, grid, col);
          if (axis === "y") paintBrush(brush, shape, baseX, my, size, grid, col);
          if (axis === "both") {
            paintBrush(brush, shape, mx, baseY, size, grid, col);
            paintBrush(brush, shape, baseX, my, size, grid, col);
            paintBrush(brush, shape, mx, my, size, grid, col);
          }
        }
      }

      function paintBrush(brush, shape, x, y, size, grid, col) {
        pg.noStroke();
        pg.fill(col.h, col.s, col.b, col.a);

        if (brush === "pixel") {
          pg.rectMode(CENTER);
          pg.rect(x, y, grid, grid);
          return;
        }

        if (brush === "round") {
          if (shape === "square") {
            pg.rectMode(CENTER);
            pg.rect(x, y, size, size);
          } else {
            pg.circle(x, y, size);
          }
          return;
        }

        if (brush === "spray") {
          const density = Math.floor(map(size, 2, 80, 6, 28));
          const r = size * 0.6;

          for (let i = 0; i < density; i++) {
            const ang = random(TWO_PI);
            const rad = r * sqrt(random());
            const sx = x + cos(ang) * rad;
            const sy = y + sin(ang) * rad;

            pg.fill(col.h, col.s, col.b, col.a * 0.22);
            pg.circle(sx, sy, random(1.5, 4.0));
          }
        }
      }

      function pickBrushColor(mode, erasing, alpha) {
        if (erasing) {
          const bg = hexToHSB(bgColor);
          return { h: bg.h, s: bg.s, b: bg.b, a: min(100, alpha + 20) };
        }

        if (mode === "bw") {
          return { h: 0, s: 0, b: 100, a: alpha };
        }

        const h = (frameCount * 1.2 + mouseX * 0.25) % 360;
        return { h, s: 80, b: 100, a: alpha };
      }

      function snap(v, g) {
        return Math.round(v / g) * g;
      }

      function hexToHSB(hex) {
        const r = parseInt(hex.slice(1,3), 16) / 255;
        const g = parseInt(hex.slice(3,5), 16) / 255;
        const b = parseInt(hex.slice(5,7), 16) / 255;

        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        const d = max - min;

        let h = 0;
        if (d !== 0) {
          if (max === r) h = ((g - b) / d) % 6;
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          h *= 60;
          if (h < 0) h += 360;
        }

        const s = max === 0 ? 0 : (d / max) * 100;
        const v = max * 100;
        return { h, s, b: v };
      }

      function windowResized() {
        const old = pg;

        resizeCanvas(windowWidth, windowHeight);

        pg = createGraphics(windowWidth, windowHeight);
        pg.pixelDensity(1);
        pg.colorMode(HSB, 360, 100, 100, 100);

        const c = hexToHSB(bgColor);
        pg.background(c.h, c.s, c.b, 100);
        pg.image(old, 0, 0);
      }