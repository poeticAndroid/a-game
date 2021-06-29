/* global AFRAME, THREE */

AFRAME.registerComponent("onevent", {
  multiple: true,
  schema: {
    event: { type: "string" },
    entity: { type: "selector" },
    property: { type: "string" },
    value: { type: "string" },
  },

  init() {
    this.trigger = this.trigger.bind(this)
  },

  update(oldData) {
    this.pause()
    this._event = this.data.event || this.id || ""
    this._entity = this.data.entity || this.el
    this._property = this.data.property || ""
    this._value = this.data.value || ""
    if (this.el.isPlaying)
      this.play()
  },

  play() {
    if (!this._event) return
    this.el.addEventListener(this._event, this.trigger)
  },

  pause() {
    if (!this._event) return
    this.el.removeEventListener(this._event, this.trigger)
  },

  trigger() {
    let args = this._property.split(".")
    args.push(this._value)
    this._entity.setAttribute(...args)
  }
})
