/* global AFRAME, THREE */

AFRAME.registerComponent("tile", {
  schema: {
    tileSize: { type: "vec2", default: { x: 1, y: 1 } },
  },

  init: function () {
    this.showHandles = this.showHandles.bind(this)
    this.hideHandles = this.hideHandles.bind(this)

    this._editor = this.el.sceneEl.querySelector("[editor]")
    this._gridSize = new THREE.Vector3()
    this._handles = []
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        if (Math.abs(x) + Math.abs(y) !== 1) continue
        let handle
        this._handles.push(handle =
          this.el.ensure(".handle" + (this._handles.length), "a-box", {
            class: "handle" + (this._handles.length),
            scale: "0.125 0.125 " + ((parseFloat(this.el.getAttribute("depth")) || 1) + 0.0625),
            grabbable: { physics: false },
            visible: false,
            position: {
              x: x * (parseFloat(this.el.getAttribute("width")) || 1) / 2,
              y: y * (parseFloat(this.el.getAttribute("height")) || 1) / 2,
              z: 0
            }
          }))
        handle.axis = { x: x, y: y }
        handle.addEventListener("grab", (e) => {
          clearTimeout(this._hideTO)
          this.el.play()
        })
        handle.addEventListener("drop", (e) => {
          clearTimeout(this._hideTO)
          this._changed = true
          this._hideTO = setTimeout(this.hideHandles, 8192)
        })
      }
    }
    this.el.addEventListener("place", (e) => {
      clearTimeout(this._hideTO)
      this.showHandles()
      this._hideTO = setTimeout(this.hideHandles, 1024 * 64)
    })
  },

  tick: function () {
    if (!this._editor) return this.el.removeAttribute("tile")
    this._gridSize.copy(this._editor.components.editor.data.gridSize)
    let width = 0, height = 0
    for (let handle of this._handles) {
      if (handle.axis.x)
        this.el.setAttribute("width", width += Math.abs(Math.round(handle.object3D.position.x / this._gridSize.x) * this._gridSize.x))
      if (handle.axis.y)
        this.el.setAttribute("height", height += Math.abs(handle.axis.y * Math.round(handle.object3D.position.y / this._gridSize.y) * this._gridSize.y))
    }
    for (let handle of this._handles) {
      handle.object3D.quaternion.set(0, 0, 0, 1)
      handle.object3D.position.set(
        handle.axis.x * (parseFloat(this.el.getAttribute("width")) || 1) / 2,
        handle.axis.y * (parseFloat(this.el.getAttribute("height")) || 1) / 2,
        0
      )
    }
  },

  showHandles: function () {
    for (let handle of this._handles) {
      handle.setAttribute("visible", true)
    }
    this.tick()
  },
  hideHandles: function () {
    for (let handle of this._handles) {
      handle.setAttribute("visible", false)
    }
    if (!this._changed) return
    let pair = this._editor.components.editor.getPair(this.el)
    // console.log("flushing")
    // this.el.flushToDOM(true)
    let width = parseFloat(this.el.getAttribute("width") || 1)
    let height = parseFloat(this.el.getAttribute("height") || 1)
    let material = AFRAME.utils.styleParser.parse(pair.src.getAttribute("material") || "")
    material.repeat = [
      width * this.data.tileSize.x,
      height * this.data.tileSize.y
    ].join(" ")
    pair.src.setAttribute("width", "" + width)
    pair.src.setAttribute("height", "" + height)
    pair.src.setAttribute("material", AFRAME.utils.styleParser.stringify(material))
    let html = pair.src.outerHTML
    this._editor.components.editor.addEntity(html)
    setTimeout(() => {
      this._editor.components.editor.removeEntity(this.el)
    }, 256)
  },
})
