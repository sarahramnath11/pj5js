let lanes = [];
let clouds = [];
let buildings = [];
let roadGlow = [];
let mouseGlow = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();

  let laneCount = max(3, floor(height / 140));
  let roadTop = height * 0.28;
  let roadBottom = height * 0.92;
  let laneH = (roadBottom - roadTop) / laneCount;

  // clouds
  for (let i = 0; i < 25; i++) {
    clouds.push({
      x: random(width),
      y: random(height * 0.25),
      s: random(60, 140),
      speed: random(0.1, 0.3)
    });
  }

  // buildings
  for (let i = 0; i < 18; i++) {
    let bw = random(50, 130);
    buildings.push({
      x: map(i, 0, 17, -20, width + 20),
      w: bw,
      h: random(height * 0.12, height * 0.34),
      color: color(random(160, 220), random(180, 230), random(200, 240))
    });
  }

  // road glow (heat shimmer style)
  for (let i = 0; i < 12; i++) {
    roadGlow.push({
      y: lerp(roadTop, roadBottom, i / 11),
      a: random(10, 25),
      w: random(width * 0.5, width * 1.2)
    });
  }

  // lanes + cars
  for (let i = 0; i < laneCount; i++) {
    let dir = i % 2 === 0 ? 1 : -1;
    lanes.push(new Lane(roadTop + laneH * i + laneH * 0.5, laneH, dir, i));
  }
}

function draw() {
  drawSky();
  drawCity();
  drawRoad();

  for (let lane of lanes) {
    lane.update();
    lane.display();
  }

  drawAtmosphere();
}

function drawSky() {
  for (let y = 0; y < height; y++) {
    let t = y / height;
    let c = lerpColor(color(135, 200, 255), color(220, 240, 255), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  // clouds
  for (let c of clouds) {
    fill(255, 255, 255, 180);
    ellipse(c.x, c.y, c.s, c.s * 0.6);
    ellipse(c.x + c.s * 0.3, c.y + 5, c.s * 0.7, c.s * 0.5);
    ellipse(c.x - c.s * 0.3, c.y + 5, c.s * 0.7, c.s * 0.5);

    c.x += c.speed;
    if (c.x > width + 100) c.x = -100;
  }
}

function drawCity() {
  let baseY = height * 0.39;
  for (let b of buildings) {
    fill(b.color);
    rect(b.x, baseY - b.h / 2, b.w, b.h, 2);

    fill(255, 255, 255, 80);
    rect(b.x + b.w * 0.08, baseY - b.h / 2.1, b.w * 0.22, b.h * 0.94, 2);
  }
}

function drawRoad() {
  let roadTop = lanes[0].y - lanes[0].h * 0.55;
  let roadBottom = lanes[lanes.length - 1].y + lanes[lanes.length - 1].h * 0.55;

  fill(90, 90, 90);
  rect(width / 2, (roadTop + roadBottom) / 2, width * 1.05, roadBottom - roadTop + 40);

  fill(70, 70, 70);
  rect(width / 2, roadTop - 18, width * 1.05, 36);
  rect(width / 2, roadBottom + 18, width * 1.05, 36);

  for (let g of roadGlow) {
    fill(255, 255, 255, g.a);
    ellipse(width * 0.5, g.y, g.w, 24);
  }

  // lane lines
  for (let i = 0; i <= lanes.length; i++) {
    let y = lanes[0].y - lanes[0].h * 0.5 + i * lanes[0].h;
    stroke(i === 0 || i === lanes.length ? color(255) : color(255, 220, 0));
    strokeWeight(i === 0 || i === lanes.length ? 2 : 1);
    line(0, y, width, y);

    if (i < lanes.length && i > 0) {
      let dashOffset = (frameCount * 0.6 * (i % 2 === 0 ? 1 : -1)) % 60;
      for (let x = -80; x < width + 80; x += 60) {
        stroke(255, 220, 0);
        line(x + dashOffset, y, x + 28 + dashOffset, y);
      }
    }
  }
  noStroke();
}

function drawAtmosphere() {
  // soft sunlight glow
  fill(255, 255, 200, 20);
  ellipse(width * 0.8, height * 0.1, 300, 300);
}

class Lane {
  constructor(y, h, dir, index) {
    this.y = y;
    this.h = h;
    this.dir = dir;
    this.index = index;
    this.cars = [];
    this.populate();
  }

  populate() {
    let x = random(0, 80);
    while (x < width + 150) {
      let carLen = random(76, 120);
      this.cars.push(new Car(x, this.y, this.h * 0.74, carLen, this.dir, this.index));
      x += carLen + random(5, 18);
    }
  }

  update() {
    for (let car of this.cars) {
      car.update(this.cars);
    }

    this.cars.sort((a, b) => a.x - b.x);

    if (this.dir > 0) {
      let first = this.cars[0];
      for (let car of this.cars) {
        if (car.x - car.len / 2 > width + 140) {
          car.x = first.x - first.len / 2 - car.len / 2 - random(8, 16);
          first = car;
        }
      }
    } else {
      let last = this.cars[this.cars.length - 1];
      for (let i = this.cars.length - 1; i >= 0; i--) {
        let car = this.cars[i];
        if (car.x + car.len / 2 < -140) {
          car.x = last.x + last.len / 2 + car.len / 2 + random(8, 16);
          last = car;
        }
      }
    }
  }

  display() {
    for (let car of this.cars) {
      car.display();
    }
  }
}

class Car {
  constructor(x, y, size, len, dir, laneIndex) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.len = len;
    this.dir = dir;
    this.laneIndex = laneIndex;
    this.speed = random(0.15, 0.45) * dir;
    this.bodyColor = this.pickColor();
    this.hazardOn = false;
    this.blinkPhase = random(TWO_PI);
  }

  pickColor() {
    let palette = [
      color(255, 80, 80),
      color(80, 160, 255),
      color(255, 200, 60),
      color(120, 220, 140),
      color(200, 120, 255),
      color(255, 255, 255),
      color(180, 180, 180)
    ];
    return random(palette);
  }

  update(allCars) {
    this.x += this.speed;
    this.hazardOn = this.contains(mouseX, mouseY);
  }

  contains(mx, my) {
    return mx > this.x - this.len * 0.52 &&
           mx < this.x + this.len * 0.52 &&
           my > this.y - this.size * 0.48 &&
           my < this.y + this.size * 0.48;
  }

  display() {
    push();
    translate(this.x, this.y);

    let blink = sin(frameCount * 0.28 + this.blinkPhase) > 0;
    let facing = this.dir > 0 ? 1 : -1;

    // body
    fill(this.bodyColor);
    rect(0, 0, this.len, this.size * 0.52, 10);

    // windows
    fill(200);
    rect(-this.len * 0.12, -this.size * 0.16, this.len * 0.18, this.size * 0.26, 4);
    rect(this.len * 0.08, -this.size * 0.16, this.len * 0.18, this.size * 0.26, 4);

    // wheels
    fill(30);
    rect(-this.len * 0.3, this.size * 0.22, this.len * 0.12, this.size * 0.16, 3);
    rect(this.len * 0.3, this.size * 0.22, this.len * 0.12, this.size * 0.16, 3);

    // lights
    let headX = this.len * 0.48 * facing;
    let tailX = -this.len * 0.48 * facing;

    fill(255, 255, 180);
    rect(headX, -this.size * 0.03, this.len * 0.03, this.size * 0.12, 2);

    fill(255, 0, 0);
    rect(tailX, -this.size * 0.03, this.len * 0.03, this.size * 0.13, 2);

    // hazard lights
    if (this.hazardOn && blink) {
      fill(255, 170, 0);
      rect(this.len * 0.39, -this.size * 0.03, this.len * 0.04, this.size * 0.12, 2);
      rect(-this.len * 0.39, -this.size * 0.03, this.len * 0.04, this.size * 0.12, 2);
    }

    pop();
  }
}