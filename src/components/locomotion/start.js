/* global AFRAME, THREE */

AFRAME.registerComponent("start", {

  init: function () {
    let loco = this.el.sceneEl.querySelector("[locomotion]").components.locomotion
    let pos = new THREE.Vector3()
    // console.log("starting at", pos)

    setTimeout(() => {
      this.el.object3D.getWorldPosition(pos)
      loco.teleport(pos, true)
      setTimeout(() => {
        loco.toggleCrouch(true)
      }, 256)
    }, 256)
  }
})
