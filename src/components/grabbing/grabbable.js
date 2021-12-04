/* global AFRAME, THREE */

AFRAME.registerComponent("grabbable", {
  schema: {
    physics: { type: "boolean", default: true },
    kinematicGrab: { type: "boolean", default: true },
    hideOnGrab: { type: "boolean", default: false },
    fixed: { type: "boolean", default: false },
    fixedPosition: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    fingerFlex: { type: "array", default: [0.5] },
    immovable: { type: "boolean", default: false },
    avoidWalls: { type: "boolean", default: true },
  },

  init() {
    if (this.data.physics && !this.el.components.body) this.el.setAttribute("body", "type:dynamic;")
  },

  events: {
    grab(e) {
      if (e.detail.hand !== "head") {
        this._grabbed = e.detail
        this._glove = e.detail.gloveElement
        this._anchor = this._glove.querySelector(".anchor")
      }
      if (this.data.kinematicGrab) this.el.setAttribute("body", "type", "kinematic")
    },
    drop(e) {
      this._grabbed = false
      if (this.data.physics) this.el.setAttribute("body", "type", "dynamic")
    },
    limited(e) {
      if (this._grabbed) {
        let delta = THREE.Vector3.temp()
        let quat = THREE.Quaternion.temp()
        this._glove.copyWorldPosRot(this.el)
        let el = this._anchor
        while (el !== this._glove) {
          quat.copy(el.object3D.quaternion).conjugate()
          this._glove.object3D.quaternion.multiply(quat)
          el = el.parentNode
        }
        this._glove.object3D.updateWorldMatrix(true, true)
        delta.copy(this._anchor.object3D.position)
        this._anchor.object3D.parent.localToWorld(delta)
        this._glove.object3D.worldToLocal(delta)
        this._glove.object3D.position.sub(delta)
      }
    },
  }
})
