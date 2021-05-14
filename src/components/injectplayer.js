/* global AFRAME, THREE */

AFRAME.registerComponent("injectplayer", {

  init: function () {
    this.el.ensure("a-camera", "a-camera", {
      "look-controls": { pointerLockEnabled: true, touchEnabled: false },
      "wasd-controls": { enabled: false }
    })
    this.el.ensure("a-hand[side=\"left\"]", "a-hand", { side: "left" })
    this.el.ensure("a-hand[side=\"right\"]", "a-hand", { side: "right" })
  }
})
