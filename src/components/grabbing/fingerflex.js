/* global AFRAME, THREE */

AFRAME.registerComponent("fingerflex", {
  schema: {
    min: { type: "number", default: 10 },
    max: { type: "number", default: 90 },
  },

  init: function () {
    this._fingers = ["thumb", "index", "middle", "ring", "little"]
    this._currentFlex = [0, 0, 0, 0, 0]
    this._targetFlex = [1.125, 0, 1.125, 1.125, 1.125]
  },

  tick: function (time, timeDelta) {
    for (let finger = 0; finger < 5; finger++) {
      let name = this._fingers[finger]
      let current = this._currentFlex[finger]
      let target = this._targetFlex[finger]

      current = Math.min(Math.max(current - 0.1, target), current + 0.1)
      let degrees = this.data.min + current * (this.data.max - this.data.min)
      let bend = this.el.querySelector(".bend." + name)
      while (bend) {
        bend.setAttribute("rotation", "y", degrees)
        bend = bend.querySelector(".bend")
      }

      this._currentFlex[finger] = current
    }
  },

  events: {
    fingerflex: function (e) {
      this._targetFlex[e.detail.finger] = e.detail.flex
    }
  }
})
