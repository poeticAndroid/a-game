/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("joint", {
  // dependencies: ["body", "shape"],
  multiple: true,

  schema: {
    type: { type: "string", default: "ball" },
    body1: { type: "selector" },
    body2: { type: "selector" },
    pivot1: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    pivot2: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    axis1: { type: "vec3", default: { x: 0, y: 1, z: 0 } },
    axis2: { type: "vec3", default: { x: 0, y: 1, z: 0 } },
    min: { type: "number", default: 0 },
    max: { type: "number", default: 1 },
    collision: { type: "boolean", default: true },
    // limit: { type: "array" },
    // motor: { type: "array" },
    // spring: { type: "array" },
  },

  play() {
    if (this._id != null) return
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    if (!this.data.body1.components.body) return this._retry = setTimeout(() => {
      this.play()
    }, 256)
    if (!this.data.body2.components.body) return this._retry = setTimeout(() => {
      this.play()
    }, 256)
    this._id = joints.indexOf(null)
    if (this._id < 0) this._id = joints.length
    joints[this._id] = this.el

    // setTimeout(() => {
    let joint = {}
    joint.type = this.data.type
    joint.body1 = this.data.body1 ? this.data.body1.components.body.id : this.el.components.body.id
    joint.body2 = this.data.body2.components.body.id
    joint.pivot1 = this.data.pivot1
    joint.pivot2 = this.data.pivot2
    joint.axis1 = this.data.axis1
    joint.axis2 = this.data.axis2
    joint.min = this.data.min
    joint.max = this.data.max
    joint.collision = this.data.collision
    worker.postMessage("world joint " + this._id + " create " + cmd.stringifyParam(joint))
    // })
  },

  update(oldData) {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    this.data.body1 = this.data.body1 || this.el
    // if (this.data.type !== oldData.type)
    //   worker.postMessage("world joint " + this._id + " type = " + cmd.stringifyParam(this.data.type))
  },

  pause() {
    clearTimeout(this._retry)
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    joints[this._id] = null
    worker.postMessage("world joint " + this._id + " remove")
    this._id = null
  },
  eval(expr) {
    let worker = this.el.sceneEl.systems.physics.worker
    worker.postMessage("world joint " + this._id + " eval " + cmd.stringifyParam(expr))
  }

})

