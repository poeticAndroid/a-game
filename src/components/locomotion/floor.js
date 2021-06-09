/* global AFRAME, THREE */

AFRAME.registerComponent("floor", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update() {
    this.el.setAttribute("wall", this.data)
  }
})
