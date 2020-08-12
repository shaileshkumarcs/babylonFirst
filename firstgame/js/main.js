/// <reference path="babylon.max.js" />

var canvas;
var engine;
var scene;
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isDPressed = false;

document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
  canvas = document.getElementById("randerCanvas");
  engine = new BABYLON.Engine(canvas, true);
  scene = createScene();
  modifySettings();
  var tank = scene.getMeshByName("HeroTank");
  var toRander = function () {
    // tank.position.z += 5;
    tank.move();
    scene.render();
  };
  engine.runRenderLoop(toRander);
}

var createScene = function () {
  var scene = new BABYLON.Scene(engine);
  var ground = createGround(scene);
  var freeCamera = createFreeCamera(scene);
  var tank = createTank(scene);
  var folllowCamera = createFollowCamera(scene, tank);
  scene.activeCamera = folllowCamera;
  createLight(scene);
  return scene;
};

function createGround(scene) {
  var ground = new BABYLON.Mesh.CreateGroundFromHeightMap(
    "ground",
    "images/hmap2.png",
    2000,
    2000,
    20,
    0,
    1000,
    scene,
    false,
    OnGroundCreated
  );
  function OnGroundCreated() {
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "images/grass.jpg",
      scene
    );
    ground.material = groundMaterial;
    ground.checkCollisions = true;
  }
  return ground;
}

function createLight(scene) {
  var light0 = new BABYLON.DirectionalLight(
    "dir0",
    new BABYLON.Vector3(-0.1, -1, 0),
    scene
  );
  var light1 = new BABYLON.DirectionalLight(
    "dir1",
    new BABYLON.Vector3(-1, -1, 0),
    scene
  );
}

function createFreeCamera(scene) {
  var camera = new BABYLON.FreeCamera(
    "freeCamera",
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas);
  camera.position.y = 50;
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.keysUp.push("w".charCodeAt(0));
  camera.keysUp.push("W".charCodeAt(0));
  camera.keysDown.push("s".charCodeAt(0));
  camera.keysDown.push("S".charCodeAt(0));
  camera.keysRight.push("d".charCodeAt(0));
  camera.keysRight.push("D".charCodeAt(0));
  camera.keysLeft.push("a".charCodeAt(0));
  camera.keysLeft.push("A".charCodeAt(0));
  return camera;
}

function createFollowCamera(scene, target) {
  var camera = new BABYLON.FollowCamera(
    "tankFollowCamera",
    target.position,
    scene,
    target
  );
  camera.radius = 20; // how far from object to follow
  camera.heightOffset = 4; // how high above the object to place the camera
  camera.rotationOffset = 180; // the viewing angle
  camera.cameraAcceleration = 0.5; // how fast to move
  camera.maxCameraSpeed = 50; // speed limit
  return camera;
}

function createTank(scene) {
  var tank = new BABYLON.MeshBuilder.CreateBox(
    "HeroTank",
    { height: 1, depth: 6, width: 6 },
    scene
  );
  var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
  tankMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
  tankMaterial.emissiveColor = new BABYLON.Color3(0, 0, 1);
  tank.material = tankMaterial;
  tank.position.y += 2;
  tank.speed = 1;
  tank.frontVector = new BABYLON.Vector3(0, 0, 1);
  tank.move = function () {
    var yMovement = 0;
    // console.log(tank.position.y);
    if (tank.position.y > 2) {
      yMovement = -2;
    }
    // tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, 5));
    if (isWPressed) {
      tank.moveWithCollisions(
        tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed)
      );
    }
    if (isSPressed) {
      tank.moveWithCollisions(
        tank.frontVector.multiplyByFloats(
          -1 * tank.speed,
          -1 * tank.speed,
          -1 * tank.speed
        )
      );
    }
    if (isAPressed) {
      // tank.moveWithCollisions(
      //   new BABYLON.Vector3(-1 * tank.speed, yMovement, 0)
      // );
      tank.rotation.y -= 0.1;
      tank.frontVector = new BABYLON.Vector3(
        Math.sin(tank.rotation.y),
        0,
        Math.cos(tank.rotation.y)
      );
    }
    if (isDPressed) {
      // tank.moveWithCollisions(
      //   new BABYLON.Vector3(1 * tank.speed, yMovement, 0)
      // );
      tank.rotation.y += 0.1;
      tank.frontVector = new BABYLON.Vector3(
        Math.sin(tank.rotation.y),
        0,
        Math.cos(tank.rotation.y)
      );
    }
  };
  return tank;
}

window.addEventListener("resize", function () {
  engine.resize();
});

function modifySettings() {
  scene.onPointerDown = function () {
    if (!scene.alreadyLocked) {
      console.log("Requesting pointer lock ");
      canvas.requestPointerLock =
        canvas.mozPointerLock ||
        canvas.webkitPointerLock ||
        canvas.msPointerLock ||
        canvas.requestPointerLock;
      canvas.requestPointerLock();
    } else {
      console.log("Not requesting because we are already locked");
    }
  };
  document.addEventListener("pointerlockchange", pointerLockListener);
  document.addEventListener("mspointerlockchange", pointerLockListener);
  document.addEventListener("mozpointerlockchange", pointerLockListener);
  document.addEventListener("webkitpointerlockchange", pointerLockListener);

  function pointerLockListener() {
    var element =
      document.mozPointerLockElement ||
      document.webkitPointerLockElement ||
      document.msPointerLockElement ||
      document.pointerLockElement ||
      null;
    if (element) {
      scene.alreadyLocked = true;
    } else {
      scene.alreadyLocked = false;
    }
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key == "w" || event.key == "W") {
    isWPressed = true;
  }
  if (event.key == "s" || event.key == "S") {
    isSPressed = true;
  }
  if (event.key == "a" || event.key == "A") {
    isAPressed = true;
  }
  if (event.key == "d" || event.key == "D") {
    isDPressed = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key == "w" || event.key == "W") {
    isWPressed = false;
  }
  if (event.key == "s" || event.key == "S") {
    isSPressed = false;
  }
  if (event.key == "a" || event.key == "A") {
    isAPressed = false;
  }
  if (event.key == "d" || event.key == "D") {
    isDPressed = false;
  }
});
