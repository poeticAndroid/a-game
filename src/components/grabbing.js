/* global AFRAME, THREE */

AFRAME.registerComponent("grabbing", {
  schema: {
    hideOnGrab: { type: "boolean", default: true },
    grabDistance: { type: "number", default: 1 }
  },

  init: function () {
    this._enableHands = this._enableHands.bind(this)
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onGripDown = this._onGripDown.bind(this)
    this._onGripUp = this._onGripUp.bind(this)
    this._onTriggerDown = this._onTriggerDown.bind(this)
    this._onTriggerUp = this._onTriggerUp.bind(this)
    this._onButtonDown = this._onButtonDown.bind(this)
    this._onButtonUp = this._onButtonUp.bind(this)
    this._onTouchTap = this._onTouchTap.bind(this)
    this._onTouchHold = this._onTouchHold.bind(this)

    this._hands = ["head", "left", "right"]
    this._head = {}
    this._left = {}
    this._right = {}
    this._head.hand = this.el.querySelector("a-camera")
    this._left.hand = this.el.querySelector("a-hand[side=\"left\"]")
    this._right.hand = this.el.querySelector("a-hand[side=\"right\"]")
    this._head.glove = this._head.hand
    this._left.glove = this._left.hand.querySelector(".glove") || this._left.hand
    this._right.glove = this._right.hand.querySelector(".glove") || this._right.hand

    this._left.glove.setAttribute("visible", false)
    this._right.glove.setAttribute("visible", false)
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this[_hand].hand.addEventListener("buttonchanged", this._enableHands)
    }

    this._head.glove.ensure(".hitbox", "a-sphere", { class: "hitbox", visible: false, radius: 0.5 })
    this._head.glove.setAttribute("body", "type:kinematic;")
    this._head.ray = this._head.glove.ensure(".grabbing-ray", "a-entity", {
      class: "grabbing-ray", position: "0 -0.125 0",
      raycaster: {
        objects: "[wall], [grabbable]",
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._head.anchor = this._head.ray.ensure(".grabbing-anchor", "a-entity", { class: "grabbing-anchor", visible: "false", body: "type:kinematic;autoShape:false;" })
  },

  update: function (oldData) {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      if (this[_hand].ray)
        this[_hand].ray.setAttribute("raycaster", "far", this.data.grabDistance + (hand === "head" ? 1 : 0.1875))
    }
  },

  play: function () {
    document.addEventListener("keydown", this._onKeyDown)
    this.el.sceneEl.canvas.addEventListener("mousedown", this._onMouseDown)
    this.el.sceneEl.canvas.addEventListener("mouseup", this._onMouseUp)
    for (let hand of [this._left.hand, this._right.hand]) {
      // hand.addEventListener("buttonchanged", this._enableHands)
      hand.addEventListener("gripdown", this._onGripDown)
      hand.addEventListener("gripup", this._onGripUp)
      hand.addEventListener("triggerdown", this._onTriggerDown)
      hand.addEventListener("triggerup", this._onTriggerUp)
      hand.addEventListener("buttondown", this._onButtonDown)
      hand.addEventListener("buttonup", this._onButtonUp)
    }
    this.el.sceneEl.canvas.addEventListener("tap", this._onTouchTap)
    this.el.sceneEl.canvas.addEventListener("hold", this._onTouchHold)
  },

  pause: function () {
    document.removeEventListener("keydown", this._onKeyDown)
    this.el.sceneEl.canvas.removeEventListener("mousedown", this._onMouseDown)
    this.el.sceneEl.canvas.removeEventListener("mouseup", this._onMouseUp)
    for (let hand of [this._left.hand, this._right.hand]) {
      // hand.removeEventListener("buttonchanged", this._enableHands)
      hand.removeEventListener("gripdown", this._onGripDown)
      hand.removeEventListener("gripup", this._onGripUp)
      hand.removeEventListener("triggerdown", this._onTriggerDown)
      hand.removeEventListener("triggerup", this._onTriggerUp)
      hand.removeEventListener("buttondown", this._onButtonDown)
      hand.removeEventListener("buttonup", this._onButtonUp)
    }
    this.el.sceneEl.canvas.removeEventListener("tap", this._onTouchTap)
    this.el.sceneEl.canvas.removeEventListener("hold", this._onTouchHold)
  },

  remove: function () {
  },

  tick: function (time, timeDelta) {
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        if ((gamepad.buttons[4].pressed || gamepad.buttons[5].pressed) && !this._grabBtn) this.toggleGrab()
        if ((gamepad.buttons[6].pressed || gamepad.buttons[7].pressed) && !this._useBtn0) this.useDown()
        if ((gamepad.buttons[0].pressed) && !this._useBtn1) this.useDown("head", 1)
        if ((gamepad.buttons[1].pressed) && !this._useBtn2) this.useDown("head", 2)
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
    headPos.copy(this._head.hand.object3D.position)
    this._head.hand.object3D.parent.localToWorld(headPos)

    for (let hand of this._hands) {
      let _hand = "_" + hand

      if (this[_hand]._occlusionRay) {
        this[_hand]._occlusionRay.object3D.position.copy(headPos)
        this[_hand].hand.object3D.getWorldPosition(delta)
        delta.sub(headPos)
        let handDist = delta.length()
        delta.normalize()
        this[_hand]._occlusionRay.setAttribute("raycaster", "direction", `${delta.x} ${delta.y} ${delta.z}`)
        this[_hand]._occlusionRay.setAttribute("raycaster", "far", handDist + 0.0625)

        let ray = this[_hand]._occlusionRay.components.raycaster
        ray.refreshObjects()
        let hit = ray.intersections[0]
        if (hit) {
          // this[_hand].glove.object3D.position.copy(hit.point)
          let dist = delta.copy(hit.point).sub(headPos).length()
          this[_hand].glove.object3D.position.copy(headPos).add(delta.normalize().multiplyScalar(dist - 0.0625))
          this[_hand].glove.object3D.parent.worldToLocal(this[_hand].glove.object3D.position)
        } else {
          this[_hand].glove.copyWorldPosRot(this[_hand].hand)
        }
      }

      if (this[_hand].grabbed) {
        if (!this[_hand].isPhysical)
          this[_hand].grabbed.copyWorldPosRot(this[_hand].anchor)
      } else if (this[_hand].ray) {
        let ray = this[_hand].ray.components.raycaster
        ray.refreshObjects()
        let hit = ray.intersections[0]
        if (hit && hit.object.el.getAttribute("grabbable") != null) {
          if (this[_hand]._lastHit !== hit.object.el) {
            if (this[_hand]._lastHit)
              this.emit("unreach", this[_hand].glove, this[_hand]._lastHit)
            this[_hand]._lastHit = hit.object.el
            this.emit("reach", this[_hand].glove, this[_hand]._lastHit)
          }
        } else {
          if (this[_hand]._lastHit)
            this.emit("unreach", this[_hand].glove, this[_hand]._lastHit)
          this[_hand]._lastHit = null
        }
      }
    }
  },

  toggleGrab: function (hand = "head") {
    let _hand = "_" + hand
    if (this[_hand].grabbed) this.drop(hand)
    else this.grab(hand)
  },
  grab: function (hand = "head") {
    let _hand = "_" + hand
    if (!this[_hand].ray) return
    if (this[_hand].grabbed) this.drop(hand)
    let ray = this[_hand].ray.components.raycaster
    ray.refreshObjects()
    let hit = ray.intersections[0]
    if (hit && hit.object.el.getAttribute("grabbable") != null) {
      this.dropObject(hit.object.el)
      this[_hand].grabbed = hit.object.el
      this[_hand].anchor.copyWorldPosRot(this[_hand].grabbed)
      if (this[_hand].grabbed.components.body != null) {
        this[_hand].anchor.setAttribute("joint__1", { body2: this[_hand].grabbed, pivot1: "-1 -1 0", pivot2: "-1 -1 0" })
        this[_hand].anchor.setAttribute("joint__2", { body2: this[_hand].grabbed, pivot1: "1 -1 0", pivot2: "1 -1 0" })
        this[_hand].anchor.setAttribute("joint__3", { body2: this[_hand].grabbed, pivot1: "0 1 0", pivot2: "0 1 0" })
        this[_hand].isPhysical = true
      } else {
        this[_hand].isPhysical = false
      }
      this[_hand].anchor.removeAttribute("animation__pos")
      this[_hand].anchor.removeAttribute("animation__rot")
      let delta = hit.distance
      if (hand === "head") delta -= 0.5
      else delta -= 0.0625
      if (this[_hand].grabbed.components.grabbable.data.freeOrientation) {
        this[_hand].anchor.setAttribute("animation__pos", {
          property: "object3D.position.z",
          to: this[_hand].anchor.object3D.position.z + delta,
          dur: 256
        })
      } else {
        this[_hand].anchor.setAttribute("animation__pos", {
          property: "position",
          to: { x: 0, y: 0, z: -0.09375 },
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
      }
      if (this.data.hideOnGrab)
        this[_hand].glove.setAttribute("visible", false)
      this[_hand].glove.setAttribute("body", "collidesWith", 0)
      this.emit("grab", this[_hand].glove, this[_hand].grabbed)
    }
  },
  drop: function (hand = "head") {
    let _hand = "_" + hand
    this[_hand].anchor.removeAttribute("joint__1")
    this[_hand].anchor.removeAttribute("joint__2")
    this[_hand].anchor.removeAttribute("joint__3")
    this[_hand].anchor.removeAttribute("animation")
    this[_hand].glove.setAttribute("visible", true)
    setTimeout(() => {
      this[_hand].glove.setAttribute("body", "collidesWith", 1)
    }, 1024)
    this.emit("drop", this[_hand].glove, this[_hand].grabbed)
    this[_hand].grabbed = null
  },
  dropObject: function (el) {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      if (this[_hand].grabbed === el) this.drop(hand)
    }
  },
  use: function (hand = "head", button = 0) {
    let _hand = "_" + hand
    this.useDown(hand, button)
    setTimeout(() => {
      this.useUp(hand, button)
    }, 32)
  },
  useDown: function (hand = "head", button = 0) {
    let _hand = "_" + hand
    if (!this[_hand].grabbed) return this.grab(hand)
    this.emit("usedown", this[_hand].glove, this[_hand].grabbed, { button: button })
  },
  useUp: function (hand = "head", button = 0) {
    let _hand = "_" + hand
    this.emit("useup", this[_hand].glove, this[_hand].grabbed, { button: button })
  },

  emit: function (eventtype, glove, grabbed, e = {}) {
    e.grabbing = this.el
    e.grabbedElement = grabbed
    e.gloveElement = glove
    for (let _hand of this._hands) {
      if (this["_" + _hand].hand === glove) e.hand = _hand
    }
    glove.emit(eventtype, e)
    if (grabbed) grabbed.emit(eventtype, e)
  },

  _enableHands: function () {
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
    }
    this._left.ray = this._left.glove.ensure(".grabbing-ray", "a-entity", {
      class: "grabbing-ray", position: "-0.0625 0 0.0625", rotation: "0 -45 0",
      raycaster: {
        objects: "[wall], [grabbable]",
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._right.ray = this._right.glove.ensure(".grabbing-ray", "a-entity", {
      class: "grabbing-ray", position: "0.0625 0 0.0625", rotation: "0 45 0",
      raycaster: {
        objects: "[wall], [grabbable]",
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._left.anchor = this._left.ray.ensure(".grabbing-anchor", "a-entity", { class: "grabbing-anchor", visible: "false", body: "type:kinematic;autoShape:false;" })
    this._right.anchor = this._right.ray.ensure(".grabbing-anchor", "a-entity", { class: "grabbing-anchor", visible: "false", body: "type:kinematic;autoShape:false;" })
    this.update()
  },

  _onKeyDown: function (e) { if (e.key === "e") this.toggleGrab() },
  _onMouseDown: function (e) {
    let btn = e.button
    this.useDown("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _onMouseUp: function (e) {
    let btn = e.button
    this.useUp("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _onTouchTap: function (e) { this.use() },
  _onTouchHold: function (e) { this.toggleGrab() },
  _onGripDown: function (e) { this.grab(e.target.getAttribute("side")) },
  _onGripUp: function (e) { this.drop(e.target.getAttribute("side")) },
  _onTriggerDown: function (e) { this.useDown(e.target.getAttribute("side")) },
  _onTriggerUp: function (e) { this.useUp(e.target.getAttribute("side")) },
  _onButtonDown: function (e) {
    let btn = e.detail.id - 3
    if (btn < 1) return
    let hand = "right"
    if (e.target == this._left.hand) hand = "left"
    this.useDown(hand, btn)
  },
  _onButtonUp: function (e) {
    let btn = e.detail.id - 3
    if (btn < 1) return
    let hand = "right"
    if (e.target == this._left.hand) hand = "left"
    this.useUp(hand, btn)
  },
})

require("./grabbing/grabbable")
