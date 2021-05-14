/* global AFRAME, THREE */

AFRAME.registerComponent("wall", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update: function () {
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:static")
  }
})
