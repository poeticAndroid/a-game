/* global AFRAME, THREE */

AFRAME.registerComponent("locomotion", {
  dependencies: ["position", "injectplayer"],
  schema: {
    speed: { type: "number", default: 4 },
    rotationSpeed: { type: "number", default: 1 },
    teleportDistance: { type: "number", default: 5 },
    jumpForce: { type: "number", default: 4 },
    gravity: { type: "number", default: 10 },
    godMode: { type: "boolean", default: false }
  },

  init() {
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onAxisMove = this._onAxisMove.bind(this)
    this._onButtonChanged = this._onButtonChanged.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)
    this._onEnterVR = this._onEnterVR.bind(this)
    this._onExitVR = this._onExitVR.bind(this)

    this._keysDown = {}
    this._kbStick = new THREE.Vector2()
    this._axes = [0, 0, 0, 0]
    this._leftTouchCenter = new THREE.Vector2()
    this._leftTouchDir = new THREE.Vector2()
    this._rightTouchCenter = new THREE.Vector2()
    this._rightTouchDir = new THREE.Vector2()
    this._teleporting = true
    this._bumpOverload = 0
    this._vertVelocity = 1
    this.currentFloorPosition = new THREE.Vector3()
    this.centerPos = new THREE.Vector3()
    this.headPos = new THREE.Vector3()
    this.headDir = new THREE.Vector3()
    this.feetPos = new THREE.Vector3()

    this._config = {
      quantizeMovement: false,
      quantizeRotation: false,
      quantizeMovementVR: !!(this.el.sceneEl.isMobile),
      quantizeRotationVR: true
    }
    if (this.el.sceneEl.is('vr-mode')) this._onEnterVR()
    else this._onExitVR()

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
        objects: "[wall]",
        // showLine: true
      }
    })
    this._headBumper = this.el.sceneEl.ensure(".head-bumper", "a-entity", {
      class: "head-bumper", position: "0 0.5 0", // radius: 0.125, color: "green",
      raycaster: {
        autoRefresh: false,
        objects: "[wall]",
        // showLine: true
      }
    })
    this._teleportBeam = this._camera.ensure(".teleport-ray", "a-entity", {
      class: "teleport-ray",
      raycaster: {
        autoRefresh: false,
        objects: "[wall]",
        // showLine: true
      }
    })
    this._teleportCursor = this.el.ensure(".teleport-cursor", "a-cylinder", {
      class: "teleport-cursor", radius: 0.5, height: 0.0625, material: "opacity:0.5;"
    })
    this._teleportCursor.setAttribute("visible", false)
  },

  update(oldData) {
    // if (this.data.jumpForce) this.data.teleportDistance = 0
    this._godMode = this.data.godMode
  },

  play() {
    document.addEventListener("keydown", this._onKeyDown)
    document.addEventListener("keyup", this._onKeyUp)
    this._leftHand.addEventListener("axismove", this._onAxisMove)
    this._rightHand.addEventListener("axismove", this._onAxisMove)
    this._leftHand.addEventListener("buttonchanged", this._onButtonChanged)
    this._rightHand.addEventListener("buttonchanged", this._onButtonChanged)
    this.el.sceneEl.canvas.addEventListener("touchstart", this._onTouchStart)
    this.el.sceneEl.canvas.addEventListener("touchmove", this._onTouchMove)
    this.el.sceneEl.canvas.addEventListener("touchend", this._onTouchEnd)
    this.el.sceneEl.addEventListener("enter-vr", this._onEnterVR)
    this.el.sceneEl.addEventListener("exit-vr", this._onExitVR)
  },

  pause() {
    document.removeEventListener("keydown", this._onKeyDown)
    document.removeEventListener("keyup", this._onKeyUp)
    this._leftHand.removeEventListener("axismove", this._onAxisMove)
    this._rightHand.removeEventListener("axismove", this._onAxisMove)
    this._leftHand.removeEventListener("buttonchanged", this._onButtonChanged)
    this._rightHand.removeEventListener("buttonchanged", this._onButtonChanged)
    this.el.sceneEl.canvas.removeEventListener("touchstart", this._onTouchStart)
    this.el.sceneEl.canvas.removeEventListener("touchmove", this._onTouchMove)
    this.el.sceneEl.canvas.removeEventListener("touchend", this._onTouchEnd)
    this.el.sceneEl.removeEventListener("enter-vr", this._onEnterVR)
    this.el.sceneEl.removeEventListener("exit-vr", this._onExitVR)
  },

  remove() {
    this.el.sceneEl.removeChild(this._legs)
    this.el.sceneEl.removeChild(this._legBumper)
    this.el.sceneEl.removeChild(this._headBumper)
  },

  tick(time, timeDelta) {
    timeDelta /= 1000
    this.el.object3D.getWorldPosition(this.centerPos)
    this.headPos.copy(this._camera.object3D.position)
    this._camera.object3D.parent.localToWorld(this.headPos)
    this.headDir.set(0, 0, -1)
      .applyQuaternion(this._camera.object3D.quaternion)
      .applyQuaternion(this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp()))
    this._legs.object3D.getWorldPosition(this.feetPos)
    this.feetPos.y -= 0.5

    this._applyButtons(timeDelta)
    this._applyMoveStick(timeDelta)
    this._applyAuxStick(timeDelta)

    // drag feet
    let head2toe = THREE.Vector3.temp()
      .copy(this.headPos).sub(this.feetPos)
    head2toe.y = 0
    if (head2toe.length() > 0.5 || !this.currentFloor) {
      if (this.currentFloor)
        head2toe.multiplyScalar(0.1)
      this._legs.object3D.position.add(head2toe)
      this.feetPos.add(head2toe)
    }

    // fall
    if (!this._godMode && !this._caution) {
      let ray = this._legs.components.raycaster
      ray.refreshObjects()
      let hit = ray.intersections[0]
      if (hit && this._vertVelocity <= 0) {
        this._vertVelocity = 0
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
        this._vertVelocity -= this.data.gravity * timeDelta
        this._move(THREE.Vector3.temp().set(0, Math.max(-0.5, this._vertVelocity * timeDelta), 0))
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

  teleport(pos, force) {
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

  jump() {
    // jump!
    if (this.currentFloor) {
      this._vertVelocity = this.data.jumpForce
    }
  },

  toggleCrouch(reset) {
    let head2toe = this.headPos.y - this.feetPos.y
    let delta
    clearTimeout(this._crouchResetTO)
    this._crouchResetTO = null
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

  _move(delta) {
    this.el.object3D.position.add(delta)
    this.centerPos.add(delta)
    this.headPos.add(delta)
    this._legs.object3D.position.y += delta.y
    this.feetPos.y += delta.y
  },
  _bump(pos, bumper) {
    let matrix = THREE.Matrix3.temp()
    let delta = THREE.Vector3.temp()
    delta.copy(pos)
    delta.sub(bumper.object3D.position)
    let dist = delta.length()
    if (dist) {
      bumper.setAttribute("raycaster", "far", dist + 0.125)
      bumper.setAttribute("raycaster", "direction", `${delta.x} ${delta.y} ${delta.z}`)
      // bumper.setAttribute("raycaster", "origin", delta.multiplyScalar(-0.25))
      let ray = bumper.components.raycaster
      ray.refreshObjects()
      let hit = ray.intersections[0]
      if (hit) {
        this.el.removeAttribute("animation")
        matrix.getNormalMatrix(hit.object.el.object3D.matrixWorld)
        delta
          .copy(hit.face.normal)
          .applyMatrix3(matrix)
          .normalize()
          .multiplyScalar(dist + 0.125)
        let feety = this._legs.object3D.position.y
        this._move(delta)
        bumper.object3D.position.add(delta)
        if (this._legs.object3D.position.y !== feety) {
          if (bumper === this._headBumper) this._headBumper.object3D.position.copy(this._legBumper.object3D.position)
          clearTimeout(this._crouchResetTO)
          this._crouchResetTO = setTimeout(() => {
            this.toggleCrouch(true)
          }, 4096)
        }
        this._legs.object3D.position.add(delta)
        this._legs.object3D.position.y = Math.max(feety, this.headPos.y - 1.5)
        this._caution = 4
        this._bumpOverload++
        this._vertVelocity = Math.min(0, this._vertVelocity)
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
    if (this._keysDown["KeyA"]) stick.x--
    if (this._keysDown["KeyD"]) stick.x++
    if (this._keysDown["KeyW"] || this._keysDown["ArrowUp"]) stick.y--
    if (this._keysDown["KeyS"] || this._keysDown["ArrowDown"]) stick.y++
    if (this._kbStick.length() > 0.1) this._kbStick.multiplyScalar((this._kbStick.length() - 0.1) / this._kbStick.length())
    else (this._kbStick.set(0, 0))
    this._kbStick.add(stick.multiplyScalar(0.2))
    if (this._kbStick.length() > 1) this._kbStick.normalize()
    if (this._kbStick.length() > bestStick.length()) bestStick.copy(this._kbStick)

    this._deadZone(stick.set(this._axes[0], this._axes[1]))
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    stick.copy(this._leftTouchDir)
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        this._deadZone(stick.set(gamepad.axes[0], gamepad.axes[1]))
        if (stick.length() > bestStick.length()) bestStick.copy(stick)
      }
    }

    if (bestStick.length() > 1) bestStick.normalize()
    if (this._keysDown["ShiftLeft"] || this._keysDown["ShiftRight"]) bestStick.multiplyScalar(0.25)
    return bestStick
  },
  _applyMoveStick(seconds) {
    let stick = this._callMoveStick()
    stick.multiplyScalar(this.data.speed)
    stick.multiplyScalar(seconds)
    let heading = THREE.Vector2.temp().set(this.headDir.z, -this.headDir.x).angle() - Math.PI
    let x2 = Math.cos(heading) * stick.x - Math.sin(heading) * stick.y
    let y2 = Math.sin(heading) * stick.x + Math.cos(heading) * stick.y
    let delta = THREE.Vector3.temp().set(x2, 0, y2)
    if (this.quantizeMovement) {
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
    if (this._keysDown["KeyQ"]) stick.y--
    if (this._keysDown["KeyC"]) stick.y++
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    this._deadZone(stick.set(this._axes[2], this._axes[3]))
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    stick.copy(this._rightTouchDir)
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        this._deadZone(stick.set(gamepad.axes[2], gamepad.axes[3]))
        if (stick.length() > bestStick.length()) bestStick.copy(stick)
      }
    }

    if (bestStick.length() > 1) bestStick.normalize()
    if (this._keysDown["ShiftLeft"] || this._keysDown["ShiftRight"]) bestStick.multiplyScalar(0.25)
    return bestStick
  },
  _applyAuxStick(seconds) {
    let stick = this._callAuxStick()
    let rotation = 0

    // Rotation
    if (this.quantizeRotation) {
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

    // Levitating
    if (this._godMode) {
      this.el.object3D.position.y += -stick.y * this.data.speed * seconds
      this._legs.object3D.position.y += -stick.y * this.data.speed * seconds
    } else {
      // Crouching
      if (Math.round(stick.y) > 0) {
        if (!this._crouching) {
          this._crouching = true
          this.toggleCrouch()
        }
      } else {
        this._crouching = false
      }

      // Teleportation and jumping
      if (Math.round(stick.y) < 0) {
        if (!this._teleporting && this.data.teleportDistance) {
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
    }
  },

  _callButtons() {
    let buttons = 0

    if (this._keysDown["Space"]) buttons = buttons | 1
    if (this._keysDown["KeyG"]) buttons = buttons | 2
    if (this._vrRightClick) buttons = buttons | 1
    if (this._vrLeftClick) buttons = buttons | 2

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        if (gamepad.buttons[3].pressed) buttons = buttons | 1
        if (gamepad.buttons[11].pressed) buttons = buttons | 1
        if (gamepad.buttons[10].pressed) buttons = buttons | 2
      }
    }

    return buttons
  },
  _applyButtons() {
    let buttons = this._callButtons()
    if (buttons) {
      if (!this._toggling) {
        if (buttons & 1) this.jump()
        if (this.data.godMode && buttons & 2) this._godMode = !this._godMode
        if (this._godMode) this._vertVelocity = 0
      }
      this._toggling = true
    } else {
      this._toggling = false
    }
  },

  _deadZone(vec, limit = 0.25) {
    if (vec.length() > limit) {
      vec.multiplyScalar(((vec.length() - limit) / (1 - limit)) / vec.length())
    } else {
      vec.set(0, 0)
    }
    return vec
  },

  _onKeyDown(e) { this._keysDown[e.code] = true },
  _onKeyUp(e) { this._keysDown[e.code] = false },
  _onAxisMove(e) {
    if (e.srcElement.getAttribute("tracked-controls").hand === "left") {
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
          objects: "[wall]",
        }
      })
      this._handEnabled = true
    }
  },
  _onButtonChanged(e) {
    if (e.srcElement.getAttribute("tracked-controls").hand === "left") {
      if (e.detail.id == 3) this._vrLeftClick = e.detail.state.pressed
    } else {
      if (e.detail.id == 3) this._vrRightClick = e.detail.state.pressed
    }
  },

  _onTouchStart(e) {
    let vw = this.el.sceneEl.canvas.clientWidth
    for (let j = 0; j < e.changedTouches.length; j++) {
      let touchEvent = e.changedTouches[j]
      if (touchEvent.clientX < vw / 2) {
        this._leftTouchId = touchEvent.identifier
        this._leftTouchCenter.set(touchEvent.clientX, touchEvent.clientY)
      }
      if (touchEvent.clientX > vw / 2) {
        this._rightTouchId = touchEvent.identifier
        this._rightTouchCenter.set(touchEvent.clientX, touchEvent.clientY)
      }
    }
    e.preventDefault()
  },
  _onTouchMove(e) {
    let stickRadius = 32
    for (let j = 0; j < e.changedTouches.length; j++) {
      let touchEvent = e.changedTouches[j]
      let touchCenter = null
      let touchDir = null
      if (this._leftTouchId === touchEvent.identifier) {
        touchCenter = this._leftTouchCenter
        touchDir = this._leftTouchDir
      }
      if (this._rightTouchId === touchEvent.identifier) {
        touchCenter = this._rightTouchCenter
        touchDir = this._rightTouchDir
      }
      if (touchDir) {
        touchDir.set(touchEvent.clientX, touchEvent.clientY)
        touchDir.sub(touchCenter)
        if (touchDir.length() > stickRadius) {
          touchDir.multiplyScalar((touchDir.length() - stickRadius) / touchDir.length())
          touchCenter.add(touchDir)
          touchDir.multiplyScalar(stickRadius / touchDir.length())
        }
        touchDir.divideScalar(stickRadius)
      }
    }
    e.preventDefault()
  },
  _onTouchEnd(e) {
    for (let j = 0; j < e.changedTouches.length; j++) {
      let touchEvent = e.changedTouches[j];
      if (this._leftTouchId === touchEvent.identifier) {
        this._leftTouchId = null
        this._leftTouchDir.set(0, 0)
      }
      if (this._rightTouchId === touchEvent.identifier) {
        this._rightTouchId = null
        this._rightTouchDir.set(0, 0)
      }
    }
  },

  _onEnterVR(e) {
    this.isVR = true
    this.quantizeMovement = this._config.quantizeMovementVR
    this.quantizeRotation = this._config.quantizeRotationVR
  },
  _onExitVR(e) {
    this.isVR = false
    this.quantizeMovement = this._config.quantizeMovement
    this.quantizeRotation = this._config.quantizeRotation
  },
})

require("./locomotion/floor")
require("./locomotion/wall")
require("./locomotion/start")
