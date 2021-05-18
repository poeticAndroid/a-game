/* global AFRAME, THREE */

AFRAME.registerComponent("thickness", {
  dependencies: ["material"],
  schema: { type: "number" },

  update: function () {
    this.el.setAttribute("width", this.el.components.material.data.repeat.x)
    this.el.setAttribute("height", this.el.components.material.data.repeat.y)
    this.el.setAttribute("depth", this.data)
  }
})
