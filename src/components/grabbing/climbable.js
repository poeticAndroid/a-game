/* global AFRAME, THREE */

AFRAME.registerComponent("climbable", {
  dependencies: ["wall"],
  schema: {
  },

  init() {
    this.el.setAttribute("grabbable", "physics:false; kinematicGrab:false;")
    this._player = this.el.sceneEl.querySelector("[locomotion")
    this._quat = new THREE.Quaternion()
    this._lpos = new THREE.Vector3()
    this._wpos = new THREE.Vector3()
    this._handpos = new THREE.Vector3()

    this._onBump = this._onBump.bind(this)

    setTimeout(() => {
      this._quat.copy(this.el.object3D.quaternion)
      this._lpos.copy(this.el.object3D.position)
      this.el.object3D.getWorldPosition(this._wpos)
      this._top = parseFloat(this.el.getAttribute("height") || 1) / 2 + 2
    }, 256)
  },

  play() {
    this._player.addEventListener("bump", this._onBump)
  },
  pause() {
    this._player.removeEventListener("bump", this._onBump)
  },

  tick() {
    if (!this._climbing) return
    let delta = THREE.Vector3.temp()
    this._hand.object3D.getWorldPosition(delta)
    delta.sub(this._handpos).multiplyScalar(-1)
    if (this._handName === "head") {
      delta.y = 0
      delta.y = delta.length()
      this._handpos.y += delta.y
    }
    this._player.components.locomotion.stopFall()
    this._player.components.locomotion.move(delta)
    if (this._handpos.y - this._wpos.y > this._top) this._onBump()

    this.el.object3D.quaternion.copy(this._quat)
    this.el.object3D.position.copy(this._lpos)
  },

  events: {
    grab(e) {
      this._climbing = true
      this._handName = e.detail.hand
      this._hand = e.detail.gloveElement.parentNode//.querySelector(".anchor")
      this._hand.object3D.getWorldPosition(this._handpos)
      if (e.detail.intersection.distance > (this._handName === "head" ? 0.5 : 0.25)) setTimeout(this._onBump, 260)
      else this._player.components.locomotion.jump()
    },
    drop(e) {
      this._climbing = false
    },
  },

  _onBump(e) {
    this._player.components.grabbing.dropObject(this.el)
  }
})
