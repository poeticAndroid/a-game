/* global AFRAME, THREE */

AFRAME.registerComponent("wall", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update() {
    if (this.data.physics && !this.el.hasAttribute("body")) this.el.setAttribute("body", "type:static")
  }
})
