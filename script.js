

var KEYCODE_UP = 38;                
var KEYCODE_DOWN = 40;                
var KEYCODE_LEFT = 37;  
var KEYCODE_RIGHT = 39;        

var scale = 2;

var py = 128;

var min_px = 128;
var max_px = 512;
var px = min_px;

var pos_x = 0;
var vel = 0;
var vel_y = 0;
var max_vel_y = scale * 4;

var stage;
var wd;
var ht;

var mud;
var mud_img;

var truck_all;
var truck = {};
var shadow;

var manifest;

document.onkeydown = handleKeyDown;

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

function updateTruck() {

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
    {src:"assets/shadow.png", id:"shadow"}
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest);
}


function handleComplete() {
  

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


  makeTruck();
  updateTruck();

  stage.update();

  createjs.Ticker.on("tick", tick);
  createjs.Ticker.setFPS(15);
}

var pvel = 0;
var level_x = 0;

function tick(event) {

  if (vel < 0) {
    vel = 0;
  }
  if (vel > 20) {
    vel = 20;
  }
  pos_x += vel;

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
  updateTruck();
 
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
