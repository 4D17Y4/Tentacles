const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

console.log("linked");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const constants = {
  width: canvas.width,
  height: canvas.height,
  nsegments: 30,
  segLength: 10,
};

class Segment {
  constructor(x, y, length, angle = 0) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.x2 = x + length * Math.cos(angle);
    this.y2 = y + length * Math.sin(angle);
    this.next = null;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  }

  moveTo(newx, newy) {
    this.x2 = newx;
    this.y2 = newy;
    let theta = Math.atan2(this.y2 - this.y, this.x2 - this.x);
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
  draw = () => this.drawLimb(this.seg);

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

  drawLimb(nseg) {
    if (nseg) {
      nseg.draw();
      this.drawLimb(nseg.next);
    }
  }
}

function drawLoop(loop) {
  for (let i = 0; i < loop.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(loop[i][0], loop[i][1]);
    ctx.lineTo(loop[i + 1][0], loop[i + 1][1]);
    ctx.stroke();
  }
  if (true) {
    ctx.beginPath();
    ctx.moveTo(loop[loop.length - 1][0], loop[loop.length - 1][1]);
    ctx.lineTo(loop[0][0], loop[0][1]);
    ctx.stroke();
  }
}

var limbs = [];
limbs.push(
  new Limb(constants.nsegments, constants.width / 2, constants.height / 2)
);

var sections = 100;
var radius = 100;
for (let i = 0; i < sections; i++) {
  var angle = (1.0 / sections) * 2 * Math.PI * i;
  var x = constants.width / 2 + radius * Math.cos(angle);
  var y = constants.height / 2 + radius * Math.sin(angle);
  limbs.push(new Limb(constants.nsegments, x, y));
}

var avail = true;

document.addEventListener("mousemove", (e) => {
  if (avail) {
    avail = false;
    ctx.clearRect(0, 0, constants.width, constants.height);
    var limbToFollow = limbs[0];

    let fixedx = limbToFollow.seg.x;
    let fixedy = limbToFollow.seg.y;
    limbToFollow.moveTo(e.clientX, e.clientY);
    limbToFollow.shiftTo(fixedx, fixedy);

    let followPoint = limbToFollow.getEnd();
    limbs.forEach((limb) => {
      if (limb != limbToFollow) {
        let fixedx = limb.seg.x;
        let fixedy = limb.seg.y;
        limb.moveTo(followPoint.x, followPoint.y);
        limb.shiftTo(fixedx, fixedy);
        limb.draw();
      }
    });

    var tempSegs = limbs.map((limb) => limb.seg);
    tempSegs.splice(0, 1);
    while (tempSegs[0]) {
      let loop = [];
      for (let i = 0; i < tempSegs.length; i++) {
        let temp = tempSegs[i];
        loop.push([temp.x, temp.y]);
        tempSegs[i] = tempSegs[i].next;
      }
      drawLoop(loop);
    }
    avail = true;
  }
});
