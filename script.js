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

var limbs = [];

for (let i = 0; i < constants.width; i += 100) {
  limbs.push(new Limb(Math.floor(constants.nsegments), i, 0));
  limbs.push(new Limb(Math.floor(constants.nsegments), i, constants.height));
}

for (let i = 0; i < constants.height; i += 100) {
  limbs.push(new Limb(Math.floor(constants.nsegments), 0, i));
  limbs.push(new Limb(Math.floor(constants.nsegments), constants.width, i));
}

document.addEventListener("mousemove", (e) => {
  ctx.clearRect(0, 0, constants.width, constants.height);
  limbs.forEach((limb) => {
    for (let i = 0; i < 50; i++) {
      var fixedx = limb.seg.x;
      var fixedy = limb.seg.y;
      limb.moveTo(e.clientX, e.clientY);
      limb.shiftTo(fixedx, fixedy);
    }
    limb.draw();
  });
});
