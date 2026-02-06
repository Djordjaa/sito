let img;

      function preload() {
        img = loadImage('img.png');
      }

      function setup() {
        createCanvas(windowWidth, windowHeight);
        img.resize(img.width / 100, img.height / 100);
      }

      function draw() {
        background(0);
        noStroke();

        let numH = img.width;
        let numV = img.height;
        let d = 20;
        let ox = (width - (numH - 1) * d) / 2;
        let oy = (height - (numV - 1) * d) / 2;
        let amount = mouseX;
        let ny = frameCount * 0.006;
        let nx = frameCount * 0.0012;
        let nz = frameCount * 0.0014;
        for (let j = 0; j < numV; j++) {
          for (let i = 0; i < numH; i++) {
            fill(img.get(i, j));
            let px = ox + i * d + map(noise(i * 0.1 + nx, j * 0.1 + ny, nz), 0, 1, -amount, amount);
            let py = oy + j * d + map(noise(i * 0.1 + nx, j * 0.1 + ny, nz), 0, 1, -amount, amount);
            circle(px, py, 15);
          }
        }
      }