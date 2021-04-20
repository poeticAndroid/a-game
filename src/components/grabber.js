/* global AFRAME, THREE */

AFRAME.registerComponent("grabber", {
  schema: {
    hideOnGrab: { type: "boolean", default: false }
  },

  init: function () {
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
    this._left.glove = this.el.querySelector(".left-glove") || this._left.hand
    this._right.glove = this.el.querySelector(".right-glove") || this._right.hand

    if (this._left.hand !== this._left.glove) this._left.hand.setAttribute("visible", false)
    if (this._right.hand !== this._right.glove) this._right.hand.setAttribute("visible", false)

    this._head.ray = this._head.glove.ensure(".grabber-ray", "a-entity", {
      class: "grabber-ray", position: "0 -0.0625 0",
      raycaster: {
        objects: "[body], [grabbable]",
        autoRefresh: false,
        // showLine: true,
      }
    })
    let dia = Math.sin(Math.PI / 4)
    this._left.ray = this._left.glove.ensure(".grabber-ray", "a-entity", {
      class: "grabber-ray",
      raycaster: {
        objects: "[body], [grabbable]",
        origin: { x: -0.0625, y: 0, z: 0.0625 },
        direction: { x: dia, y: 0, z: -dia },
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._right.ray = this._right.glove.ensure(".grabber-ray", "a-entity", {
      class: "grabber-ray",
      raycaster: {
        objects: "[body], [grabbable]",
        origin: { x: 0.0625, y: 0, z: 0.0625 },
        direction: { x: -dia, y: 0, z: -dia },
        autoRefresh: false,
        // showLine: true,
      }
    })

    this._head.anchor = this._head.glove.ensure(".grabber-anchor", "a-entity", { class: "grabber-anchor", visible: "false" })
    this._left.anchor = this._left.glove.ensure(".grabber-anchor", "a-entity", { class: "grabber-anchor", visible: "false" })
    this._right.anchor = this._right.glove.ensure(".grabber-anchor", "a-entity", { class: "grabber-anchor", visible: "false" })
  },

  update: function (oldData) {
  },

  play: function () {
    document.addEventListener("keydown", this._onKeyDown)
    this.el.sceneEl.canvas.addEventListener("mousedown", this._onMouseDown)
    this.el.sceneEl.canvas.addEventListener("mouseup", this._onMouseUp)
    for (let hand of [this._left.hand, this._right.hand]) {
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
    for (let hand of this._hands) {
      let _hand = "_" + hand
      ray = this[_hand].ray.components.raycaster
      ray.refreshObjects()
      hit = ray.intersections[0]
      if (hit && hit.object.el.getAttribute("grabbable") != null) {
        this[_hand].ray.setAttribute("raycaster", "showLine", true)
      } else {
        this[_hand].ray.setAttribute("raycaster", "showLine", false)
      }
    }
  },

  toggleGrab: function (hand = "head") {
    let _hand = "_" + hand
    if (this[_hand].grabbed) this.drop(hand)
    else this.grab(hand)
  },
  grab: function (hand = "head") { },
  drop: function (hand = "head") { },
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
    this.emit("usedown", this[_hand].hand, this[_hand].grabbed, { button: button })
  },
  useUp: function (hand = "head", button = 0) {
    let _hand = "_" + hand
    this.emit("useup", this[_hand].hand, this[_hand].grabbed, { button: button })
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

require("./grabber/grabbable")
