/* global AFRAME, THREE */

AFRAME.registerComponent("trigger", {
  schema: {
    objects: { type: "string", default: ".head-bumper" },
  },

  init() {
    this._refreshTO = setInterval(this.refreshObjects.bind(this), 1024)
  },

  remove() {
    clearInterval(this._refreshTO)
  },

  tick() {
    if (!this.objects) return this.refreshObjects()
    let local = THREE.Vector3.temp()
    let width = this.el.components.geometry.data.width
    let height = this.el.components.geometry.data.height
    let depth = this.el.components.geometry.data.depth
    let radius = this.el.components.geometry.data.radius
    let inside
    for (let obj of this.objects) {
      obj.object3D.localToWorld(local.set(0, 0, 0))
      this.el.object3D.worldToLocal(local)
      switch (this.el.tagName.toLowerCase()) {
        case "a-sphere":
          inside = local.length() < radius
          break
        case "a-box":
          inside = Math.abs(local.x) < width / 2
            && Math.abs(local.y) < height / 2
            && Math.abs(local.z) < depth / 2
          break
        case "a-cylinder":
          inside = Math.abs(local.y) < height / 2
          local.y = 0
          inside = inside && local.length() < radius
          break
      }
      if (inside && this.triggered.indexOf(obj) < 0) {
        let d = {
          trigger: this.el,
          object: obj,
        }
        this.el.addState("triggered")
        this.el.emit("trigger", d)
        obj.emit("trigger", d)
        this.triggered.push(obj)
      }
      if (!inside && this.triggered.indexOf(obj) >= 0) {
        let d = {
          trigger: this.el,
          object: obj,
        }
        this.el.emit("untrigger", d)
        obj.emit("untrigger", d)
        this.triggered.splice(this.triggered.indexOf(obj), 1)
        if (!this.triggered.length)
          this.el.removeState("triggered")
      }
    }
  },

  refreshObjects() {
    this.objects = this.objects || []
    this.triggered = this.triggered || []
    this.objects.splice(0, this.objects.length)
    let els = this.el.sceneEl.querySelectorAll(this.data.objects)
    if (!els) return
    els.forEach(el => {
      this.objects.push(el)
    })
    for (let i = 0; i < this.triggered.length; i++) {
      let obj = this.triggered[i]
      if (this.objects.indexOf(obj) < 0) {
        this.triggered.splice(i, 1)
        i--
      }
    }
  },


})
