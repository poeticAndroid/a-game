/* global AFRAME, THREE */

AFRAME.registerComponent("fingerflex", {
  schema: {
    min: { type: "number", default: 10 },
    max: { type: "number", default: 90 },
  },

  init: function () {
    this._fingers = ["thumb", "index", "middle", "ring", "little"]
    this._currentFlex = [0, 0, 0, 0, 0]
    this._targetFlex = [1.125, 1.125, 1.125, 1.125, 1.125]
  },

  tick: function (time, timeDelta) {
    for (let finger = 0; finger < 5; finger++) {
      let name = this._fingers[finger]
      let current = this._currentFlex[finger]
      let target = this._targetFlex[finger]

      current = current + Math.random() * Math.random() * (target - current)
      let degrees = this.data.min + current * (this.data.max - this.data.min)
      let bend = this.el.querySelector(".bend." + name)
      while (bend) {
        let rot = bend.getAttribute("rotation")
        rot.y = degrees
        bend.setAttribute("rotation", rot)
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
