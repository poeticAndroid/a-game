AFRAME.registerComponent("ball-spewer", {
  schema: { type: "string" },

  tick: function () {
    let div = document.createElement("div")
    div.innerHTML = '<a-sphere body="type:dynamic;" position="0 8 -8" radius="0.25"></a-sphere>'
    let ball = div.firstElementChild
    ball.setAttribute("position", "" + (0.5 - Math.random()) + " 8 " + (-7.5 - Math.random()))
    ball.setAttribute("color", "#" + ("0000" + (4096 * Math.random()).toString(16)).substr(-3))
    let scene = document.querySelector("#world")
    scene.appendChild(ball)
  }
})
