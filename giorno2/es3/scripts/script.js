 function setup() {
        createCanvas(windowWidth, windowHeight);
        noStroke();
      }

      function draw() {
        fill(mouseX, mouseY, 235);

        ellipse(mouseX, mouseY, 200, 200);
        ellipse(windowWidth - mouseX, mouseY, 100, 100);
      }