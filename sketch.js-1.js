let highway;
let city = [];
let clouds = [];
let trees = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  highway = new Highway();
  createScene();
}

function draw() {
  drawSky();
  drawBackgroundCity();
  drawTreeLine();
  highway.update();
  highway.display();
  drawLightOverlay();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  highway = new Highway();
  createScene();
}

function createScene() {
  city = [];
  clouds = [];
  trees = [];

  for (let i = 0; i < 22; i++) {
    const w = random(50, 130);
    city.push({
      x: map(i, 0, 21, -20, width + 20),
      w,
      h: random(height * 0.09, height * 0.28),
      tone: color(random(165, 215), random(175, 220), random(185, 230)),
      shade: color(random(115, 165), random(125, 175), random(135, 185))
    });
  }

  for (let i = 0; i < 18; i++) {
    clouds.push({
      x: random(width),
      y: random(height * 0.05, height * 0.22),
      w: random(90, 190),
      h: random(35, 70),
      speed: random(0.08, 0.22)
    });
  }

  for (let i = 0; i < 36; i++) {
    trees.push({
      x: map(i, 0, 35, -30, width + 30),
      s: random(28, 58),
      yOffset: random(-10, 12)
    });
  }
}

function drawSky() {
  for (let y = 0; y < height; y++) {
    const t = constrain(y / (height * 0.85), 0, 1);
    const c = lerpColor(color(110, 190, 255), color(238, 246, 255), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  fill(255, 245, 185, 210);
  circle(width * 0.83, height * 0.13, min(width, height) * 0.12);

  fill(255, 255, 255, 150);
  ellipse(width * 0.83, height * 0.13, min(width, height) * 0.18);

  for (let c of clouds) {
    drawCloud(c.x, c.y, c.w, c.h);
    c.x += c.speed;
    if (c.x - c.w * 0.8 > width) c.x = -c.w;
  }
}

function drawCloud(x, y, w, h) {
  fill(255, 255, 255, 170);
  ellipse(x, y, w * 0.58, h * 0.78);
  ellipse(x - w * 0.22, y + h * 0.04, w * 0.42, h * 0.58);
  ellipse(x + w * 0.22, y + h * 0.05, w * 0.44, h * 0.56);
  ellipse(x - w * 0.04, y - h * 0.12, w * 0.34, h * 0.48);
}

function drawBackgroundCity() {
  const baseY = height * 0.34;

  fill(140, 185, 120, 100);
  rectMode(CORNER);
  rect(0, baseY - 12, width, 20);

  for (let b of city) {
    fill(b.tone);
    rect(b.x - b.w / 2, baseY - b.h, b.w, b.h);

    fill(b.shade);
    rect(b.x - b.w / 2 + b.w * 0.08, baseY - b.h, b.w * 0.22, b.h);

    fill(255, 255, 255, 80);
    rect(b.x - b.w / 2 + b.w * 0.48, baseY - b.h, b.w * 0.05, b.h);

    const rows = floor(b.h / 18);
    const cols = floor(b.w / 16);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (random() < 0.65) {
          fill(225, 240, 255, 80);
          rect(
            b.x - b.w / 2 + 8 + c * 14,
            baseY - b.h + 8 + r * 16,
            7,
            9
          );
        }
      }
    }
  }
}

function drawTreeLine() {
  const y = height * 0.34;
  for (let t of trees) {
    const x = t.x;
    const s = t.s;
    const yy = y + t.yOffset;

    fill(105, 80, 58);
    rectMode(CENTER);
    rect(x, yy + s * 0.22, s * 0.12, s * 0.42, 2);

    fill(55, 125, 72);
    ellipse(x, yy, s * 0.85, s * 0.72);
    fill(70, 145, 84, 220);
    ellipse(x - s * 0.13, yy - s * 0.06, s * 0.56, s * 0.44);
    ellipse(x + s * 0.14, yy - s * 0.04, s * 0.54, s * 0.42);
  }
}

function drawLightOverlay() {
  noStroke();
  fill(255, 250, 235, 22);
  rectMode(CORNER);
  rect(0, 0, width, height);

  fill(255, 235, 170, 18);
  ellipse(width * 0.8, height * 0.15, width * 0.35, height * 0.24);
}

class Highway {
  constructor() {
    this.top = height * 0.38;
    this.bottom = height * 0.92;
    this.laneCount = max(4, floor((this.bottom - this.top) / 88));
    this.laneH = (this.bottom - this.top) / this.laneCount;
    this.lanes = [];

    for (let i = 0; i < this.laneCount; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.lanes.push(new Lane(this, i, dir));
    }
  }

  update() {
    for (let lane of this.lanes) lane.update();
  }

  display() {
    this.drawRoadBase();
    this.drawLaneMarks();
    for (let lane of this.lanes) lane.display();
  }

  drawRoadBase() {
    rectMode(CORNER);
    noStroke();

    fill(88, 92, 98);
    rect(0, this.top, width, this.bottom - this.top);

    fill(73, 77, 82);
    rect(0, this.top, width, 14);
    rect(0, this.bottom - 14, width, 14);

    fill(160, 164, 170, 25);
    rect(0, this.top + 14, width, 8);

    for (let i = 0; i < 10; i++) {
      const y = lerp(this.top, this.bottom, i / 9);
      fill(255, 255, 255, 6);
      ellipse(width * 0.52, y, width * 0.75, 14);
    }

    fill(124, 126, 130);
    rect(0, this.bottom, width, height - this.bottom);

    fill(115, 155, 95);
    rect(0, this.top - 18, width, 18);
  }

  drawLaneMarks() {
    const dashLen = 32;
    const dashGap = 24;

    for (let i = 0; i <= this.laneCount; i++) {
      const y = this.top + i * this.laneH;
      if (i === 0 || i === this.laneCount) {
        stroke(245, 245, 245, 180);
        strokeWeight(2);
        line(0, y, width, y);
      } else {
        stroke(255, 214, 56, 210);
        strokeWeight(2);
        const offset = (frameCount * 0.7 * (i % 2 === 0 ? 1 : -1)) % (dashLen + dashGap);
        for (let x = -80; x < width + 80; x += dashLen + dashGap) {
          line(x + offset, y, x + offset + dashLen, y);
        }
      }
    }
    noStroke();
  }
}

class Lane {
  constructor(highway, index, dir) {
    this.highway = highway;
    this.index = index;
    this.dir = dir;
    this.y = highway.top + highway.laneH * index + highway.laneH * 0.5;
    this.h = highway.laneH;
    this.cars = [];
    this.populate();
  }

  populate() {
    let x = this.dir > 0 ? -80 : width + 80;
    let safety = 0;

    while (safety < 120 && ((this.dir > 0 && x < width + 250) || (this.dir < 0 && x > -250))) {
      const type = random(["sedan", "sedan", "suv", "van"]);
      const len = type === "van" ? random(120, 145) : type === "suv" ? random(98, 122) : random(86, 112);
      const colorSet = randomCarPalette();
      this.cars.push(new Car(this, x, this.y, len, this.h * 0.68, this.dir, type, colorSet));
      const gap = random(10, 26);
      x += (len + gap) * this.dir;
      safety++;
    }
  }

  update() {
    for (let c of this.cars) c.update(this.cars);
  }

  display() {
    for (let c of this.cars) c.display();
  }
}

class Car {
  constructor(lane, x, y, len, h, dir, type, colorSet) {
    this.lane = lane;
    this.x = x;
    this.y = y;
    this.len = len;
    this.h = h;
    this.dir = dir;
    this.type = type;

    this.body = colorSet.body;
    this.roof = colorSet.roof;
    this.trim = colorSet.trim;
    this.windowColor = color(190, 220, 235, 215);

    this.baseSpeed = random(0.42, 0.9) * dir;
    this.speed = this.baseSpeed;
    this.blinkPhase = random(TWO_PI);
    this.hover = 0;
    this.hazardActive = false;
    this.bobPhase = random(TWO_PI);
  }

  update(cars) {
    const front = this.getFrontCar(cars);
    let target = this.baseSpeed;

    if (front) {
      const gap = this.dir > 0
        ? (front.x - front.len * 0.5) - (this.x + this.len * 0.5)
        : (this.x - this.len * 0.5) - (front.x + front.len * 0.5);

      if (gap < 8) target = 0.02 * this.dir;
      else if (gap < 16) target = 0.08 * this.dir;
      else if (gap < 28) target = 0.16 * this.dir;
      else if (gap < 42) target = 0.24 * this.dir;
      else if (gap < 62) target = 0.36 * this.dir;
      else if (gap < 86) target = 0.52 * this.dir;
      else target = this.baseSpeed;
    }

    const pulse = sin(frameCount * 0.025 + this.lane.index * 0.7 + this.x * 0.01) * 0.04 * this.dir;
    target += pulse;
    this.speed = lerp(this.speed, target, 0.05);
    this.x += this.speed;

    if (this.dir > 0 && this.x - this.len * 0.7 > width + 180) {
      const leftmost = this.findBackMost(cars);
      this.x = leftmost - random(this.len + 12, this.len + 28);
    }

    if (this.dir < 0 && this.x + this.len * 0.7 < -180) {
      const rightmost = this.findBackMost(cars);
      this.x = rightmost + random(this.len + 12, this.len + 28);
    }

    this.hazardActive = this.contains(mouseX, mouseY);
    this.hover = lerp(this.hover, this.hazardActive ? 1 : 0, 0.18);
  }

  findBackMost(cars) {
    let candidate = this.x;
    if (this.dir > 0) {
      candidate = Infinity;
      for (let c of cars) {
        if (c !== this) candidate = min(candidate, c.x - c.len * 0.5);
      }
    } else {
      candidate = -Infinity;
      for (let c of cars) {
        if (c !== this) candidate = max(candidate, c.x + c.len * 0.5);
      }
    }
    return candidate;
  }

  getFrontCar(cars) {
    let best = null;
    let bestDist = Infinity;
    for (let other of cars) {
      if (other === this) continue;

      if (this.dir > 0 && other.x > this.x) {
        const d = other.x - this.x;
        if (d < bestDist) {
          bestDist = d;
          best = other;
        }
      }

      if (this.dir < 0 && other.x < this.x) {
        const d = this.x - other.x;
        if (d < bestDist) {
          bestDist = d;
          best = other;
        }
      }
    }
    return best;
  }

  contains(mx, my) {
    return mx > this.x - this.len * 0.55 &&
           mx < this.x + this.len * 0.55 &&
           my > this.y - this.h * 0.52 &&
           my < this.y + this.h * 0.52;
  }

  display() {
    push();
    translate(this.x, this.y + sin(frameCount * 0.04 + this.bobPhase) * 0.35);

    const facing = this.dir;
    const blink = sin(frameCount * 0.34 + this.blinkPhase) > 0;
    const wheelY = this.h * 0.22;
    const bodyH = this.h * 0.38;
    const cabH = this.type === "van" ? this.h * 0.26 : this.h * 0.24;
    const cabW = this.type === "van" ? this.len * 0.52 : this.type === "suv" ? this.len * 0.5 : this.len * 0.45;

    noStroke();

    fill(0, 0, 0, 40);
    ellipse(0, this.h * 0.3, this.len * 0.92, this.h * 0.42);

    fill(255, 180, 80, 9 + this.hover * 12);
    ellipse(0, this.h * 0.22, this.len * (1.03 + this.hover * 0.05), this.h * 0.5);

    fill(this.body);
    rectMode(CENTER);
    rect(0, 0, this.len * 0.92, bodyH, 10);

    if (this.type === "sedan") {
      beginShape();
      vertex(-cabW * 0.62, -bodyH * 0.04);
      vertex(-cabW * 0.38, -cabH * 0.92);
      vertex(cabW * 0.28, -cabH * 0.92);
      vertex(cabW * 0.56, -bodyH * 0.04);
      vertex(cabW * 0.45, cabH * 0.16);
      vertex(-cabW * 0.56, cabH * 0.16);
      endShape(CLOSE);
    } else if (this.type === "suv") {
      beginShape();
      vertex(-cabW * 0.62, -bodyH * 0.06);
      vertex(-cabW * 0.55, -cabH * 1.0);
      vertex(cabW * 0.48, -cabH * 1.0);
      vertex(cabW * 0.62, -bodyH * 0.08);
      vertex(cabW * 0.5, cabH * 0.18);
      vertex(-cabW * 0.58, cabH * 0.18);
      endShape(CLOSE);
    } else {
      beginShape();
      vertex(-cabW * 0.66, -bodyH * 0.06);
      vertex(-cabW * 0.66, -cabH * 0.98);
      vertex(cabW * 0.56, -cabH * 0.98);
      vertex(cabW * 0.66, -bodyH * 0.06);
      vertex(cabW * 0.55, cabH * 0.18);
      vertex(-cabW * 0.6, cabH * 0.18);
      endShape(CLOSE);
    }

    fill(this.roof);
    if (this.type === "van") {
      rect(0, -cabH * 0.42, cabW * 1.16, cabH * 0.9, 7);
    } else {
      rect(-this.len * 0.02, -cabH * 0.36, cabW * 1.02, cabH * 0.8, 7);
    }

    fill(this.windowColor);
    if (this.type === "sedan") {
      drawWindow(-cabW * 0.19, -cabH * 0.36, cabW * 0.28, cabH * 0.48, 4);
      drawWindow(cabW * 0.12, -cabH * 0.36, cabW * 0.25, cabH * 0.48, 4);
    } else if (this.type === "suv") {
      drawWindow(-cabW * 0.23, -cabH * 0.34, cabW * 0.25, cabH * 0.48, 3);
      drawWindow(0, -cabH * 0.34, cabW * 0.24, cabH * 0.48, 3);
      drawWindow(cabW * 0.24, -cabH * 0.34, cabW * 0.18, cabH * 0.48, 3);
    } else {
      drawWindow(-cabW * 0.26, -cabH * 0.34, cabW * 0.26, cabH * 0.5, 3);
      drawWindow(0, -cabH * 0.34, cabW * 0.24, cabH * 0.5, 3);
      drawWindow(cabW * 0.26, -cabH * 0.34, cabW * 0.22, cabH * 0.5, 3);
    }

    fill(255, 255, 255, 70);
    rect(-this.len * 0.06, -cabH * 0.52, cabW * 0.88, 2, 1);

    fill(this.trim);
    rect(0, bodyH * 0.02, this.len * 0.76, 3, 2);

    fill(40, 42, 46);
    rect(-this.len * 0.27, wheelY, this.len * 0.12, this.h * 0.16, 5);
    rect(this.len * 0.27, wheelY, this.len * 0.12, this.h * 0.16, 5);

    fill(25, 25, 28);
    circle(-this.len * 0.28, wheelY + 2, this.h * 0.28);
    circle(this.len * 0.28, wheelY + 2, this.h * 0.28);

    fill(88, 90, 95);
    circle(-this.len * 0.28, wheelY + 2, this.h * 0.14);
    circle(this.len * 0.28, wheelY + 2, this.h * 0.14);

    const headX = this.len * 0.47 * facing;
    const rearX = -this.len * 0.47 * facing;

    fill(248, 245, 215);
    rect(headX, -this.h * 0.01, this.len * 0.03, this.h * 0.09, 2);

    fill(222, 25, 30);
    rect(rearX, -this.h * 0.01, this.len * 0.03, this.h * 0.1, 2);

    fill(255, 245, 190, 15);
    ellipse(headX + facing * 16, 0, this.len * 0.18, this.h * 0.18);

    fill(255, 40, 40, 10);
    ellipse(rearX - facing * 14, 0, this.len * 0.25, this.h * 0.16);

    if (this.hazardActive && blink) {
      fill(255, 180, 35);
      rect(this.len * 0.39, -this.h * 0.015, this.len * 0.03, this.h * 0.09, 2);
      rect(-this.len * 0.39, -this.h * 0.015, this.len * 0.03, this.h * 0.09, 2);

      fill(255, 180, 35, 24);
      ellipse(this.len * 0.39, 0, this.len * 0.15, this.h * 0.18);
      ellipse(-this.len * 0.39, 0, this.len * 0.15, this.h * 0.18);
    }

    pop();
  }
}

function drawWindow(x, y, w, h, r) {
  rect(x, y, w, h, r);
}

function randomCarPalette() {
  const palettes = [
    {
      body: color(214, 42, 42),
      roof: color(165, 28, 28),
      trim: color(230, 230, 235)
    },
    {
      body: color(25, 92, 182),
      roof: color(19, 70, 138),
      trim: color(225, 228, 235)
    },
    {
      body: color(230, 198, 64),
      roof: color(184, 152, 42),
      trim: color(240, 240, 230)
    },
    {
      body: color(58, 145, 88),
      roof: color(42, 112, 66),
      trim: color(225, 232, 226)
    },
    {
      body: color(235, 236, 238),
      roof: color(185, 188, 193),
      trim: color(92, 96, 102)
    },
    {
      body: color(42, 42, 48),
      roof: color(18, 18, 22),
      trim: color(205, 205, 210)
    },
    {
      body: color(122, 122, 130),
      roof: color(92, 92, 100),
      trim: color(220, 220, 225)
    },
    {
      body: color(165, 70, 34),
      roof: color(118, 48, 23),
      trim: color(235, 228, 220)
    }
  ];
  return random(palettes);
}