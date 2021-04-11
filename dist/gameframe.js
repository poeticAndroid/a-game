(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("locomotion", {
  dependencies: ["position"],
  schema: {
    acceleration: { type: "number", default: 65 },
    rotationSpeed: { type: "number", default: 1 },
    quantizeMovement: { type: "boolean", default: false },
    quantizeRotation: { type: "boolean", default: true },
    teleportDistance: { type: "number", default: 3 },
    godMode: { type: "boolean", default: false }
  },

  init: function () {
    // Do something when component first attached.
    this.playCenter = new THREE.Vector3() // Center/origin of VR playarea
    this.playerPos = new THREE.Vector3() // position of camera projected down onto the floor
    this.feetPos = new THREE.Vector3() // position of player's dragging feet
    this.safeHeadPos = new THREE.Vector3() // last known safe position of player's head
    this.safeFeetPos = new THREE.Vector3() // last known safe position of player's feet
    this.cameraPos = new THREE.Vector3() // position of camera
    this.cameraDir = new THREE.Vector3() // direction of camera
    this.angle = 0
    this.floorOffset = 0

    this._ensurePlayer()
    this._camera = this.el.querySelector("a-camera")
    this._cameraObj = this._camera.querySelector(".tracker")
    this._leftHand = this.el.querySelector(".left-hand")
    this._rightHand = this.el.querySelector(".right-hand")
    this._cursor = this._camera.ensure("a-cursor.locomotion", "a-cursor", {
      class: "locomotion",
      raycaster: { origin: { x: 0, y: 0, z: 0.5 } },
      autoRefresh: false,
      objects: "[floor], [wall]",
      position: { x: 0, y: 0, z: -0.5 }
    })
    this._cursorBall = this._cursor.ensure("a-sphere", "a-sphere", { radius: 0.0625, color: "#0ff", visible: false })
    this._vehicle = this.el.ensure(".locomotion-vehicle", "a-entity", {
      class: "locomotion-vehicle",
      position: { x: 0, y: 0.5, z: 0 },
      raycaster: { autoRefresh: false, direction: { x: 0, y: -1, z: 0 }, far: 0.6, objects: "[floor]" }
    })
    this._bumper = this._vehicle.ensure(".locomotion-bumper", "a-entity", {
      class: "locomotion-bumper",
      raycaster: { autoRefresh: false, direction: { x: 1, y: 0, z: 0 }, far: 1, objects: "[wall]" }
    })
    this._helmet = this.el.ensure(".locomotion-helmet", "a-entity", {
      class: "locomotion-helmet",
      position: { x: 0, y: 1.5, z: 0 },
      raycaster: { autoRefresh: false, direction: { x: 1, y: 0, z: 0 }, far: 1, objects: "[wall], [floor]" }
    })

    this.enableHands = this.enableHands.bind(this)
    this.toggleCrouch = this.toggleCrouch.bind(this)
    this._axisMove = this._axisMove.bind(this)
    this._buttonChanged = this._buttonChanged.bind(this)
    this._keyDown = this._keyDown.bind(this)
    this._keyUp = this._keyUp.bind(this)
    this._fireDown = this._fireDown.bind(this)
    this._fireUp = this._fireUp.bind(this)
    this._turnLeft = this._turnLeft.bind(this)
    this._turnRight = this._turnRight.bind(this)
    this._getBackUp = this._getBackUp.bind(this)
    this._rightHand.addEventListener("buttonchanged", this.enableHands)
    this._leftHand.addEventListener("axismove", this._axisMove)
    this._leftHand.addEventListener("buttonchanged", this._buttonChanged)
    this._rightHand.addEventListener("axismove", this._axisMove)
    this._rightHand.addEventListener("buttonchanged", this._buttonChanged)
    this._rightHand.addEventListener("buttonchanged", this.enableHands)
    addEventListener("keydown", this._keyDown)
    addEventListener("keyup", this._keyUp)
    document.querySelector("canvas").addEventListener("swipeleft", this._turnLeft)
    document.querySelector("canvas").addEventListener("swiperight", this._turnRight)
    document.querySelector("canvas").addEventListener("swipedown", this.toggleCrouch)
    document.querySelector("canvas").addEventListener("swipeup", this._fireDown)
    document.querySelector("canvas").addEventListener("touchend", this._fireUp)

    this._nextMove = 0
    this._targetDir = 0
    this._alt = 0
    this._lastFloorPos = new THREE.Vector3()
  },

  update: function () {
    // Do something when component's data is updated.
    this._camera.setAttribute("wasd-controls", "acceleration", this.data.acceleration)
    this._allowGod = this.data.godMode
    this._godMode = this.data.godMode
  },

  remove: function () {
    // Do something the component or its entity is detached.
    this._rightHand.removeEventListener("buttonchanged", this.enableHands)
    this._leftHand.removeEventListener("axismove", this._axisMove)
    this._leftHand.removeEventListener("buttonchanged", this._buttonChanged)
    this._rightHand.removeEventListener("axismove", this._axisMove)
    this._rightHand.removeEventListener("buttonchanged", this._buttonChanged)
    this._rightHand.removeEventListener("buttonchanged", this.enableHands)
    removeEventListener("keydown", this._keyDown)
    removeEventListener("keyup", this._keyUp)
    document.querySelector("canvas").removeEventListener("swipeleft", this._turnLeft)
    document.querySelector("canvas").removeEventListener("swiperight", this._turnRight)
    document.querySelector("canvas").removeEventListener("swipedown", this.toggleCrouch)
    document.querySelector("canvas").removeEventListener("swipeup", this._fireDown)
    document.querySelector("canvas").removeEventListener("touchend", this._fireUp)
  },

  tick: function (time, timeDelta) {
    let dir = THREE.Vector2.temp()
    let camdir = THREE.Vector2.temp()
    let pivot = THREE.Vector2.temp()
    let delta = THREE.Vector3.temp()
    let matrix = THREE.Matrix3.temp()
    let gamepad, i, l, len, mk, ref, rk
    this._cameraObj.object3D.updateMatrix()
    // Do something on every scene tick or frame.
    this._cameraObj.object3D.getWorldPosition(this.cameraPos)
    this._cameraObj.object3D.getWorldDirection(this.cameraDir)
    this.el.object3D.getWorldPosition(this.playCenter)
    this.playerPos.set(this.cameraPos.x, this.playCenter.y - this.floorOffset, this.cameraPos.z)
    if (this.cameraPos.y < this.playerPos.y) this.toggleCrouch()

    delta.set(this._camera.object3D.position.x - this._vehicle.object3D.position.x, 0, this._camera.object3D.position.z - this._vehicle.object3D.position.z)
    if (delta.length() > 0.5) this._vehicle.object3D.position.add(delta.multiplyScalar(0.1))
    this._vehicle.object3D.getWorldPosition(this.feetPos)
    this.feetPos.y = this.playerPos.y

    delta.set(this.safeFeetPos.x - this.feetPos.x, this.safeFeetPos.y - this.feetPos.y, this.safeFeetPos.z - this.feetPos.z)
    this._bumper.object3D.position.copy(delta)
    this._bumper.setAttribute("raycaster", "far", delta.length() + 0.125)
    this._bumper.setAttribute("raycaster", "direction", AFRAME.utils.coordinates.stringify(delta.multiplyScalar(-1).normalize()))

    delta.set(this.cameraPos.x - this.safeHeadPos.x, this.cameraPos.y - this.safeHeadPos.y, this.cameraPos.z - this.safeHeadPos.z)
    this.el.object3D.worldToLocal(this._helmet.object3D.position.copy(this.safeHeadPos))
    this._helmet.setAttribute("raycaster", "far", delta.length() + 0.125)
    this._helmet.setAttribute("raycaster", "direction", AFRAME.utils.coordinates.stringify(delta.normalize()))

    if (!this._godMode) {
      this._vehicle.components.raycaster.refreshObjects()
      if (this._vehicle.components.raycaster.intersections[0]) {
        let int = this._vehicle.components.raycaster.intersections[0]
        let p = int.point
        this.moveTo(this.playerPos.x, Math.max(p.y, this.playerPos.y - 0.1), this.playerPos.z)
        if (this._lastFloor == int.object.el) {
          delta.copy(this._lastFloor.object3D.position).sub(this._lastFloorPos)
          this.playCenter.add(delta)
          this.playerPos.add(delta)
          this.cameraPos.add(delta)
          this.feetPos.add(delta)
          this.el.object3D.position.add(delta)
        }
        this._lastFloor = int.object.el
        this._lastFloorPos.copy(this._lastFloor.object3D.position)
      } else {
        this.moveTo(this.playerPos.x, this.playerPos.y - 0.1, this.playerPos.z)
        this._lastFloor = null
      }

      this._bumper.components.raycaster.refreshObjects()
      if (this._bumper.components.raycaster.intersections[0]) {
        let int = this._bumper.components.raycaster.intersections[0]
        matrix.getNormalMatrix(int.object.el.object3D.matrixWorld)
        delta
          .copy(int.face.normal)
          .applyMatrix3(matrix)
          .normalize()
          .multiplyScalar(0.25)
        this.playCenter.add(delta)
        this.playerPos.add(delta)
        this.cameraPos.add(delta)
        this.feetPos.add(delta)
        this.el.object3D.position.add(delta)
      }
      this.safeFeetPos.lerp(this.feetPos, 0.125)

      this._helmet.components.raycaster.refreshObjects()
      if (this._helmet.components.raycaster.intersections[0]) {
        let int = this._helmet.components.raycaster.intersections[0]
        matrix.getNormalMatrix(int.object.el.object3D.matrixWorld)
        delta
          .copy(int.face.normal)
          .applyMatrix3(matrix)
          .normalize()
          .multiplyScalar(0.25)
        if (Math.abs(delta.y) > Math.abs(delta.x) && Math.abs(delta.y) > Math.abs(delta.z)) {
          this.floorOffset += delta.y
          this._vehicle.object3D.position.y = 0.5 - this.floorOffset
          setTimeout(this._getBackUp, 10000)
        } else {
          this.moveBy(delta.x, delta.y, delta.z, true)
        }
      }
      this.safeHeadPos.lerp(this.cameraPos, 0.125)
    }

    camdir.set(this.cameraDir.z, -this.cameraDir.x)

    mk = (timeDelta * this.data.acceleration) / 25000
    rk = (timeDelta / 1000) * -this.data.rotationSpeed
    dir.set(0, 0)
    let rot = 0,
      alt = 0
    this._btnDown = this._btnDown ? this._btnDown - 1 : 0
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        dir.x += Math.abs(gamepad.axes[0]) > 0.25 ? gamepad.axes[0] : 0
        dir.y += Math.abs(gamepad.axes[1]) > 0.25 ? gamepad.axes[1] : 0
        rot += Math.round(gamepad.axes[2])
        alt += Math.round(gamepad.axes[3])
        if (gamepad.buttons[10].pressed) {
          if (this._allowGod) {
            if (this._btnDown == 0) this._godMode = !this._godMode
          }
          else {
            if (this._btnDown == 0) this.data.quantizeMovement = !this.data.quantizeMovement
          }
          this._btnDown = 3
        }
        if (gamepad.buttons[11].pressed) {
          if (this._btnDown == 0) this.data.quantizeRotation = !this.data.quantizeRotation
          this._btnDown = 3
        }
      }
    }
    if (this._axes) {
      dir.x += Math.abs(this._axes[0]) > 0.25 ? this._axes[0] : 0
      dir.y += Math.abs(this._axes[1]) > 0.25 ? this._axes[1] : 0
      rot += Math.round(this._axes[2])
      alt += Math.round(this._axes[3])
    }
    if (this.data.quantizeMovement) {
      mk = 0
      if (Math.round(dir.length())) {
        dir.normalize()
        if (this._nextMove < time) {
          mk = (256 * this.data.acceleration) / 25000
          this._nextMove = time + 256
        }
      }
    }
    if (this.data.quantizeRotation && rot != 0) {
      if (this._rotated) rk = 0
      else rk = -Math.PI / 4
    }
    this._rotated = rot != 0

    if (alt < 0) {
      if (this._alt >= 0) {
        this._cursor.setAttribute("raycaster", "showLine", true)
        this._cursorBall.setAttribute("visible", true)
      }
      this._cursor.components.raycaster.refreshObjects()
      let ray = this._cursor.components.raycaster
      let int = ray.intersections[0]
      this._cursorBall.object3D.position.set(0, 0, int && -int.distance + this._cursor.components.raycaster.data.origin.z)

      if (int && int.object.el.getAttribute("floor") != null && int.point.y < this.playerPos.y + 1.5) {
        this._cursorBall.setAttribute("color", "#0f0")
        if (this.playerPos.distanceTo(int.point) > this.data.teleportDistance) {
          delta.copy(int.point).sub(this.playerPos)
          delta.normalize().multiplyScalar(this.data.teleportDistance)
          this._cursorBall.object3D.parent.worldToLocal(this._cursorBall.object3D.position.copy(this.playerPos).add(delta))
        }
      } else {
        this._cursorBall.setAttribute("color", "#f00")
      }
    }
    if (alt == 0) {
      if (this._alt < 0) {
        this._cursor.setAttribute("raycaster", "showLine", false)
        this._cursorBall.setAttribute("visible", false)

        let ray = this._cursor.components.raycaster
        let int = ray.intersections[0]
        if (int && int.object.el.getAttribute("floor") != null && int.point.y < this.playerPos.y + 1.5) {
          // teleport!
          if (this.playerPos.distanceTo(int.point) <= this.data.teleportDistance) {
            this.moveTo(int.point.x, int.point.y, int.point.z, false, true)
          } else {
            delta.copy(int.point).sub(this.playerPos)
            delta
              .normalize()
              .multiplyScalar(this.data.teleportDistance)
              .add(this.playerPos)
            this.moveTo(delta.x, delta.y, delta.z, false, true)
          }
        }
      }
    }
    if (alt > 0) {
      if (this._alt <= 0) {
        this.toggleCrouch()
      }
    }
    this._alt = alt
    dir.multiplyScalar(mk)
    let fwd = dir.y
    if (this._godMode) dir.y = 0
    pivot.set(0, 0)
    dir.rotateAround(pivot, camdir.angle())
    if (rot) this.rotateBy(rot * rk)
    this.moveBy(dir.x, 0, dir.y)
    if (this._godMode)
      this.moveBy(this.cameraDir.x * fwd, this.cameraDir.y * fwd, this.cameraDir.z * fwd)
  },

  moveBy: function (x, y, z, safe, stand) {
    let delta = THREE.Vector3.temp()
    let delta2 = THREE.Vector2.temp()
    let pivot = THREE.Vector2.temp()
    delta.set(x, y, z)
    delta2.set(-x, -z)
    pivot.set(0, 0)
    delta2.rotateAround(pivot, this.angle)

    let feetY = this._vehicle.object3D.position.y
    this._vehicle.object3D.position.x += delta2.x
    this._vehicle.object3D.position.z += delta2.y

    this.playCenter.add(delta)
    this.playerPos.add(delta)
    this.cameraPos.add(delta)
    this.el.object3D.position.add(delta)
    if (safe || this._godMode) {
      this.safeFeetPos.copy(this.playerPos)
      this.safeHeadPos.copy(this.cameraPos)
    }
    if (stand || this._godMode) {
      this._vehicle.object3D.position.copy(this._camera.object3D.position)
    }
    this._vehicle.object3D.position.y = feetY
  },
  moveTo: function (x, y, z, safe, stand) {
    this.moveBy(x - this.playerPos.x, y - this.playerPos.y, z - this.playerPos.z, safe, stand)
  },

  rotateBy: function (angle) {
    let pos = THREE.Vector2.temp()
    let pivot = THREE.Vector2.temp()
    let delta = THREE.Vector3.temp()
    this.moveTo(this.feetPos.x, this.feetPos.y, this.feetPos.z)

    pos.set(this.playerPos.x, this.playerPos.z)
    pivot.set(this.playCenter.x, this.playCenter.z)
    pos.rotateAround(pivot, -angle)
    delta.set(this.playerPos.x - pos.x, 0, this.playerPos.z - pos.y)

    this.el.object3D.rotateY(angle)
    this._vehicle.object3D.rotateY(-angle)
    this.el.object3D.position.add(delta)
    this.playCenter.add(delta)
    this.angle += angle
    if (this.angle > Math.PI) this.angle -= Math.PI * 2
    if (this.angle < -Math.PI) this.angle += Math.PI * 2
  },

  enableHands: function () {
    let _cursor = this._camera.querySelector("a-cursor")
    if (_cursor) {
      this._camera.removeChild(_cursor)

      this._cursor = this._rightHand.ensure("a-cursor.locomotion", "a-cursor", {
        autoRefresh: false,
        class: "locomotion",
        objects: "[floor], [wall]",
        position: { x: 0, y: 0, z: 0 }
      })
      this._cursorBall = this._cursor.ensure("a-sphere", "a-sphere", { radius: 0.0625, color: "#0ff", visible: false })

      this._rightHand.removeEventListener("buttonchanged", this.enableHands)
      this.hasHands = true
    }
  },

  toggleCrouch: function () {
    if (this.floorOffset) {
      this.floorOffset = 0
      this.moveTo(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z)
    } else {
      this.floorOffset = -1
      this.moveTo(this.playerPos.x, this.playerPos.y - 0.8, this.playerPos.z)
    }
    this._vehicle.object3D.position.y = 0.5 - this.floorOffset
  },

  _ensurePlayer: function () {
    let cam = this.el.ensure("a-camera", "a-camera", { "look-controls": { pointerLockEnabled: true, touchEnabled: false } })
    cam.ensure(".tracker", "a-entity", { class: "tracker" })
    let boxsize = 0.0625
    let leftHand = this.el.ensure(".left-hand", "a-entity", { class: "left-hand" })
    let leftHitbox = leftHand.ensure(".left-hitbox", "a-box", { class: "left-hitbox", position: "0 -0 0.0625", material: "visible:false", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
    let leftGlove = leftHitbox.ensure(".left-glove", "a-entity", { class: "left-glove", position: "0 0 -0.0625" })
    let rightHand = this.el.ensure(".right-hand", "a-entity", { class: "right-hand" })
    let rightHitbox = rightHand.ensure(".right-hitbox", "a-box", { class: "right-hitbox", position: "0 -0 0.0625", material: "visible:false", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
    let rightGlove = rightHitbox.ensure(".right-glove", "a-entity", { class: "right-glove", position: "0 0 -0.0625" })
    setTimeout(() => {
      leftHand.setAttribute("hand-controls", { hand: "left", handEntity: leftGlove })
      rightHand.setAttribute("hand-controls", { hand: "right", handEntity: rightGlove })
    }, 256)
  },

  _axisMove: function (e) {
    this._axes = this._axes || []
    if (e.srcElement.getAttribute("hand-controls").hand === "left") {
      this._axes[0] = e.detail.axis[2]
      this._axes[1] = e.detail.axis[3]
    } else {
      this._axes[2] = e.detail.axis[2]
      this._axes[3] = e.detail.axis[3]
    }
  },

  _buttonChanged: function (e) {
    if (e.srcElement.getAttribute("hand-controls").hand === "left") {
      if (this._allowGod) {
        if (e.detail.id == 3 && e.detail.state.pressed) this._godMode = !this._godMode
      }
      else {
        if (e.detail.id == 3 && e.detail.state.pressed) this.data.quantizeMovement = !this.data.quantizeMovement
      }
    } else {
      if (e.detail.id == 3 && e.detail.state.pressed) this.data.quantizeRotation = !this.data.quantizeRotation
    }
  },

  _turnLeft: function (e) {
    this._axes = this._axes || [0, 0, 0, 0]
    this._alt = this._alt || 0
    this._axes[2] = -1
  },
  _turnRight: function (e) {
    this._axes = this._axes || [0, 0, 0, 0]
    this._alt = this._alt || 0
    this._axes[2] = 1
  },

  _fireDown: function (e) {
    this._axes = this._axes || [0, 0, 0, 0]
    this._alt = this._alt || 0
    this._axes[3] = -1
  },

  _fireUp: function (e) {
    this._axes = this._axes || [0, 0, 0, 0]
    this._alt = this._alt || 0
    this._axes[2] = 0
    this._axes[3] = 0
  },

  _keyDown: function (e) {
    if (e.code == "Space") {
      this._axes = this._axes || [0, 0, 0, 0]
      this._alt = this._alt || 0
      this._axes[3] = -1
    }
    if (e.code == "KeyC") {
      this.toggleCrouch()
    }
    if (this._allowGod && e.code == "KeyG") {
      this._godMode = !this._godMode
    }
  },

  _keyUp: function (e) {
    if (e.code == "Space" && this._axes) {
      this._axes[3] = 0
    }
  },

  _getBackUp: function (e) {
    if (this.floorOffset) this.toggleCrouch()
  }
})

AFRAME.registerComponent("floor", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update: function () {
    // Do something when component's data is updated.
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:static")
  }
})
AFRAME.registerComponent("wall", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update: function () {
    // Do something when component's data is updated.
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:static")
  }
})
AFRAME.registerComponent("start", {

  update: function () {
    // Do something when component's data is updated.
    let loco = this.el.sceneEl.querySelector("[locomotion]").components.locomotion
    let pos = this.el.object3D.position
    console.log("starting at", pos)
    // loco.moveTo(pos.x, pos.y, pos.z, true)

    setTimeout(() => {
      loco.moveTo(pos.x, pos.y + 1, pos.z, true, true)
      setTimeout(() => {
        if (loco.floorOffset) {
          loco.toggleCrouch()
        }
      }, 256)
    }, 256)
  }
})

},{}],3:[function(require,module,exports){
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
},{"../libs/cmdCodec":8,"./physics/body":4,"./physics/joint":5,"./physics/shape":6}],4:[function(require,module,exports){
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


},{"../../libs/cmdCodec":8}],5:[function(require,module,exports){
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


},{"../../libs/cmdCodec":8}],6:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("shape", {
  // dependencies: ["body"],
  multiple: true,
  schema: {
    // type: { type: "string", default: "box" },
    // density: { type: "number", default: 1 },
    // friction: { type: "number", default: 0.2 },
    // restitution: { type: "number", default: 0.2 },
    // belongsTo: { type: "int", default: 1 },
    // collidesWith: { type: "int", default: 0xffffffff },
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

      worker.postMessage("world body " + this.bodyId + " shape " + this.id + " create " + cmd.stringifyParam(shape))
    })

  },

  update: function () {
  },

  remove: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let shapes = this.body.components.body.shapes
    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " remove")
    shapes[this.id] = null
  }
})


},{"../../libs/cmdCodec":8}],7:[function(require,module,exports){
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
require("./components/locomotion")

},{"./components/include":1,"./components/locomotion":2,"./components/physics":3,"./libs/copyWorldPosRot":9,"./libs/ensureElement":10,"./libs/pools":11,"./libs/touchGestures":12}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}]},{},[7]);
