/* global AFRAME, THREE */

AFRAME.registerComponent("grabbing", {
  schema: {
    hideOnGrab: { type: "boolean", default: false },
    grabDistance: { type: "number", default: 1 }
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

    this._hands = ["head", "left", "right"]
    this._head = {}
    this._left = {}
    this._right = {}
    this._head.hand = this.el.querySelector("a-camera")
    this._left.hand = this.el.querySelector("a-hand[side=\"left\"]")
    this._right.hand = this.el.querySelector("a-hand[side=\"right\"]")
    this._head.glove = this._head.hand.ensure(".hitbox", "a-sphere", { class: "hitbox", body: "type:kinematic;", radius: 0.25 })
    this._left.glove = this._ensureGlove(this._left.hand)
    this._right.glove = this._ensureGlove(this._right.hand)

    this._left.glove.setAttribute("visible", false)
    this._right.glove.setAttribute("visible", false)
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this[_hand].hand.addEventListener("buttonchanged", this._enableHands)
    }

    this._head.ray = this._head.hand.ensure(".grabbing-ray", "a-entity", {
      class: "grabbing-ray", position: "0 -0.125 0",
      raycaster: {
        objects: "[wall], [grabbable]",
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._head.buttonRay = this._head.hand.ensure(".button.ray", "a-entity", {
      class: "button ray", position: "0 -0.125 0",
      raycaster: {
        objects: "[wall], [button]",
        far: 1,
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._head.reticle = this._head.ray.ensure(".reticle", "a-sphere", {
      class: "reticle",
      radius: 0.015625,
      // color: "black",
      position: "0 0 -1"
    }, `<a-torus position="0 0 0.015625" color="black" radius="0.015625" radius-tubular="0.001953125"></a-torus>`)
    this._head.buttonReticle = this._head.buttonRay.ensure(".reticle", "a-sphere", {
      class: "reticle",
      radius: 0.015625,
      color: "black",
      position: "0 0 -1"
    }, `<a-torus position="0 0 0.015625" radius="0.015625" radius-tubular="0.001953125"></a-torus>`)
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
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        if ((gamepad.buttons[4].pressed || gamepad.buttons[5].pressed) && !this._grabBtn) this.toggleGrab()
        if ((gamepad.buttons[6].pressed || gamepad.buttons[7].pressed) && !this._useBtn0) this.useDown()
        if ((gamepad.buttons[0].pressed) && !this._useBtn1) this.useDown("head", 1)
        if ((gamepad.buttons[1].pressed) && !this._useBtn2) this.useDown("head", 2)
        if (gamepad.buttons[2].pressed) {
          if (gamepad.buttons[12].pressed) this.moveHeadHand(0, -0.03125)
          if (gamepad.buttons[13].pressed) this.moveHeadHand(0, 0.03125)
          if (gamepad.buttons[14].pressed) this.moveHeadHand(0, 0, -0.03125)
          if (gamepad.buttons[15].pressed) this.moveHeadHand(0, 0, 0.03125)
        } else {
          if (gamepad.buttons[12].pressed) this.moveHeadHand(-0.03125)
          if (gamepad.buttons[13].pressed) this.moveHeadHand(0.03125)
          if (gamepad.buttons[14].pressed) this.moveHeadHand(0, 0, 0, 0.03125)
          if (gamepad.buttons[15].pressed) this.moveHeadHand(0, 0, 0, -0.03125)
        }
      }
    }
    this._grabBtn = false
    this._useBtn0 = false
    this._useBtn1 = false
    this._useBtn2 = false
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        this._grabBtn = this._grabBtn || gamepad.buttons[4].pressed || gamepad.buttons[5].pressed
        this._useBtn0 = this._useBtn0 || gamepad.buttons[6].pressed || gamepad.buttons[7].pressed
        this._useBtn1 = this._useBtn1 || gamepad.buttons[0].pressed
        this._useBtn2 = this._useBtn2 || gamepad.buttons[1].pressed
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
      if (this[_hand]._occlusionRay) {
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
      if (this[_hand].grabbed) {
        let ray = this[_hand].ray.components.raycaster
        ray.refreshObjects()
        for (let hit of ray.intersections) {
          if (hit && hit.el.getAttribute("wall") != null && hit.distance < -this[_hand].anchor.object3D.position.z) {
            this[_hand].anchor.object3D.position.multiplyScalar(0.5)
          }
        }
        this[_hand].grabbed.copyWorldPosRot(this[_hand].anchor)
        if (this[_hand].reticle) this[_hand].reticle.object3D.position.z = 1
      } else {
        if (this[_hand].ray) {
          let ray = this[_hand].ray.components.raycaster
          ray.refreshObjects()
          let hit = ray.intersections[0]
          if (hit && hit.el.getAttribute("grabbable") != null) {
            if (this[_hand]._lastHit !== hit.el) {
              if (this[_hand]._lastHit)
                this.emit("unreachable", this[_hand].glove, this[_hand]._lastHit)
              this[_hand]._lastHit = hit.el
              this.emit("reachable", this[_hand].glove, this[_hand]._lastHit)
              this._flexFinger(hand, 5, 0.25, true)
            }
            if (this[_hand].reticle) this[_hand].reticle.object3D.position.z = -hit.distance
          } else {
            if (this[_hand]._lastHit) {
              this.emit("unreachable", this[_hand].glove, this[_hand]._lastHit)
              this._restoreUserFlex(hand)
            }
            this[_hand]._lastHit = null
            if (this[_hand].reticle) this[_hand].reticle.object3D.position.z = 1
          }
        }

        // handle buttons
        if (this[_hand].buttonRay) {
          let ray = this[_hand].buttonRay.components.raycaster
          ray.refreshObjects()
          let hit = ray.intersections[0]
          if (hit && hit.el.getAttribute("button") != null) {
            if (this[_hand]._lastButton !== hit.el) {
              if (this[_hand]._lastButton)
                this.emit("unhover", this[_hand].glove, this[_hand]._lastButton)
              this[_hand]._lastButton = hit.el
              this.emit("hover", this[_hand].glove, this[_hand]._lastButton)
              this._flexFinger(hand, 7, 1, true)
              this._flexFinger(hand, 1, 0, true)
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
            if (this[_hand].buttonReticle) this[_hand].buttonReticle.object3D.position.z = -hit.distance
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
            if (this[_hand].buttonReticle) this[_hand].buttonReticle.object3D.position.z = 1
          }
        }
      }
    }
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
    if (hit && hit.el.getAttribute("grabbable") != null) {
      this.dropObject(hit.el)
      this[_hand].grabbed = hit.el
      this[_hand].anchor.copyWorldPosRot(this[_hand].grabbed)
      this[_hand].anchor.components.body.commit()
      if (this[_hand].grabbed.components.body != null) {
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
      } else {
        this[_hand].anchor.setAttribute("animation__pos", {
          property: "object3D.position.z",
          to: this[_hand].anchor.object3D.position.z + delta,
          dur: 256
        })
      }
      if (this.data.hideOnGrab || this[_hand].grabbed.components.grabbable.hideOnGrab)
        this[_hand].glove.setAttribute("visible", false)
      // if (this[_hand].glove.getAttribute("body"))
      this[_hand].glove.setAttribute("body", "collidesWith", 0)
      this.emit("grab", this[_hand].glove, this[_hand].grabbed, { intersection: hit })
      this._grabCount = Math.min(2, this._grabCount + 1)
      this.el.addState("grabbing")
      this[_hand].grabbed.addState("grabbed")
      this.sticky = true
      this._flexFinger(hand, 5, 0, true)
      setTimeout(() => {
        this.sticky = false
        this._flexFinger(hand, 5, 0.5, true)
      }, 256)
    }
  },
  drop(hand = "head") {
    let _hand = "_" + hand
    if (this.sticky) return
    this[_hand].anchor.removeAttribute("animation__rot")
    this[_hand].anchor.removeAttribute("animation__pos")
    this[_hand].glove.setAttribute("visible", true)
    setTimeout(() => {
      this[_hand].anchor.removeAttribute("joint__grab")
      this[_hand].anchor.setAttribute("position", "0 0 0")
      this[_hand].anchor.setAttribute("rotation", "0 0 0")
    }, 32)
    setTimeout(() => {
      // if (this[_hand].glove.getAttribute("body"))
      this[_hand].glove.setAttribute("body", "collidesWith", 1)
    }, 1024)
    if (this[_hand].grabbed) {
      this.emit("drop", this[_hand].glove, this[_hand].grabbed)
      this._grabCount = Math.max(0, this._grabCount - 1)
      if (!this._grabCount)
        this.el.removeState("grabbing")
      this._restoreUserFlex(hand)
      this[_hand].grabbed.removeState("grabbed")
      this[_hand].grabbed = null
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
      this.emit("usedown", this[_hand].glove, this[_hand].grabbed, { button: button })
    } else if (this[_hand]._lastButton) {
      this[_hand]._lastClick = this[_hand]._lastButton
      this.emit("press", this[_hand].glove, this[_hand]._lastClick, { button: button })
      this[_hand]._lastClick.addState("pressed")
    }
  },
  useUp(hand = "head", button = 0) {
    let _hand = "_" + hand
    if (this[_hand].grabbed) {
      this.emit("useup", this[_hand].glove, this[_hand].grabbed, { button: button })
    } else if (this[_hand]._lastClick) {
      this.emit("unpress", this[_hand].glove, this[_hand]._lastClick)
      this[_hand]._lastClick.removeState("pressed")
      this[_hand]._lastClick = null
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
    glove.emit(eventtype, e)
    if (grabbed) grabbed.emit(eventtype, e)
  },

  _enableHands() {
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
          objects: "[wall]",
          autoRefresh: false
        }
      })

      let palm = this[_hand].glove.querySelector(".palm") || this[_hand].glove
      this[_hand].ray = palm.ensure(".grabbing.ray", "a-entity", {
        class: "grabbing ray", position: hand === "left" ? "-0.0625 0 0.0625" : "0.0625 0 0.0625", rotation: hand === "left" ? "0 -45 0" : "0 45 0",
        raycaster: {
          objects: "[wall], [grabbable]",
          autoRefresh: false,
          // showLine: true,
        }
      })
      this[_hand].buttonRay = palm.ensure(".button.ray", "a-entity", {
        class: "button ray", position: "0 0.03125 0", rotation: hand === "left" ? "0 -8 0" : "0 8 0",
        raycaster: {
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
    this.update()
  },

  _ensureGlove(el) {
    let hand = el.getAttribute("side")
    let color = el.getAttribute("color") || "lightblue"
    return el.ensure(".glove", "a-entity", {
      "class": "glove",
      "fingerflex": {
        min: hand === "left" ? -10 : 10,
        max: hand === "left" ? -90 : 90,
      }
    }, `<a-box class="palm" color="${color}" position="${hand === "left" ? -0.01 : 0.01} -0.03 0.08" rotation="-35 0 0" width="0.02" height="0.08"
      depth="0.08">
      <a-entity position="0 0.04 0.02" rotation="80 0 ${hand === "left" ? -45 : 45}">
        <a-entity class="thumb bend">
          <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            <a-entity class="bend" position="0 0 -0.02">
              <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
              </a-box>
            </a-entity>
          </a-box>
        </a-entity>
      </a-entity>
      <a-entity class="index bend" position="0 0.03 -0.04" rotation="3 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
      <a-entity class="middle bend" position="0 0.01 -0.04" rotation="1 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
      <a-entity class="ring bend" position="0 -0.01 -0.04" rotation="-1 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
      <a-entity class="little bend" position="0 -0.03 -0.04" rotation="-3 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
    </a-box>`)
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
    this._keysDown[e.code] = true
    if (e.key === "e") this.toggleGrab()
  },
  _onKeyUp(e) { this._keysDown[e.code] = false },
  _onMouseDown(e) {
    let btn = e.button
    this.useDown("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _onWheel(e) {
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
  _onTouchTap(e) { this.use() },
  _onTouchHold(e) { this.toggleGrab() },
  _onButtonChanged(e) {
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
})

require("./grabbing/button")
require("./grabbing/climbable")
require("./grabbing/fingerflex")
require("./grabbing/grabbable")
require("./grabbing/receptacle")
