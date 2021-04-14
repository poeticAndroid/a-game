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

    this._keysDown = {}
    this.centerPos = new THREE.Vector3()
    this.headPos = new THREE.Vector3()
    this.headDir = new THREE.Vector3()
    this.feetPos = new THREE.Vector3()

    this._camera = this.el.querySelector("a-camera")
    this._cameraObj = this._camera.querySelector(".tracker")
    this._leftHand = this.el.querySelector("a-hand[side=\"left\"]")
    this._rightHand = this.el.querySelector("a-hand[side=\"right\"]")
    this._legs = this.el.sceneEl.ensure(".legs", "a-sphere", {
      class: "legs", position: "0 0.5 0", radius: 0.125, color: "blue",
      raycaster: {
        autoRefresh: false,
        objects: "[floor]",
        direction: "0 -1 0",
        far: 0.625,
        // showLine: true
      }
    })
    this._legBumper = this.el.sceneEl.ensure(".legBumper", "a-sphere", {
      class: "legBumper", position: "0 15 0", radius: 0.125, color: "red",
      raycaster: {
        autoRefresh: false,
        objects: "[floor], [wall]",
        showLine: true
      }
    })
    this._headBumper = this.el.sceneEl.ensure(".headBumper", "a-entity", {
      class: "headBumper", position: "0 15 0",
      raycaster: {
        autoRefresh: false,
        objects: "[floor], [wall]",
        // showLine: true
      }
    })
  },

  update: function (oldData) {
  },

  play: function () {
    document.addEventListener("keydown", this._onKeyDown)
    document.addEventListener("keyup", this._onKeyUp)
  },

  pause: function () {
    document.removeEventListener("keydown", this._onKeyDown)
    document.removeEventListener("keyup", this._onKeyUp)
  },

  remove: function () {
    this.el.sceneEl.removeChild(this._legs)
    this.el.sceneEl.removeChild(this._legBumper)
    this.el.sceneEl.removeChild(this._headBumper)
  },

  tick: function (time, timeDelta) {
    timeDelta /= 1000
    this.el.object3D.getWorldPosition(this.centerPos)
    this._cameraObj.object3D.getWorldPosition(this.headPos)
    this._cameraObj.object3D.getWorldDirection(this.headDir)
    this._legs.object3D.getWorldPosition(this.feetPos)
    this.feetPos.y -= 0.5

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
    if (!this._caution) {
      let ray = this._legs.components.raycaster
      ray.refreshObjects()
      let hit = ray.intersections[0]
      if (hit) {
        this._move(THREE.Vector3.temp().set(0, 0.5 - hit.distance, 0))
      } else {
        this._move(THREE.Vector3.temp().set(0, -0.125, 0))
      }
    }

    // bump walls
    this._bump(this._legs, this._legBumper)
    this._bump(this._cameraObj, this._headBumper)
  },

  _move: function (delta) {
    this.el.object3D.position.add(delta)
    this.centerPos.add(delta)
    this.headPos.add(delta)
    this._legs.object3D.position.y += delta.y
    this.feetPos.y += delta.y
  },
  _toggleCrouch: function (reset) {
    let head2toe = this.headPos.y - this.feetPos.y
    let delta
    if (this.centerPos.y !== this.feetPos.y) {
      delta = this.feetPos.y - this.centerPos.y
    } else if (!reset) {
      if (head2toe > 1) {
        delta = -1
      } else {
        delta = 1
      }
    }
    if (delta) {
      this.el.setAttribute("animation", {
        property: "object3D.position.y",
        to: this.el.object3D.position.y + delta,
        dur: 256,
        // easing: "easeInOutSine"
      })
    }
  },

  _bump: function (object, bumper) {
    let matrix = THREE.Matrix3.temp()
    let delta = THREE.Vector3.temp()
    object.object3D.getWorldPosition(delta)
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
          .multiplyScalar(0.125 + dist)
        this._move(delta)
        delta.y = 0
        this._legs.object3D.position.add(delta)
        this._caution = 4
      } else if (this._caution) {
        this._caution--
      } else {
        bumper.object3D.position.lerp(this._legs.object3D.position, 0.25)
      }
    }
  },

  _callMoveStick() {
    let stick = THREE.Vector2.temp().set(0, 0)
    if (this._keysDown["a"]) stick.x--
    if (this._keysDown["d"]) stick.x++
    if (this._keysDown["w"] || this._keysDown["ArrowUp"]) stick.y--
    if (this._keysDown["s"] || this._keysDown["ArrowDown"]) stick.y++
    return stick
  },
  _applyMoveStick: function (seconds) {
    let stick = this._callMoveStick()
    stick.multiplyScalar(this.data.speed)
    stick.multiplyScalar(seconds)
    let heading = THREE.Vector2.temp().set(-this.headDir.z, this.headDir.x).angle() - Math.PI
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
    let stick = THREE.Vector2.temp().set(0, 0)
    if (this._keysDown["ArrowLeft"]) stick.x--
    if (this._keysDown["ArrowRight"]) stick.x++
    if (this._keysDown["Space"]) stick.y--
    if (this._keysDown["Control"]) stick.y++
    return stick
  },
  _applyAuxStick: function (seconds) {
    let stick = this._callAuxStick()
    let rotation = 0
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
    if (Math.round(stick.y) > 0) {
      if (!this._crouching) {
        this._crouching = true
        this._toggleCrouch()
      }
    } else {
      this._crouching = false
    }
  },

  _onKeyDown(e) { this._keysDown[e.key] = true },
  _onKeyUp(e) { this._keysDown[e.key] = false },
})

require("./locomotion/floor")
require("./locomotion/wall")
require("./locomotion/start")
