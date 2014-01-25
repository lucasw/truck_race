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

// position of the player on screen, belongs in special object?
var px = min_px;
var py = 128;
var min_px = 128;
var max_px = 512;
var pvel = 0;

function Jump(scale, tileW, i) {

  this.img = new createjs.Bitmap(loader.getResult("ramp"));
  this.img.scaleX = scale;
  this.img.scaleY = scale;
  // place off-screen for now
  this.img.x = - tileW * 2;
  
  this.x = i * 5;
  this.y = i % 5;

  this.img.y = this.y * tileW;
}

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
  var y = Math.floor(t_y / tile_size);
  //console.log("pos " + Math.round(t_x) + " " + t_y + ", " + x + " " + y);
  for (var i = 0; i < features.length; i++) {
    if ((x === features[i].x) && (y === features[i].y)) {
      // this assumes every feature is a jump with a slope of 1
      var height = t_x - x * tile_size;
      console.log("height " + height);
      return height;
    }
  }

  return 0;
}

this.init = function() {
  mud_img = loader.getResult("mud");
  //mud_img.scaleX = 4;
  //mud_img.scaleY = 4;
  mud = new createjs.Shape();
  mud.graphics.beginBitmapFill(mud_img).drawRect(0, 0, //-mud_img.width*scale, 0, 
      wd/scale + mud_img.width*scale, ht/scale);
  mud.scaleX = scale;
  mud.scaleY = scale;
  mud.tileW = mud_img.width * scale;
  tile_size = mud.tileW;

  stage.addChild(mud); 

  features = [];

  // TODO instead load a bitmap or text file that specifies where features are
  for (var i = 0; i < 30; i++) {
    var jump = new Jump(scale, mud.tileW, i);
    features.push(jump);
    console.log("feature " + jump.x + " " + jump.y);
    stage.addChild(jump.img);
  }
}

this.update = function() {
  // make the truck move to x in screen coordinates as it speeds up
  // This doesn't allow the vehicle to ever overtake the furthest
  // forward position in x onscreen before level catches up
  var mix = 0.04;
  pvel = truck.getVel() * mix + pvel * (1.0 - mix); 
  level_x += pvel;
  px = (truck.getPos() - level_x) + min_px;

  //var deltaS = event.delta/1000;
  // dithered textures produce strobing effect at right velocities
  //mud.x = Math.round( ((mud.x - vel) % mud.tileW) / scale) * scale;// (mud.x - deltaS* (px - min_px)) & mud.tileW;
  mud.x = ( ((mud.x - pvel) % mud.tileW));// (mud.x - deltaS* (px - min_px)) & mud.tileW;

  for (var i = 0; i < features.length; i++) {
    features[i].img.x = features[i].x * mud.tileW - level_x;
  }
}


} // Level

var truck;

function Truck() {

// includes the shadow
var truck_all;
// just the physical truck
var truck_body;

var truck;
var wheel1;
var wheel2;
var axle1;
var axle2;

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
  vel_x += 1;
}

this.brake = function() {
  vel_x -= 1;
}

this.turnLeft = function() {
  vel_y = - max_vel_y;
}

this.turnRight = function() {
  vel_y = max_vel_y;
}

this.init = function() {

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

  truck = new createjs.Bitmap(loader.getResult("truck"));
  truck.scaleX = scale;
  truck.scaleY = scale;
  truck_body.addChild(truck);

  axle1 = new createjs.Container();
  axle1.x = 24;
  axle1.y = 128;
  truck_body.addChild(axle1);
  
  wheel1 = new createjs.Bitmap(loader.getResult("wheel"));
  //var wheel_wd = wheel1.width;
  wheel1.scaleX = scale;
  wheel1.scaleY = scale;
  wheel1.regX = 12;
  wheel1.regY = wheel1.regX;
  //wheel1.regY = wheel_wd/2;
  axle1.addChild(wheel1);

  var axle2 = new createjs.Container();
  axle2.x = 106;
  axle2.y = axle1.y;
  truck_body.addChild(axle2);

  wheel2 = new createjs.Bitmap(loader.getResult("wheel"));
  wheel2.scaleX = scale;
  wheel2.scaleY = scale;
  wheel2.regX = wheel1.regX;
  wheel2.regY = wheel2.regX;
  axle2.addChild(wheel2);

} // init


this.update = function() {
  
  if (vel_x < 0) {
    vel_x = 0;
  }
  if (vel_x > 20) {
    vel_x = 20;
  }
  vel_x *= 0.98;
  pos_x += vel_x;

  pos_z += vel_z;
  if (pos_z < 0) {
    //if (vel_z < 0) {
    //  vel_z = -Math.round(vel_z/2);
    //}
    vel_z = 0;
    pos_z = 0;
    off_ground = false;
  }
  if (off_ground) {
    vel_z -= 0.16 * scale;
    //console.log(vel_z + " " + pos_z);
  }

  // TODO use wheel diameter (24 pixels, or get bounds)
  // pi*d * rotation/(2*pi) = pos_x
  // rotation = pos_x * 2 / d ?
  wheel1.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 
  wheel2.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 
 
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
  
  py = pos_y;
 
  // TBD make wheel1_offset_x and wheel2_offset_x
  var wheel1_offset_x = 12;
  var wheel2_offset_x = tile_size - 12;
  var wheel_offset_y = tile_size;

  // TBD whyl tile_size * 2?
  var front_height = level.getHeight(pos_x - (tile_size * 2 - wheel2_offset_x), pos_y);
  var back_height  = level.getHeight(pos_x - (tile_size * 2 - wheel1_offset_x), pos_y);
  var truck_length = wheel2_offset_x - wheel1_offset_x;
  var height_diff = front_height - back_height;
  var angle = Math.atan2(-height_diff, truck_length);
  //truck_body.rotation = angle * 180.0 / Math.PI;
  //if (!off_ground && (truck_height > 0)) {
  //  this.jump();
  //}
  pos_z = back_height; 
  
  // px is determined by the level update
  truck_all.x = px;
  truck_all.y = py;

  // we want the back wheel to be at back_height and the front wheel to be
  // at front_height, the handle of the rotation is the top left of the truck_body
  // bitmap which is tile_size * tile_size
  // so the r = sqrt(wheel_offset_x^2 + wheel_offset_y^2)
  // and handle_wheel_angle = atan2(-wheel_offset_y , wheel_offset_x)
  // truck_body.y + r*sin(handle_wheel_angle) - r*sin(angle + handle_wheel_angle) = wheel_height
  // and we want the back wheel x position to stay constant
  // truck_body.x + r*cos(handle_wheel1_angle + angle) = wheel1_offset_x
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
    {src:"assets/shadow.png", id:"shadow"},
    {src:"assets/wheel.png", id:"wheel"},
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
  truck.init();
  truck.update();

  stage.update();

  createjs.Ticker.on("tick", tick);
  createjs.Ticker.setFPS(15);
}


function tick(event) {

  truck.update();
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

