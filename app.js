/******************************************************************************/
//                                Constants
/******************************************************************************/
const WIDTH               = 900;
const HEIGHT              = 500;
const MAXSPEED            = 1;
const NUMBOIDS            = 200;
const BOIDRADIUS          = 5;
const VIEWRADIUS          = BOIDRADIUS + 40;
const VIEWRADIUSSQUARED   = VIEWRADIUS * VIEWRADIUS;
const MAXFORCE            = 0.1;
const MASS                = 1;

/******************************************************************************/
//                              Boid Class
/******************************************************************************/
function Boid(newX, newY) {
  this.position = createVector(newX, newY);
  this.velocity = createVector(0, 0);
  this.acceleration = createVector(0, 0);
  this.mass = MASS;
}

Boid.prototype.update = function() {
  this.position.add(this.velocity);
  this.velocity.add(this.acceleration);
  this.acceleration.setMag(0);
  this.limit();
}

Boid.prototype.show = function() {
  noFill();
  stroke(255);
  circle(this.position.x, this.position.y, BOIDRADIUS);
  circle(this.position.x + WIDTH, this.position.y, BOIDRADIUS);
  circle(this.position.x - WIDTH, this.position.y, BOIDRADIUS);
  circle(this.position.x, this.position.y + HEIGHT, BOIDRADIUS);
  circle(this.position.x, this.position.y - HEIGHT, BOIDRADIUS);
}

Boid.prototype.limit = function() {
  if(this.position.x > WIDTH) {
    this.position.x = 0;
    // this.velocity.x *= -1;
  }
  if(this.position.x < 0) {
    this.position.x = WIDTH;
    // this.velocity.x *= -1;
  }
  if(this.position.y > HEIGHT) {
    this.position.y = 0;
    // this.velocity.y *= -1;
  }
  if(this.position.y < 0) {
    this.position.y = HEIGHT;
    // this.velocity.y *= -1;
  }
  this.velocity.limit(MAXSPEED);
}

Boid.prototype.addForce = function(force) {
  this.acceleration.add(force);
}

Boid.prototype.allign = function(boids) {
  var force = createVector(0, 0);
  var numBoidsInView = 0;

  for(var boid of boids) {
    let diffSquared = this.calculateDistanceSquared(boid);
    if(diffSquared < VIEWRADIUSSQUARED && this !== boid) {
      ++numBoidsInView;
      force.add(boid.velocity);
    }
  }
  if(numBoidsInView > 0) {
    force.div(numBoidsInView);
    force.setMag(MAXSPEED);
    force.sub(this.velocity);
    force.limit(MAXFORCE);
    this.addForce(force);
  }
}

Boid.prototype.cohesion = function(boids) {
  var force = createVector(0, 0);
  var numBoidsInView = 0;

  for(var boid of boids) {
    let diffSquared = this.calculateDistanceSquared(boid);
    if(diffSquared < VIEWRADIUSSQUARED && this !== boid) {
      ++numBoidsInView;
      force.add(boid.position);
    }
  }
  if(numBoidsInView > 0) {
    force.div(numBoidsInView);
    force.sub(this.position);
    force.setMag(MAXSPEED);
    force.sub(this.velocity);
    force.limit(MAXFORCE);
    this.addForce(force);
  }
}

Boid.prototype.seperation = function(boids) {
  var force = createVector(0, 0);
  var numBoidsInView = 0;

  for(var boid of boids) {
    let diffSquared = this.calculateDistanceSquared(boid);
    if(diffSquared < VIEWRADIUSSQUARED && this !== boid) {
      ++numBoidsInView;
      let diff = p5.Vector.sub(this.position, boid.position);
      diff.div(diffSquared);
      force.add(diff);
    }
  }
  if(numBoidsInView > 0) {
    force.div(numBoidsInView);
    force.setMag(MAXSPEED);
    force.sub(this.velocity);
    force.limit(MAXFORCE);
    this.addForce(force);
  }
}

// Boid.prototype.collisions = function(boids) {
//   for(var boid of boids) {
//     let diffSquared = this.calculateDistanceSquared(boid);
//     if(diffSquared <= BOIDRADIUS * BOIDRADIUS * 4 && this !== boid) {
//       let vel = p5.Vector.sub(this.velocity, p5.Vector.mult(p5.Vector.sub(this.position, boid.position), (2 * boid.mass / (this.mass + boid.mass)) *
//             (p5.Vector.dot(p5.Vector.sub(this.velocity, boid.velocity), p5.Vector.sub(this.position, boid.position)) /
//             p5.Vector.sub(this.position, boid.position).magSq())));
//       boid.velocity = p5.Vector.sub(boid.velocity, p5.Vector.mult(p5.Vector.sub(boid.position, this.position), (2 * this.mass / (boid.mass + this.mass)) *
//             (p5.Vector.dot(p5.Vector.sub(boid.velocity, this.velocity), p5.Vector.sub(boid.position, this.position)) /
//             p5.Vector.sub(boid.position, this.position).magSq())));
//       this.velocity = vel;
//     }
//   }
// }

Boid.prototype.calculateDistanceSquared = function(boid) {
  let differenceSquared = sq(this.position.x - boid.position.x) + sq(this.position.y - boid.position.y);
  let differenceSquaredTop = sq(this.position.x - boid.position.x) + sq(this.position.y - boid.position.y + HEIGHT);
  let differenceSquaredBottom = sq(this.position.x - boid.position.x) + sq(this.position.y - boid.position.y - HEIGHT);
  let differenceSquaredLeft = sq(this.position.x - boid.position.x - WIDTH) + sq(this.position.y - boid.position.y);
  let differenceSquaredRight = sq(this.position.x - boid.position.x + WIDTH) + sq(this.position.y - boid.position.y);
  if(differenceSquaredTop < differenceSquared) {
    differenceSquared = differenceSquaredTop;
  }
  if(differenceSquaredBottom < differenceSquared) {
    differenceSquared = differenceSquaredBottom;
  }
  if(differenceSquaredLeft < differenceSquared) {
    differenceSquared = differenceSquaredLeft;
  }
  if(differenceSquaredRight < differenceSquared) {
    differenceSquared = differenceSquaredRight;
  }

  return differenceSquared;
}


/******************************************************************************/
//                              Main Loop
/******************************************************************************/
var boids = [];

function setup() {
  let canvas = createCanvas(WIDTH, HEIGHT);
  // let colsWidth = WIDTH / sqrt(NUMBOIDS);
  canvas.parent('canvas');
  for(var i = 0; i < NUMBOIDS; i++) {
    // boids.push(new Boid((i%sqrt(NUMBOIDS)) * colsWidth, (i/sqrt(NUMBOIDS)) * colsWidth));
    boids.push(new Boid(random(WIDTH - BOIDRADIUS * 2) + BOIDRADIUS, random(HEIGHT - BOIDRADIUS * 2) + BOIDRADIUS));
    boids[i].addForce(createVector(random(10)-5, random(10)-5));
  }
}

function draw() {
  background(64);
  for(var boid of boids) {
    boid.allign(boids);
    boid.cohesion(boids);
    boid.seperation(boids);
    // boid.collisions(boids);
    boid.update();
    boid.show();
  }
}
