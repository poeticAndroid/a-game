/* global AFRAME, THREE */

AFRAME.registerComponent("script", {
  schema: {
    src: { type: "string" },
    call: { type: "string" },
    args: { type: "array" },
  },

  async update(oldData) {
    if (this.data.src !== oldData.src) {
      if (this.script) {
        if (this.el.isPlaying)
          this.script.pause?.()
        this.script.remove?.()
      }
      this.script = null

      let response = await fetch(this.data.src)
      if (response.status >= 200 && response.status < 300) {
        this.script = eval(await (await (response).text()))
        this.script.el = this.el
        if (this.script.events) {
          for (let event in this.script.events) {
            this.script.events[event] = this.script.events[event].bind(this.script)
          }
        }
      } else {
        console.error("Could not load", this.data.src)
      }
      this.script.init?.()
      if (this.el.isPlaying)
        this.script.play?.()
    }
    if (this.script && this.data.call?.trim()) {
      this.script[this.data.call.trim()](...this.data.args)
      this.el.setAttribute("script", "call", "")
    }
  },

  remove() {
    if (!this.script) return
    this.script.remove?.(...arguments)
  },
  tick() {
    if (!this.script) return
    this.script.tick?.(...arguments)
  },
  tock() {
    if (!this.script) return
    this.script.tock?.(...arguments)
  },
  play() {
    if (!this.script) return
    if (this.script.events) {
      for (let event in this.script.events) {
        this.el.addEventListener(event, this.script.events[event])
      }
    }
    this.script.play?.(...arguments)
  },
  pause() {
    if (!this.script) return
    if (this.script.events) {
      for (let event in this.script.events) {
        this.el.removeEventListener(event, this.script.events[event])
      }
    }
    this.script.pause?.(...arguments)
  },
})
