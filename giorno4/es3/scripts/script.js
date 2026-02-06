let particles = [];
const numParticles = 4000;
const noiseScale = 0.01; 
let flowField;
let cols, rows;
const scl = 40;
let zOff = 0;


const color1 = [123, 44, 191]; // #7b2cbf
const color2 = [0, 255, 255];  // Cyan

function setup() {
    createCanvas(windowWidth, windowHeight);
    cols = floor(width / scl);
    rows = floor(height / scl);
    
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
    
    background(5);
}

function draw() {
    noStroke();
    fill(5, 5, 5, 20); 
    rect(0, 0, width, height);

    let yOff = 0;
    for (let y = 0; y < rows; y++) {
        let xOff = 0;
        for (let x = 0; x < cols; x++) {
            let angle = noise(xOff, yOff, zOff) * TWO_PI * 2;
            
            let d = dist(mouseX, mouseY, x * scl, y * scl);
            if (d < 200) {
                angle += map(d, 0, 200, PI, 0); 
            }

            let v = p5.Vector.fromAngle(angle);
            v.setMag(1);
            
            xOff += noiseScale;
        }
        yOff += noiseScale;
    }
    zOff += 0.003;

    for (let i = 0; i < particles.length; i++) {
        particles[i].follow();
        particles[i].update();
        particles[i].edges();
        particles[i].show();
    }
}

class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 2; 
        this.prevPos = this.pos.copy();
        
        this.colorRatio = random(1);
    }

    follow() {
        let x = floor(this.pos.x / scl);
        let y = floor(this.pos.y / scl);
        
        let angle = noise(x * noiseScale, y * noiseScale, zOff) * TWO_PI * 2;
        
        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        if (d < 250) {
             angle += 2; 
             this.maxSpeed = 4; 
        } else {
             this.maxSpeed = 2;
        }

        let force = p5.Vector.fromAngle(angle);
        this.applyForce(force);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    show() {
        let r = lerp(color1[0], color2[0], this.colorRatio);
        let g = lerp(color1[1], color2[1], this.colorRatio);
        let b = lerp(color1[2], color2[2], this.colorRatio);

        stroke(r, g, b, 150);
        strokeWeight(1);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        
        this.updatePrev();
    }

    updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }

    edges() {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.updatePrev();
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.updatePrev();
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.updatePrev();
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.updatePrev();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(5);
    cols = floor(width / scl);
    rows = floor(height / scl);
}