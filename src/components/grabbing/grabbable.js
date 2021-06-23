/* global AFRAME, THREE */

AFRAME.registerComponent("grabbable", {
  schema: {
    physics: { type: "boolean", default: true },
    kinematicGrab: { type: "boolean", default: true },
    fixed: { type: "boolean", default: false },
    fixedPosition: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
  },

  init() {
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:dynamic;")
  },

  events: {
    grab() {
      if (this.data.kinematicGrab) this.el.setAttribute("body", "type", "kinematic")
    },
    drop() {
      if (this.data.kinematicGrab) this.el.setAttribute("body", "type", "dynamic")
    },
  }
})
