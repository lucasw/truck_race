

var KEYCODE_UP = 38;                
var KEYCODE_LEFT = 37;  
var KEYCODE_RIGHT = 39;        

var px = 100;
var py = 100;

var stage;
var circle;

function init() {
  stage = new createjs.Stage("truck_race");
  circle = new createjs.Shape();
  circle.graphics.beginFill("red").drawCircle(0, 0, 50);
  circle.x = px;
  circle.y = py;
  stage.addChild(circle);

  stage.update();
}
