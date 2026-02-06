let cols, rows;
const size = 30;
let shapeType = 0;

const bg = '#050505';
let slider;

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    cols = width / size;
    rows = height / size;
    noStroke();
    
    slider = document.getElementById('hueSlider');
}

function draw() {
    background(bg);

    let hueVal = slider.value;
    let dynamicAccent = color(`hsl(${hueVal}, 100%, 50%)`);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * size + size / 2;
            let y = j * size + size / 2;

            let d = dist(mouseX, mouseY, x, y);
            
            let angle = map(d, 0, width, PI * 4, 0); 
            
            let s = map(d, 0, 300, size * 0.8, size * 0.2); 
            s = constrain(s, size * 0.1, size * 0.9);

            push();
            translate(x, y);
            rotate(angle + frameCount * 0.01); 

            let colorAmount = map(d, 0, 400, 1, 0);
            let c = lerpColor(color(50), dynamicAccent, colorAmount);
            
            if (d < 150) {
                 fill(255);
            } else {
                 fill(c);
            }

            if (shapeType === 0) {
                rect(0, 0, s, s, 4);
            } else if (shapeType === 1) {
                stroke(c);
                if (d < 150) stroke(255);
                strokeWeight(2);
                line(-size/3, 0, size/3, 0);
                line(0, -size/3, 0, size/3);
            } else {
                noFill();
                stroke(c);
                if (d < 150) stroke(255);
                strokeWeight(1.5);
                ellipse(0, 0, s, s);
            }

            pop();
        }
    }
}

function mousePressed(e) {
    if (e.target.id !== 'hueSlider') {
        shapeType = (shapeType + 1) % 3;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = width / size;
    rows = height / size;
}