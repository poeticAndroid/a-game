/* global AFRAME, THREE */

AFRAME.registerComponent("fingerflex", {
  schema: {
    min: { type: "number", default: 10 },
    max: { type: "number", default: 90 },
  },

  init: function () {
    this._fingers = ["thumb", "index", "middle", "ring", "little"]
  },

  events: {
    fingerflex: function (e) {
      let degrees = this.data.min + e.detail.flex * (this.data.max - this.data.min)
      let bend = this.el.querySelector(".bend." + this._fingers[e.detail.finger])
      while (bend) {
        bend.setAttribute("rotation", "y", degrees)
        bend = bend.querySelector(".bend")
      }
    }
  }
})
