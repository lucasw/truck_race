// Copyright Lucas Walter 2013
// GNU GPL 3.0

var KEYCODE_CTRL = 74;
var KEYCODE_UP = 38;                
var KEYCODE_DOWN = 40;                
var KEYCODE_LEFT = 37;  
var KEYCODE_RIGHT = 39;        

var scale = 2;

var stage;
var wd;
var ht;

var tile_size;

var manifest;

document.onkeydown = handleKeyDown;

// x and y are in tile coords
function Feature(scale, tileW, x, y, name) {

  this.img = new createjs.Bitmap(loader.getResult(name));
  this.img.scaleX = scale;
  this.img.scaleY = scale;
  // place off-screen for now
  this.img.x = - tileW * 2;

  // this is a correction in pixels between the left hand
  // position of the bitmap and where it needs to be, useful
  // when a scaleX paremeter is -1, then the image is a width to the left 
  // of expected.
  this.x_offset = 0;
  this.x = x;
  this.y = y;

  this.scale = scale;
  this.tileW = tileW;
  
  this.img.y = (this.y + 1) * tileW;

  // x is in tile pixel coords (not screen pixel coords?)
  this.getHeight = function(x) {
    return 0;
  }
}

function ReverseJump(scale, tileW, x, y) {
     
  var that = new Feature(scale, tileW, x, y, "ramp");         
  that.img.scaleX = -that.img.scaleX;
  that.x_offset = tileW;
  that.getHeight = function(x) {
    return that.tileW - x;
  }
  
  return that;
}
// inherits doesn't work
//ReverseJump.inherits(Jump);//////

function Jump(scale, tileW, x, y) {
  var that = new Feature(scale, tileW, x, y, "ramp");         

  that.getHeight = function(x) {
    return x;
  }

  return that;
}
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function Level() {


//var level = {};
// level, TODO encapsulate
var mud;
var mud_img;
var ramp;

var level_x = 0;
var features;

this.getHeight = function(t_x, t_y) {
  var x = Math.floor(t_x / tile_size); 
  var y = Math.round(t_y / tile_size);
  //console.log("pos " + Math.round(t_x) + " " + t_y + ", " + x + " " + y);
  for (var i = 0; i < features.length; i++) {
    if ((x === features[i].x) && (y === features[i].y)) {
      // this assumes every feature is a jump with a slope of 1
      var height = features[i].getHeight(t_x - x * tile_size);
      //console.log("height " + height);
      return height;
    }
  }

  return 0;
}

var seed = 1;
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

this.init = function() {
  mud_img = loader.getResult("mud");
  //mud_img.scaleX = 4;
  //mud_img.scaleY = 4;
  mud = new createjs.Shape();
  mud.graphics.beginBitmapFill(mud_img).drawRect(-mud_img.width*scale, 0, 
      wd/scale + mud_img.width*scale*2, ht/scale);
  mud.scaleX = scale;
  mud.scaleY = scale;
  mud.tileW = mud_img.width * scale;
  tile_size = mud.tileW;

  stage.addChild(mud); 

  features = [];

  var level_length = 150;
  // start line
  for (var i = 1; i < 10; i++) {
    var feature = new Feature(scale, mud.tileW, 5, i, "checkers");
    features.push(feature);
    stage.addChild(feature.img);
  } 
  // finish line
  for (var i = 0; i < 10; i++) {
    var feature = new Feature(scale, mud.tileW, 5 + level_length, i, "checkers");
    features.push(feature);
    stage.addChild(feature.img);
  }

  // TODO instead load a bitmap or text file that specifies where features are
  for (var i = 0; i < 15; i++) {
    var x = Math.floor( 5 + random() * level_length);
    var y =  1 + i % 4; //Math.floor(Math.random() * 5 + 1);
    var jump = new Jump(scale, mud.tileW, x, y);
    features.push(jump);
    console.log("feature " + jump.x + " " + jump.y);
    stage.addChild(jump.img);
    
    var reverse_jump = new ReverseJump(scale, mud.tileW, x + 1, y);
    features.push(reverse_jump);
    console.log("feature reverse_jump " + reverse_jump.x + " " + reverse_jump.y);
    stage.addChild(reverse_jump.img);
  }
}

this.update = function() {
  // make the truck move to x in screen coordinates as it speeds up
  // This doesn't allow the vehicle to ever overtake the furthest
  // forward position in x onscreen before level catches up
  var mix = 0.04;
  truck.pvel = truck.getVel() * mix + truck.pvel * (1.0 - mix); 
  level_x += truck.pvel;
  // move this into truck update, have a set level_x function
  truck.px = (truck.getPos() - level_x) + min_px;
  
  for (var i = 0; i < cpu_trucks.length; i++) {
    cpu_trucks[i].px = cpu_trucks[i].getPos() - level_x + min_px;
  }

  //var deltaS = event.delta/1000;
  // dithered textures produce strobing effect at right velocities
  //mud.x = Math.round( ((mud.x - vel) % mud.tileW) / scale) * scale;// (mud.x - deltaS* (px - min_px)) & mud.tileW;
  mud.x = ( ((mud.x - truck.pvel) % mud.tileW));// (mud.x - deltaS* (px - min_px)) & mud.tileW;

  for (var i = 0; i < features.length; i++) {
    features[i].img.x = features[i].x * mud.tileW + features[i].x_offset - level_x;
  }
}


} // Level

var truck;

var cpu_trucks = [];

var min_px = 128;
var max_px = 512;

function Truck() {

// position on screen
this.px = min_px;
this.py = 128;
this.pvel = 0;


// includes the shadow
var truck_all;
// just the physical truck
var truck_body;

var truck;
var wheel_front;
var wheel_back;
var axle1;
var axle2;

// the height of the level at the front and back wheels
var level_front_height;
var level_back_height;

// screen resolution but level coordinates
var pos_x = 0;
var pos_y = 0;
// how high in air or on ramp
var pos_z = 0;

var vel_x = 0;
var vel_y = 0;
var vel_z = 0;
var max_vel_y = scale * 4;

var off_ground = false;

this.jump = function() {
  if (!off_ground) {
    //console.log("jump");
    vel_z = 3 * scale;
    off_ground = true;
  }
}

this.getVel = function() {
  return vel_x;
}

this.getPos = function() {
  return pos_x;
}

this.accelerate = function() {
  if (!off_ground)
    vel_x += 1;
}

this.brake = function() {
  if (!off_ground)
    vel_x -= 1;
}

this.turnLeft = function() {
  if (!off_ground)
    vel_y = - max_vel_y;
}

this.turnRight = function() {
  if (!off_ground)
    vel_y = max_vel_y;
}

this.init = function(truck_image, x, y) {
  
  pos_x = x;
  pos_y = y;

  truck_all = new createjs.Container();
  stage.addChild(truck_all);
  
  var shadow1 = new createjs.Bitmap(loader.getResult("shadow"));
  shadow1.scaleX = scale;
  shadow1.scaleY = scale;
  shadow1.x = 32 * scale;
  shadow1.y = 96;
  truck_all.addChild(shadow1);

  var shadow2 = new createjs.Bitmap(loader.getResult("shadow"));
  shadow2.scaleX = scale;
  shadow2.scaleY = scale;
  shadow2.x = 0;
  shadow2.y = 96;
  truck_all.addChild(shadow2);

  truck_body = new createjs.Container();
  truck_all.addChild(truck_body);
  //truck_body.regX = tile_size/2; 
  //truck_body.regY = tile_size/2; 
  //truck_body.x = truck_body.regX;
  //truck_body.y = tile_size; //truck_body.regY;

  truck = new createjs.Bitmap(loader.getResult(truck_image));
  truck.scaleX = scale;
  truck.scaleY = scale;
  truck_body.addChild(truck);

  axle1 = new createjs.Container();
  axle1.x = 24;
  axle1.y = 128;
  truck_body.addChild(axle1);
  
  wheel_front = new createjs.Bitmap(loader.getResult("wheel"));
  //var wheel_wd = wheel_front.width;
  wheel_front.scaleX = scale;
  wheel_front.scaleY = scale;
  wheel_front.regX = 12;
  wheel_front.regY = wheel_front.regX;
  //wheel_front.regY = wheel_wd/2;
  axle1.addChild(wheel_front);

  var axle2 = new createjs.Container();
  axle2.x = 106;
  axle2.y = axle1.y;
  truck_body.addChild(axle2);

  wheel_back = new createjs.Bitmap(loader.getResult("wheel"));
  wheel_back.scaleX = scale;
  wheel_back.scaleY = scale;
  wheel_back.regX = wheel_front.regX;
  wheel_back.regY = wheel_back.regX;
  axle2.addChild(wheel_back);

} // init

// if the car is a cpu use these
this.cpu_aggression = 0.4;
this.autoDrive = function() {
    if (Math.random() > 1.0 - this.cpu_aggression) {
      this.accelerate();
    }
    if (Math.random() > 0.98) {
      this.turnLeft();
    }
    if (Math.random() > 0.98) {
      this.turnRight();
    }
    if (Math.random() > 0.996) {
      this.brake();
    }
}

// Truck
this.update = function() {
  
  if (vel_x < -10) {
    vel_x = -10;
  }
  if (vel_x > 20) {
    vel_x = 20;
  }
  if (!off_ground) {
    vel_x *= 0.98;
  }
  pos_x += vel_x;

  pos_z += vel_z;
  if (pos_z <= Math.max(level_front_height, level_back_height)) {
    //if (vel_z < 0) {
    //  vel_z = -Math.round(vel_z/2);
    //}
    if (vel_z < 0) {
      vel_z = 0;
    }
    pos_z = Math.max(level_front_height, level_back_height);
    off_ground = false;
  } else {
    off_ground = true;
  }
  if (off_ground) {
    vel_z -= 0.025 * tile_size;
    //console.log(vel_z + " " + pos_z);
  }

  // TODO use wheel diameter (24 pixels, or get bounds)
  // pi*d * rotation/(2*pi) = pos_x
  // rotation = pos_x * 2 / d ?
  wheel_front.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 
  wheel_back.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 
 
  pos_y += vel_y;
  pos_y = Math.round(pos_y/scale) * scale;

  // complete turn when in new lane
  if (Math.round(pos_y/max_vel_y) % (tile_size/2 * scale/max_vel_y) == 0) {
    vel_y = 0;
  }

  if (pos_y < 0) {
    pos_y = 0;
  }
  if (pos_y > ht - tile_size * 3) {
    pos_y = ht - tile_size * 3;
  }
  
  this.py = pos_y;
 
  // TBD make wheel_front_offset_x and wheel_back_offset_x
  var wheel_back_offset_x = 12;
  var wheel_front_offset_x = scale * tile_size - 12;
  var wheel_offset_y = tile_size;

  // TBD why tile_size * 3?
  // TODO need a set of functions to convert between screen coordinates,
  // pixel coords, and tile coords
  var x_offset = tile_size * scale;
  var back_height = level.getHeight(pos_x + x_offset + wheel_back_offset_x,  pos_y);
  var front_height  = level.getHeight(pos_x + x_offset + wheel_front_offset_x, pos_y);
  var truck_length = wheel_back_offset_x - wheel_front_offset_x;
 
  var veh_diff = back_height - front_height;
  var pos_diff = Math.max(front_height - pos_z, back_height - pos_z);
  if (pos_diff > 20) {
    // bounce back into same lane first
    if (Math.abs(vel_y) > 0.001) {
      vel_y = -vel_y * 0.9;
    } else if (Math.abs(vel_x) > 0.001) {
        vel_x = -vel_x;
    } 
  } else if (pos_diff > 0) {
    vel_z += (pos_diff) * 0.2;
    //console.log("off ground " + vel_z + " " + pos_z + " " + front_height); 
  } 
  
  if (!off_ground) {
    vel_x += veh_diff * 0.005;
  }
  //var dz_front = front_height - level_front_height; 
  //var dz_back = back_height - level_back_height;
  

  level_back_height = back_height;
  level_front_height = front_height;
  //var height_diff = front_height - back_height;
  //var angle = Math.atan2(-height_diff, truck_length);
  //truck_body.rotation = angle * 180.0 / Math.PI;
  //if (!off_ground && (truck_height > 0)) {
  //  this.jump();
  //}
  
  //pos_z = Math.max(back_height, front_height); 
  
  // px is determined by the level update
  truck_all.x = this.px;
  truck_all.y = this.py;

  // we want the back wheel to be at back_height and the front wheel to be
  // at front_height, the handle of the rotation is the top left of the truck_body
  // bitmap which is tile_size * tile_size
  // so the r = sqrt(wheel_offset_x^2 + wheel_offset_y^2)
  // and handle_wheel_angle = atan2(-wheel_offset_y , wheel_offset_x)
  // truck_body.y + r*sin(handle_wheel_angle) - r*sin(angle + handle_wheel_angle) = wheel_height
  // and we want the back wheel x position to stay constant
  // truck_body.x + r*cos(handle_wheel_front_angle + angle) = wheel_front_offset_x
  truck_body.y = -pos_z;

} // update

} // Truck

var loader;

function init() {
  stage = new createjs.Stage("truck_race");

  wd = stage.canvas.width;
  ht = stage.canvas.height;

  var context = stage.canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;

  manifest = [
    {src:"assets/mud.png", id:"mud"},
    {src:"assets/truck.png", id:"truck"},
    {src:"assets/truck_cpu.png", id:"truck_cpu"},
    {src:"assets/shadow.png", id:"shadow"},
    {src:"assets/wheel.png", id:"wheel"},
    {src:"assets/checkers.png", id:"checkers"},
    {src:"assets/ramp.png", id:"ramp"}
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest);
}


var scene_graph;

function handleComplete() {
  level = new Level();
  level.init();  

  scene_graph = new createjs.Container();
 
  truck = new Truck(); 
  truck.init("truck", 0, 0);
  truck.update();

  // make rows of cpu trucks
  for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 2; j++) {
    var cpu_truck = new Truck();
    cpu_truck.init("truck_cpu", -j * tile_size * scale, (i + 1) * tile_size * scale);
    cpu_truck.cpu_aggression = 0.1 + Math.random() * 0.7;
    cpu_truck.update();
    cpu_trucks.push(cpu_truck);
  }
  }

  stage.update();

  createjs.Ticker.on("tick", tick);
  createjs.Ticker.setFPS(15);
}


function tick(event) {

  truck.update();

  for (var i = 0; i < cpu_trucks.length; i++) { 
    cpu_trucks[i].autoDrive();
    cpu_trucks[i].update();
  }

  level.update();

  stage.update(event);
}


function handleKeyDown(e) {
  // cross browse issue?
  if (!e) { var e = window.event; }

  var step = scale;
  switch (e.keyCode) {
    case KEYCODE_CTRL:
      truck.jump();
      return false;
    case KEYCODE_LEFT:
      truck.brake()
      return false;
    case KEYCODE_RIGHT:
      truck.accelerate();
      return false;
   case KEYCODE_UP:
      truck.turnLeft();
      return false;
   case KEYCODE_DOWN:
      truck.turnRight();
      return false;
  }
 
}

