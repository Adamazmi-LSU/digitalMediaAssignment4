// --- GLOBAL VARIABLES & GAME STATES ---
let GameStates = Object.freeze({ 
  START: "start",
  PLAY: "play",
  END: "end"
});
let gameState = GameStates.START;
let score = 0;
let highScore = 0;
let time = 30; 
let textPadding = 15;
let gameFont;
let bug;       
let bugs = []; 
let speedMultiplier = 1; 


function preload() {
  gameFont = loadFont("media/PressStart2P-Regular.ttf");
  bug = loadImage("media/bug.png");
}

function setup() {
  createCanvas(400, 400);
  textFont(gameFont);
  
  
  for (let i = 0; i < 5; i++){
    bugs.push(spawnBug());
  }
}

function draw() {
  background(220);
  
  switch(gameState) {
    case GameStates.START:
      textAlign(CENTER, CENTER);
      textSize(18);
      text("Press ENTER to Start", width / 2, height / 2);
      break;
      
    case GameStates.PLAY:
      
      textAlign(LEFT, TOP);
      textSize(14);
      text("Score: " + score, textPadding, textPadding);
      textAlign(RIGHT, TOP);
      text("Time: " + Math.ceil(time), width - textPadding, textPadding);
      
      
      for (let bugObj of bugs) {
        bugObj.update();
        bugObj.draw();
      }
      
      
      for (let i = bugs.length - 1; i >= 0; i--) {
        if (bugs[i].removed) {
          bugs.splice(i, 1);
          bugs.push(spawnBug());
        }
      }
      
      
      time -= deltaTime / 1000;
      if (time <= 0) {
        gameState = GameStates.END;
      }
      break;
      
    case GameStates.END:
      textAlign(CENTER, CENTER);
      textSize(18);
      text("Game Over!", width / 2, height / 2 - 20);
      text("Score: " + score, width / 2, height / 2);
      if (score > highScore) {
        highScore = score;
      }
      text("High Score: " + highScore, width / 2, height / 2 + 20);
      break;
  }
}

function keyPressed() {
  if (gameState === GameStates.START && keyCode === ENTER) {
    gameState = GameStates.PLAY;
  }
}

function mousePressed() {
  if (gameState === GameStates.PLAY) {
    
    for (let bugObj of bugs) {
      
      if (bugObj.currentAnimation !== "squish" && bugObj.isClicked(mouseX, mouseY)) {
        bugObj.squish();  
        score++;        
        speedMultiplier += 0.1; 
        
        break;
      }
    }
  }
}


function spawnBug() {
  let newBug = new Character(random(80, width - 80), random(80, height - 80));
  
  newBug.addAnimation("move", new SpriteAnimation(bug, 0, 0, 4));
  
  newBug.addAnimation("squish", new SpriteAnimation(bug, 4 * 32, 0, 1));
  newBug.currentAnimation = "move";
  
  
  newBug.vx = random([-1, 1]) * random(1, 3) * speedMultiplier;
  newBug.vy = 0;
  
  return newBug;
}


class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;            
    this.currentAnimation = null;
    this.animations = {};
    this.vx = 0;
    this.vy = 0;
    this.squishTimer = 0;  
    this.removed = false;  
  }
  
  addAnimation(key, animation) {
    this.animations[key] = animation;
  }
  
  update() {
    if (this.currentAnimation === "squish") {
      
      this.squishTimer -= deltaTime / 1000;
      if (this.squishTimer <= 0) {
        this.removed = true;
      }
      if (this.animations["squish"]) {
        this.animations["squish"].update();
      }
    } else {
      
      this.x += this.vx;
      this.y += this.vy;
      
      
      if (this.vx !== 0 || this.vy !== 0) {
        this.angle = atan2(this.vy, this.vx) + HALF_PI;
      }
      
      let anim = this.animations["move"];
      
      
      if (this.x < 0 || this.x + anim.frameWidth > width) {
        this.vx *= -1;
      }
      
      
      if (this.y < 0 || this.y + anim.frameHeight > height) {
        this.vy *= -1;
      }
      
      if (this.animations["move"]) {
        this.animations["move"].update();
      }
    }
  }
  
  draw() {
    if (this.animations[this.currentAnimation]) {
      
      this.animations[this.currentAnimation].draw(this.x, this.y, this.angle);
    } else {
      
      ellipse(this.x, this.y, 32, 32);
    }
  }
  
  
  isClicked(mx, my) {
    let anim = this.animations["move"];
    return (mx >= this.x && mx <= this.x + anim.frameWidth &&
            my >= this.y && my <= this.y + anim.frameHeight);
  }
  
  
  squish() {
    this.currentAnimation = "squish";
    this.vx = 0;
    this.vy = 0;
    this.squishTimer = 0.5;
  }
}


class SpriteAnimation {
  
  constructor(spritesheet, startU, startV, duration) {
    this.spritesheet = spritesheet;
    this.startU = startU; 
    this.v = startV;      
    this.duration = duration; 
    this.frameCount = duration;
    
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDelay = 6;    
    this.frameWidth = 32;   
    this.frameHeight = 32; 
  }
  
  update() {
    if (this.frameCount > 1) {
      this.elapsedTime++;
      if (this.elapsedTime >= this.frameDelay) {
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        this.elapsedTime = 0;
      }
    }
  }
  
  draw(x, y, angle = 0) {
    let sx = this.startU + this.currentFrame * this.frameWidth;
    let sy = this.v;
    push();
    
    translate(x + this.frameWidth / 2, y + this.frameHeight / 2);
    rotate(angle);

    image(
      this.spritesheet,
      -this.frameWidth / 2, -this.frameHeight / 2,
      this.frameWidth, this.frameHeight,
      sx, sy,
      this.frameWidth, this.frameHeight
    );
    pop();
  }
}
