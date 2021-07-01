/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("shape", {
  // dependencies: ["body"],
  schema: {
  },

  play() {
    if (this.id != null) return
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return

    this.body = this.el
    while (this.body && !this.body.matches("[body]")) this.body = this.body.parentElement
    if (!this.body) return this._retry = setTimeout(() => {
      this.play()
    }, 256)
    this.bodyId = this.body.components.body.id

    let shapes = this.body.components.body.shapes
    this.id = shapes.indexOf(null)
    if (this.id < 0) this.id = shapes.length
    shapes[this.id] = this.el

    let shape = {}
    shape.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
    this.body.object3D.worldToLocal(shape.position)
    shape.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    let bodyquat = this.body.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    shape.quaternion.multiply(bodyquat.conjugate().normalize()).normalize()
    shape.size = THREE.Vector3.temp().set(1, 1, 1)

    switch (this.el.tagName.toLowerCase()) {
      case "a-sphere":
        shape.type = "sphere"
        shape.size.multiplyScalar(parseFloat(this.el.getAttribute("radius") || 1) * 2)
        break
      case "a-cylinder":
        shape.type = "cylinder"
        shape.size.multiplyScalar(parseFloat(this.el.getAttribute("radius") || 1) * 2).y = parseFloat(this.el.getAttribute("height") || 1)
        break
      case "a-box":
        shape.type = "box"
        shape.size.set(
          parseFloat(this.el.getAttribute("width") || 1),
          parseFloat(this.el.getAttribute("height") || 1),
          parseFloat(this.el.getAttribute("depth") || 1)
        )
        break
      // case "a-plane":
      //   shape.type = "plane"
      //   break
    }
    let scale = this.el.object3D.getWorldScale(THREE.Vector3.temp())
    shape.size.multiply(scale)
    shape.position.multiply(scale)

    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " create " + cmd.stringifyParam(shape))
  },

  pause() {
    clearTimeout(this._retry)
    if (!this.body) return
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    let shapes = this.body.components.body.shapes
    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " remove")
    shapes[this.id] = null
    this.id = null
  },

  eval(expr) {
    let worker = this.el.sceneEl.systems.physics.worker
    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " eval " + cmd.stringifyParam(expr))
  }
})

