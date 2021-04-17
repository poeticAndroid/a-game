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
