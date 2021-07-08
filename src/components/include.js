/* global AFRAME, THREE */

AFRAME.registerComponent("include", {
  schema: { type: "string" },

  async init() {
    if (this.data && !this.el.sceneEl._including_) {
      this.el.sceneEl._including_ = true
      let b4Content = this.el.outerHTML

      let p1 = b4Content.indexOf(" ")
      let p2 = b4Content.indexOf(" include=")
      let attrs = b4Content.substr(p1, p2 - p1)

      p1 = b4Content.indexOf("\"", p2 + 10) + 1
      p2 = b4Content.indexOf(">")
      attrs += b4Content.substr(p1, p2 - p1)

      let response = await fetch(this.data)
      if (response.status >= 200 && response.status < 300) {
        this.el.outerHTML = await (await (response).text()).replace(">", " >").replace(" ", " " + attrs + " ")
      }
      else {
        this.el.removeAttribute("include")
      }
      this.el.sceneEl._including_ = false
      let next = this.el.sceneEl.querySelector("[include]")
      if (next && next.components && next.components.include) next.components.include.init()
    }
  }
})
