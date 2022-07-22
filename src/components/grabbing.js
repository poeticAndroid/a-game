/* global AFRAME, THREE */

AFRAME.registerComponent("grabbing", {
  schema: {
    hideOnGrab: { type: "boolean", default: false },
    grabDistance: { type: "number", default: 1 },
    attractHand: { type: "boolean", default: true },
    avoidWalls: { type: "boolean", default: true },
  },

  init() {
    this._enableHands = this._enableHands.bind(this)
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onWheel = this._onWheel.bind(this)
    this._onButtonChanged = this._onButtonChanged.bind(this)
    this._onTouchTap = this._onTouchTap.bind(this)
    this._onTouchHold = this._onTouchHold.bind(this)

    this._btnPress = {}
    this._btnFlex = {}
    this._keysDown = {}
    this._grabCount = 0
    this._gamepadBtns = []

    this._hands = ["head", "left", "right"]
    this._head = {}
    this._left = {}
    this._right = {}
    this._head.hand = this.el.querySelector("a-camera")
    this._left.hand = this.el.querySelector("a-hand[side=\"left\"]")
    this._right.hand = this.el.querySelector("a-hand[side=\"right\"]")
    this._head.glove = this._head.hand.ensure(".hitbox", "a-sphere", { class: "hitbox", body: "type:kinematic;", radius: 0.25 })
    this._left.glove = this._left.hand.ensure("a-glove")
    this._right.glove = this._right.hand.ensure("a-glove")

    this._left.glove.setAttribute("visible", false)
    this._right.glove.setAttribute("visible", false)
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this[_hand].hand.addEventListener("buttonchanged", this._enableHands)
    }

    this._head.ray = this._head.hand.ensure(".grabbing-ray", "a-entity", {
      class: "grabbing-ray",
      raycaster: {
        deep: true,
        objects: "[wall], [grabbable]",
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._head.buttonRay = this._head.hand.ensure(".button.ray", "a-entity", {
      class: "button ray",
      raycaster: {
        deep: true,
        objects: "[wall], [button]",
        far: 1,
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._head.reticle = this._head.hand.ensure(".reticle", "a-plane", {
      class: "reticle",
      material: "transparent:true; shader:flat;",
      position: "0 0 -0.0078125",
      scale: "0.00048828125 0.00048828125 0.00048828125"
    })
    this._head.anchor = this._head.ray.ensure(".grabbing.anchor", "a-entity", { class: "grabbing anchor", visible: false, body: "type:kinematic;autoShape:false;" })
  },

  update(oldData) {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      if (this[_hand].ray)
        this[_hand].ray.setAttribute("raycaster", "far", this.data.grabDistance + (hand === "head" ? 1 : 0.1875))
    }
  },

  play() {
    document.addEventListener("keydown", this._onKeyDown)
    document.addEventListener("keyup", this._onKeyUp)
    this.el.sceneEl.canvas.addEventListener("mousedown", this._onMouseDown)
    this.el.sceneEl.canvas.addEventListener("mouseup", this._onMouseUp)
    this.el.sceneEl.canvas.addEventListener("wheel", this._onWheel)
    for (let hand of [this._left.hand, this._right.hand]) {
      // hand.addEventListener("buttonchanged", this._enableHands)
      hand.addEventListener("buttonchanged", this._onButtonChanged)
    }
    this.el.sceneEl.canvas.addEventListener("tap", this._onTouchTap)
    this.el.sceneEl.canvas.addEventListener("hold", this._onTouchHold)
  },

  pause() {
    document.removeEventListener("keydown", this._onKeyDown)
    document.removeEventListener("keyup", this._onKeyUp)
    this.el.sceneEl.canvas.removeEventListener("mousedown", this._onMouseDown)
    this.el.sceneEl.canvas.removeEventListener("mouseup", this._onMouseUp)
    this.el.sceneEl.canvas.removeEventListener("wheel", this._onWheel)
    for (let hand of [this._left.hand, this._right.hand]) {
      // hand.removeEventListener("buttonchanged", this._enableHands)
      hand.removeEventListener("buttonchanged", this._onButtonChanged)
    }
    this.el.sceneEl.canvas.removeEventListener("tap", this._onTouchTap)
    this.el.sceneEl.canvas.removeEventListener("hold", this._onTouchHold)
  },

  remove() {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this.drop(hand)
      this[_hand].glove.copyWorldPosRot(this[_hand].hand)
      let flex = 0.25
      for (let finger = 0; finger < 5; finger++) {
        this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
      }
    }
  },

  tick(time, timeDelta) {
    // handle gamepads
    for (let i = 0; i < 16; i++)
      this._gamepadBtns[i] = 0
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        for (let i = 0; i < 16; i++)
          this._gamepadBtns[i] += gamepad.buttons[i]?.pressed || 0
      }
    }

    if ((this._gamepadBtns[4] || this._gamepadBtns[5]) && !this._grabBtn) {
      this._setDevice("gamepad")
      console.log("grabbing!", this._gamepadBtns[4], this._gamepadBtns[5], this._grabBtn)
      this.grab()
    }
    if (this._grabBtn && !(this._gamepadBtns[4] || this._gamepadBtns[5])) {
      console.log("dropping!", this._gamepadBtns[4], this._gamepadBtns[5], this._grabBtn)
      this.drop()
    }
    if ((this._gamepadBtns[6] || this._gamepadBtns[7]) && !this._useBtn0) this.useDown()
    if ((this._gamepadBtns[0]) && !this._useBtn1) this.useDown("head", 1)
    if ((this._gamepadBtns[1]) && !this._useBtn2) this.useDown("head", 2)
    if (this._gamepadBtns[2]) {
      if (this._gamepadBtns[12]) this.moveHeadHand(0, -0.03125)
      if (this._gamepadBtns[13]) this.moveHeadHand(0, 0.03125)
      if (this._gamepadBtns[14]) this.moveHeadHand(0, 0, -0.03125)
      if (this._gamepadBtns[15]) this.moveHeadHand(0, 0, 0.03125)
    } else {
      if (this._gamepadBtns[12]) this.moveHeadHand(-0.03125)
      if (this._gamepadBtns[13]) this.moveHeadHand(0.03125)
      if (this._gamepadBtns[14]) this.moveHeadHand(0, 0, 0, 0.03125)
      if (this._gamepadBtns[15]) this.moveHeadHand(0, 0, 0, -0.03125)
    }
    this._grabBtn = false
    this._useBtn0 = false
    this._useBtn1 = false
    this._useBtn2 = false
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        this._grabBtn = this._grabBtn || this._gamepadBtns[4] || this._gamepadBtns[5]
        this._useBtn0 = this._useBtn0 || this._gamepadBtns[6] || this._gamepadBtns[7]
        this._useBtn1 = this._useBtn1 || this._gamepadBtns[0]
        this._useBtn2 = this._useBtn2 || this._gamepadBtns[1]
      }
    }

    let headPos = THREE.Vector3.temp()
    let delta = THREE.Vector3.temp()
    let palmDelta = THREE.Vector3.temp()
    headPos.copy(this._head.hand.object3D.position)
    this._head.hand.object3D.parent.localToWorld(headPos)

    for (let hand of this._hands) {
      let _hand = "_" + hand

      // keep hands out of walls
      if (this.data.avoidWalls && this[_hand]._occlusionRay) {
        let palm = this[_hand].glove.querySelector(".palm") || this[_hand].glove
        this[_hand].glove.copyWorldPosRot(this[_hand].hand)

        this[_hand]._occlusionRay.object3D.position.copy(headPos)
        palm.object3D.getWorldPosition(delta)
        this[_hand].glove.object3D.getWorldPosition(palmDelta)
        palmDelta.sub(delta)
        delta.sub(headPos)
        let handDist = delta.length()
        delta.normalize()
        this[_hand]._occlusionRay.setAttribute("raycaster", "direction", `${delta.x} ${delta.y} ${delta.z}`)
        this[_hand]._occlusionRay.setAttribute("raycaster", "far", handDist + 0.03125)

        let ray = this[_hand]._occlusionRay.components.raycaster
        ray.refreshObjects()
        let hit = ray.intersections[0]
        if (hit) {
          // this[_hand].glove.object3D.position.copy(hit.point)
          let dist = delta.copy(hit.point).sub(headPos).length()
          this[_hand].glove.object3D.position.copy(headPos).add(palmDelta).add(delta.normalize().multiplyScalar(dist - 0.03125))
          this[_hand].glove.object3D.parent.worldToLocal(this[_hand].glove.object3D.position)
        }
      }

      // handle grabbables
      let reticleMode = "default"
      if (this[_hand].grabbed) {
        let ray = this[_hand].ray.components.raycaster
        ray.refreshObjects()
        if (!this[_hand].grabbed.components.grabbable?.data.immovable) {
          if (this[_hand].grabbed.components.grabbable?.data.avoidWalls) {
            for (let hit of ray.intersections) {
              if (hit && hit.el.components.wall && hit.distance < -this[_hand].anchor.object3D.position.z) {
                this[_hand].anchor.object3D.position.multiplyScalar(0.5)
              }
            }
          }
          let delta = THREE.Vector3.temp().copy(this[_hand].grabbed.object3D.position)
          this[_hand].grabbed.copyWorldPosRot(this[_hand].anchor)
          delta.sub(this[_hand].grabbed.object3D.position)
          if (delta.length() > 1 && !this.ironGrip) this.drop(hand)
          this.ironGrip=false
        }
        if (this[_hand].reticle) this._setReticle(null)
      } else {
        if (this[_hand].ray) {
          let ray = this[_hand].ray.components.raycaster
          ray.refreshObjects()
          let hit = ray.intersections[0]
          if (hit && hit.el.components.grabbable) {
            if (this[_hand]._lastHit !== hit.el) {
              if (this[_hand]._lastHit)
                this.emit("unreachable", this[_hand].glove, this[_hand]._lastHit)
              this[_hand]._lastHit = hit.el
              this.emit("reachable", this[_hand].glove, this[_hand]._lastHit)
              this._flexFinger(hand, 5, -0.125, true)
              this._flexFinger(hand, 0, 0, true)
            }
            if (this[_hand].reticle) {
              reticleMode = "grab"
            }
          } else {
            if (this[_hand]._lastHit) {
              this.emit("unreachable", this[_hand].glove, this[_hand]._lastHit)
              this._restoreUserFlex(hand)
            }
            this[_hand]._lastHit = null
          }
        }

        // handle buttons
        if (this[_hand].buttonRay) {
          let ray = this[_hand].buttonRay.components.raycaster
          ray.refreshObjects()
          let hit = ray.intersections[0]
          if (hit && hit.el.components.button != null) {
            if (this[_hand]._lastButton !== hit.el) {
              if (this[_hand]._lastButton)
                this.emit("unhover", this[_hand].glove, this[_hand]._lastButton)
              this[_hand]._lastButton = hit.el
              this.emit("hover", this[_hand].glove, this[_hand]._lastButton)
              this._flexFinger(hand, 7, 1, true)
              this._flexFinger(hand, 1, -0.125, true)
            }
            if (hit.distance < 0.125) {
              if (this[_hand]._lastPress !== hit.el) {
                if (this[_hand]._lastPress) {
                  this.emit("unpress", this[_hand].glove, this[_hand]._lastPress)
                  this[_hand]._lastPress.removeState("pressed")
                }
                this[_hand]._lastPress = hit.el
                this.emit("press", this[_hand].glove, this[_hand]._lastPress)
                this[_hand]._lastPress.addState("pressed")
              }
            } else {
              if (this[_hand]._lastPress) {
                this.emit("unpress", this[_hand].glove, this[_hand]._lastPress)
                this[_hand]._lastPress.removeState("pressed")
              }
              this[_hand]._lastPress = null
            }
            if (this[_hand].reticle) {
              reticleMode = "push"
            }
          } else {
            if (this[_hand]._lastPress) {
              this.emit("unpress", this[_hand].glove, this[_hand]._lastPress)
              this[_hand]._lastPress.removeState("pressed")
            }
            this[_hand]._lastPress = null
            if (this[_hand]._lastButton) {
              this.emit("unhover", this[_hand].glove, this[_hand]._lastButton)
              this._restoreUserFlex(hand)
            }
            this[_hand]._lastButton = null
          }
        }
        if (this[_hand].reticle) this._setReticle(reticleMode)
      }

      // Track velocity
      this[_hand].lastGlovePos = this[_hand].lastGlovePos || new THREE.Vector3()
      this[_hand].lastGrabbedPos = this[_hand].lastGrabbedPos || new THREE.Vector3()
      this[_hand].gloveVelocity = this[_hand].gloveVelocity || new THREE.Vector3()
      this[_hand].grabbedVelocity = this[_hand].grabbedVelocity || new THREE.Vector3()
      let pos = THREE.Vector3.temp()
      if (this[_hand].glove) {
        this[_hand].glove.object3D.localToWorld(pos.set(0, 0, 0))
        this[_hand].gloveVelocity.copy(pos).sub(this[_hand].lastGlovePos).multiplyScalar(500 / timeDelta)
        this[_hand].lastGlovePos.copy(pos)
      }
      if (this[_hand].grabbed) {
        this[_hand].grabbed.object3D.localToWorld(pos.set(0, 0, 0))
        this[_hand].grabbedVelocity.copy(pos).sub(this[_hand].lastGrabbedPos).multiplyScalar(500 / timeDelta)
        this[_hand].lastGrabbedPos.copy(pos)
      }
      if (hand === "head") this[_hand].gloveVelocity.copy(this[_hand].grabbedVelocity)
    }

    // Update The Matrix! 🐱‍💻
    this.el.object3D.updateWorldMatrix(true, true)
  },

  toggleGrab(hand = "head") {
    let _hand = "_" + hand
    if (this[_hand].grabbed) this.drop(hand)
    else this.grab(hand)
  },
  grab(hand = "head") {
    let _hand = "_" + hand
    if (!this[_hand].ray) return
    if (this[_hand].grabbed) return
    let ray = this[_hand].ray.components.raycaster
    ray.refreshObjects()
    let hit = ray.intersections[0]
    if (hit && hit.el.components.grabbable) {
      if (hand === "head" && this.data.attractHand) this[_hand].ray.setAttribute("animation__pos", {
        property: "position",
        to: { x: 0, y: -0.125, z: 0 },
        dur: 256
      })
      this.dropObject(hit.el)
      this[_hand].grabbed = hit.el
      this[_hand].anchor.copyWorldPosRot(this[_hand].grabbed)
      this[_hand].anchor.components.body.commit()
      if (this[_hand].grabbed.components.body != null) {
        if (!this[_hand].grabbed.components.grabbable?.data.immovable)
          this[_hand].anchor.setAttribute("joint__grab", { body2: this[_hand].grabbed, type: "lock" })
        this[_hand].isPhysical = true
      } else {
        this[_hand].isPhysical = false
      }
      this[_hand].anchor.removeAttribute("animation__pos")
      this[_hand].anchor.removeAttribute("animation__rot")
      let delta = hit.distance
      if (hand === "head") delta -= 0.5
      else delta -= 0.09375
      if (this[_hand].grabbed.components.grabbable.data.fixed) {
        let pos = THREE.Vector3.temp().copy(this[_hand].grabbed.components.grabbable.data.fixedPosition)
        if (hand === "left") pos.x *= -1
        if (hand === "head") pos.x = 0
        let quat = THREE.Quaternion.temp().copy(this[_hand].ray.object3D.quaternion).conjugate()
        pos.applyQuaternion(quat)
        pos.z += -0.09375
        this[_hand].anchor.setAttribute("animation__pos", {
          property: "position",
          to: { x: pos.x, y: pos.y, z: pos.z },
          dur: 256
        })
        let rot = { x: 0, y: 0, z: 0 }
        if (hand === "left") rot.y = 45
        if (hand === "right") rot.y = -45
        this[_hand].anchor.setAttribute("animation__rot", {
          property: "rotation",
          to: rot,
          dur: 256
        })
      } else if (this.data.attractHand && !this[_hand].grabbed.components.grabbable?.data.immovable) {
        this[_hand].anchor.setAttribute("animation__pos", {
          property: "object3D.position.z",
          to: this[_hand].anchor.object3D.position.z + delta,
          dur: 256
        })
      }
      if (this.data.hideOnGrab || this[_hand].grabbed.components.grabbable.data.hideOnGrab)
        this[_hand].glove.setAttribute("visible", false)
      // if (this[_hand].glove.components.body)
      this[_hand].glove.setAttribute("body", "collidesWith", 0)
      this.emit("grab", this[_hand].glove, this[_hand].grabbed, { intersection: hit })
      this._grabCount = Math.min(2, this._grabCount + 1)
      this.el.addState("grabbing")
      this[_hand].grabbed.addState("grabbed")
      this.sticky = true
      this._flexFinger(hand, 5, 0, true)
      setTimeout(() => {
        let flexes = this[_hand].grabbed.components.grabbable.data.fingerFlex.map(x => parseFloat(x)) || [0.5]
        this._flexFinger(hand, 5, flexes.pop() || 0, true)
        let finger = 0
        for (let flex of flexes) this._flexFinger(hand, finger++, flex || 0, true)
        this.sticky = false
      }, 256)
    }
  },
  drop(hand = "head") {
    let _hand = "_" + hand
    if (this.sticky) return
    this[_hand].anchor.removeAttribute("animation__rot")
    this[_hand].anchor.removeAttribute("animation__pos")
    this[_hand].glove.setAttribute("visible", true)
    this[_hand].anchor.removeAttribute("joint__grab")
    this[_hand].anchor.setAttribute("position", "0 0 0")
    this[_hand].anchor.setAttribute("rotation", "0 0 0")
    setTimeout(() => {
      // if (this[_hand].glove.components.body)
      this[_hand].glove.setAttribute("body", "collidesWith", 1)
    }, 1024)
    if (this[_hand].grabbed) {
      this.emit("drop", this[_hand].glove, this[_hand].grabbed)
      this._grabCount = Math.max(0, this._grabCount - 1)
      if (!this._grabCount)
        this.el.removeState("grabbing")
      this._restoreUserFlex(hand)
      this[_hand].grabbed.removeState("grabbed")
      if (this[_hand].grabbed.components.grabbable?.data.kinematicGrab && !this[_hand].grabbed.components.grabbable?.data.immovable) {
        this[_hand].grabbed.components.body?.applyWorldImpulse(this[_hand].gloveVelocity, this[_hand].lastGlovePos)
        this[_hand].grabbed.components.body?.applyWorldImpulse(this[_hand].grabbedVelocity, this[_hand].lastGrabbedPos)
      }
      this[_hand].grabbed = null
      if (hand === "head") {
        this[_hand].ray.removeAttribute("animation__pos")
        this[_hand].ray.object3D.position.y = 0
      }
    }
  },
  dropObject(el) {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      if (this[_hand].grabbed === el) this.drop(hand)
    }
  },
  use(hand = "head", button = 0) {
    let _hand = "_" + hand
    this.useDown(hand, button)
    setTimeout(() => {
      this.useUp(hand, button)
    }, 32)
  },
  useDown(hand = "head", button = 0) {
    let _hand = "_" + hand
    // if (!this[_hand].grabbed) return this.grab(hand)
    if (this[_hand].grabbed) {
      this._flexFinger(hand, Math.max(0, 1 - button), 0.5, true)
      this.emit("usedown", this[_hand].glove, this[_hand].grabbed, { button: button })
      this.emit("use" + (button + 1) + "down", this[_hand].glove, this[_hand].grabbed, { button: button })
    } else if (this[_hand]._lastButton) {
      this._flexFinger(hand, 0, 0.5, true)
      this[_hand]._lastClick = this[_hand]._lastButton
      this.emit("press", this[_hand].glove, this[_hand]._lastClick, { button: button })
      this[_hand]._lastClick.addState("pressed")
    } else {
      this.emit("usedown", this[_hand].glove, this[_hand].grabbed, { button: button })
      this.emit("use" + (button + 1) + "down", this[_hand].glove, this[_hand].grabbed, { button: button })
    }
  },
  useUp(hand = "head", button = 0) {
    let _hand = "_" + hand
    if (this[_hand].grabbed) {
      this._flexFinger(hand, Math.max(0, 1 - button), 0, true)
      this.emit("useup", this[_hand].glove, this[_hand].grabbed, { button: button })
      this.emit("use" + (button + 1) + "up", this[_hand].glove, this[_hand].grabbed, { button: button })
    } else if (this[_hand]._lastClick) {
      this._flexFinger(hand, 0, 0, true)
      this.emit("unpress", this[_hand].glove, this[_hand]._lastClick)
      this[_hand]._lastClick.removeState("pressed")
      this[_hand]._lastClick = null
    } else {
      this.emit("useup", this[_hand].glove, this[_hand].grabbed, { button: button })
      this.emit("use" + (button + 1) + "up", this[_hand].glove, this[_hand].grabbed, { button: button })
    }
  },
  moveHeadHand(pz = 0, rx = 0, ry = 0, rz = 0) {
    this._head.anchor.object3D.position.z = Math.min(Math.max(-1.5, this._head.anchor.object3D.position.z + pz), -0.125)
    let quat = THREE.Quaternion.temp().set(rx, ry, rz, 1).normalize()
    this._head.anchor.object3D.quaternion.premultiply(quat)
  },

  emit(eventtype, glove, grabbed, e = {}) {
    e.grabbing = this.el
    e.grabbedElement = grabbed
    e.gloveElement = glove
    for (let _hand of this._hands) {
      if (this["_" + _hand].glove === glove) e.hand = _hand
    }
    glove.emit(eventtype, e, true)
    if (grabbed) grabbed.emit(eventtype, e, true)
  },

  _setReticle(mode) {
    if (!this._head.reticle) return
    if (this._head._reticleMode === mode) return
    let src = "data:image/gif;base64,R0lGODlhEAAQAPD/AAAAAP///yH5BAUKAAIALAAAAAAQABAAAAIVlI+py+0PIwQgghDqu9lqCYbiSBoFADs="
    switch (mode) {
      case "grab":
        src = "data:image/gif;base64,R0lGODlhEAAQAPD/AAAAAP///yH5BAUKAAIALAAAAAAQABAAAAI1lC8AyLkQgloMSotrVHsnhHWXdISS+DzRimIWy3Ii7CU0Tdn3mr93bvDBgMFfozg8OiaTQwEAOw=="
        break
      case "push":
        src = "data:image/gif;base64,R0lGODlhEAAQAPD/AAAAAP///yH5BAUKAAIALAAAAAAQABAAAAIylA1wywIRVGMvTgrlRTltl3Wao1RmB0YVxEYqu7ZwGstWbWdcPh94O0rZgjsZEZFIagoAOw=="
        break
    }
    this._head.reticle.setAttribute("src", src)
    this._head._reticleMode = mode
  },

  _enableHands() {
    this._setDevice("vrcontroller")
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this[_hand].hand.removeEventListener("buttonchanged", this._enableHands)

      let boxsize = 0.0625
      this[_hand].glove.ensure(".hitbox", "a-box", { class: "hitbox", visible: false, position: "0 0 0.03125", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
      this[_hand].glove.setAttribute("body", "type:kinematic;")

      if (hand === "head") continue
      this[_hand]._occlusionRay = this.el.sceneEl.ensure(".occlusion-ray." + hand, "a-entity", {
        class: "occlusion-ray " + hand,
        raycaster: {
          deep: true,
          objects: "[wall]",
          autoRefresh: false
        }
      })

      let palm = this[_hand].glove.querySelector(".palm") || this[_hand].glove
      this[_hand].ray = palm.ensure(".grabbing.ray", "a-entity", {
        class: "grabbing ray", position: hand === "left" ? "-0.0625 0 0.0625" : "0.0625 0 0.0625", rotation: hand === "left" ? "0 -45 0" : "0 45 0",
        raycaster: {
          deep: true,
          objects: "[wall], [grabbable]",
          autoRefresh: false,
          // showLine: true,
        }
      })
      this[_hand].buttonRay = palm.ensure(".button.ray", "a-entity", {
        class: "button ray", position: "0 0.03125 0",
        raycaster: {
          deep: true,
          objects: "[wall], [button]",
          far: 0.5,
          autoRefresh: false,
          // showLine: true,
        }
      })
      this[_hand].anchor = this[_hand].ray.ensure(".grabbing.anchor", "a-entity", { class: "grabbing anchor", visible: "false", body: "type:kinematic;autoShape:false;" })
      this[_hand].glove.setAttribute("visible", true)
    }

    this._head.ray = null
    this._head.buttonRay = null
    this._head.reticle.setAttribute("position", "0 0 1")
    this._head.reticle.setAttribute("visible", "false")
    this._head.reticle = null
    this.update()
  },

  _flexFinger(hand, finger, flex, priority = false) {
    let _hand = "_" + hand
    this[_hand].userFlex = this[_hand].userFlex || []
    if (priority) this[_hand].priorityFlex = true
    if (finger < 5) {
      if (priority || !this[_hand].priorityFlex) this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
      if (!priority) this[_hand].userFlex[finger] = flex
    } else {
      for (finger -= 5; finger < 5; finger++) {
        if (priority || !this[_hand].priorityFlex) this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
        if (!priority) this[_hand].userFlex[finger] = flex
      }
    }
  },
  _restoreUserFlex(hand) {
    let _hand = "_" + hand
    this[_hand].userFlex = this[_hand].userFlex || []
    this[_hand].priorityFlex = false
    for (let finger = 0; finger < 5; finger++) {
      let flex = this[_hand].userFlex[finger] || 0
      this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
    }
  },

  _onKeyDown(e) {
    if (e.code === "KeyE" && !this._keysDown[e.code]) {
      this._setDevice("desktop")
      this.grab()
    }
    this._keysDown[e.code] = true
  },
  _onKeyUp(e) {
    if (e.code === "KeyE" && this._keysDown[e.code]) {
      this.drop()
    }
    this._keysDown[e.code] = false
  },
  _onMouseDown(e) {
    this._setDevice("desktop")
    let btn = e.button
    this.useDown("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _onWheel(e) {
    this._setDevice("desktop")
    let x = 0, y = 0, z = 0
    if (this._keysDown["Digit3"] && e.deltaY > 0) z += -0.125
    if (this._keysDown["Digit3"] && e.deltaY < 0) z += 0.125
    if (this._keysDown["Digit2"] && e.deltaY > 0) y += -0.125
    if (this._keysDown["Digit2"] && e.deltaY < 0) y += 0.125
    if (this._keysDown["Digit1"] && e.deltaY > 0) x += 0.125
    if (this._keysDown["Digit1"] && e.deltaY < 0) x += -0.125
    if (x || y || z) return this.moveHeadHand(0, x, y, z)
    if (e.deltaY > 0) return this.moveHeadHand(0.125)
    if (e.deltaY < 0) return this.moveHeadHand(-0.125)
  },
  _onMouseUp(e) {
    let btn = e.button
    this.useUp("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _onTouchTap(e) {
    this._setDevice("touch")
    this.use()
  },
  _onTouchHold(e) {
    this._setDevice("touch")
    this.toggleGrab()
  },
  _onButtonChanged(e) {
    this._setDevice("vrcontroller")
    let hand = e.srcElement.getAttribute("tracked-controls").hand
    let _hand = "_" + hand
    let finger = -1
    let flex = 0
    if (e.detail.state.touched) flex = 0.5
    if (e.detail.state.pressed) flex = 1
    if (e.detail.state.value) flex = 0.5 + e.detail.state.value / 2
    this._btnFlex[hand + e.detail.id] = flex
    switch (e.detail.id) {
      case 0: // Trigger
        finger = 1
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.useDown(hand)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.useUp(hand)
        break
      case 1: // Grip
        if (flex <= 0 || flex >= 1) {
          finger = 7
          this._fist = flex > 0.5
        } else {
          this._flexFinger(hand, 2, this._fist ? 0 : 1)
          finger = 3
        }
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.grab(hand)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.drop(hand)
        break
      case 3: // Thumbstick
        finger = 0
        flex = Math.max(this._btnFlex[hand + 3] || 0, this._btnFlex[hand + 4] || 0, this._btnFlex[hand + 5] || 0)
        break
      case 4: // A/X
        finger = 0
        flex = Math.max(this._btnFlex[hand + 3] || 0, this._btnFlex[hand + 4] || 0, this._btnFlex[hand + 5] || 0)
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.useDown(hand, 1)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.useUp(hand, 1)
        break
      case 5: // B/Y
        finger = 0
        flex = Math.max(this._btnFlex[hand + 3] || 0, this._btnFlex[hand + 4] || 0, this._btnFlex[hand + 5] || 0)
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.useDown(hand, 2)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.useUp(hand, 2)
        break
    }
    this._btnPress[hand + e.detail.id] = e.detail.state.pressed
    this._flexFinger(hand, finger, flex)
  },

  _setDevice(device) {
    if (this.device === device) return
    this.el.removeState(this.device || "noinput")
    this.device = device
    this.el.addState(this.device || "noinput")
  }
})

require("./grabbing/button")
require("./grabbing/climbable")
require("./grabbing/fingerflex")
require("./grabbing/grabbable")
require("./grabbing/receptacle")
