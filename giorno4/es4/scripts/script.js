let cols, rows;
const size = 40; // Grandezza delle celle (più piccolo = più denso)
let shapeType = 0; // 0 = Quadrati, 1 = Linee, 2 = Cerchi

// Colori
const bg = '#050505';
const accent = '#7b2cbf'; // Il tuo viola
const light = '#f0f0f0';

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    cols = width / size;
    rows = height / size;
    noStroke();
}

function draw() {
    background(bg);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * size + size / 2;
            let y = j * size + size / 2;

            // Calcola distanza dal mouse
            let d = dist(mouseX, mouseY, x, y);
            
            // Calcola l'angolo di rotazione basato sulla distanza
            // Più sei vicino, più ruota
            let angle = map(d, 0, width, PI, 0);
            
            // Calcola la dimensione (più vicino = più piccolo o grande)
            let s = map(d, 0, 300, size * 0.8, size * 0.2);
            s = constrain(s, size * 0.1, size * 0.9);

            push();
            translate(x, y);
            rotate(angle + frameCount * 0.01); // Rotazione interattiva + lenta rotazione automatica

            // Colore dinamico: Viola se vicino, Grigio se lontano
            let colorAmount = map(d, 0, 400, 1, 0);
            let c = lerpColor(color(100), color(accent), colorAmount);
            
            if (d < 150) {
                 // Effetto "Highlight" bianco quando passi sopra
                 fill(255);
            } else {
                 fill(c);
            }

            // Disegna la forma in base alla modalità corrente
            if (shapeType === 0) {
                // Quadrati eleganti
                rect(0, 0, s, s, 4); // 4 è il border-radius
            } else if (shapeType === 1) {
                // Croci / Linee
                stroke(c);
                if (d < 150) stroke(255);
                strokeWeight(2);
                line(-size/3, 0, size/3, 0);
                line(0, -size/3, 0, size/3);
            } else {
                // Cerchi concentrici
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

function mousePressed() {
    shapeType = (shapeType + 1) % 3;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = width / size;
    rows = height / size;
}