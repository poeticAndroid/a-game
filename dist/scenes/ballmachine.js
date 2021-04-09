AFRAME.registerComponent("ball-spewer", {
  schema: { type: "string" },

  init: function () {
    setTimeout(() => {
      this.el.removeAttribute("ball-spewer")
      setTimeout(() => {
        this.el.setAttribute("ball-spewer", "")
      }, 1000 * 60 * 5)
    }, 16000)
  },

  tick: function () {
    let div = document.createElement("div")
    div.innerHTML = '<a-sphere body="type:dynamic;emitsWith:1;" position="0 8 -8" radius="0.25" deadvoid ></a-sphere>'
    let ball = div.firstElementChild
    ball.setAttribute("radius", Math.random() * 0.125 + 0.125)
    ball.setAttribute("position", "" + (0.5 - Math.random()) + " 8 " + (-7.5 - Math.random()))
    ball.addEventListener("collision", e => {
      if (e.detail.body2.tagName.toLowerCase() === "a-sphere") {
        if (e.detail.body2.getAttribute("color") && !ball.getAttribute("color")) {
          // ball.setAttribute("color", e.detail.body2.getAttribute("color"))
          ball.setAttribute("color", "hsl(" + (360 * Math.random()) + ", 50%, 75%)")
          ball.setAttribute("body", "emitsWith", 0)
        }
      }
      // else {
      //   ball.setAttribute("color", "hsl(" + (360 * Math.random()) + ", 50%, 50%)")
      //   ball.setAttribute("body", "emitsWith", 0)
      // }
    })
    let scene = this.el.sceneEl.querySelector(".world")
    scene.appendChild(ball)
  }
})
AFRAME.registerComponent("deadvoid", {
  schema: { type: "string" },

  tick: function () {
    if (this.el.object3D.position.y < -8)
      this.el.parentElement.removeChild(this.el)
  }
})
