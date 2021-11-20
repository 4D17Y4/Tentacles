const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

console.log("linked");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circleSegments = 12;
const noOfAdditionalLimbs = 2;
const noOfSegmentsToSegLengthRatio = 10;

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
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.stroke();
  }

  draw(segNo, baseRadius) {
    var outerRadius = baseRadius;
    baseRadius = ((segNo - 1) * baseRadius * 1.0) / segNo;
    var innerRadius = baseRadius;

    var pointA = { x: this.x + outerRadius, y: this.y };
    var pointB = { x: this.x2 + innerRadius, y: this.y2 };
    this.drawLine(pointA, pointB);
    for (let i = 1; i < circleSegments; i++) {
      let pointA2 = {
        x:
          this.x + outerRadius * Math.cos(i * ((2 * Math.PI) / circleSegments)),
        y:
          this.y + outerRadius * Math.sin(i * ((2 * Math.PI) / circleSegments)),
      };
      let pointB2 = {
        x:
          this.x2 +
          innerRadius * Math.cos(i * ((2 * Math.PI) / circleSegments)),
        y:
          this.y2 +
          innerRadius * Math.sin(i * ((2 * Math.PI) / circleSegments)),
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
  constructor(noOfSegments, orginx, originy, segLength, baseRadius) {
    this.noOfSegments = noOfSegments;
    this.segLength = segLength;
    this.baseRadius = baseRadius;
    this.seg = this.create(
      noOfSegments,
      orginx,
      originy,
      Math.random() * 2 * Math.PI
    );
  }

  moveTo = (endx, endy) => this.moveLimb(this.seg, endx, endy);
  shiftTo = (endx, endy) => {
    this.shiftLimb(this.seg, endx - this.seg.x, endy - this.seg.y);
  };
  draw = () => {
    // console.log(this);
    this.drawLimb(this.seg, this.noOfSegments, this.baseRadius);
  };

  getEnd() {
    var temp = this.seg;
    while (temp.next) {
      temp = temp.next;
    }
    return { x: temp.x2, y: temp.y2 };
  }

  create(count, endx, endy, angle = 0) {
    if (count == 0) {
      return null;
    }
    let nseg = new Segment(endx, endy, this.segLength, angle);
    var newAngle = angle;
    if (Math.random() > 0.9)
      if (Math.random() > 0.5) {
        newAngle += (Math.random() * Math.PI) / 10;
      } else {
        newAngle -= (Math.random() * Math.PI) / 10;
      }
    nseg.next = this.create(count - 1, nseg.x2, nseg.y2, newAngle);
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

  drawLimb(nseg, n, baseRadius) {
    if (nseg) {
      nseg.draw(n, baseRadius);
      baseRadius = ((n - 1) * baseRadius * 1.0) / n;
      this.drawLimb(nseg.next, --n, baseRadius);
    }
  }

  updateAndDraw(x, y) {
    for (let i = 0; i < 1; i++) {
      var constx = this.seg.x;
      var consty = this.seg.y;
      this.moveTo(x, y);
      this.shiftTo(constx, consty);
    }
    this.draw();
  }
}

class RandomMovingLimb {
  constructor(x, y) {
    var calcLen = Math.ceil(Math.sqrt((canvas.width + 250) / 10));

    this.constants = {
      width: canvas.width,
      height: canvas.height,
      nsegments: Math.ceil(((canvas.width + 250) * 1.0) / calcLen),
      segLength: calcLen,
      baseRadius: 65,
      maxSpeed: 0.5,
      numLimbs: 3,
    };

    this.limb = new Limb(
      this.constants.nsegments,
      x,
      y,
      this.constants.segLength,
      this.constants.baseRadius
    );
    this.curx = Math.random() * this.constants.width;
    this.cury = Math.random() * this.constants.height;
    this.direction = Math.random() * 2 * Math.PI;
  }

  // crappy random function, TODO : change
  randomMotion() {
    if (Math.random() > 0.75) {
      if (Math.random() > 0.5) {
        this.direction += (Math.random() * Math.PI) / 10;
      } else {
        this.direction -= (Math.random() * Math.PI) / 10;
      }
    }
    var randomSpeed = 7 + Math.random() * this.constants.maxSpeed;

    var newx = this.curx + randomSpeed * Math.cos(this.direction);
    var newy = this.cury + randomSpeed * Math.sin(this.direction);

    if (newx < -2 * this.constants.baseRadius) {
      newx = -2 * this.constants.baseRadius;
      this.direction = Math.PI - this.direction;
    } else if (newx > this.constants.width + 2 * this.constants.baseRadius) {
      newx = this.constants.width + 2 * this.constants.baseRadius;
      this.direction = Math.PI - this.direction;
    }
    if (newy < -2 * this.constants.baseRadius) {
      newy = -2 * this.constants.baseRadius;
      this.direction = -this.direction;
    } else if (newy > this.constants.height + 2 * this.constants.baseRadius) {
      newy = this.constants.height + 2 * this.constants.baseRadius;
      this.direction = -this.direction;
    }
    this.limb.updateAndDraw(newx, newy);
    this.curx = newx;
    this.cury = newy;
  }
}

var limbs = [];

var limbLength = Math.floor(Math.sqrt(canvas.width / 10));

var limbToCursor = new Limb(
  Math.ceil((canvas.width * 1.0) / limbLength),
  -60,
  canvas.height / 2,
  limbLength,
  60
);
limbToCursor.updateAndDraw(canvas.width / 2, 0);

for (let i = 0; i < noOfAdditionalLimbs / 2; i++) {
  limbs.push(
    new RandomMovingLimb(
      -80,
      canvas.height / 2 - (0.5 + Math.random() / 2) * 100
    )
  );
  limbs.push(
    new RandomMovingLimb(
      -80,
      canvas.height / 2 + (0.5 + Math.random() / 2) * 100
    )
  );
}

var mouseX = canvas.width / 2;
var mouseY = canvas.height / 2;

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < noOfAdditionalLimbs; i++) {
    limbs[i].randomMotion();
  }
  if (mouseX && mouseY) limbToCursor.updateAndDraw(mouseX, mouseY);
}

animate();

document.addEventListener("mousemove", (e) => {
  if (e.clientX && e.clientY) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }
});
