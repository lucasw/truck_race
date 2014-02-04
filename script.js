// Copyright Lucas Walter 2013
// GNU GPL 3.0

var paused = true;
var show_title = true;
var title_image;

var KEYCODE_CTRL = 74;
var KEYCODE_UP = 38;                
var KEYCODE_DOWN = 40;                
var KEYCODE_LEFT = 37;  
var KEYCODE_RIGHT = 39;        

var scale = 2;

// TODO belongs in Level?
var stage;

var wd;
var ht;

var tile_size;

var manifest;

var level;
var wrap = false;

var key_ctrl = false;
var key_up = false;
var key_down = false;
var key_left = false;
var key_right = false;

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function handleKeyDown(e) {
  
  if (show_title) {
    show_title = false;
    stage.removeChild(title_image);
    paused = false;
  }
  
  // cross browse issue?
  if (!e) { var e = window.event; }
  handleKey(e, true);
}

function handleKeyUp(e) {
  // cross browse issue?
  if (!e) { var e = window.event; }
  handleKey(e, false);
}

function handleKey(e, val) {
  switch (e.keyCode) {
    case KEYCODE_CTRL:
      //truck.jump();
      key_ctrl = val;
      return false;
    case KEYCODE_LEFT:
      key_left = val;
      return false;
    case KEYCODE_RIGHT:
      key_right = val;
      return false;
   case KEYCODE_UP:
      key_up = val;
      return false;
   case KEYCODE_DOWN:
      key_down = val;
      return false;
  }
}

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

function Barrier(scale, tileW, x, y) {
     
  var that = new Feature(scale, tileW, x, y, "barrier");         
  that.getHeight = function(x) {
    return that.tileW;
  }
  
  return that;
}

function Boost(scale, tileW, x, y) {
     
  var that = new Feature(scale, tileW, x, y /*+ tile_size*/, "boost");         
  that.getHeight = function(x) {
    return -2;
  }
  
  return that;
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

// containers for each lane of travel,
// allows depth to be handled correctly
this.lanes;

//var level = {};
// level, TODO encapsulate
var mud;
var mud_img;
var ramp;

var level_x = 0;
var features;

this.level_length = 150;

this.getHeight = function(t_x, t_y) {

  if (wrap) {
    if (t_x > this.level_length) t_x -= this.level_length;
    if (t_x < 0) t_x += this.level_length;
  }

  var x = Math.floor(t_x / tile_size); 
  var y = Math.round(t_y / tile_size);
  //console.log("pos " + Math.round(t_x) + " " + t_y + ", " + x + " " + y);
  for (var i = 0; i < features.length; i++) {
    if ((x === features[i].x) && (y === features[i].y)) {
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

var num_lanes = 9;

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

  this.lanes = [];
  for (var i = 0; i < num_lanes; i++) {
    var lane = new createjs.Container(); 
    stage.addChild(lane);
    this.lanes.push(lane);
  }

  features = [];
  // start line
  for (var i = 0; i < num_lanes; i++) {
    // TODO fix the i + 1
    var feature = new Feature(scale, mud.tileW, 5, i + 1, "checkers");
    features.push(feature);
    this.lanes[i].addChild(feature.img);
  } 
  // finish line
  for (var i = 0; i < num_lanes; i++) {
    var feature = new Feature(scale, mud.tileW, 5 + this.level_length, i + 1, "checkers");
    features.push(feature);
    this.lanes[i].addChild(feature.img);
  }

  // TODO instead load a bitmap or text file that specifies where features are
  for (var i = 0; i < 25; i++) {
    var x = Math.floor( 8 + random() * (this.level_length - 10));
    var y =  i % num_lanes; //Math.floor(Math.random() * 5 + 1);
    var jump = new Jump(scale, mud.tileW, x, y);
    features.push(jump);
    console.log("feature " + jump.x + " " + jump.y);
    this.lanes[y].addChild(jump.img);
    
    var reverse_jump = new ReverseJump(scale, mud.tileW, x + 1, y);
    features.push(reverse_jump);
    console.log("feature reverse_jump " + reverse_jump.x + " " + reverse_jump.y);
    this.lanes[y].addChild(reverse_jump.img);
  }
  // boosts
  for (var i = 0; i < 25; i++) {
    var x = Math.floor( 10 + random() * (this.level_length - 10));
    var y =  i % num_lanes; //Math.floor(Math.random() * 5 + 1);
    // TODO need to be able to check for existing features
    var reverse_jump = new Boost(scale, mud.tileW, x, y);
    features.push(reverse_jump);
    console.log("feature reverse_jump " + reverse_jump.x + " " + reverse_jump.y);
    this.lanes[y].addChild(reverse_jump.img);

  }
  // walls
  for (var i = 0; i < 20; i++) {
    var x = Math.floor( 20 + (random() * this.level_length - 20));
    var y =  i % num_lanes; //Math.floor(Math.random() * 5 + 1);
    // TODO need to be able to check for existing features
    var reverse_jump = new Barrier(scale, mud.tileW, x, y);
    features.push(reverse_jump);
    console.log("feature reverse_jump " + reverse_jump.x + " " + reverse_jump.y);
    this.lanes[y].addChild(reverse_jump.img);

  }



}

this.update = function() {
  // make the truck move to x in screen coordinates as it speeds up
  // This doesn't allow the vehicle to ever overtake the furthest
  // forward position in x onscreen before level catches up
  var mix = 0.04;
  truck.pvel = truck.getVel() * mix + truck.pvel * (1.0 - mix); 
  level_x += truck.pvel;

  if (false) {
    if (level_x > this.level_length) {
      console.log("wrap level_x " + level_x + " " + level.level_length); 
      level_x -= this.level_length;
    }
    if (level_x < 0) {
      console.log("wrap level_x " + level_x + " " + level.level_length); 
      level_x += this.level_length;
    }
    
  }
  //console.log(" level_x " + level_x);
  // move this into truck update, have a set level_x function
  //truck.px = (truck.getPos() - level_x) + min_px;
  
  for (var i = 0; i < all_trucks.length; i++) {
    all_trucks[i].px = all_trucks[i].getPos() - level_x + min_px;
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

var all_trucks = [];

var min_px = 128;
var max_px = 512;

function Truck() {

this.is_cpu = true;
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

var x_offset;
var wheel_back_offset_x;
var wheel_front_offset_x;

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

this.getPosY = function() {
  return pos_y;
}

this.accelerate = function() {
  if (!off_ground && (vel_x < 20))
    vel_x += 1;
}

this.brake = function() {
  if (!off_ground && (vel_x > -15))
    vel_x -= 2;

}

this.turnLeft = function() {
  if (!off_ground)
    vel_y = - max_vel_y;
}

this.turnRight = function() {
  if (!off_ground)
    vel_y = max_vel_y;
}

var old_lane = 0;

// Truck
this.init = function(truck_image, x, y) {
  
  pos_x = x;
  pos_y = y;

  truck_all = new createjs.Container();

  var cur_lane = Math.round(this.getLane());
  level.lanes[cur_lane].addChild(truck_all);
  
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

  x_offset = tile_size * scale;
  wheel_back_offset_x = 12;
  wheel_front_offset_x = scale * tile_size - 12;
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

    
    if (Math.random() > 0.9995) {
      this.cpu_aggression += Math.random() * 0.3;
      if (this.cpu_aggression > 1.0) this.cpu_aggression = 1.0;
      if (this.cpu_aggression < 0.0) this.cpu_aggression = 0.0;
    }
}


this.getBackPos = function() {
  var pos = pos_x + x_offset + wheel_back_offset_x;
  //console.log("back pos " + pos + " " + pos_x);
  return pos;
}
this.getFrontPos = function() {
  var pos = pos_x + x_offset + wheel_front_offset_x;
  //console.log("back pos " + pos);
  return pos;
}

this.frontCollide = function(other_truck) {
  //var average_vel = this.getVel() + other_truck.getVel();

  //if (Math.abs(vel_y) > 0.001) {
  //  vel_y = -vel_y * 0.9;
  //}
  vel_x *= 0.9;
  vel_x -= 5.0;
  //var diff_vel = other_truck.
  //if (Math.abs(getVel() > average_vel) {
  //  vel_
  //}
  //vel_x = average_vel;
  //max(
}

this.backCollide = function(other_truck) {
  vel_x *= 1.1;
  vel_x += 6.0;
}

this.getLane = function() {
  return (pos_y / (tile_size));
}

// Truck
this.update = function() {
  
  if (vel_x < -30) {
    vel_x = -30;
  }
  if (vel_x > 30) {
    vel_x = 30;
  }
  if (!off_ground) {
    vel_x *= 0.98;
  }
  pos_x += vel_x;

  if (wrap) {
  if (pos_x > level.level_length * tile_size) {
    console.log("truck wrap pos_x " + pos_x + " " + level.level_length); 
    pos_x -= level.level_length * tile_size;
    } 
    if (pos_x < 0) {
      console.log("truck wrap pos_x " + pos_x + " " + level.level_length); 
      pos_x += level.level_length * tile_size;
    }
    console.log(" truck pos " + pos_x);
  }

  level_back_height = level.getHeight(this.getBackPos(),  pos_y);
  level_front_height  = level.getHeight(this.getFrontPos(), pos_y);
  var old_pos_z = pos_z;
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
    vel_z -= 0.02 * tile_size;
    //console.log(vel_z + " " + pos_z);
  }

  // TODO use wheel diameter (24 pixels, or get bounds)
  // pi*d * rotation/(2*pi) = pos_x
  // rotation = pos_x * 2 / d ?
  wheel_front.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 
  wheel_back.rotation = pos_x * 2.5; //setTransform(0,0, scale, scale, pos_x); 

  {
  var wheel_offset_y = tile_size;

  // TODO need a set of functions to convert between screen coordinates,
  // pixel coords, and tile coords
  var x_offset = tile_size * scale;
  //var back_height = level.getHeight(this.getBackPos(),  pos_y);
  //var front_height  = level.getHeight(this.getFrontPos(), pos_y + vel_y);
  var truck_length = wheel_back_offset_x - wheel_front_offset_x;
 
  var veh_diff = level_back_height - level_front_height;
  //var pos_diff = Math.max(level_front_height - pos_z, level_back_height - pos_z);
  var old_pos_diff = Math.max(level_front_height - old_pos_z, level_back_height - old_pos_z);
  
  //if (Math.abs(old_pos_diff) > 0) console.log(" pos diff " + old_pos_diff);

  //console.log(pos_diff + " " + pos_z + " " + front_height + " " + back_height);
  //if (pos_diff > 0) console.log(pos_diff);
  // bounce back into same lane first
  if ((Math.abs(vel_y) > 0.002) && (old_pos_diff > 17)) {
      console.log("y bounce " + vel_y + " " + pos_y + " " + old_pos_diff);
      vel_y = -vel_y * 0.9;
      pos_y += 2*vel_y;
    
    pos_z = old_pos_z;
  } else if ((Math.abs(vel_x) > 0.001) && (old_pos_diff/Math.abs(vel_x) > 2.0)) {
    
      console.log("x bounce " + 
        vel_x + 
        ", back " + level_back_height +
        ", front " + level_front_height +
        ", pos diff " + old_pos_diff
        );
        vel_x = -vel_x;
  } else if (old_pos_diff > 0) {
    if (off_ground) {
      //vel_z += (old_pos_diff) * 0.01;
    } else {
      vel_z = 0.34 * (pos_z - old_pos_z);
    }
    //console.log("off ground " + vel_z + " " + old_pos_z + " " + level_front_height); 
  }
  
  if (!off_ground) {
    vel_x += veh_diff * 0.005;
  }

  // TODO hacky
  if ((level_front_height < 0) || (level_back_height < 0)) {
    console.log("boost");
    vel_x += 4;
  }
  //var dz_front = front_height - level_front_height; 
  //var dz_back = back_height - level_back_height;
  

  //var height_diff = front_height - back_height;
  //var angle = Math.atan2(-height_diff, truck_length);
  //truck_body.rotation = angle * 180.0 / Math.PI;
  //if (!off_ground && (truck_height > 0)) {
  //  this.jump();
  //}
  
  //pos_z = Math.max(back_height, front_height); 
  }
 
  pos_y += vel_y;
  pos_y = Math.round(pos_y/scale) * scale;

  if (Math.round(pos_y/max_vel_y) % (tile_size/2 * scale/max_vel_y) == 0) {
    vel_y = 0;
  }

  if (pos_y < 0) {
    pos_y = 0;
  }
  
  // complete turn when in new lane
  //console.log("cur lane " + this.getLane());
  if (this.getLane() > (level.lanes.length - 1)) {
    pos_y = (level.lanes.length - 1) * tile_size;
  }
  var cur_lane = Math.round(this.getLane());
  if (cur_lane < 0) {
    console.log("lane error " + cur_lane);
    cur_lane = 0;
  }
  if (cur_lane >= level.num_lanes) {
    console.log("lane error " + cur_lane);
    cur_lane = level.num_lanes - 1;
  }
  if (cur_lane != old_lane) {
    level.lanes[old_lane].removeChild(truck_all);
    level.lanes[cur_lane].addChild(truck_all);
  }
  
  this.py = pos_y;

  
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

  var cur_lane = Math.round(this.getLane());
  old_lane = cur_lane;
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
    {src:"assets/title.png", id:"title"},
    {src:"assets/mud.png", id:"mud"},
    {src:"assets/barrier.png", id:"barrier"},
    {src:"assets/boost.png", id:"boost"},
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


function handleComplete() {
  
  

  level = new Level();
  level.init();  

 
  truck = new Truck();
  truck.is_cpu = false;
  truck.init("truck", 0, 0);
  truck.update();
  all_trucks.push(truck);

  // make rows of cpu trucks
  for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 6; j++) {
    var cpu_truck = new Truck();
    cpu_truck.init("truck_cpu", -j * tile_size * scale * 1.2, (i + 1) * tile_size * scale);
    cpu_truck.cpu_aggression = 0.1 + Math.random() * 0.7;
    cpu_truck.update();
    all_trucks.push(cpu_truck);
  }
  }

  // setup title screen
  title_image = new createjs.Bitmap(loader.getResult("title"));
  title_image.scaleX = ht/64;
  title_image.scaleY = ht/64;
  title_image.x = (wd - ht)/2.0;
  stage.addChild(title_image); 
 
  stage.update();

  createjs.Ticker.on("tick", tick);
  createjs.Ticker.setFPS(15);
}


function tick(event) {

  if (!paused) {
  if (key_left)
    truck.brake();
  if (key_right)
    truck.accelerate();
  if (key_up)
    truck.turnLeft();
  if (key_down)
    truck.turnRight();

  for (var i = 0; i < all_trucks.length; i++) { 
    // look for collisions
    for (var j = 0; j < all_trucks.length; j++) { 
      if (i === j) continue;
      if ((Math.abs(all_trucks[i].getPosY() - all_trucks[j].getPosY()) < tile_size/3) &&
          (all_trucks[i].getFrontPos() > all_trucks[j].getBackPos()) &&
          (all_trucks[i].getFrontPos() < all_trucks[j].getFrontPos())
          ) {
        console.log("collision " + i + " " + j + " " + 
            all_trucks[i].getFrontPos() + 
            ", " + all_trucks[j].getFrontPos() +
            ", y " + all_trucks[i].getPosY() + " " + all_trucks[j].getPosY()
            );
        all_trucks[i].frontCollide(all_trucks[j]); 
        all_trucks[j].backCollide(all_trucks[i]); 
      }
    }

    if (all_trucks[i].is_cpu) {
      all_trucks[i].autoDrive();
    }
    all_trucks[i].update();
  }

  level.update();
  }

  stage.update(event);
}

