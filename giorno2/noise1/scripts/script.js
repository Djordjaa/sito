  function setup() {
        createCanvas(windowWidth, windowHeight);
        colorMode(HSB, 360, 100, 100, 1);
      }

      function draw() {
        background(0);
        noFill();
        strokeWeight(1);

        let intensitaNoise = map(mouseX, 0, width, 0.01, 0.1);

        for (let i = 50; i < height - 50; i += 10) {
          stroke('hsl(' + map(i, 50, height - 50, 0, 360) + ', 80%, 60%)');

          beginShape();
          for (let x = 0; x < width; x += 5) {
            let n = noise(x * intensitaNoise, i * 0.02, frameCount * 0.01);

            let y = i + n * 100 - 50;

            vertex(x, y);
          }
          endShape();
        }
      }