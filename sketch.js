let player;
let candies = [];
let hazards = [];
let particles = [];
let score = 0;
let live = 3;
let gameState = "START"; // START, PLAY, GAMEOVER
let font;

function setup() {
  createCanvas(800, 600);
  player = new Ghost();
}

function draw() {
  // Spooky night background gradient
  setGradient(0, 0, width, height, color(15, 10, 30), color(40, 20, 60));
  
  // Draw spooky background elements (stars/distant bats)
  drawBackgroundElements();

  if (gameState === "START") {
    drawStartScreen();
  } else if (gameState === "PLAY") {
    playGame();
  } else if (gameState === "GAMEOVER") {
    drawGameOverScreen();
  }
}

function playGame() {
  // Update and show player
  player.update();
  player.display();

  // Handle Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }

  // Handle Candies
  if (frameCount % 60 === 0) {
    candies.push(new Candy());
  }

  for (let i = candies.length - 1; i >= 0; i--) {
    candies[i].update();
    candies[i].display();

    // Check collision with player
    if (player.hits(candies[i])) {
      score += candies[i].isGolden ? 5 : 1;
      // Spawn collection burst
      for (let p = 0; p < 15; p++) {
        particles.push(new Particle(candies[i].x, candies[i].y, color(255, 200, 50)));
      }
      candies.splice(i, 1);
    } else if (candies[i].offScreen()) {
      candies.splice(i, 1);
    }
  }

  // Handle Hazards (Bats / Jack-o'-lanterns)
  let hazardSpawnRate = max(30, 90 - Math.floor(score / 5) * 5);
  if (frameCount % hazardSpawnRate === 0) {
    hazards.push(new Hazard());
  }

  for (let i = hazards.length - 1; i >= 0; i--) {
    hazards[i].update();
    hazards[i].display();

    // Check collision with player
    if (player.hits(hazards[i])) {
      lives--;
      // Spawn hit burst
      for (let p = 0; p < 20; p++) {
        particles.push(new Particle(player.x, player.y, color(200, 50, 50)));
      }
      hazards.splice(i, 1);
      if (lives <= 0) {
        gameState = "GAMEOVER";
      }
    } else if (hazards[i].offScreen()) {
      hazards.splice(i, 1);
    }
  }

  // Draw HUD (Score & Lives)
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Candy: ${score}`, 20, 20);
  text(`Lives: ${'🎃'.repeat(lives)}`, 20, 50);
}

// --- CONTROLS ---
function keyPressed() {
  if (gameState === "START" && (keyCode === ENTER || key === ' ')) {
    resetGame();
    gameState = "PLAY";
  } else if (gameState === "GAMEOVER" && (keyCode === ENTER || key === ' ')) {
    resetGame();
    gameState = "PLAY";
  }
}

function resetGame() {
  score = 0;
  lives = 3;
  candies = [];
  hazards = [];
  particles = [];
  player = new Ghost();
}

// --- CLASSES ---

class Ghost {
  constructor() {
    this.x = 100;
    this.y = height / 2;
    this.size = 50;
    this.speed = 5;
  }

  update() {
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      this.y -= this.speed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
      this.y += this.speed;
    }
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      this.x += this.speed;
    }

    // Keep ghost inside canvas boundaries
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.y = constrain(this.y, this.size / 2, height - this.size / 2);
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // Floating wavy effect
    let floatOffset = sin(frameCount * 0.1) * 5;
    
    // Ghost Body (Custom eerie cyan/white style)
    noStroke();
    fill(220, 245, 255, 220);
    ellipse(0, floatOffset, this.size, this.size * 1.2);
    
    // Wavy bottom skirt
    rectMode(CENTER);
    rect(0, floatOffset + 25, this.size, 15, 5);

    // Glowing Eyes
    fill(255, 100, 0);
    ellipse(-8, floatOffset - 5, 8, 12);
    ellipse(8, floatOffset - 5, 8, 12);
    pop();
  }

  hits(object) {
    let d = dist(this.x, this.y, object.x, object.y);
    return d < (this.size / 2 + object.size / 2);
  }
}

class Candy {
  constructor() {
    this.x = width;
    this.y = random(50, height - 50);
    this.size = 30;
    this.speed = 4;
    this.isGolden = random(1) < 0.15; // 15% chance for a golden bonus candy
  }

  update() {
    this.x -= this.speed;
  }

  display() {
    push();
    translate(this.x, this.y);
    if (this.isGolden) {
      fill(255, 215, 0);
      stroke(255, 255, 255);
    } else {
      fill(255, 105, 180);
      stroke(150, 0, 100);
    }
    // Simple custom candy shape (Wrapped sweet)
    ellipse(0, 0, 20, 15);
    triangle(-15, -10, -8, 0, -15, 10);
    triangle(15, -10, 8, 0, 15, 10);
    pop();
  }

  offScreen() {
    return this.x < -30;
  }
}

class Hazard {
  constructor() {
    this.x = width;
    this.y = random(50, height - 50);
    this.size = 40;
    this.speed = random(5, 8);
    this.type = random(['bat', 'pumpkin']);
  }

  update() {
    this.x -= this.speed;
    if (this.type === 'bat') {
      this.y += sin(frameCount * 0.2) * 3; // Swooping bat movement
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    if (this.type === 'bat') {
      // Spooky Bat design
      fill(30);
      noStroke();
      ellipse(0, 0, 30, 15);
      // Wings flapping
      let wingFlap = sin(frameCount * 0.5) * 15;
      triangle(0, 0, -25, -15 + wingFlap, -5, 0);
      triangle(0, 0, 25, -15 + wingFlap, 5, 0);
      // Red eyes
      fill(255, 0, 0);
      ellipse(-4, -2, 4, 4);
      ellipse(4, -2, 4, 4);
    } else {
      // Evil Jack-o'-lantern design
      fill(255, 140, 0);
      stroke(100, 50, 0);
      ellipse(0, 0, 40, 35);
      // Face
      fill(0);
      noStroke();
      triangle(-8, -5, -2, -5, -5, -10); // Left eye
      triangle(2, -5, 8, -5, 5, -10);   // Right eye
      rect(-6, 5, 12, 4, 2);             // Grin
    }
    pop();
  }

  offScreen() {
    return this.x < -50;
  }
}

class Particle {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.alpha = 255;
    this.color = col;
    this.size = random(4, 8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 10;
  }

  display() {
    noStroke();
    let c = color(this.color);
    c.setAlpha(this.alpha);
    fill(c);
    ellipse(this.x, this.y, this.size);
  }

  finished() {
    return this.alpha <= 0;
  }
}

// --- UI & BACKGROUND HELPERS ---

fn = function() {}; // placeholder

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(255, 150, 0);
  textSize(48);
  text("MIDNIGHT MUNCHIES", width / 2, height / 2 - 60);

  fill(200);
  textSize(20);
  text("Use ARROW KEYS or W/A/S/D to move.", width / 2, height / 2);
  text("Collect candy, avoid bats & jack-o'-lanterns!", width / 2, height / 2 + 30);

  fill(255, 215, 0);
  textSize(24);
  text("Press [ENTER] or [SPACE] to Start", width / 2, height / 2 + 90);
}

function drawGameOverScreen() {
  textAlign(CENTER, CENTER);
  fill(220, 50, 50);
  textSize(48);
  text("GAME OVER", width / 2, height / 2 - 60);

  fill(255);
  textSize(24);
  text(`Final Candy Collected: ${score}`, width / 2, height / 2);

  fill(255, 215, 0);
  textSize(20);
  text("Press [ENTER] or [SPACE] to Play Again", width / 2, height / 2 + 60);
}

function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function drawBackgroundElements() {
  // Simple twinkling background stars / spooky ambiance
  fill(255, 255, 255, 150);
  noStroke();
  ellipse(150, 100, 2, 2);
  ellipse(350, 80, 3, 3);
  ellipse(600, 150, 2, 2);
  ellipse(720, 90, 3, 3);
  ellipse(250, 300, 2, 2);
}