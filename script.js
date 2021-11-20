const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

console.log("linked");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const constants = {
  width: canvas.width,
  height: canvas.height,
  nsegments: 100,
  segLength: 15,
  baseRadius: 50,
  circleSegments: 15,
  maxSpeed: 10,
  numLimbs: 3,
};

var baseRadius = constants.baseRadius;

class Segment {
  constructor(x, y, length, angle = 0) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.angle = angle;
    this.x2 = x + length * Math.cos(angle);
    this.y2 = y + length * Math.sin(angle);
    this.next = null;
  }

  drawLine(pointA, pointB) {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.stroke();
  }

  draw(segNo) {
    var outerRadius = baseRadius;
    baseRadius = ((segNo - 1) * baseRadius * 1.0) / segNo;
    var innerRadius = baseRadius;

    var pointA = { x: this.x + outerRadius, y: this.y };
    var pointB = { x: this.x2 + innerRadius, y: this.y2 };
    this.drawLine(pointA, pointB);
    for (let i = 1; i < constants.circleSegments; i++) {
      let pointA2 = {
        x:
          this.x +
          outerRadius *
            Math.cos(i * ((2 * Math.PI) / constants.circleSegments)),
        y:
          this.y +
          outerRadius *
            Math.sin(i * ((2 * Math.PI) / constants.circleSegments)),
      };
      let pointB2 = {
        x:
          this.x2 +
          innerRadius *
            Math.cos(i * ((2 * Math.PI) / constants.circleSegments)),
        y:
          this.y2 +
          innerRadius *
            Math.sin(i * ((2 * Math.PI) / constants.circleSegments)),
      };
      this.drawLine(pointB, pointB2);
      this.drawLine(pointA2, pointB2);
      pointA = pointA2;
      pointB = pointB2;
    }
    // this.drawLine(pointA, { x: this.x + outerRadius, y: this.y });
    this.drawLine(pointB, { x: this.x2 + innerRadius, y: this.y2 });
  }

  moveTo(newx, newy) {
    this.x2 = newx;
    this.y2 = newy;
    let theta = Math.atan2(this.y2 - this.y, this.x2 - this.x);
    this.angle = theta;
    this.x = this.x2 - this.length * Math.cos(theta);
    this.y = this.y2 - this.length * Math.sin(theta);
  }

  shift(delx, dely) {
    this.x += delx;
    this.y += dely;
    this.x2 += delx;
    this.y2 += dely;
  }
}

class Limb {
  constructor(count, orginx, originy) {
    console.log(count, orginx, originy);
    this.seg = this.create(count, orginx, originy);
  }

  moveTo = (endx, endy) => this.moveLimb(this.seg, endx, endy);
  shiftTo = (endx, endy) => {
    this.shiftLimb(this.seg, endx - this.seg.x, endy - this.seg.y);
  };
  draw = () => this.drawLimb(this.seg, constants.nsegments);

  getEnd() {
    var temp = this.seg;
    while (temp.next) {
      temp = temp.next;
    }
    return { x: temp.x2, y: temp.y2 };
  }

  create(count, endx, endy) {
    if (count == 0) {
      return null;
    }
    let nseg = new Segment(endx, endy, constants.segLength);
    nseg.next = this.create(count - 1, nseg.x2, nseg.y2);
    return nseg;
  }

  moveLimb(nseg, endx, endy) {
    if (nseg) {
      let movedLimb = this.moveLimb(nseg.next, endx, endy);
      if (movedLimb) {
        nseg.moveTo(movedLimb.x, movedLimb.y);
      } else {
        nseg.moveTo(endx, endy);
      }
    }
    return nseg;
  }

  shiftLimb(nseg, delx, dely) {
    if (nseg) {
      this.shiftLimb(nseg.next, delx, dely);
      nseg.shift(delx, dely);
    }
  }

  drawLimb(nseg, n) {
    if (nseg) {
      nseg.draw(n);
      this.drawLimb(nseg.next, --n);
    }
  }

  updateAndDraw(x, y) {
    var constx = this.seg.x;
    var consty = this.seg.y;
    this.moveTo(x, y);
    this.shiftTo(constx, consty);
    baseRadius = constants.baseRadius;
    this.draw();
  }
}

class RandomMovingLimb {
  constructor(limb) {
    this.limb = limb;
    this.curx = Math.random() * constants.width;
    this.cury = Math.random() * constants.height;
    this.direction = Math.random() * 2 * Math.PI;
  }

  randomMotion() {
    if (Math.random() > 0.9) {
      if (Math.random() > 0.5) {
        this.direction += (Math.random() * Math.PI) / 4;
      } else {
        this.direction -= (Math.random() * Math.PI) / 4;
      }
    }
    var randomSpeed = Math.random() * constants.maxSpeed;
    var newx = this.curx + randomSpeed * Math.cos(this.direction);
    var newy = this.cury + randomSpeed * Math.sin(this.direction);

    if (newx < -2 * constants.baseRadius) {
      newx = -2 * constants.baseRadius;
      this.direction = Math.PI - this.direction;
    } else if (newx > constants.width + 2 * constants.baseRadius) {
      newx = constants.width + 2 * constants.baseRadius;
      this.direction = Math.PI - this.direction;
    }
    if (newy < -2 * constants.baseRadius) {
      newy = -2 * constants.baseRadius;
      this.direction = -this.direction;
    } else if (newy > constants.height + 2 * constants.baseRadius) {
      newy = constants.height + 2 * constants.baseRadius;
      this.direction = -this.direction;
    }
    this.limb.updateAndDraw(newx, newy);
    this.curx = newx;
    this.cury = newy;
  }
}

var limbs = [];

for (let i = 0; i < constants.numLimbs; i++) {
  limbs.push(
    new RandomMovingLimb(
      new Limb(constants.nsegments, -constants.baseRadius, constants.height / 2)
    )
  );
}

function animate() {
  ctx.clearRect(0, 0, constants.width, constants.height);
  for (let i = 0; i < constants.numLimbs; i++) {
    limbs[i].randomMotion();
  }
  requestAnimationFrame(animate);
}

animate();

// document.addEventListener("mousemove", (e) => {
//   if (avail) {
//     avail = false;
//     ctx.clearRect(0, 0, constants.width, constants.height);
//     limb1.updateAndDraw(e.clientX, e.clientY);
//     limb2.updateAndDraw(e.clientX, e.clientY);
//     avail = true;
//   }
// });
