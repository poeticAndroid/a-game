/* global AFRAME, THREE */

AFRAME.registerComponent("include", {
  schema: { type: "string" },

  update: async function () {
    if (this.data && !this.el.sceneEl._including_) {
      this.el.sceneEl._including_ = true
      let response = await fetch(this.data)
      if (response.status >= 200 && response.status < 300) this.el.outerHTML = await (response).text()
      else this.el.removeAttribute("include")
      this.el.sceneEl._including_ = false
      let next = this.el.sceneEl.querySelector("[include]")
      if (next) next.components.include.update()
    }
  }
})
