// Copyright Lucas Walter 2013
// GNU GPL 3.0

var KEYCODE_UP = 38;                
var KEYCODE_DOWN = 40;                
var KEYCODE_LEFT = 37;  
var KEYCODE_RIGHT = 39;        

var scale = 2;

var stage;
var wd;
var ht;

var manifest;

// level, TODO encapsulate
var mud;
var mud_img;
var ramp;

var py = 128;
var min_px = 128;
var max_px = 512;
var px = min_px;

/// truck, TODO encapsulate
var truck_all;
//var truck = {};
var truck;
var wheel1;
var wheel2;
var axle1;

var pos_x = 0;
var vel = 0;
var vel_y = 0;
var max_vel_y = scale * 4;

document.onkeydown = handleKeyDown;

/*
function makeWheel(name, x) {
  var radius = 30;
  var tire_color = "#111111";
  truck[name] = new createjs.Shape();
  truck[name].graphics.beginFill(tire_color).drawCircle(0, 0, radius);
  truck[name].x = x;
  truck[name].y = 50;
  truck_all.addChild(truck[name]);
  
  var hubcap_color = "#999999";
  truck["rim_" + name] = new createjs.Shape();
  truck["rim_" + name].graphics.beginFill(hubcap_color).drawCircle(0, 0, 
      radius - 10);
  truck["rim_" + name].x = x;
  truck["rim_" + name].y = 50;
  truck_all.addChild(truck["rim_" + name]);
}

function makeTruck() {
  truck_all = new createjs.Container();
  stage.addChild(truck_all);
  
  shadow = new createjs.Bitmap(loader.getResult("shadow"));
  truck_all.addChild(shadow);

  var body_color = "#11d011";
  truck["body"] = new createjs.Shape();
  truck["body"].graphics.beginFill(body_color).drawRect(-100, -30, 200, 60);
  truck_all.addChild(truck["body"]);
  truck["cab"] = new createjs.Shape();
  truck["cab"].graphics.beginFill(body_color).drawRect(-10, -70, 70, 50);
  truck_all.addChild(truck["cab"]);
  
  makeWheel("wheel_left", -50);
  makeWheel("wheel_right", 50);

}
*/

function makeTruck() {

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


  truck = new createjs.Bitmap(loader.getResult("truck"));
  truck.scaleX = scale;
  truck.scaleY = scale;
  truck_all.addChild(truck);

  axle1 = new createjs.Container();
  axle1.x = 24;
  axle1.y = 128;
  truck_all.addChild(axle1);
  
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
  truck_all.addChild(axle2);

  wheel2 = new createjs.Bitmap(loader.getResult("wheel"));
  wheel2.scaleX = scale;
  wheel2.scaleY = scale;
  wheel2.regX = wheel1.regX;
  wheel2.regY = wheel2.regX;
  axle2.addChild(wheel2);

}

function updateTruck() {
  if (vel < 0) {
    vel = 0;
  }
  if (vel > 20) {
    vel = 20;
  }
  vel *= 0.96;
  pos_x += vel;

  // TODO use wheel diameter (24 pixels, or get bounds)
  // pi*d * rotation/(2*pi) = pos_x
  // rotation = pos_x * 2 / d ?
  wheel1.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 
  wheel2.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 
 
  //var scaled_vel = vel * scale * 6;
  //px += ((px - min_px) - scaled_vel)/16;
  py += vel_y;
  py = Math.round(py/scale) * scale;

  if (Math.round(py/max_vel_y) % (mud_img.height * scale/max_vel_y) == 0) {
    vel_y = 0;
  }

  if (py < 0) {
    py = 0;
  }
  if (py > ht) {
    py = ht;
  }

  truck_all.x = px;
  truck_all.y = py;

}

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

var level = {};

function makeLevel() {
  mud_img = loader.getResult("mud");
  //mud_img.scaleX = 4;
  //mud_img.scaleY = 4;
  mud = new createjs.Shape();
  mud.graphics.beginBitmapFill(mud_img).drawRect(0, 0, //-mud_img.width*scale, 0, 
      wd/scale + mud_img.width*scale, ht/scale);
  mud.scaleX = scale;
  mud.scaleY = scale;
  mud.tileW = mud_img.width * scale;
  stage.addChild(mud); 

  level.features = [];

  // TODO instead load a bitmap or text file that specifies where features are
  for (var i = 0; i < 30; i++) {
    var jump = new createjs.Bitmap(loader.getResult("ramp"));
    jump.scaleX = scale;
    jump.scaleY = scale;
    // place off-screen for now
    jump.x = - mud.tileW * 2;
    level.features.push( { img: jump, x: i * 5, y: i % 5 } );
    jump.y = level.features[i].y * mud.tileW;
    stage.addChild(jump);
  }
}

function levelDraw() {
  // make the truck move to x in screen coordinates as it speeds up
  // This doesn't allow the vehicle to ever overtake the furthest
  // forward position in x onscreen before level catches up
  var mix = 0.04;
  pvel = vel * mix + pvel * (1.0 - mix); 
  level_x += pvel;
  px = (pos_x - level_x) + min_px;

  //var deltaS = event.delta/1000;
  // dithered textures produce strobing effect at right velocities
  //mud.x = Math.round( ((mud.x - vel) % mud.tileW) / scale) * scale;// (mud.x - deltaS* (px - min_px)) & mud.tileW;
  mud.x = ( ((mud.x - pvel) % mud.tileW));// (mud.x - deltaS* (px - min_px)) & mud.tileW;

  for (var i = 0; i < level.features.length; i++) {
    level.features[i].img.x = level.features[i].x * mud.tileW - level_x;
  }
}

function handleComplete() {
  makeLevel();  

  makeTruck();
  updateTruck();

  stage.update();

  createjs.Ticker.on("tick", tick);
  createjs.Ticker.setFPS(15);
}

var pvel = 0;
var level_x = 0;

function tick(event) {

  updateTruck();
  levelDraw();

  stage.update(event);
}


function handleKeyDown(e) {
  // cross browse issue?
  if (!e) { var e = window.event; }

  var step = scale;
  switch (e.keyCode) {
    case KEYCODE_LEFT:
      vel -= 1;
      return false;
    case KEYCODE_RIGHT:
      vel += 1;
      return false;
   case KEYCODE_UP:
      vel_y = -max_vel_y;
      return false;
   case KEYCODE_DOWN:
      vel_y = max_vel_y;
      return false;
  }
 

}
