/* global AFRAME, THREE */

AFRAME.registerComponent("injectplayer", {

  init: function () {
    let cam = this.el.ensure("a-camera", "a-camera", {
      "look-controls": { pointerLockEnabled: true, touchEnabled: false },
      "wasd-controls": { enabled: false }
    })
    cam.ensure(".tracker", "a-entity", { class: "tracker" })
    let boxsize = 0.0625
    let leftHand = this.el.ensure("a-hand[side=\"left\"]", "a-hand", { side: "left" })
    // let leftHitbox = leftHand.ensure(".left-hitbox", "a-box", { class: "left-hitbox", position: "0 -0 0.0625", material: "visible:false", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
    // let leftGlove = leftHitbox.ensure(".left-glove", "a-entity", { class: "left-glove", position: "0 0 -0.0625" })
    let rightHand = this.el.ensure("a-hand[side=\"right\"]", "a-hand", { side: "right" })
    // let rightHitbox = rightHand.ensure(".right-hitbox", "a-box", { class: "right-hitbox", position: "0 -0 0.0625", material: "visible:false", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
    // let rightGlove = rightHitbox.ensure(".right-glove", "a-entity", { class: "right-glove", position: "0 0 -0.0625" })
  }
})
