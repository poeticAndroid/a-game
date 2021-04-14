/* global AFRAME, THREE */

AFRAME.registerComponent("start", {

  init: function () {
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
