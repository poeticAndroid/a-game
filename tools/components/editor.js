/* global AFRAME, THREE */

AFRAME.registerComponent("editor", {
  // dependencies: ["grabbable"],
  schema: {
    gridSize: { type: "vec3", default: { x: 0.5, y: 0.5, z: 0.5 } },
    rotationSteps: { type: "vec3", default: { x: 8, y: 8, z: 8 } }
  },

  init: function () {
    this._map = []
    this._div = document.body.ensure("template")
    this._src = this._parseHTML('<a-main>\n</a-main>')
    this._world = this.el.sceneEl.ensure("a-main")
    this._worldAnchor = this._world.ensure(".editor-anchors", "a-entity", {
      class: "editor-anchors"
    })
    this._anchor = this.el.ensure(".editor-anchor", "a-entity", {
      class: "editor-anchor"
    })
    this._angularSize = new THREE.Vector3()
    this._history = []
    this._anchors = []
    this._grabbed = []

    this.load = this.load.bind(this)
    this.save = this.save.bind(this)
    this._grab = this._grab.bind(this)
    this._useDown = this._useDown.bind(this)
    this._useUp = this._useUp.bind(this)
    this.el.addEventListener("grab", this._grab)
    this.el.addEventListener("usedown", this._useDown)
    this.el.addEventListener("useup", this._useUp)
    if (this.el.sceneEl.hasLoaded) {
      this.load()
    } else {
      this.el.sceneEl.addEventListener("loaded", this.load)
    }
  },

  remove: function () {
    this.el.removeEventListener("grab", this._grab)
    this.el.removeEventListener("usedown", this._useDown)
    this.el.removeEventListener("useup", this._useUp)
  },

  update: function () {
    this._angularSize.set(360, 360, 360).divide(this.data.rotationSteps)
    if (!this.el.getAttribute("grabbable"))
      this.el.setAttribute("grabbable", {
        physics: false,
        freeOrientation: false
      })
    if (!this.el.getAttribute("raycaster"))
      this.el.setAttribute("raycaster", {
        objects: ".editable, .editable *",
        far: 1,
        autoRefresh: false,
        showLine: true
      })
  },

  tick: function (time, timeDelta) {
    if (this._selecting) {
      let ray = this.el.components.raycaster
      ray.refreshObjects()
      let int = ray.intersections[0]
      if (int) {
        let grab = int.object.el
        if (!grab) return
        while (!grab.classList.contains("editable")) {
          grab = grab.parentNode
          if (!grab) return
        }
        this._anchor.copyWorldPosRot(grab)
        this._worldAnchor.copyWorldPosRot(grab)
        if (this._grabbed.indexOf(grab) < 0) {
          this._grabbed.push(grab)
          grab.pause()
          let oldScale = JSON.parse(JSON.stringify(grab.getAttribute("scale")))
          let newScale = JSON.parse(JSON.stringify(oldScale))
          newScale.x *= 1.1
          newScale.y *= 1.1
          newScale.z *= 1.1
          grab.setAttribute("scale", newScale)
          setTimeout(() => {
            grab.setAttribute("scale", oldScale)
          }, 256)
          console.log("added to selection", this._grabbed.length)
        }
      }

      if (this._grabbed.length > this._anchors.length) {
        let anch = document.createElement("a-entity")
        this._worldAnchor.appendChild(anch)
        this._anchors.push(anch)
      }
    } else {
      for (let i = 0; i < this._grabbed.length; i++) {
        let grab = this._grabbed[i]
        let anch = this._anchors[i]
        if (grab && grab.copyWorldPosRot) {
          grab.copyWorldPosRot(anch)
          // if (grab.body) {
          //   grab.body.sleep()
          //   grab.body.velocity.set(0, 0, 0)
          //   grab.body.angularVelocity.set(0, 0, 0)
          // }
        }
      }

      this._worldAnchor.copyWorldPosRot(this._anchor)
      this._snap(this._worldAnchor)
    }
  },

  addEntity: function (srcEl) {
    if (typeof srcEl === "string") {
      srcEl = this._parseHTML(srcEl)
    }
    // srcEl = srcEl.cloneNode(true)
    // this._div.innerHTML = srcEl.outerHTML.trim()
    let worldEl = this._parseHTML(srcEl.outerHTML)
    srcEl.removeAttribute("position")
    srcEl.removeAttribute("rotation")
    srcEl.removeAttribute("scale")
    worldEl.classList.add("editable")
    this._map.push({
      src: srcEl,
      world: worldEl
    })
    worldEl.addEventListener("loaded", () => {
      worldEl.pause()
    })
    this._src.appendChild(srcEl)
    this._world.appendChild(worldEl)
    this._history.push({
      cmd: "remove",
      el: srcEl
    })
  },
  findEntity: function (el) {
    let index = null
    if (typeof el === "object") {
      for (let i = 0; i < this._map.length; i++) {
        if (this._map[i].src === el) index = i
        if (this._map[i].world === el) index = i
      }
    }
    return index
  },
  removeEntity: function (el) {
    let index = el
    if (typeof el === "object") {
      for (let i = 0; i < this._map.length; i++) {
        if (this._map[i].src === el) index = i
        if (this._map[i].world === el) index = i
      }
    }
    if (typeof index === "number") {
      let m = this._map[index]
      this._history.push({
        cmd: "add",
        html: m.src.outerHTML
      })
      m.src.parentNode.removeChild(m.src)
      m.world.parentNode.removeChild(m.world)
      this._map.splice(index, 1)
    }
  },

  load: function () {
    if (!this.el.sceneEl.querySelector("a-assets")) {
      let to = setTimeout(this.load, 256)
      return
    }

    while (this._map.length) this.removeEntity(this._map.length - 1)
    let src = localStorage.getItem("wip-scene")
    if (!src) return
    let scene = this._parseHTML(src)
    for (let ent of scene.childNodes) {
      if (ent instanceof Element) {
        this.addEntity(ent.outerHTML)
      }
    }
  },
  save: function () {
    for (let i = 0; i < this._map.length; i++) {
      let m = this._map[i]
      let oldHtml = m.src.outerHTML
      let str = AFRAME.utils.coordinates.stringify(m.world.getAttribute("position"))
      if (str && str != "0 0 0") m.src.setAttribute("position", str)
      else m.src.removeAttribute("position")
      str = AFRAME.utils.coordinates.stringify(m.world.getAttribute("rotation"))
      if (str && str != "0 0 0") m.src.setAttribute("rotation", str)
      else m.src.removeAttribute("rotation")
      str = AFRAME.utils.coordinates.stringify(m.world.getAttribute("scale"))
      if (str && str != "1 1 1") m.src.setAttribute("scale", str)
      else m.src.removeAttribute("scale")
      if (!m.src.getAttribute("class")) m.src.removeAttribute("class")
      let newHtml = m.src.outerHTML
      if (newHtml !== oldHtml) {
        this._history.push({
          cmd: "edit",
          el: m.src,
          html: oldHtml,
          _html: newHtml
        })
      }
    }
    localStorage.setItem("wip-scene", this._src.outerHTML.replace(/=""/g, "").trim())
  },

  undo: function () {
    if (this._history.length == 0) return
    let action = this._history.pop()
    console.log("Undoing...", this._history.length, action)
    let len = this._history.length
    switch (action.cmd) {
      case "remove":
        this.removeEntity(action.el)
        break
      case "add":
        this.addEntity(action.html)
        break
      case "edit":
        let m = this._map[this.findEntity(action.el)]
        if (!m) return
        let child = this._parseHTML(action.html)
        let def = ["0 0 0", "0 0 0", "1 1 1"]
        for (let atr of ["position", "rotation", "scale"]) {
          let _def = def.shift()
          if (child.getAttribute(atr)) {
            m.world.setAttribute(atr, child.getAttribute(atr))
            m.src.setAttribute(atr, child.getAttribute(atr))
          } else {
            m.world.setAttribute(atr, _def)
            m.src.removeAttribute(atr)
          }
        }
        // this.save()
        break
    }
    while (this._history.length > len) this._history.pop()
  },

  _grab: function (e) {
    this.save()
    this._grabbed = true
    setTimeout(() => {
      this._selecting = false
      this._grabbed = []
      this._undoBtn = 0
      this._history = []
    }, 256)
  },

  _useDown: function (e) {
    if (e.detail.button) this._undoBtn++
    if (this._undoBtn > 1) {
      if (this._grabbed.length) this.save()
      this._selecting = false
      this._grabbed = []
    } else {
      this._selecting = this._grabbed.length === 0
    }
  },
  _useUp: function (e) {
    if (this._selecting) {
      for (let i = 0; i < this._grabbed.length; i++) {
        let grab = this._grabbed[i]
        let anch = this._anchors[i]
        if (anch && anch.copyWorldPosRot) {
          anch.copyWorldPosRot(grab)
        }
      }
    }
    if (this._undoBtn > 1) this.undo()
    if (this._undoBtn > 0) this._undoBtn--

    if (this._grabbed.length) {
      switch (e.detail.button) {
        case 1:
          for (let i = 0; i < this._grabbed.length; i++) {
            let grab = this._grabbed[i]
            let j = this.findEntity(grab)
            let html = grab.outerHTML
            if (j != null) {
              html = this._map[j].src.outerHTML
            } else {
              html = html.replace(/\ velocity\=\"\"/gi, "")
            }
            let e = this._map.length
            this.addEntity(html)
            let m = this._map[e]
            grab.emit("place")
            this._grabbed[i] = m.world
          }
          break
        case 2:
          let grab
          while ((grab = this._grabbed.pop())) {
            this.removeEntity(grab)
          }
          break
        default:
          if (!this._selecting) this._place()
      }
      clearTimeout(this._saveTO)
      this._saveTO = setTimeout(this.save, 1024)
    }
    this._selecting = false
    let ray = this.el.components.raycaster
    ray.refreshObjects()
  },

  _place: function () {
    let grab
    while ((grab = this._grabbed.pop())) {
      grab.emit("place")
    }
  },

  _snap: function (el) {
    let rot = THREE.Vector3.temp()
    el.object3D.position
      .divide(this.data.gridSize)
      .round()
      .multiply(this.data.gridSize)
    rot
      .copy(el.getAttribute("rotation"))
      .divide(this._angularSize)
      .round()
      .multiply(this._angularSize)
    el.setAttribute("rotation", AFRAME.utils.coordinates.stringify(rot))
  },

  _parseHTML: function (html) {
    this._div.innerHTML = html.trim()
    return document.importNode(this._div.content, true).firstChild
  }
})
