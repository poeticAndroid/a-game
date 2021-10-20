/* global AFRAME, THREE */

let currentClimb

AFRAME.registerComponent("climbable", {
  dependencies: ["wall"],
  schema: {
  },

  init() {
    this.el.setAttribute("grabbable", "physics:false; kinematicGrab:false; immovable:true;")
    this._player = this.el.sceneEl.querySelector("[locomotion]")
    this._localAnchor = new THREE.Vector3()

    this._onBump = this._onBump.bind(this)
  },

  play() {
    this._player.addEventListener("bump", this._onBump)
  },
  pause() {
    this._player.removeEventListener("bump", this._onBump)
    this._climbing = false
  },

  tick() {
    if (!this._floating) return
    this._player.components.locomotion.stopFall()
    if (!this._climbing) return
    let worldAnchor = THREE.Vector3.temp().copy(this._localAnchor)
    let handPos = THREE.Vector3.temp().set(0, 0, 0)
    let delta = THREE.Vector3.temp()

    this.el.object3D.localToWorld(worldAnchor)
    this._hand.object3D.localToWorld(handPos)
    delta.copy(worldAnchor).sub(handPos).multiplyScalar(0.5)

    this._player.components.locomotion.move(delta)
  },

  events: {
    grab(e) {
      if (currentClimb && currentClimb !== this.el) this._player.components.grabbing.dropObject(currentClimb)
      currentClimb = this.el
      this._climbing = true
      this._floating = true
      this._handName = e.detail.hand
      this._hand = e.detail.gloveElement.parentNode
      this._localAnchor.copy(e.detail.intersection.point)
      this.el.object3D.worldToLocal(this._localAnchor)
      if (this._handName === "head") {
        this._hand = this._hand.querySelector(".anchor")
        this._hand.object3D.position.set(0, 0, -e.detail.intersection.distance)
      }
      this._player.components.locomotion.jump()
      setTimeout(() => {
        this.el.sceneEl.querySelector(".legs")?.object3D.position.copy(this._player.components.locomotion.headPos)
      })
      clearTimeout(this._autoCrouchTO)
    },
    drop(e) {
      this._climbing = false
      setTimeout(() => {
        this.el.sceneEl.querySelector(".legs")?.object3D.position.copy(this._player.components.locomotion.headPos)
      })
      clearTimeout(this._autoCrouchTO)
      this._autoCrouchTO = setTimeout(() => {
        this._floating = false
        this._player.components.locomotion.toggleCrouch(true)
      }, this._handName === "head" ? 1024 : 256)
      currentClimb = null
    },
  },

  _onBump(e) {
    this._climbing = false
    clearTimeout(this._autoCrouchTO)
    this._autoCrouchTO = setTimeout(() => {
      this._floating = false
    }, 1024)
    this._player.components.grabbing.dropObject(this.el)
  },
})
