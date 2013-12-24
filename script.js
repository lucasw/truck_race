

var KEYCODE_UP = 38;                
var KEYCODE_DOWN = 40;                
var KEYCODE_LEFT = 37;  
var KEYCODE_RIGHT = 39;        

var px = 100;
var py = 100;

var stage;

var truck_all;
var truck = {};

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
  /*
  truck["rim_wheel_left"].x = px - 50;
  truck["rim_wheel_left"].y = py + 50;
  truck["wheel_left"].x = px - 50;
  truck["wheel_left"].y = py + 50;
  
  truck["rim_wheel_right"].x = px + 50;
  truck["rim_wheel_right"].y = py + 50;
  truck["wheel_right"].x = px + 50;
  truck["wheel_right"].y = py + 50;
  
  truck["cab"].x = px;
  truck["cab"].y = py;
*/
}

function init() {
  stage = new createjs.Stage("truck_race");
  makeTruck();
  updateTruck();

  stage.update();

  createjs.Ticker.on("tick", tick);
  createjs.Ticker.setFPS(15);
}

function tick(event) {

  updateTruck();

  stage.update(event);
}

function handleKeyDown(e) {
  // cross browse issue?
  if (!e) { var e = window.event; }

  var step = 3;
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
