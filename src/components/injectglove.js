/* global AFRAME, THREE */

AFRAME.registerComponent("injectglove", {
  init() {
    if (!this.el.innerHTML.trim()) this.defaultGlove()
    let hand = this.el.getAttribute("side") || this.el.parentNode.getAttribute("side")
    this.el.ensure(".palm", "a-entity", {
      class: "palm",
      position: `${hand === "left" ? -0.01 : 0.01} -0.03 0.08`,
      rotation: "-35 0 0"
    })
    this.el.ensure("a-hand[side=\"right\"]", "a-hand", { side: "right" })
  },

  defaultGlove() {
    let hand = this.el.getAttribute("side") || this.el.parentNode.getAttribute("side")
    let color = this.el.getAttribute("color") || this.el.parentNode.getAttribute("color") || "lightblue"
    if (!this.el.getAttribute("fingerflex")) this.el.setAttribute("fingerflex", {
      min: hand === "left" ? -10 : 10,
      max: hand === "left" ? -90 : 90,
    })
    this.el.innerHTML = `<a-box class="palm" color="${color}" position="${hand === "left" ? -0.01 : 0.01} -0.03 0.08" rotation="-35 0 0" width="0.02" height="0.08"
      depth="0.08">
      <a-entity position="0 0.04 0.02" rotation="80 0 ${hand === "left" ? -45 : 45}">
        <a-entity class="thumb bend">
          <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            <a-entity class="bend" position="0 0 -0.02">
              <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
              </a-box>
            </a-entity>
          </a-box>
        </a-entity>
      </a-entity>
      <a-entity class="index bend" position="0 0.03 -0.04" rotation="3 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
      <a-entity class="middle bend" position="0 0.01 -0.04" rotation="1 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
      <a-entity class="ring bend" position="0 -0.01 -0.04" rotation="-1 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
      <a-entity class="little bend" position="0 -0.03 -0.04" rotation="-3 0 0">
        <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="${color}" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
    </a-box>`
  },
})
