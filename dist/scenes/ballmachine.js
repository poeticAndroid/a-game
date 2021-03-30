AFRAME.registerComponent("ball-spewer", {
  schema: { type: "string" },

  init: function () {
    setTimeout(() => {
      this.el.removeAttribute("ball-spewer")
    }, 5000)
  },

  tick: function () {
    let div = document.createElement("div")
    div.innerHTML = '<a-sphere body="type:dynamic;emitsWith:2;" position="0 8 -8" radius="0.25"></a-sphere>'
    let ball = div.firstElementChild
    ball.setAttribute("position", "" + (0.5 - Math.random()) + " 8 " + (-7.5 - Math.random()))
    ball.addEventListener("collision", e => {
      if (e.detail.body2.tagName.toLowerCase() === "a-sphere") {
        if (e.detail.body2.getAttribute("color"))
          ball.setAttribute("color", e.detail.body2.getAttribute("color"))
      }
      else {
        ball.setAttribute("color", "#" + ("0000" + (4096 * Math.random()).toString(16)).substr(-3))
        ball.setAttribute("body", "emitsWith", 0)
      }
    })
    let scene = document.querySelector("#world")
    scene.appendChild(ball)
  }
})
