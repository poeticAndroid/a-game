/* global AFRAME, THREE */

AFRAME.registerComponent("grabbable", {
  schema: {
    freeOrientation: { type: "boolean", default: true },
    physics: { type: "boolean", default: true }
  },

  init() {
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:dynamic;")
  }
})
