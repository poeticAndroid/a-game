/* global AFRAME, THREE */

AFRAME.registerComponent("locomotion", {
  dependencies: ["position", "injectplayer"],
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

    this._camera = this.el.querySelector("a-camera")
    this._cameraObj = this._camera.querySelector(".tracker")
    this._leftHand = this.el.querySelector("a-hand[side=\"left\"]")
    this._rightHand = this.el.querySelector("a-hand[side=\"right\"]")
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

  init: function () {
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
