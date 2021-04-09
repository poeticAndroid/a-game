/* global AFRAME, THREE */

AFRAME.registerComponent("include", {
  schema: { type: "string" },

  init: async function () {
    if (this.data && !this.el.sceneEl._including_) {
      this.el.sceneEl._including_ = true
      let baseUrl = ""
      let baseEl = this.el
      while (baseEl && !baseEl.dataset["includeBase"]) baseEl = baseEl.parentElement
      if (baseEl) baseUrl = baseEl.dataset["includeBase"]
      let url = this.data
      if (url.substr(0, 1) !== "/" && url.substr(0, 4) !== "http") url = baseUrl + url
      if (url.indexOf("/") >= 0) this.el.dataset["includeBase"] = url.substr(0, url.lastIndexOf("/") + 1)

      let b4Content = this.el.outerHTML

      let p1 = b4Content.indexOf(" ")
      let p2 = b4Content.indexOf(" include=")
      let attrs = b4Content.substr(p1, p2 - p1)

      p1 = b4Content.indexOf("\"", p2 + 10) + 1
      p2 = b4Content.indexOf(">")
      attrs += b4Content.substr(p1, p2 - p1)

      let response = await fetch(url)
      if (response.status >= 200 && response.status < 300) this.el.outerHTML = await (await (response).text()).replace(">", " " + attrs + ">")
      else this.el.removeAttribute("include")
      this.el.sceneEl._including_ = false
      let next = this.el.sceneEl.querySelector("[include]")
      if (next && next.components && next.components.include) next.components.include.init()
    }
  }
})
