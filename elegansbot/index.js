import init, { Universe, memory } from "./polygon.js";

function mod(a,b) {
  return ((a % b) + b) % b;
}

function mixColor(color1, color2, amount) {
    const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
    const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
    
    const r = Math.round(r1 + (r2 - r1) * amount);
    const g = Math.round(g1 + (g2 - g1) * amount);
    const b = Math.round(b1 + (b2 - b1) * amount);

    return `rgb(${r}, ${g}, ${b})`;
}

class App {
  constructor() {
    // Variables and WASM-connections
    this.universe = Universe.new(1/30, 1); // input : fps(frame per sec) , behavior(crawl:1, swim:2)
    this.n_point = this.universe.n_point();
    let pointer;
    pointer = this.universe.x_skin();
    this.x_point = new Float64Array(memory.buffer, pointer, this.n_point); // n_point대신에 undefined를 써도 되긴함.
    pointer = this.universe.y_skin();
    this.y_point = new Float64Array(memory.buffer, pointer, this.n_point);
    
    this.n_worms = 1
    for (let i = 0; i < this.n_worms-1; i++){
      this.add_worm(1, Math.random()*2*Math.PI, 0, 0);
    }

    this.grid_cell_size = 20;

    // Ratio between screen and the worm size.
    this.divider = 4.2;

    // Graphics
    this.canvas = document.getElementById("canvas-background");
    this.ctx = this.canvas.getContext('2d');
    this.pixelRatio = 0.992;
    window.addEventListener('resize', this.resize.bind(this), false);
    this.resize();
    window.requestAnimationFrame(this.animate.bind(this));

    this.isDown = false;
    this.mouseX = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.r_b = 1;
    this.behavior = 1;

    document.addEventListener('pointerdown', this.onDown.bind(this), false);
    document.addEventListener('pointermove', this.onMove.bind(this), false);
    document.addEventListener('pointerup', this.onUp.bind(this), false);
    document.addEventListener("touchstart", this.onTouchStart.bind(this), false);
    document.addEventListener("touchmove", this.onTouchMove.bind(this), false);
    document.addEventListener("touchend", this.onTouchEnd.bind(this), false);
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;
    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.piexelRatio, this.pixelRatio);
  }

  animate(t) {
    this.r = this.stageWidth < this.stageHeight ? this.stageWidth/this.divider : this.stageHeight/this.divider;
    // console.log(this.universe.t()); // for finding out FPS
    window.requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
    this.ctx.fillStyle = mixColor("rgb(200, 230, 255)", "rgb(255, 255, 230)", this.r_b);
    this.ctx.fillRect(0, 0, this.stageWidth, this.stageHeight);

    this.universe.update();

    this.drawGrid();
    let n_skin = 52;
    for (let i = 0; i < this.universe.number_worms(); i++) {
      let offset = i * n_skin;
      let x_skin = this.x_point.slice(0 +offset, n_skin +offset);
      let y_skin = this.y_point.slice(0 +offset, n_skin +offset);
      this.drawWorm(n_skin, x_skin, y_skin, i);
    }
    this.drawslider1();
    this.drawslider2();

  }

  set_r_b() {
    if (this.isDown == true) {
      if (0 < this.offsetX && this.offsetX < 300
        && 0 < this.offsetY && this.offsetY < 60) {
        if (this.mouseX < 30) {
          this.r_b = 0;
        }
        else if (270 < this.mouseX) {
          this.r_b = 1;
        }
        else {
          this.r_b = (this.mouseX -30) /240;
        }
        app.universe.set_worms_r_b(this.r_b)
      }
    }
  }

  set_behavior() {
    if (this.isDown == true) {
      if (0+320 < this.offsetX && this.offsetX < 300+320
        && 0 < this.offsetY && this.offsetY < 60) {
        if (this.mouseX < 30+320) {
          this.behavior = 0;
        }
        else if (270+320 < this.mouseX) {
          this.behavior = 1;
        }
        else {
          this.behavior = (this.mouseX -30-320) /240;
        }
        app.universe.set_worms_behavior(this.behavior)
      }
    }
  }

  onDown(e) {
    this.isDown = true;
    this.mouseX = e.clientX;
    this.offsetX = e.clientX;
    this.offsetY = e.clientY;
    this.set_r_b();
    this.set_behavior();

    if (this.stageWidth * 0.9 < this.offsetX
      && this.offsetY < this.stageHeight * 0.1) {
      let x_add = (this.offsetX -this.stageWidth/2)/this.r;
      let y_add = -(this.offsetY -this.stageHeight/2)/this.r;
      this.add_worm(1, Math.random()*2*Math.PI, x_add, y_add);
    }

    // let x_add = (this.offsetX -this.stageWidth/2)/this.r;
    // let y_add = -(this.offsetY -this.stageHeight/2)/this.r;
    // this.add_worm(1, Math.random()*2*Math.PI, x_add, y_add);
  //   let x_mousePos = e.clientX;
  //   let y_mousePos = e.clientY;
  //   console.log(y_mousePos);
  //   let x_add = (x_mousePos -this.stageWidth/2)/this.r;
  //   let y_add = -(y_mousePos -this.stageHeight/2)/this.r;
  //   this.add_worm(1, Math.random()*2*Math.PI, x_add, y_add);
  }

  onMove(e) {
    if (this.isDown) {
      this.mouseX = e.clientX;
      this.set_r_b();
      this.set_behavior();
    }
  }

  onUp(e) {
    this.isDown = false;
  }

  onTouchStart(e) {
    var eTouch = e.changedTouches[0];
    this.isDown = true;
    this.mouseX = eTouch.clientX;
    this.offsetX = eTouch.clientX;
    this.offsetY = eTouch.clientY;
    this.set_r_b();
    this.set_behavior();

    // let x_mousePos = e.clientX;
    // let y_mousePos = e.clientY;
    // console.log(y_mousePos);
    // let x_add = (x_mousePos -this.stageWidth/2)/this.r;
    // let y_add = -(y_mousePos -this.stageHeight/2)/this.r;
    // this.add_worm(1, Math.random()*2*Math.PI, x_add, y_add);
  }

  onTouchMove(e) {
    if (this.isDown) {
      var eTouch = e.changedTouches[0];
      this.mouseX = eTouch.clientX;
      this.set_r_b();
      this.set_behavior();
    }
  }

  onTouchEnd(e) {
    this.isDown = false;
  }

  drawGrid() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#CCCCCC";
    let size = this.grid_cell_size;
    let width = Math.floor(this.stageWidth / size);
    let height = Math.floor(this.stageHeight / size);
  
    for (let i = 0; i <= width; i++) {
      this.ctx.moveTo(i * size, 0);
      this.ctx.lineTo(i * size, size * height);
    }
  
    for (let j = 0; j <= height; j++) {
      this.ctx.moveTo(0,            j * size);
      this.ctx.lineTo(size * width, j * size);
    }
  
    this.ctx.stroke(); 
  }

  drawslider1() {
    let gradient = this.ctx.createLinearGradient(0, 0, 300, 0);
    gradient.addColorStop(0.2, '#33F');   // Red at the start
    gradient.addColorStop(0.8, '#FF8'); // Yellow at the end
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 300, 60);

    this.ctx.font = '30px Arial';
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillText('Water', 10, 40);
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('Agar', 225, 40);

    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(30+240*this.r_b, 30, 20, 0, 2 * Math.PI, false);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFF';
    this.ctx.beginPath();
    this.ctx.arc(30+240*this.r_b, 30, 15, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }

  drawslider2() {
    let gradient = this.ctx.createLinearGradient(320, 0, 300+320, 0);
    gradient.addColorStop(0.2, '#7DF');   // Red at the start
    gradient.addColorStop(0.8, '#5FA'); // Yellow at the end
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(320, 0, 300, 60);

    this.ctx.font = '30px Arial';
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('Swim', 10+320, 40);
    this.ctx.fillText('Crawl', 215+320, 40);

    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(30+240*this.behavior+320, 30, 20, 0, 2 * Math.PI, false);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFF';
    this.ctx.beginPath();
    this.ctx.arc(30+240*this.behavior+320, 30, 15, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }

  drawWorm(n_skin, x_skin, y_skin, worm_index) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = "#" + mod(worm_index*833+15, 4096).toString(16).padStart(3,'0');
    // 833 = 3*256 + 4*16 + 1, 15 = "00F"

    let x_center = 0;
    let y_center = 0;
    for (let i = 0; i < n_skin; i++) {
      x_center += x_skin[i];
      y_center += y_skin[i];
    }
    x_center = (x_center/n_skin)*this.r + this.stageWidth/2;
    y_center = -(y_center/n_skin)*this.r + this.stageHeight/2;
    let stage_worm_ratio = 0.9/this.divider;
    let xr = this.stageWidth * stage_worm_ratio/2;
    let yr = this.stageHeight * stage_worm_ratio/2;
    let x_in_box = x_center + xr - mod(x_center + xr, this.stageWidth + 2*xr);
    let y_in_box = y_center + yr - mod(y_center + yr, this.stageHeight + 2*yr);
    let xp1, yp1, xp2, yp2, xp3, yp3;
    xp3 = x_skin[0]*this.r + this.stageWidth/2;
    yp3 = -y_skin[0]*this.r + this.stageHeight/2; // y is -y in javascript
    xp2 = x_skin[1]*this.r + this.stageWidth/2;
    yp2 = -y_skin[1]*this.r + this.stageHeight/2;
    xp3 -= x_in_box;
    yp3 -= y_in_box;
    xp2 -= x_in_box;
    yp2 -= y_in_box;

    xp1 = xp3;
    yp1 = yp3;
    this.ctx.moveTo((xp1+xp2)/2, (yp1+yp2)/2);
    let j;
    for (let i = 1; i < n_skin+2; i++) {
      j = i % n_skin;
      xp2 = x_skin[j]*this.r + this.stageWidth/2;
      yp2 = -y_skin[j]*this.r + this.stageHeight/2;
      xp2 -= x_in_box;
      yp2 -= y_in_box;

      this.ctx.quadraticCurveTo(xp1, yp1, (xp1+xp2)/2, (yp1+yp2)/2);
      xp1 = xp2;
      yp1 = yp2;
    }

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  add_worm(type, direction, xc, yc) {
    this.universe.add_worm(type, direction, xc, yc);
    this.n_point = this.universe.n_point();
    let pointer;
    pointer = this.universe.x_skin();
    this.x_point = new Float64Array(memory.buffer, pointer, this.n_point); // n_point대신에 undefined를 써도 되긴함.
    pointer = this.universe.y_skin();
    this.y_point = new Float64Array(memory.buffer, pointer, this.n_point);
  }
}

await init();
var app = new App();
