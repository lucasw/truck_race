

var KEYCODE_UP = 38;                
var KEYCODE_DOWN = 40;                
var KEYCODE_LEFT = 37;  
var KEYCODE_RIGHT = 39;        

var py = 100;

var min_px = 128;
var max_px = 512;
var px = min_px;

var stage;
var wd;
var ht;

var mud;
var mud_img;

var truck_all;
var truck = {};

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
    {src:"assets/mud.png", id:"mud"}
  ];

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest);
}

var scale = 4;

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

function tick(event) {
  if (px > max_px) {
    px = max_px;
  }
  if (px < min_px) {
    px = min_px;
  }
  if (py < 0) {
    py = 0;
  }
  if (py > ht) {
    py = ht;
  }
  updateTruck();
  
  var deltaS = event.delta/1000;
  mud.x = (mud.x - (px - min_px)/(scale*4)) % mud.tileW;// (mud.x - deltaS* (px - min_px)) & mud.tileW;

  stage.update(event);
}


function handleKeyDown(e) {
  // cross browse issue?
  if (!e) { var e = window.event; }

  var step = scale;
  switch (e.keyCode) {
    case KEYCODE_LEFT:
      px -= step;
      return false;
    case KEYCODE_RIGHT:
      px += step;
      return false;
   case KEYCODE_UP:
      py -= step;
      return false;
   case KEYCODE_DOWN:
      py += step;
      return false;


  }
 

}
