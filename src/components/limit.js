/* global AFRAME, THREE */

AFRAME.registerComponent("limit", {
  schema: {
    minPos: { type: "vec3" },
    maxPos: { type: "vec3" },
    rotationRange: { type: "vec3", default: { x: 1, y: 1, z: 1 } },
  },

  tick() {
    let delta = THREE.Vector3.temp()
    let pos = this.el.object3D.position
    let minPos = this.data.minPos
    let maxPos = this.data.maxPos
    let quat = this.el.object3D.quaternion
    let minQuat = THREE.Quaternion.temp().set(
      -Math.abs(this.data.rotationRange.x),
      -Math.abs(this.data.rotationRange.y),
      -Math.abs(this.data.rotationRange.z),
      -1)
    let maxQuat = THREE.Quaternion.temp().set(
      Math.abs(this.data.rotationRange.x),
      Math.abs(this.data.rotationRange.y),
      Math.abs(this.data.rotationRange.z),
      1)
    delta.copy(pos)
    pos.set(
      Math.min(Math.max(minPos.x, pos.x), maxPos.x),
      Math.min(Math.max(minPos.y, pos.y), maxPos.y),
      Math.min(Math.max(minPos.z, pos.z), maxPos.z)
    )
    quat.set(
      Math.min(Math.max(minQuat.x, quat.x), maxQuat.x),
      Math.min(Math.max(minQuat.y, quat.y), maxQuat.y),
      Math.min(Math.max(minQuat.z, quat.z), maxQuat.z),
      Math.min(Math.max(minQuat.w, quat.w), maxQuat.w)
    ).normalize()
    delta.sub(pos)
    if (delta.length() > 0) {
      setTimeout(() => {
        this.el.components.body?.commit()
      })
      this.el.object3D.updateWorldMatrix(true, true)
      this.el.emit("limited")
    }
  },

  events: {
    drop(e) {

    }
  }

})
