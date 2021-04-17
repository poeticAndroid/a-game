(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "name": "a-game",
  "title": "A-Game",
  "version": "0.1.30",
  "description": "game components for A-Frame",
  "main": "index.js",
  "scripts": {
    "prepare": "npm run build",
    "build": "foreach -g src/*.js -x \"browserify #{path} -o dist/#{name}.js\" && npm run minify",
    "watch": "foreach -g src/*.js -C -x \"watchify #{path} -d -o dist/#{name}.js\"",
    "minify": "touch dist/foo.min.js && rm dist/*.min.js && foreach -g dist/*.js -C -x \"minify #{path} > dist/#{name}.min.js\"",
    "bump": "npm version patch --no-git-tag-version",
    "gitadd": "git add package*.json dist/"
  },
  "pre-commit": [
    "bump",
    "build",
    "gitadd"
  ],
  "keywords": [
    "aframe",
    "webvr",
    "webxr",
    "gamedev"
  ],
  "author": "poeticAndroid",
  "license": "MIT",
  "devDependencies": {
    "browserify": "^17.0.0",
    "foreach-cli": "^1.8.1",
    "minify": "^7.0.1",
    "pre-commit": "^1.2.2",
    "watchify": "^4.0.0"
  }
}

},{}],2:[function(require,module,exports){
require("./libs/pools")
require("./libs/copyWorldPosRot")
require("./libs/ensureElement")
require("./libs/touchGestures")

setTimeout(() => {
  document.body.addEventListener("swipeup", e => {
    document.body.requestFullscreen()
  })
})

require("./components/include")
require("./components/physics")
require("./components/injectplayer")
require("./components/locomotion")
require("./components/grabber")

require("./primitives/a-main")
require("./primitives/a-player")
require("./primitives/a-hand")

const pkg = require("../package")
console.log(`${pkg.title} Version ${pkg.version} by ${pkg.author}`)

},{"../package":1,"./components/grabber":3,"./components/include":5,"./components/injectplayer":6,"./components/locomotion":7,"./components/physics":11,"./libs/copyWorldPosRot":16,"./libs/ensureElement":17,"./libs/pools":18,"./libs/touchGestures":19,"./primitives/a-hand":20,"./primitives/a-main":21,"./primitives/a-player":22}],3:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("grabber", {
  schema: {
    hideOnGrab: { type: "boolean", default: false }
  },

  init: function () {
    this._camera = this.el.querySelector("a-camera")
    this._leftHand = this.el.querySelector("a-hand[side=\"left\"]")
    this._rightHand = this.el.querySelector("a-hand[side=\"right\"]")
    this._leftGlove = this.el.querySelector(".left-hitbox")
    this._rightGlove = this.el.querySelector(".right-hitbox")
    this._hands = ["head", "left", "right"]
    this._head = { hand: this._camera }
    this._left = { hand: this._leftHand, glove: this._leftGlove }
    this._right = { hand: this._rightHand, glove: this._rightGlove }

    this._head.ray = this._camera.ensure(".items-ray", "a-entity", {
      class: "items-ray",
      raycaster: {
        objects: "[grabbable]",
        far: 2,
        autoRefresh: false
      }
    })
    let dia = Math.sin(Math.PI / 4)
    this._left.ray = this._leftGlove.ensure(".items-ray", "a-entity", {
      class: "items-ray",
      raycaster: {
        objects: "[grabbable]", far: 0.2,
        origin: { x: -0.0625, y: 0, z: 0.0625 },
        direction: { x: dia, y: 0, z: -dia },
        autoRefresh: false
      }
    })
    this._right.ray = this._rightGlove.ensure(".items-ray", "a-entity", {
      class: "items-ray",
      raycaster: {
        objects: "[grabbable]", far: 0.2,
        origin: { x: 0.0625, y: 0, z: 0.0625 },
        direction: { x: -dia, y: 0, z: -dia },
        autoRefresh: false
      }
    })
    this._head.anchor = this._head.ray.ensure(".items-anchor", "a-box", { class: "items-anchor", visible: "false" })
    this._left.anchor = this._left.ray.ensure(".items-anchor", "a-box", { class: "items-anchor", visible: "false" })
    this._right.anchor = this._right.ray.ensure(".items-anchor", "a-box", { class: "items-anchor", visible: "false" })

    this.enableHands = this.enableHands.bind(this)
    this._keyDown = this._keyDown.bind(this)
    this._mouseDown = this._mouseDown.bind(this)
    this._mouseUp = this._mouseUp.bind(this)
    this._buttonDown = this._buttonDown.bind(this)
    this._buttonUp = this._buttonUp.bind(this)
    this._head.toggleGrab = () => { this.toggleGrab("head") }
    this._head.grab = () => { this.grab("head") }
    this._head.use = () => { this.use("head") }
    this._head.useDown = () => { this.useDown("head") }
    this._head.useUp = () => { this.useUp("head") }
    this._head.drop = () => { this.drop("head") }
    this._left.toggleGrab = () => { this.toggleGrab("left") }
    this._left.grab = () => { this.grab("left") }
    this._left.use = () => { this.use("left") }
    this._left.useDown = () => { this.useDown("left") }
    this._left.useUp = () => { this.useUp("left") }
    this._left.drop = () => { this.drop("left") }
    this._right.toggleGrab = () => { this.toggleGrab("right") }
    this._right.grab = () => { this.grab("right") }
    this._right.use = () => { this.use("right") }
    this._right.useDown = () => { this.useDown("right") }
    this._right.useUp = () => { this.useUp("right") }
    this._right.drop = () => { this.drop("right") }

    this._leftHand.addEventListener("buttonchanged", this.enableHands)
    this._rightHand.addEventListener("buttonchanged", this.enableHands)
    this._leftHand.addEventListener("gripdown", this._left.grab)
    this._leftHand.addEventListener("triggerdown", this._left.useDown)
    this._leftHand.addEventListener("triggerup", this._left.useUp)
    this._leftHand.addEventListener("buttondown", this._buttonDown)
    this._leftHand.addEventListener("buttonup", this._buttonUp)
    this._leftHand.addEventListener("gripup", this._left.drop)
    this._rightHand.addEventListener("gripdown", this._right.grab)
    this._rightHand.addEventListener("triggerdown", this._right.useDown)
    this._rightHand.addEventListener("triggerup", this._right.useUp)
    this._rightHand.addEventListener("buttondown", this._buttonDown)
    this._rightHand.addEventListener("buttonup", this._buttonUp)
    this._rightHand.addEventListener("gripup", this._right.drop)
    addEventListener("keydown", this._keyDown)
    document.querySelector("canvas").addEventListener("mousedown", this._mouseDown)
    document.querySelector("canvas").addEventListener("mouseup", this._mouseUp)
    document.querySelector("canvas").addEventListener("hold", this._head.toggleGrab)
    document.querySelector("canvas").addEventListener("tap", this._head.use)

    this._wildItem = 0
  },

  update: function () {
    // Do something when component's data is updated.
  },

  remove: function () {
    // Do something the component or its entity is detached.
    this._leftHand.removeEventListener("buttonchanged", this.enableHands)
    this._rightHand.removeEventListener("buttonchanged", this.enableHands)
    this._leftHand.removeEventListener("gripdown", this._left.grab)
    this._leftHand.removeEventListener("triggerdown", this._left.useDown)
    this._leftHand.removeEventListener("triggerup", this._left.useUp)
    this._leftHand.removeEventListener("buttondown", this._buttonDown)
    this._leftHand.removeEventListener("buttonup", this._buttonUp)
    this._leftHand.removeEventListener("gripup", this._left.drop)
    this._rightHand.removeEventListener("gripdown", this._right.grab)
    this._rightHand.removeEventListener("triggerdown", this._right.useDown)
    this._rightHand.removeEventListener("triggerup", this._right.useUp)
    this._rightHand.removeEventListener("buttondown", this._buttonDown)
    this._rightHand.removeEventListener("buttonup", this._buttonUp)
    this._rightHand.removeEventListener("gripup", this._right.drop)
    removeEventListener("keydown", this._keyDown)
    document.querySelector("canvas").removeEventListener("mousedown", this._mouseDown)
    document.querySelector("canvas").removeEventListener("mouseup", this._mouseUp)
    document.querySelector("canvas").removeEventListener("hold", this._head.toggleGrab)
    document.querySelector("canvas").removeEventListener("tap", this._head.use)
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
    let i, len, gamepad
    this._gamepadDelta = this._gamepadDelta || []
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        if (gamepad.buttons[0].value > 0.75 && !this._gamepadDelta[0]) this.useDown("head", 1)
        if (gamepad.buttons[1].value > 0.75 && !this._gamepadDelta[1]) this.useDown("head", 2)
        if (!(gamepad.buttons[0].value > 0.75) && this._gamepadDelta[0]) this.useUp("head", 1)
        if (!(gamepad.buttons[1].value > 0.75) && this._gamepadDelta[1]) this.useUp("head", 2)
        if (gamepad.buttons[4].value > 0.75 && !this._gamepadDelta[4]) this.toggleGrab()
        if (gamepad.buttons[5].value > 0.75 && !this._gamepadDelta[5]) this.toggleGrab()
        if (gamepad.buttons[6].value > 0.75 && !this._gamepadDelta[6]) this.useDown()
        if (gamepad.buttons[7].value > 0.75 && !this._gamepadDelta[7]) this.useDown()
        if (!(gamepad.buttons[6].value > 0.75) && this._gamepadDelta[6]) this.useUp()
        if (!(gamepad.buttons[7].value > 0.75) && this._gamepadDelta[7]) this.useUp()
        this._gamepadDelta[0] = gamepad.buttons[0].value > 0.75
        this._gamepadDelta[1] = gamepad.buttons[1].value > 0.75
        this._gamepadDelta[4] = gamepad.buttons[4].value > 0.75
        this._gamepadDelta[5] = gamepad.buttons[5].value > 0.75
        this._gamepadDelta[6] = gamepad.buttons[6].value > 0.75
        this._gamepadDelta[7] = gamepad.buttons[7].value > 0.75
      }
    }
    let pos1 = THREE.Vector3.temp()
    let pos2 = THREE.Vector3.temp()
    let delta = THREE.Vector3.temp()
    for (let hand of this._hands) {
      hand = "_" + hand
      // if (this[hand].glove)
      //   this[hand].glove.copyWorldPosRot(this[hand].hand)
      if (this[hand].grabbed) {
        this[hand].grabbed.object3D.getWorldPosition(pos1)
        this[hand].grabbed.copyWorldPosRot(this[hand].anchor)
        this[hand].grabbed.object3D.getWorldPosition(pos2)
        delta.copy(pos2).sub(pos1).multiplyScalar(512 / timeDelta)

        if (this[hand].grabbed.body && this[hand].grabbed.body.sleep) {
          this[hand].grabbed.body.sleep()
          this[hand].grabbed.body.velocity.set(delta.x, delta.y, delta.z)
          // this[hand].grabbed.body.angularVelocity.set(0, 0, 0)
        }
        if (this[hand].grabbed.body && this[hand].grabbed.body.activate)
          this[hand].grabbed.body.activate()
        delta.copy(pos2).sub(pos1)
        if (delta.length() > 1) {
          this._wildItem++
          if (this._wildItem > 3) this[hand].drop()
        }
      }
    }
    if (this._wildItem > 0) this._wildItem -= 0.5
  },

  enableHands: function () {
    if (this._head.ray) {
      this._head.hand.removeChild(this._head.ray)
      this._head.ray = null
      this._leftHand.removeEventListener("buttonchanged", this.enableHands)
      this._rightHand.removeEventListener("buttonchanged", this.enableHands)
      this.hasHands = true

      for (let hand of this._hands) {
        hand = "_" + hand
        if (this[hand].glove) {
          // this[hand].glove.copyWorldPosRot(this[hand].hand)
          this[hand].glove.setAttribute("ammo-body", "activationState:disableDeactivation")
          this[hand].glove.setAttribute("ammo-shape", "type:box")
          // this[hand].glove.setAttribute("ammo-wait", "")
          this[hand].hand.setAttribute("ammo-body", "type:kinematic; collisionFilterMask:0;")
          this[hand].hand.setAttribute("ammo-shape", "type:box")
          this[hand].hand.setAttribute("ammo-constraint", { target: this[hand].glove })
        }
      }
    }
  },
  emit: function (eventtype, hand, grabbed, e = {}) {
    e.grabber = this.el
    e.grabbedElement = grabbed
    e.handElement = hand
    for (let _hand of this._hands) {
      if (this["_" + _hand].hand === hand) e.hand = _hand
    }
    hand.emit(eventtype, e)
    if (grabbed) grabbed.emit(eventtype, e)
  },

  toggleGrab: function (hand = "head") {
    hand = "_" + hand
    if (this[hand].grabbed) this[hand].drop()
    else this[hand].grab()
  },

  grab: function (hand = "head") {
    hand = "_" + hand
    let ray = this[hand].ray.components.raycaster
    ray.refreshObjects()
    let int = ray.intersections[0]
    if (int) {
      this.dropObject(int.object.el)
      this[hand].grabbed = int.object.el
      this[hand].anchor.copyWorldPosRot(this[hand].grabbed)
      if (this[hand].grabbed.getAttribute("ammo-body")) {
        this[hand].anchor.setAttribute("ammo-body", "type:kinematic; collisionFilterMask:0;")
        this[hand].anchor.setAttribute("ammo-shape", "type:box")
        this[hand].anchor.setAttribute("ammo-constraint", { target: this[hand].grabbed })
      }
      if (this[hand].grabbed.components.grabbable.data.freeOrientation) {
        if (hand == "_head") {
          this[hand].anchor.object3D.position.z -= 0.5 - int.distance
          this[hand].anchor.object3D.position.y -= 0.25
          this[hand].anchor.object3D.quaternion.set(0, 0, 0, 1)
        }
      } else {
        if (hand == "_head") this[hand].anchor.object3D.position.set(0, -0.25, -0.5)
        else this[hand].anchor.object3D.position.set(0, 0, 0)
        this[hand].anchor.object3D.quaternion.set(0, 0, 0, 1)
      }
      if (this[hand].glove) {
        this[hand].glove.setAttribute("ammo-body", "collisionFilterMask", 0)
        if (this.hideOnGrab)
          this[hand].hand.object3D.visible = false
      }
    }
    this.emit("grab", this[hand].hand, this[hand].grabbed)
  },
  use: function (hand = "head", button = 0) {
    hand = "_" + hand
    if (this._used) {
      clearTimeout(this._used)
      this[hand].useUp(button)
      this._used = null
    }
    this[hand].useDown(button)
    this._used = setTimeout(() => {
      this[hand].useUp(button)
      this._used = null
    }, 256)
  },
  useDown: function (hand = "head", button = 0) {
    hand = "_" + hand
    if (!this[hand].grabbed) this[hand].grab()
    this.emit("usedown", this[hand].hand, this[hand].grabbed, { button: button })
  },
  useUp: function (hand = "head", button = 0) {
    hand = "_" + hand
    this.emit("useup", this[hand].hand, this[hand].grabbed, { button: button })
  },
  drop: function (hand = "head") {
    hand = "_" + hand
    if (this[hand].grabbed) {
      this[hand].anchor.removeAttribute("ammo-constraint")
      this[hand].anchor.removeAttribute("ammo-shape")
      this[hand].anchor.removeAttribute("ammo-body")
      if (this[hand].grabbedAttrs) {
        for (let attr in this[hand].grabbedAttrs) {
          this[hand].grabbed.setAttribute(attr, this[hand].grabbedAttrs[attr])
        }
        this[hand].grabbedAttrs = null
      }
      if (this[hand].grabbed.body && this[hand].grabbed.body.wakeUp) {
        this[hand].grabbed.body.wakeUp()
      }
    }
    this.emit("drop", this[hand].hand, this[hand].grabbed)
    this[hand].grabbed = null
    if (this[hand].glove) {
      this[hand].glove.setAttribute("ammo-body", "collisionFilterMask", 1)
      this[hand].hand.object3D.visible = true
    }
  },
  dropObject: function (el) {
    for (let hand of this._hands) {
      hand = "_" + hand
      if (this[hand].grabbed == el) this[hand].drop()
    }
  },

  _keyDown: function (e) {
    if (e.code == "KeyE") this.toggleGrab()
  },

  _mouseDown: function (e) {
    let btn = e.button
    this.useDown("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _mouseUp: function (e) {
    let btn = e.button
    this.useUp("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },

  _buttonDown: function (e) {
    let btn = e.detail.id - 3
    if (btn < 1) return
    let hand = "right"
    if (e.target == this._leftHand) hand = "left"
    this.useDown(hand, btn)
  },
  _buttonUp: function (e) {
    let btn = e.detail.id - 3
    if (btn < 1) return
    let hand = "right"
    if (e.target == this._leftHand) hand = "left"
    this.useUp(hand, btn)
  }
})

require("./grabber/grabbable")

},{"./grabber/grabbable":4}],4:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("grabbable", {
  schema: {
    freeOrientation: { type: "boolean", default: true },
    physics: { type: "boolean", default: true }
  },

  init: function () {
    // Do something when component's data is updated.
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:dynamic;")
  }
})

},{}],5:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("include", {
  schema: { type: "string" },

  init: async function () {
    if (this.data && !this.el.sceneEl._including_) {
      this.el.sceneEl._including_ = true
      let b4Content = this.el.outerHTML

      let p1 = b4Content.indexOf(" ")
      let p2 = b4Content.indexOf(" include=")
      let attrs = b4Content.substr(p1, p2 - p1)

      p1 = b4Content.indexOf("\"", p2 + 10) + 1
      p2 = b4Content.indexOf(">")
      attrs += b4Content.substr(p1, p2 - p1)

      let response = await fetch(this.data)
      if (response.status >= 200 && response.status < 300) {
        this.el.outerHTML = await (await (response).text()).replace(">", " >").replace(" ", " " + attrs + " ")
      }
      else {
        this.el.removeAttribute("include")
      }
      this.el.sceneEl._including_ = false
      let next = this.el.sceneEl.querySelector("[include]")
      if (next && next.components && next.components.include) next.components.include.init()
    }
  }
})

},{}],6:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("injectplayer", {

  init: function () {
    let cam = this.el.ensure("a-camera", "a-camera", {
      "look-controls": { pointerLockEnabled: true, touchEnabled: false },
      "wasd-controls": { enabled: false }
    })
    // cam.ensure("[tracker]", "a-entity", { tracker: "" })
    let boxsize = 0.0625
    let leftHand = this.el.ensure("a-hand[side=\"left\"]", "a-hand", { side: "left", body: "type:kinematic;" })
    let leftHitbox = leftHand.ensure(".left-hitbox", "a-box", { class: "left-hitbox", position: "0 -0 0.0625", material: "visible:false", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
    // let leftGlove = leftHitbox.ensure(".left-glove", "a-entity", { class: "left-glove", position: "0 0 -0.0625" })
    let rightHand = this.el.ensure("a-hand[side=\"right\"]", "a-hand", { side: "right", body: "type:kinematic;" })
    let rightHitbox = rightHand.ensure(".right-hitbox", "a-box", { class: "right-hitbox", position: "0 -0 0.0625", material: "visible:false", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
    // let rightGlove = rightHitbox.ensure(".right-glove", "a-entity", { class: "right-glove", position: "0 0 -0.0625" })
  }
})

},{}],7:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("locomotion", {
  dependencies: ["position", "injectplayer"],
  schema: {
    speed: { type: "number", default: 4 },
    rotationSpeed: { type: "number", default: 1 },
    quantizeMovement: { type: "boolean", default: false },
    quantizeRotation: { type: "boolean", default: true },
    teleportDistance: { type: "number", default: 3 },
    godMode: { type: "boolean", default: false }
  },

  init: function () {
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onAxisMove = this._onAxisMove.bind(this)
    this._onButtonChanged = this._onButtonChanged.bind(this)
    this._onSwipeLeft = this._onSwipeLeft.bind(this)
    this._onSwipeRight = this._onSwipeRight.bind(this)
    this._onSwipeUp = this._onSwipeUp.bind(this)
    this._onSwipeDown = this._onSwipeDown.bind(this)
    this._onSwipeEnd = this._onSwipeEnd.bind(this)

    this._keysDown = {}
    this._axes = [0, 0, 0, 0]
    this._touchAxes = new THREE.Vector2()
    this._teleporting = true
    this._flyDir = 1
    this._bumpOverload = 0
    this.currentFloorPosition = new THREE.Vector3()
    this.centerPos = new THREE.Vector3()
    this.headPos = new THREE.Vector3()
    this.headDir = new THREE.Vector3()
    this.feetPos = new THREE.Vector3()

    this._camera = this.el.querySelector("a-camera")
    this._leftHand = this.el.querySelector("a-hand[side=\"left\"]")
    this._rightHand = this.el.querySelector("a-hand[side=\"right\"]")
    this._legs = this.el.sceneEl.ensure(".legs", "a-entity", {
      class: "legs", position: "0 0.5 0", // radius: 0.125, color: "blue",
      raycaster: {
        autoRefresh: false,
        objects: "[floor]",
        direction: "0 -1 0",
        far: 0.625,
        // showLine: true
      }
    })
    this._legBumper = this.el.sceneEl.ensure(".leg-bumper", "a-entity", {
      class: "leg-bumper", position: "0 0.5 0", // radius: 0.125, color: "red",
      raycaster: {
        autoRefresh: false,
        objects: "[floor], [wall]",
        // showLine: true
      }
    })
    this._headBumper = this.el.sceneEl.ensure(".head-bumper", "a-entity", {
      class: "head-bumper", position: "0 0.5 0", // radius: 0.125, color: "green",
      raycaster: {
        autoRefresh: false,
        objects: "[floor], [wall]",
        // showLine: true
      }
    })
    this._teleportBeam = this._camera.ensure(".teleportBeam", "a-entity", {
      class: "teleportBeam",
      raycaster: {
        autoRefresh: false,
        objects: "[floor], [wall]",
        // showLine: true
      }
    })
    this._teleportCursor = this.el.ensure(".teleport-cursor", "a-cylinder", {
      class: "teleport-cursor", radius: 0.5, height: 0.0625, material: "opacity:0.5;"
    })
  },

  update: function (oldData) {
    this._godMode = this.data.godMode
  },

  play: function () {
    document.addEventListener("keydown", this._onKeyDown)
    document.addEventListener("keyup", this._onKeyUp)
    this._leftHand.addEventListener("axismove", this._onAxisMove)
    this._rightHand.addEventListener("axismove", this._onAxisMove)
    this._leftHand.addEventListener("buttonchanged", this._onButtonChanged)
    this._rightHand.addEventListener("buttonchanged", this._onButtonChanged)
    this.el.sceneEl.canvas.addEventListener("swipeleft", this._onSwipeLeft)
    this.el.sceneEl.canvas.addEventListener("swiperight", this._onSwipeRight)
    this.el.sceneEl.canvas.addEventListener("swipeup", this._onSwipeUp)
    this.el.sceneEl.canvas.addEventListener("swipedown", this._onSwipeDown)
    this.el.sceneEl.canvas.addEventListener("touchend", this._onSwipeEnd)
  },

  pause: function () {
    document.removeEventListener("keydown", this._onKeyDown)
    document.removeEventListener("keyup", this._onKeyUp)
    this._leftHand.removeEventListener("axismove", this._onAxisMove)
    this._rightHand.removeEventListener("axismove", this._onAxisMove)
    this._leftHand.removeEventListener("buttonchanged", this._onButtonChanged)
    this._rightHand.removeEventListener("buttonchanged", this._onButtonChanged)
    this.el.sceneEl.canvas.removeEventListener("swipeleft", this._onSwipeLeft)
    this.el.sceneEl.canvas.removeEventListener("swiperight", this._onSwipeRight)
    this.el.sceneEl.canvas.removeEventListener("swipeup", this._onSwipeUp)
    this.el.sceneEl.canvas.removeEventListener("swipedown", this._onSwipeDown)
    this.el.sceneEl.canvas.removeEventListener("touchend", this._onSwipeEnd)
  },

  remove: function () {
    this.el.sceneEl.removeChild(this._legs)
    this.el.sceneEl.removeChild(this._legBumper)
    this.el.sceneEl.removeChild(this._headBumper)
  },

  tick: function (time, timeDelta) {
    timeDelta /= 1000
    this.el.object3D.getWorldPosition(this.centerPos)
    this.headPos.copy(this._camera.object3D.position)
    this._camera.object3D.parent.localToWorld(this.headPos)
    this.headDir.set(0, 0, -1)
      .applyQuaternion(this._camera.object3D.quaternion)
      .applyQuaternion(this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp()))
    this._legs.object3D.getWorldPosition(this.feetPos)
    this.feetPos.y -= 0.5

    this._applyToggles(timeDelta)
    this._applyMoveStick(timeDelta)
    this._applyAuxStick(timeDelta)

    // drag feet
    let head2toe = THREE.Vector3.temp()
      .copy(this.headPos).sub(this.feetPos)
    head2toe.y = 0
    if (head2toe.length() > 0.5) {
      head2toe.multiplyScalar(0.1)
      this._legs.object3D.position.add(head2toe)
      this.feetPos.add(head2toe)
    }

    // fall
    if (!this._godMode && !this._caution) {
      let ray = this._legs.components.raycaster
      ray.refreshObjects()
      let hit = ray.intersections[0]
      if (hit) {
        if (this.currentFloor === hit.object.el) {
          let delta = THREE.Vector3.temp()
          delta.copy(this.currentFloor.object3D.position).sub(this.currentFloorPosition)
          this._move(delta)
          delta.y = 0
          this._legs.object3D.position.add(delta)
        } else {
          if (this.currentFloor) this.currentFloor.emit("playerleave")
          hit.object.el.emit("playerenter")
        }
        this._move(THREE.Vector3.temp().set(0, 0.5 - hit.distance, 0))
        this.currentFloor = hit.object.el
        this.currentFloorPosition.copy(this.currentFloor.object3D.position)
      } else {
        if (this.currentFloor) this.currentFloor.emit("playerleave")
        this._move(THREE.Vector3.temp().set(0, -0.125, 0))
        this.currentFloor = null
      }
    }

    // bump walls
    if (this._godMode) {
      this._legBumper.object3D.position.copy(this._legs.object3D.position)
      this._headBumper.object3D.position.copy(this._legs.object3D.position)
    } else if (this._bumpOverload > 4 || Math.abs(this.headPos.y - this.feetPos.y) > 3) {
      this.feetPos.y = this.centerPos.y
      this._legs.object3D.position.y = this.feetPos.y + 0.5
      this.teleport(this._legBumper.object3D.position, true)
      if (this._bumpOverload) this._bumpOverload--
    } else {
      let pos = THREE.Vector3.temp()
      pos.copy(this.feetPos).y += 0.5
      this._bump(pos, this._legBumper)
      pos.copy(this.headPos)
      this._bump(pos, this._headBumper)
    }
  },

  teleport: function (pos, force) {
    let delta = THREE.Vector3.temp()
    delta.copy(pos).sub(this.feetPos)
    this._move(delta)
    this._legs.object3D.position.x = this.feetPos.x = this.headPos.x
    this._legs.object3D.position.z = this.feetPos.z = this.headPos.z
    this._caution = 8
    if (force) {
      this._legBumper.object3D.position.copy(this._legs.object3D.position)
      this._headBumper.object3D.position.copy(this._legs.object3D.position)
    }
  },

  toggleCrouch: function (reset) {
    let head2toe = this.headPos.y - this.feetPos.y
    let delta
    if (Math.abs(this.centerPos.y - this.feetPos.y) > 0.03125) {
      delta = this.feetPos.y - this.centerPos.y
    } else if (!reset) {
      if (head2toe > 1) {
        delta = -1
      } else {
        delta = 1
      }
    }
    this.el.removeAttribute("animation")
    if (delta) {
      this.el.setAttribute("animation", {
        property: "object3D.position.y",
        to: this.el.object3D.position.y + delta,
        dur: 256,
        // easing: "easeInOutSine"
      })
    }
  },

  _move: function (delta) {
    this.el.object3D.position.add(delta)
    this.centerPos.add(delta)
    this.headPos.add(delta)
    this._legs.object3D.position.y += delta.y
    this.feetPos.y += delta.y
  },
  _bump: function (pos, bumper) {
    let matrix = THREE.Matrix3.temp()
    let delta = THREE.Vector3.temp()
    delta.copy(pos)
    delta.sub(bumper.object3D.position)
    let dist = delta.length()
    if (dist) {
      bumper.setAttribute("raycaster", "far", dist + 0.125)
      bumper.setAttribute("raycaster", "direction", delta.normalize())
      // bumper.setAttribute("raycaster", "origin", delta.multiplyScalar(-0.25))
      ray = bumper.components.raycaster
      ray.refreshObjects()
      hit = ray.intersections[0]
      if (hit) {
        matrix.getNormalMatrix(hit.object.el.object3D.matrixWorld)
        delta
          .copy(hit.face.normal)
          .applyMatrix3(matrix)
          .normalize()
          .multiplyScalar(0.25 + dist / 2)
        let feety = this._legs.object3D.position.y
        this._move(delta)
        this._legs.object3D.position.y = feety
        this._caution = 4
        this._bumpOverload++
      } else if (this._caution) {
        this._caution--
      } else {
        if (this._bumpOverload) this._bumpOverload--
        bumper.object3D.position.lerp(pos, 0.25)
      }
    }
  },

  _callMoveStick() {
    let bestStick = THREE.Vector2.temp().set(0, 0)
    let stick = THREE.Vector2.temp()

    stick.set(0, 0)
    if (this._keysDown["a"]) stick.x--
    if (this._keysDown["d"]) stick.x++
    if (this._keysDown["w"] || this._keysDown["ArrowUp"]) stick.y--
    if (this._keysDown["s"] || this._keysDown["ArrowDown"]) stick.y++
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    stick.set(this._axes[0], this._axes[1])
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        stick.set(
          Math.abs(gamepad.axes[0]) > 0.25 ? gamepad.axes[0] : 0,
          Math.abs(gamepad.axes[1]) > 0.25 ? gamepad.axes[1] : 0
        )
        if (stick.length() > bestStick.length()) bestStick.copy(stick)
      }
    }

    if (bestStick.length() > 1) bestStick.normalize()
    return bestStick
  },
  _applyMoveStick: function (seconds) {
    let stick = this._callMoveStick()
    stick.multiplyScalar(this.data.speed)
    stick.multiplyScalar(seconds)
    let heading = THREE.Vector2.temp().set(this.headDir.z, -this.headDir.x).angle() - Math.PI
    let x2 = Math.cos(heading) * stick.x - Math.sin(heading) * stick.y
    let y2 = Math.sin(heading) * stick.x + Math.cos(heading) * stick.y
    let delta = THREE.Vector3.temp().set(x2, 0, y2)
    if (this.data.quantizeMovement) {
      this._quantTime = this._quantTime || 0
      this._quantDelta = this._quantDelta || new THREE.Vector3()
      this._quantTime += seconds
      this._quantDelta.add(delta)
      if (this._quantTime > 0.25) {
        this._quantTime -= 0.25
        delta.copy(this._quantDelta)
        this._quantDelta.set(0, 0, 0)
      } else {
        delta.set(0, 0, 0)
      }
    }
    this._move(delta)
  },

  _callAuxStick() {
    let bestStick = THREE.Vector2.temp().set(0, 0)
    let stick = THREE.Vector2.temp()

    stick.set(0, 0)
    if (this._keysDown["ArrowLeft"]) stick.x--
    if (this._keysDown["ArrowRight"]) stick.x++
    if (this._keysDown[" "]) stick.y--
    if (this._keysDown["Control"]) stick.y++
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    stick.set(this._axes[2], this._axes[3])
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    stick.copy(this._touchAxes)
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        stick.set(
          Math.abs(gamepad.axes[2]) > 0.25 ? gamepad.axes[2] : 0,
          Math.abs(gamepad.axes[3]) > 0.25 ? gamepad.axes[3] : 0
        )
        if (stick.length() > bestStick.length()) bestStick.copy(stick)
      }
    }

    if (bestStick.length() > 1) bestStick.normalize()
    return bestStick
  },
  _applyAuxStick: function (seconds) {
    let stick = this._callAuxStick()
    let rotation = 0

    // Rotation
    if (this.data.quantizeRotation) {
      if (Math.round(stick.x)) {
        if (!this._rotating) {
          this._rotating = true
          rotation = -Math.round(stick.x) * Math.PI / 4
        }
      } else {
        this._rotating = false
      }
    } else {
      rotation = -stick.x * this.data.rotationSpeed * seconds
    }
    if (rotation) {
      let pos = THREE.Vector2.temp()
      let pivot = THREE.Vector2.temp()
      let delta = THREE.Vector3.temp()
      pos.set(this.feetPos.x, this.feetPos.z)
      pivot.set(this.centerPos.x, this.centerPos.z)
      pos.rotateAround(pivot, -rotation)
      delta.set(this.feetPos.x - pos.x, 0, this.feetPos.z - pos.y)

      this.el.object3D.rotateY(rotation)
      this.el.object3D.position.add(delta)
      this.centerPos.add(delta)
    }

    // Crouching
    if (Math.round(stick.y) > 0) {
      if (this._godMode) {
        this.el.object3D.position.y += stick.y * this.data.speed * seconds * this._flyDir
        this._legs.object3D.position.y += stick.y * this.data.speed * seconds * this._flyDir
        this._crouching = true
      } else if (!this._crouching) {
        this._crouching = true
        this.toggleCrouch()
      }
    } else {
      if (this._crouching) this._flyDir *= -1
      this._crouching = false
    }

    // Teleportation!
    if (Math.round(stick.y) < 0) {
      if (!this._teleporting) {
        this._teleportCursor.setAttribute("visible", true)
        this._teleporting = true
      }
      let quat = THREE.Quaternion.temp()
      this._teleportCursor.object3D.getWorldQuaternion(quat)
      this._teleportCursor.object3D.quaternion.multiply(quat.conjugate().normalize()).multiply(quat.copy(this.el.object3D.quaternion).multiply(this._camera.object3D.quaternion))
      this._teleportCursor.object3D.quaternion.x = 0
      this._teleportCursor.object3D.quaternion.z = 0
      this._teleportCursor.object3D.quaternion.normalize()

      ray = this._teleportBeam.components.raycaster
      ray.refreshObjects()
      hit = ray.intersections[0]
      if (hit && hit.object.el.getAttribute("floor") != null) {
        let straight = THREE.Vector3.temp()
        let delta = THREE.Vector3.temp()
        let matrix = THREE.Matrix3.temp()
        delta.copy(hit.point).sub(this.feetPos)
        if (delta.y > 1.5) delta.multiplyScalar(0)
        if (delta.length() > this.data.teleportDistance) delta.normalize().multiplyScalar(this.data.teleportDistance)
        delta.add(this.feetPos)
        this._teleportCursor.object3D.position.copy(delta)
        this._teleportCursor.object3D.parent.worldToLocal(this._teleportCursor.object3D.position)

        matrix.getNormalMatrix(hit.object.el.object3D.matrixWorld)
        delta
          .copy(hit.face.normal)
          .applyMatrix3(matrix)
          .normalize()
        delta.applyQuaternion(quat.copy(this.el.object3D.quaternion).conjugate())
        straight.set(0, 1, 0)
        quat.setFromUnitVectors(straight, delta)
        this._teleportCursor.object3D.quaternion.premultiply(quat)
      } else {
        this._teleportCursor.object3D.position.copy(this.feetPos)
        this._teleportCursor.object3D.parent.worldToLocal(this._teleportCursor.object3D.position)
      }
    } else if (this._teleporting) {
      let pos = THREE.Vector3.temp()
      this._teleportCursor.object3D.getWorldPosition(pos)
      this.teleport(pos)
      this._teleportCursor.setAttribute("visible", false)
      this._teleportCursor.setAttribute("position", "0 0 0")
      this._teleporting = false
    }
  },

  _callToggles() {
    let toggles = 0

    if (this._keysDown["h"]) toggles = toggles | 1
    if (this._keysDown["g"]) toggles = toggles | 2
    if (this._vrRightClick) toggles = toggles | 1
    if (this._vrLeftClick) toggles = toggles | 2

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        if (gamepad.buttons[11].pressed) toggles = toggles | 1
        if (gamepad.buttons[10].pressed) toggles = toggles | 2
      }
    }

    return toggles
  },
  _applyToggles: function () {
    let toggles = this._callToggles()
    if (toggles) {
      if (!this._toggling) {
        if (toggles & 1) this.data.quantizeRotation = !this.data.quantizeRotation
        if (toggles & 2) {
          if (this.data.godMode) this._godMode = !this._godMode
          else this.data.quantizeMovement = !this.data.quantizeMovement
        }
      }
      this._toggling = true
    } else {
      this._toggling = false
    }
  },

  _onKeyDown(e) { this._keysDown[e.key] = true },
  _onKeyUp(e) { this._keysDown[e.key] = false },
  _onAxisMove(e) {
    if (e.srcElement.getAttribute("hand-controls").hand === "left") {
      this._axes[0] = e.detail.axis[2]
      this._axes[1] = e.detail.axis[3]
    } else {
      this._axes[2] = e.detail.axis[2]
      this._axes[3] = e.detail.axis[3]
    }
    if (!this._handEnabled) {
      this._teleportBeam.parentElement.removeChild(this._teleportBeam)
      this._teleportBeam = this._rightHand.ensure(".teleportBeam", "a-entity", {
        class: "teleportBeam",
        raycaster: {
          autoRefresh: false,
          objects: "[floor], [wall]",
        }
      })
      this._handEnabled = true
    }
  },
  _onButtonChanged: function (e) {
    if (e.srcElement.getAttribute("hand-controls").hand === "left") {
      if (e.detail.id == 3) this._vrLeftClick = e.detail.state.pressed
    } else {
      if (e.detail.id == 3) this._vrRightClick = e.detail.state.pressed
    }
  },
  _onSwipeLeft: function (e) { this._touchAxes.x = -1 },
  _onSwipeRight: function (e) { this._touchAxes.x = 1 },
  _onSwipeUp: function (e) { this._touchAxes.y = -1 },
  _onSwipeDown: function (e) { this._touchAxes.y = 1 },
  _onSwipeEnd: function (e) { this._touchAxes.set(0, 0) },
})

require("./locomotion/floor")
require("./locomotion/wall")
require("./locomotion/start")

},{"./locomotion/floor":8,"./locomotion/start":9,"./locomotion/wall":10}],8:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("floor", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update: function () {
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:static")
  }
})

},{}],9:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("start", {

  init: function () {
    let loco = this.el.sceneEl.querySelector("[locomotion]").components.locomotion
    let pos = new THREE.Vector3()
    // console.log("starting at", pos)

    setTimeout(() => {
      this.el.object3D.getWorldPosition(pos)
      loco.teleport(pos, true)
      setTimeout(() => {
        loco.toggleCrouch(true)
      }, 256)
    }, 256)
  }
})

},{}],10:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("wall", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update: function () {
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:static")
  }
})

},{}],11:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../libs/cmdCodec")

AFRAME.registerSystem("physics", {
  schema: {
    workerUrl: { type: "string" },
    gravity: { type: "vec3", default: { x: 0, y: -9.8, z: 0 } },
    debug: { type: "boolean", default: false }
  },

  update: function () {
    if (this.data.workerUrl) {
      if (!this.worker) {
        this.worker = new Worker(this.data.workerUrl)
        this.worker.addEventListener("message", this.onMessage.bind(this))
      }
      this.bodies = this.bodies || []
      this.movingBodies = this.movingBodies || []
      this.joints = this.joints || []
      this.buffers = [new Float64Array(8), new Float64Array(8)]
      this.worker.postMessage("world gravity = " + cmd.stringifyParam(this.data.gravity))
      this._debug = this.data.debug
    } else {
      this.remove()
    }
  },

  remove: function () {
    this.worker && this.worker.terminate()
    this.worker = null
    this.bodies = []
    this.movingBodies = []
  },

  tick: function (time, timeDelta) {
    if (!this.worker) return
    if (this.buffers.length < 2) return
    let buffer = this.buffers.shift()
    if (buffer.length < 8 * this.movingBodies.length) {
      let len = buffer.length
      while (len < 8 * this.movingBodies.length) {
        len *= 2
      }
      let bods = this.movingBodies
      buffer = new Float64Array(len)
      buffer.fill(NaN)
      let vec = THREE.Vector3.temp()
      let quat = THREE.Quaternion.temp()
      for (let i = 0; i < bods.length; i++) {
        let p = i * 8
        if (bods[i]) {
          bods[i].object3D.getWorldPosition(vec)
          buffer[p++] = vec.x
          buffer[p++] = vec.y
          buffer[p++] = vec.z
          p++
          bods[i].object3D.getWorldQuaternion(quat)
          buffer[p++] = quat.x
          buffer[p++] = quat.y
          buffer[p++] = quat.z
          buffer[p++] = quat.w
        }
      }
    }
    this.worker.postMessage(buffer, [buffer.buffer])
  },

  onMessage: function (e) {
    if (typeof e.data === "string") {
      let command = cmd.parse(e.data)
      switch (command.shift()) {
        case "world":
          this.command(command)
          break
      }
    }
    else if (e.data instanceof Float64Array) {
      this.buffers.push(e.data)
      while (this.buffers.length > 2)
        this.buffers.shift()
    }
  },

  command: function (params) {
    if (typeof params[0] === "number") {
      params.shift()
    }
    switch (params.shift()) {
      case "body":
        let id = params.shift()
        let body = this.bodies[id]
        if (body)
          body.components.body.command(params)
        break
    }
  }
})

require("./physics/body")
require("./physics/shape")
require("./physics/joint")

},{"../libs/cmdCodec":15,"./physics/body":12,"./physics/joint":13,"./physics/shape":14}],12:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("body", {
  dependencies: ["position", "rotation", "scale"],

  schema: {
    type: { type: "string", default: "static" },
    mass: { type: "number", default: 1 },
    belongsTo: { type: "int", default: 1 },
    collidesWith: { type: "int", default: 1 },
    emitsWith: { type: "int", default: 0 },
    sleeping: { type: "boolean", default: false },
    autoShape: { type: "boolean", default: true },
  },

  init: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let bodies = this.el.sceneEl.systems.physics.bodies
    let movingBodies = this.el.sceneEl.systems.physics.movingBodies
    let buffer = this.el.sceneEl.systems.physics.buffers[0]
    if (!worker) return
    this.id = bodies.indexOf(null)
    if (this.id < 0) this.id = bodies.length
    bodies[this.id] = this.el
    if (this.data.type !== "static") {
      this.mid = movingBodies.indexOf(null)
      if (this.mid < 0) this.mid = movingBodies.length
      movingBodies[this.mid] = this.el
    } else {
      this.mid = null
    }
    let body = { mid: this.mid }
    body.type = this.data.type
    body.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
    body.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    if (this.mid !== null) {
      let p = this.mid * 8
      buffer[p++] = body.position.x
      buffer[p++] = body.position.y
      buffer[p++] = body.position.z
      buffer[p++] = this.data.sleeping
      buffer[p++] = body.quaternion.x
      buffer[p++] = body.quaternion.y
      buffer[p++] = body.quaternion.z
      buffer[p++] = body.quaternion.w
    }
    this.shapes = []
    this.sleeping = true
    worker.postMessage("world body " + this.id + " create " + cmd.stringifyParam(body))
    // if (body.type === "static") 
    setTimeout(() => {
      body.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
      body.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
      worker.postMessage("world body " + this.id + " position = " + cmd.stringifyParam(body.position))
      worker.postMessage("world body " + this.id + " quaternion = " + cmd.stringifyParam(body.quaternion))
    })

    if (this.data.autoShape) {
      if (!this.el.getAttribute("shape")) {
        if (this.el.firstElementChild) {
          let els = this.el.querySelectorAll("a-box, a-sphere, a-cylinder")
          if (els) els.forEach(el => {
            if (!el.getAttribute("shape")) el.setAttribute("shape", true)
          })
        } else {
          this.el.setAttribute("shape", true)
        }
      }
    }
  },

  update: function (oldData) {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    if (this.data.type !== oldData.type)
      worker.postMessage("world body " + this.id + " type = " + cmd.stringifyParam(this.data.type))
    if (this.data.mass !== oldData.mass)
      worker.postMessage("world body " + this.id + " mass = " + cmd.stringifyParam(this.data.mass))
    if (this.data.belongsTo !== oldData.belongsTo)
      worker.postMessage("world body " + this.id + " belongsTo = " + cmd.stringifyParam(this.data.belongsTo))
    if (this.data.collidesWith !== oldData.collidesWith)
      worker.postMessage("world body " + this.id + " collidesWith = " + cmd.stringifyParam(this.data.collidesWith))
    if (this.data.emitsWith !== oldData.emitsWith)
      worker.postMessage("world body " + this.id + " emitsWith = " + cmd.stringifyParam(this.data.emitsWith))
    // if (this.data.sleeping !== oldData.sleeping)
    setTimeout(() => {
      worker.postMessage("world body " + this.id + " sleeping = " + !!(this.data.sleeping))
    })
  },

  pause: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    worker.postMessage("world body " + this.id + " sleeping = true")
    this.sleeping = true
  },

  remove: function () {
    if (this.data.autoShape) {
      this.el.removeAttibute("shape")
      if (this.el.firstElementChild) {
        let els = this.el.querySelectorAll("a-box, a-sphere, a-cylinder")
        if (els) els.forEach(el => {
          el.removeAttribute("shape")
        })
      }
    }

    let worker = this.el.sceneEl.systems.physics.worker
    let bodies = this.el.sceneEl.systems.physics.bodies
    let movingBodies = this.el.sceneEl.systems.physics.movingBodies
    if (!worker) return
    bodies[this.id] = null
    if (this.mid !== null)
      movingBodies[this.mid] = null
    worker.postMessage("world body " + this.id + " remove")
  },

  tick: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let buffer = this.el.sceneEl.systems.physics.buffers[0]
    if (!worker) return
    if (this.mid !== null) {
      let p = this.mid * 8
      if (buffer.length <= p) return
      if (this.data.type === "kinematic") {
        let vec = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
        buffer[p++] = vec.x
        buffer[p++] = vec.y
        buffer[p++] = vec.z
        this.sleeping = !!(buffer[p++])
        let quat = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
        buffer[p++] = quat.x
        buffer[p++] = quat.y
        buffer[p++] = quat.z
        buffer[p++] = quat.w
      } else if (buffer[p + 1]) {
        let quat = THREE.Quaternion.temp()

        this.el.object3D.position.set(buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.parent.worldToLocal(this.el.object3D.position)
        this.sleeping = !!(buffer[p++])

        this.el.object3D.getWorldQuaternion(quat)
        this.el.object3D.quaternion.multiply(quat.conjugate().normalize())
        quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.quaternion.multiply(quat.normalize())
      }
    }
  },

  command: function (params) {
    switch (params.shift()) {
      case "emits":
        let e = params.shift()
        switch (e.event) {
          case "collision":
            let bodies = this.el.sceneEl.systems.physics.bodies
            e.body1 = bodies[e.body1]
            e.body2 = bodies[e.body2]
            if (!e.body1 || !e.body2) return
            e.shape1 = e.body1.components.body.shapes[e.shape1]
            e.shape2 = e.body2.components.body.shapes[e.shape2]
            break
        }
        this.el.emit(e.event, e)
        break
    }
  }
})


},{"../../libs/cmdCodec":15}],13:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("joint", {
  // dependencies: ["body", "shape"],
  multiple: true,

  schema: {
    type: { type: "string", default: "ball" },
    body1: { type: "selector" },
    body2: { type: "selector" },
    pivot1: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    pivot2: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    axis1: { type: "vec3", default: { x: 0, y: 1, z: 0 } },
    axis2: { type: "vec3", default: { x: 0, y: 1, z: 0 } },
    min: { type: "number", default: 0 },
    max: { type: "number", default: 1 },
    collision: { type: "boolean", default: true },
    // limit: { type: "array" },
    // motor: { type: "array" },
    // spring: { type: "array" },
  },

  init: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    this.id = joints.indexOf(null)
    if (this.id < 0) this.id = joints.length
    joints[this.id] = this.el

    setTimeout(() => {
      let joint = {}
      joint.type = this.data.type
      joint.body1 = this.data.body1 ? this.data.body1.components.body.id : this.el.components.body.id
      joint.body2 = this.data.body2.components.body.id
      joint.pivot1 = this.data.pivot1
      joint.pivot2 = this.data.pivot2
      joint.axis1 = this.data.axis1
      joint.axis2 = this.data.axis2
      joint.min = this.data.min
      joint.max = this.data.max
      joint.collision = this.data.collision
      worker.postMessage("world joint " + this.id + " create " + cmd.stringifyParam(joint))
    })
  },

  update: function (oldData) {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    // if (this.data.type !== oldData.type)
    //   worker.postMessage("world joint " + this.id + " type = " + cmd.stringifyParam(this.data.type))
  },

  remove: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    joints[this.id] = null
    worker.postMessage("world joint " + this.id + " remove")
  },

})


},{"../../libs/cmdCodec":15}],14:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("shape", {
  // dependencies: ["body"],
  multiple: true,
  schema: {
  },

  init: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    setTimeout(() => {
      this.body = this.el
      while (this.body && !this.body.matches("[body]")) this.body = this.body.parentElement
      this.bodyId = this.body.components.body.id

      let shapes = this.body.components.body.shapes
      this.id = shapes.indexOf(null)
      if (this.id < 0) this.id = shapes.length
      shapes[this.id] = this.el

      let shape = {}
      shape.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
      this.body.object3D.worldToLocal(shape.position)
      shape.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
      let bodyquat = this.body.object3D.getWorldQuaternion(THREE.Quaternion.temp())
      shape.quaternion.multiply(bodyquat.conjugate().normalize()).normalize()
      shape.size = THREE.Vector3.temp().set(1, 1, 1)

      switch (this.el.tagName.toLowerCase()) {
        case "a-sphere":
          shape.type = "sphere"
          shape.size.multiplyScalar(parseFloat(this.el.getAttribute("radius") || 1) * 2)
          break
        case "a-cylinder":
          shape.type = "cylinder"
          shape.size.multiplyScalar(parseFloat(this.el.getAttribute("radius") || 1) * 2).y = parseFloat(this.el.getAttribute("height") || 1)
          break
        case "a-box":
          shape.type = "box"
          shape.size.set(
            parseFloat(this.el.getAttribute("width") || 1),
            parseFloat(this.el.getAttribute("height") || 1),
            parseFloat(this.el.getAttribute("depth") || 1)
          )
          break
        // case "a-plane":
        //   shape.type = "plane"
        //   break
      }
      shape.size.multiply(this.el.object3D.getWorldScale(THREE.Vector3.temp()))

      worker.postMessage("world body " + this.bodyId + " shape " + this.id + " create " + cmd.stringifyParam(shape))
    })

  },

  update: function () {
  },

  remove: function () {
    if (!this.body) return
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    let shapes = this.body.components.body.shapes
    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " remove")
    shapes[this.id] = null
  }
})


},{"../../libs/cmdCodec":15}],15:[function(require,module,exports){
module.exports = {
  parse: function (cmd) {
    let words = cmd.split(" ")
    let args = []
    for (let word of words) {
      if (word) {
        try {
          args.push(JSON.parse(word))
        } catch (error) {
          if (word !== "=")
            args.push(word)
        }
      }
    }
    return args
  },
  stringifyParam: function (val) {
    return JSON.stringify(val).replaceAll(" ", "\\u0020").replaceAll("\"_", "\"")
  }
}
},{}],16:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.AEntity.prototype.copyWorldPosRot = function (srcEl) {
  let quat = THREE.Quaternion.temp()
  let src = srcEl.object3D
  let dest = this.object3D
  if (!src) return
  if (!dest) return
  if (!dest.parent) return
  src.getWorldPosition(dest.position)
  dest.parent.worldToLocal(dest.position)

  dest.getWorldQuaternion(quat)
  dest.quaternion.multiply(quat.conjugate().normalize())
  src.getWorldQuaternion(quat)
  dest.quaternion.multiply(quat.normalize())
}
},{}],17:[function(require,module,exports){
Element.prototype.ensure = function (selector, name = selector, attrs = {}) {
  let _childEl, attr, val
  _childEl = this.querySelector(selector)
  if (!_childEl) {
    _childEl = document.createElement(name)
    this.appendChild(_childEl)
    for (attr in attrs) {
      val = attrs[attr]
      _childEl.setAttribute(attr, val)
    }
    // _childEl.flushToDOM()
  }
  return _childEl
}
},{}],18:[function(require,module,exports){
/* global AFRAME, THREE */

function makePool(Class) {
  Class._pool = []
  Class._inUse = []
  Class.temp = function () {
    let v = Class._pool.pop() || new Class()
    Class._inUse.push(v)
    if (!Class._gc)
      Class._gc = setTimeout(Class._recycle)
    return v
  }
  Class._recycle = function () {
    while (Class._inUse.length)
      Class._pool.push(Class._inUse.pop())
    Class._gc = false
  }
}

makePool(THREE.Vector2)
makePool(THREE.Vector3)
makePool(THREE.Quaternion)
makePool(THREE.Matrix3)
makePool(THREE.Matrix4)

},{}],19:[function(require,module,exports){
let _addEventListener = Element.prototype.addEventListener
let _removeEventListener = Element.prototype.removeEventListener
let init = el => {
  if (el._tgest) return el._tgest
  el._tgest = {
    handlers: {
      swipeup: [],
      swipedown: [],
      swipeleft: [],
      swiperight: [],
      tap: [],
      hold: []
    }
  }
  let cx, cy, to, held
  let emit = (type, e) => {
    if (el._tgest.handlers[type]) {
      for (let handler of el._tgest.handlers[type]) {
        handler(e)
      }
    } else console.log(type, el._tgest.handlers[type])
  }
  el.addEventListener("touchstart", e => {
    cx = e.changedTouches[0].screenX
    cy = e.changedTouches[0].screenY
    held = false
    to = setTimeout(() => {
      held = true
      emit("hold", e)
    }, 512)
  })
  el.addEventListener("touchmove", e => {
    let x = e.changedTouches[0].screenX,
      y = e.changedTouches[0].screenY,
      l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
    if (l > 32) {
      clearTimeout(to)
      if (held) return
      if (Math.abs(cx - x) > Math.abs(cy - y)) {
        if (x < cx) emit("swipeleft", e)
        else emit("swiperight", e)
      } else {
        if (y < cy) emit("swipeup", e)
        else emit("swipedown", e)
      }
      held = true
    }
  })
  el.addEventListener("touchend", e => {
    clearTimeout(to)
    let x = e.changedTouches[0].screenX,
      y = e.changedTouches[0].screenY,
      l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
    if (l < 32) {
      if (held) return
      emit("tap", e)
    }
  })

  return el._tgest
}
Element.prototype.addEventListener = function (eventtype, handler) {
  switch (eventtype) {
    case "swipeup":
    case "swipedown":
    case "swipeleft":
    case "swiperight":
    case "tap":
    case "hold":
      let tg = init(this)
      tg.handlers[eventtype].push(handler)
      break
    default:
      return _addEventListener.call(this, eventtype, handler)
  }
}
Element.prototype.removeEventListener = function (eventtype, handler) {
  switch (eventtype) {
    case "swipeup":
    case "swipedown":
    case "swipeleft":
    case "swiperight":
    case "tap":
    case "hold":
      let tg = init(this)
      let i = tg.handlers[eventtype].indexOf(handler)
      if (i >= 0) tg.handlers[eventtype].splice(i, 1)
      break
    default:
      return _removeEventListener.call(this, eventtype, handler)
  }
}

},{}],20:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerPrimitive("a-hand", {
  mappings: {
    side: "hand-controls.hand",
    color: "hand-controls.color",
    model: "hand-controls.handModelStyle",
  }
})

},{}],21:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerPrimitive("a-main", {})
},{}],22:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerPrimitive("a-player", {
  defaultComponents: {
    injectplayer: {}
  }
})
},{}]},{},[2]);
