(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "name": "a-game",
  "title": "A-Game",
  "version": "0.34.0",
  "description": "game components for A-Frame",
  "homepage": "https://github.com/poeticAndroid/a-game/blob/master/README.md",
  "main": "index.js",
  "scripts": {
    "prepare": "npm run build",
    "clean": "rm dist/*.js || del dist\\*.js",
    "build": "npm run clean && foreach -g src/*.js -x \"browserify #{path} -o dist/#{name}.js\" && npm run minify",
    "watch": "npm run clean && foreach -g src/*.js -C -x \"watchify #{path} -d -o dist/#{name}.js\"",
    "minify": "foreach -g dist/*.js -C -x \"minify #{path} > dist/#{name}.min.js\"",
    "bump": "npm version minor --no-git-tag-version",
    "gitadd": "git add package*.json dist/*.js"
  },
  "pre-commit": [
    "bump",
    "build",
    "gitadd"
  ],
  "keywords": [
    "aframe",
    "aframe-component",
    "webvr",
    "webxr",
    "gamedev"
  ],
  "author": "poeticAndroid",
  "license": "MIT",
  "devDependencies": {
    "browserify": "^17.0.0",
    "foreach-cli": "^1.8.1",
    "minify": "^7.0.2",
    "pre-commit": "^1.2.2",
    "watchify": "^4.0.0"
  }
}

},{}],2:[function(require,module,exports){
require("./libs/pools")
require("./libs/copyWorldPosRot")
require("./libs/ensureElement")
require("./libs/touchGestures")
require("./libs/betterRaycaster")

setTimeout(() => {
  document.body.addEventListener("swipeup", e => {
    document.body.requestFullscreen()
  })
})

require("./components/grabbing")
require("./components/include")
require("./components/injectplayer")
require("./components/locomotion")
require("./components/onevent")
require("./components/onstate")
require("./components/physics")
require("./components/script")
require("./components/trigger")

require("./primitives/a-hand")
require("./primitives/a-main")
require("./primitives/a-player")

const pkg = require("../package")
console.log(`${pkg.title} Version ${pkg.version} by ${pkg.author}\n(${pkg.homepage})`)

},{"../package":1,"./components/grabbing":3,"./components/include":9,"./components/injectplayer":10,"./components/locomotion":11,"./components/onevent":15,"./components/onstate":16,"./components/physics":17,"./components/script":21,"./components/trigger":22,"./libs/betterRaycaster":23,"./libs/copyWorldPosRot":25,"./libs/ensureElement":26,"./libs/pools":27,"./libs/touchGestures":28,"./primitives/a-hand":29,"./primitives/a-main":30,"./primitives/a-player":31}],3:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("grabbing", {
  schema: {
    hideOnGrab: { type: "boolean", default: false },
    grabDistance: { type: "number", default: 1 }
  },

  init() {
    this._enableHands = this._enableHands.bind(this)
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onWheel = this._onWheel.bind(this)
    this._onButtonChanged = this._onButtonChanged.bind(this)
    this._onTouchTap = this._onTouchTap.bind(this)
    this._onTouchHold = this._onTouchHold.bind(this)

    this._btnPress = {}
    this._btnFlex = {}
    this._keysDown = {}
    this._grabCount = 0
    this._gamepadBtns = []

    this._hands = ["head", "left", "right"]
    this._head = {}
    this._left = {}
    this._right = {}
    this._head.hand = this.el.querySelector("a-camera")
    this._left.hand = this.el.querySelector("a-hand[side=\"left\"]")
    this._right.hand = this.el.querySelector("a-hand[side=\"right\"]")
    this._head.glove = this._head.hand.ensure(".hitbox", "a-sphere", { class: "hitbox", body: "type:kinematic;", radius: 0.25 })
    this._left.glove = this._ensureGlove(this._left.hand)
    this._right.glove = this._ensureGlove(this._right.hand)

    this._left.glove.setAttribute("visible", false)
    this._right.glove.setAttribute("visible", false)
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this[_hand].hand.addEventListener("buttonchanged", this._enableHands)
    }

    this._head.ray = this._head.hand.ensure(".grabbing-ray", "a-entity", {
      class: "grabbing-ray",
      raycaster: {
        objects: "[wall], [grabbable]",
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._head.buttonRay = this._head.hand.ensure(".button.ray", "a-entity", {
      class: "button ray",
      raycaster: {
        objects: "[wall], [button]",
        far: 1,
        autoRefresh: false,
        // showLine: true,
      }
    })
    this._head.reticle = this._head.ray.ensure(".reticle", "a-box", {
      class: "reticle",
      depth: 0,
      width: 0.5,
      height: 0.25,
      color: "black",
      position: "0 0 -1",
      scale: "0.125 0.125 0.125"
    }, `<a-text align="center" value="grab"></a-text>`)
    this._head.buttonReticle = this._head.buttonRay.ensure(".reticle", "a-box", {
      class: "reticle",
      depth: 0,
      width: 0.625,
      height: 0.25,
      color: "black",
      position: "0 0 -1",
      scale: "0.125 0.125 0.125"
    }, `<a-text align="center" value="press"></a-text>`)
    this._head.anchor = this._head.ray.ensure(".grabbing.anchor", "a-entity", { class: "grabbing anchor", visible: false, body: "type:kinematic;autoShape:false;" })
  },

  update(oldData) {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      if (this[_hand].ray)
        this[_hand].ray.setAttribute("raycaster", "far", this.data.grabDistance + (hand === "head" ? 1 : 0.1875))
    }
  },

  play() {
    document.addEventListener("keydown", this._onKeyDown)
    document.addEventListener("keyup", this._onKeyUp)
    this.el.sceneEl.canvas.addEventListener("mousedown", this._onMouseDown)
    this.el.sceneEl.canvas.addEventListener("mouseup", this._onMouseUp)
    this.el.sceneEl.canvas.addEventListener("wheel", this._onWheel)
    for (let hand of [this._left.hand, this._right.hand]) {
      // hand.addEventListener("buttonchanged", this._enableHands)
      hand.addEventListener("buttonchanged", this._onButtonChanged)
    }
    this.el.sceneEl.canvas.addEventListener("tap", this._onTouchTap)
    this.el.sceneEl.canvas.addEventListener("hold", this._onTouchHold)
  },

  pause() {
    document.removeEventListener("keydown", this._onKeyDown)
    document.removeEventListener("keyup", this._onKeyUp)
    this.el.sceneEl.canvas.removeEventListener("mousedown", this._onMouseDown)
    this.el.sceneEl.canvas.removeEventListener("mouseup", this._onMouseUp)
    this.el.sceneEl.canvas.removeEventListener("wheel", this._onWheel)
    for (let hand of [this._left.hand, this._right.hand]) {
      // hand.removeEventListener("buttonchanged", this._enableHands)
      hand.removeEventListener("buttonchanged", this._onButtonChanged)
    }
    this.el.sceneEl.canvas.removeEventListener("tap", this._onTouchTap)
    this.el.sceneEl.canvas.removeEventListener("hold", this._onTouchHold)
  },

  remove() {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this.drop(hand)
      this[_hand].glove.copyWorldPosRot(this[_hand].hand)
      let flex = 0.25
      for (let finger = 0; finger < 5; finger++) {
        this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
      }
    }
  },

  tick(time, timeDelta) {
    // handle gamepads
    for (let i = 0; i < 16; i++)
      this._gamepadBtns[i] = 0
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        for (let i = 0; i < 16; i++)
          this._gamepadBtns[i] += gamepad.buttons[i]?.pressed || 0
      }
    }

    if ((this._gamepadBtns[4] || this._gamepadBtns[5]) && !this._grabBtn) {
      this._setDevice("gamepad")
      console.log("grabbing!", this._gamepadBtns[4], this._gamepadBtns[5], this._grabBtn)
      this.grab()
    }
    if (this._grabBtn && !(this._gamepadBtns[4] || this._gamepadBtns[5])) {
      console.log("dropping!", this._gamepadBtns[4], this._gamepadBtns[5], this._grabBtn)
      this.drop()
    }
    if ((this._gamepadBtns[6] || this._gamepadBtns[7]) && !this._useBtn0) this.useDown()
    if ((this._gamepadBtns[0]) && !this._useBtn1) this.useDown("head", 1)
    if ((this._gamepadBtns[1]) && !this._useBtn2) this.useDown("head", 2)
    if (this._gamepadBtns[2]) {
      if (this._gamepadBtns[12]) this.moveHeadHand(0, -0.03125)
      if (this._gamepadBtns[13]) this.moveHeadHand(0, 0.03125)
      if (this._gamepadBtns[14]) this.moveHeadHand(0, 0, -0.03125)
      if (this._gamepadBtns[15]) this.moveHeadHand(0, 0, 0.03125)
    } else {
      if (this._gamepadBtns[12]) this.moveHeadHand(-0.03125)
      if (this._gamepadBtns[13]) this.moveHeadHand(0.03125)
      if (this._gamepadBtns[14]) this.moveHeadHand(0, 0, 0, 0.03125)
      if (this._gamepadBtns[15]) this.moveHeadHand(0, 0, 0, -0.03125)
    }
    this._grabBtn = false
    this._useBtn0 = false
    this._useBtn1 = false
    this._useBtn2 = false
    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        this._grabBtn = this._grabBtn || this._gamepadBtns[4] || this._gamepadBtns[5]
        this._useBtn0 = this._useBtn0 || this._gamepadBtns[6] || this._gamepadBtns[7]
        this._useBtn1 = this._useBtn1 || this._gamepadBtns[0]
        this._useBtn2 = this._useBtn2 || this._gamepadBtns[1]
      }
    }

    let headPos = THREE.Vector3.temp()
    let delta = THREE.Vector3.temp()
    let palmDelta = THREE.Vector3.temp()
    headPos.copy(this._head.hand.object3D.position)
    this._head.hand.object3D.parent.localToWorld(headPos)

    for (let hand of this._hands) {
      let _hand = "_" + hand

      // keep hands out of walls
      if (this[_hand]._occlusionRay) {
        let palm = this[_hand].glove.querySelector(".palm") || this[_hand].glove
        this[_hand].glove.copyWorldPosRot(this[_hand].hand)

        this[_hand]._occlusionRay.object3D.position.copy(headPos)
        palm.object3D.getWorldPosition(delta)
        this[_hand].glove.object3D.getWorldPosition(palmDelta)
        palmDelta.sub(delta)
        delta.sub(headPos)
        let handDist = delta.length()
        delta.normalize()
        this[_hand]._occlusionRay.setAttribute("raycaster", "direction", `${delta.x} ${delta.y} ${delta.z}`)
        this[_hand]._occlusionRay.setAttribute("raycaster", "far", handDist + 0.03125)

        let ray = this[_hand]._occlusionRay.components.raycaster
        ray.refreshObjects()
        let hit = ray.intersections[0]
        if (hit) {
          // this[_hand].glove.object3D.position.copy(hit.point)
          let dist = delta.copy(hit.point).sub(headPos).length()
          this[_hand].glove.object3D.position.copy(headPos).add(palmDelta).add(delta.normalize().multiplyScalar(dist - 0.03125))
          this[_hand].glove.object3D.parent.worldToLocal(this[_hand].glove.object3D.position)
        }
      }

      // handle grabbables
      if (this[_hand].grabbed) {
        let ray = this[_hand].ray.components.raycaster
        ray.refreshObjects()
        if (!this[_hand].grabbed.components.grabbable?.data.immovable) {
          for (let hit of ray.intersections) {
            if (hit && hit.el.getAttribute("wall") != null && hit.distance < -this[_hand].anchor.object3D.position.z) {
              this[_hand].anchor.object3D.position.multiplyScalar(0.5)
            }
          }
          this[_hand].grabbed.copyWorldPosRot(this[_hand].anchor)
        }
        if (this[_hand].reticle) this[_hand].reticle.object3D.position.z = 1
      } else {
        if (this[_hand].ray) {
          let ray = this[_hand].ray.components.raycaster
          ray.refreshObjects()
          let hit = ray.intersections[0]
          if (hit && hit.el.getAttribute("grabbable") != null) {
            if (this[_hand]._lastHit !== hit.el) {
              if (this[_hand]._lastHit)
                this.emit("unreachable", this[_hand].glove, this[_hand]._lastHit)
              this[_hand]._lastHit = hit.el
              this.emit("reachable", this[_hand].glove, this[_hand]._lastHit)
              this._flexFinger(hand, 5, -0.125, true)
              this._flexFinger(hand, 0, 0, true)
            }
            if (this[_hand].reticle) this[_hand].reticle.object3D.position.z = -hit.distance / 2
          } else {
            if (this[_hand]._lastHit) {
              this.emit("unreachable", this[_hand].glove, this[_hand]._lastHit)
              this._restoreUserFlex(hand)
            }
            this[_hand]._lastHit = null
            if (this[_hand].reticle) this[_hand].reticle.object3D.position.z = 1
          }
        }

        // handle buttons
        if (this[_hand].buttonRay) {
          let ray = this[_hand].buttonRay.components.raycaster
          ray.refreshObjects()
          let hit = ray.intersections[0]
          if (hit && hit.el.getAttribute("button") != null) {
            if (this[_hand]._lastButton !== hit.el) {
              if (this[_hand]._lastButton)
                this.emit("unhover", this[_hand].glove, this[_hand]._lastButton)
              this[_hand]._lastButton = hit.el
              this.emit("hover", this[_hand].glove, this[_hand]._lastButton)
              this._flexFinger(hand, 7, 1, true)
              this._flexFinger(hand, 1, -0.125, true)
            }
            if (hit.distance < 0.125) {
              if (this[_hand]._lastPress !== hit.el) {
                if (this[_hand]._lastPress) {
                  this.emit("unpress", this[_hand].glove, this[_hand]._lastPress)
                  this[_hand]._lastPress.removeState("pressed")
                }
                this[_hand]._lastPress = hit.el
                this.emit("press", this[_hand].glove, this[_hand]._lastPress)
                this[_hand]._lastPress.addState("pressed")
              }
            } else {
              if (this[_hand]._lastPress) {
                this.emit("unpress", this[_hand].glove, this[_hand]._lastPress)
                this[_hand]._lastPress.removeState("pressed")
              }
              this[_hand]._lastPress = null
            }
            if (this[_hand].buttonReticle) this[_hand].buttonReticle.object3D.position.z = -hit.distance / 2
          } else {
            if (this[_hand]._lastPress) {
              this.emit("unpress", this[_hand].glove, this[_hand]._lastPress)
              this[_hand]._lastPress.removeState("pressed")
            }
            this[_hand]._lastPress = null
            if (this[_hand]._lastButton) {
              this.emit("unhover", this[_hand].glove, this[_hand]._lastButton)
              this._restoreUserFlex(hand)
            }
            this[_hand]._lastButton = null
            if (this[_hand].buttonReticle) this[_hand].buttonReticle.object3D.position.z = 1
          }
        }
      }

      // Track velocity
      this[_hand].lastGlovePos = this[_hand].lastGlovePos || new THREE.Vector3()
      this[_hand].lastGrabbedPos = this[_hand].lastGrabbedPos || new THREE.Vector3()
      this[_hand].gloveVelocity = this[_hand].gloveVelocity || new THREE.Vector3()
      this[_hand].grabbedVelocity = this[_hand].grabbedVelocity || new THREE.Vector3()
      let pos = THREE.Vector3.temp()
      if (this[_hand].glove) {
        this[_hand].glove.object3D.localToWorld(pos.set(0, 0, 0))
        this[_hand].gloveVelocity.copy(pos).sub(this[_hand].lastGlovePos).multiplyScalar(500 / timeDelta)
        this[_hand].lastGlovePos.copy(pos)
      }
      if (this[_hand].grabbed) {
        this[_hand].grabbed.object3D.localToWorld(pos.set(0, 0, 0))
        this[_hand].grabbedVelocity.copy(pos).sub(this[_hand].lastGrabbedPos).multiplyScalar(500 / timeDelta)
        this[_hand].lastGrabbedPos.copy(pos)
      }
      if (hand === "head") this[_hand].gloveVelocity.copy(this[_hand].grabbedVelocity)
    }
  },

  toggleGrab(hand = "head") {
    let _hand = "_" + hand
    if (this[_hand].grabbed) this.drop(hand)
    else this.grab(hand)
  },
  grab(hand = "head") {
    let _hand = "_" + hand
    if (!this[_hand].ray) return
    if (this[_hand].grabbed) return
    let ray = this[_hand].ray.components.raycaster
    ray.refreshObjects()
    let hit = ray.intersections[0]
    if (hit && hit.el.getAttribute("grabbable") != null) {
      if (hand === "head") this[_hand].ray.setAttribute("animation__pos", {
        property: "position",
        to: { x: 0, y: -0.125, z: 0 },
        dur: 256
      })
      this.dropObject(hit.el)
      this[_hand].grabbed = hit.el
      this[_hand].anchor.copyWorldPosRot(this[_hand].grabbed)
      this[_hand].anchor.components.body.commit()
      if (this[_hand].grabbed.components.body != null) {
        if (!this[_hand].grabbed.components.grabbable?.data.immovable)
          this[_hand].anchor.setAttribute("joint__grab", { body2: this[_hand].grabbed, type: "lock" })
        this[_hand].isPhysical = true
      } else {
        this[_hand].isPhysical = false
      }
      this[_hand].anchor.removeAttribute("animation__pos")
      this[_hand].anchor.removeAttribute("animation__rot")
      let delta = hit.distance
      if (hand === "head") delta -= 0.5
      else delta -= 0.09375
      if (this[_hand].grabbed.components.grabbable.data.fixed) {
        let pos = THREE.Vector3.temp().copy(this[_hand].grabbed.components.grabbable.data.fixedPosition)
        if (hand === "left") pos.x *= -1
        if (hand === "head") pos.x = 0
        let quat = THREE.Quaternion.temp().copy(this[_hand].ray.object3D.quaternion).conjugate()
        pos.applyQuaternion(quat)
        pos.z += -0.09375
        this[_hand].anchor.setAttribute("animation__pos", {
          property: "position",
          to: { x: pos.x, y: pos.y, z: pos.z },
          dur: 256
        })
        let rot = { x: 0, y: 0, z: 0 }
        if (hand === "left") rot.y = 45
        if (hand === "right") rot.y = -45
        this[_hand].anchor.setAttribute("animation__rot", {
          property: "rotation",
          to: rot,
          dur: 256
        })
      } else if (!this[_hand].grabbed.components.grabbable?.data.immovable) {
        this[_hand].anchor.setAttribute("animation__pos", {
          property: "object3D.position.z",
          to: this[_hand].anchor.object3D.position.z + delta,
          dur: 256
        })
      }
      if (this.data.hideOnGrab || this[_hand].grabbed.components.grabbable.data.hideOnGrab)
        this[_hand].glove.setAttribute("visible", false)
      // if (this[_hand].glove.getAttribute("body"))
      this[_hand].glove.setAttribute("body", "collidesWith", 0)
      this.emit("grab", this[_hand].glove, this[_hand].grabbed, { intersection: hit })
      this._grabCount = Math.min(2, this._grabCount + 1)
      this.el.addState("grabbing")
      this[_hand].grabbed.addState("grabbed")
      this.sticky = true
      this._flexFinger(hand, 5, 0, true)
      setTimeout(() => {
        let flexes = this[_hand].grabbed.components.grabbable.data.fingerFlex.map(x => parseFloat(x)) || [0.5]
        this._flexFinger(hand, 5, flexes.pop() || 0, true)
        let finger = 0
        for (let flex of flexes) this._flexFinger(hand, finger++, flex || 0, true)
        this.sticky = false
      }, 256)
    }
  },
  drop(hand = "head") {
    let _hand = "_" + hand
    if (this.sticky) return
    this[_hand].anchor.removeAttribute("animation__rot")
    this[_hand].anchor.removeAttribute("animation__pos")
    this[_hand].glove.setAttribute("visible", true)
    this[_hand].anchor.removeAttribute("joint__grab")
    this[_hand].anchor.setAttribute("position", "0 0 0")
    this[_hand].anchor.setAttribute("rotation", "0 0 0")
    setTimeout(() => {
      // if (this[_hand].glove.getAttribute("body"))
      this[_hand].glove.setAttribute("body", "collidesWith", 1)
    }, 1024)
    if (this[_hand].grabbed) {
      this.emit("drop", this[_hand].glove, this[_hand].grabbed)
      this._grabCount = Math.max(0, this._grabCount - 1)
      if (!this._grabCount)
        this.el.removeState("grabbing")
      this._restoreUserFlex(hand)
      this[_hand].grabbed.removeState("grabbed")
      if (this[_hand].grabbed.components.grabbable?.data.kinematicGrab && !this[_hand].grabbed.components.grabbable?.data.immovable) {
        this[_hand].grabbed.components.body?.applyWorldImpulse(this[_hand].gloveVelocity, this[_hand].lastGlovePos)
        this[_hand].grabbed.components.body?.applyWorldImpulse(this[_hand].grabbedVelocity, this[_hand].lastGrabbedPos)
      }
      this[_hand].grabbed = null
      if (hand === "head") {
        this[_hand].ray.removeAttribute("animation__pos")
        this[_hand].ray.object3D.position.y = 0
      }
    }
  },
  dropObject(el) {
    for (let hand of this._hands) {
      let _hand = "_" + hand
      if (this[_hand].grabbed === el) this.drop(hand)
    }
  },
  use(hand = "head", button = 0) {
    let _hand = "_" + hand
    this.useDown(hand, button)
    setTimeout(() => {
      this.useUp(hand, button)
    }, 32)
  },
  useDown(hand = "head", button = 0) {
    let _hand = "_" + hand
    // if (!this[_hand].grabbed) return this.grab(hand)
    if (this[_hand].grabbed) {
      this._flexFinger(hand, Math.max(0, 1 - button), 0.5, true)
      this.emit("usedown", this[_hand].glove, this[_hand].grabbed, { button: button })
    } else if (this[_hand]._lastButton) {
      this._flexFinger(hand, 0, 0.5, true)
      this[_hand]._lastClick = this[_hand]._lastButton
      this.emit("press", this[_hand].glove, this[_hand]._lastClick, { button: button })
      this[_hand]._lastClick.addState("pressed")
    }
  },
  useUp(hand = "head", button = 0) {
    let _hand = "_" + hand
    if (this[_hand].grabbed) {
      this._flexFinger(hand, Math.max(0, 1 - button), 0, true)
      this.emit("useup", this[_hand].glove, this[_hand].grabbed, { button: button })
    } else if (this[_hand]._lastClick) {
      this._flexFinger(hand, 0, 0, true)
      this.emit("unpress", this[_hand].glove, this[_hand]._lastClick)
      this[_hand]._lastClick.removeState("pressed")
      this[_hand]._lastClick = null
    }
  },
  moveHeadHand(pz = 0, rx = 0, ry = 0, rz = 0) {
    this._head.anchor.object3D.position.z = Math.min(Math.max(-1.5, this._head.anchor.object3D.position.z + pz), -0.125)
    let quat = THREE.Quaternion.temp().set(rx, ry, rz, 1).normalize()
    this._head.anchor.object3D.quaternion.premultiply(quat)
  },

  emit(eventtype, glove, grabbed, e = {}) {
    e.grabbing = this.el
    e.grabbedElement = grabbed
    e.gloveElement = glove
    for (let _hand of this._hands) {
      if (this["_" + _hand].glove === glove) e.hand = _hand
    }
    glove.emit(eventtype, e)
    if (grabbed) grabbed.emit(eventtype, e)
  },

  events: {
    stateadded(e) {
      if (this.el.is("desktop")) {
        this._setReticleText(this._head.reticle, "[E]")
        this._setReticleText(this._head.buttonReticle, "Click")
      }
      if (this.el.is("touch")) {
        this._setReticleText(this._head.reticle, "hold")
        this._setReticleText(this._head.buttonReticle, "tap")
      }
      if (this.el.is("gamepad")) {
        this._setReticleText(this._head.reticle, "[RB]")
        this._setReticleText(this._head.buttonReticle, "(A)")
      }
    }
  },

  _setReticleText(reticle, text) {
    reticle.setAttribute("width", text.length * 0.125)
    let txt = reticle.querySelector("a-text")
    txt.setAttribute("value", text)
  },

  _enableHands() {
    this._setDevice("vrcontroller")
    for (let hand of this._hands) {
      let _hand = "_" + hand
      this[_hand].hand.removeEventListener("buttonchanged", this._enableHands)

      let boxsize = 0.0625
      this[_hand].glove.ensure(".hitbox", "a-box", { class: "hitbox", visible: false, position: "0 0 0.03125", width: boxsize / 2, height: boxsize, depth: boxsize * 2 })
      this[_hand].glove.setAttribute("body", "type:kinematic;")

      if (hand === "head") continue
      this[_hand]._occlusionRay = this.el.sceneEl.ensure(".occlusion-ray." + hand, "a-entity", {
        class: "occlusion-ray " + hand,
        raycaster: {
          objects: "[wall]",
          autoRefresh: false
        }
      })

      let palm = this[_hand].glove.querySelector(".palm") || this[_hand].glove
      this[_hand].ray = palm.ensure(".grabbing.ray", "a-entity", {
        class: "grabbing ray", position: hand === "left" ? "-0.0625 0 0.0625" : "0.0625 0 0.0625", rotation: hand === "left" ? "0 -45 0" : "0 45 0",
        raycaster: {
          objects: "[wall], [grabbable]",
          autoRefresh: false,
          // showLine: true,
        }
      })
      this[_hand].buttonRay = palm.ensure(".button.ray", "a-entity", {
        class: "button ray", position: "0 0.03125 0",
        raycaster: {
          objects: "[wall], [button]",
          far: 0.5,
          autoRefresh: false,
          // showLine: true,
        }
      })
      this[_hand].anchor = this[_hand].ray.ensure(".grabbing.anchor", "a-entity", { class: "grabbing anchor", visible: "false", body: "type:kinematic;autoShape:false;" })
      this[_hand].glove.setAttribute("visible", true)
    }

    this._head.ray = null
    this._head.buttonRay = null
    this.update()
  },

  _ensureGlove(el) {
    let hand = el.getAttribute("side")
    let color = el.getAttribute("color") || "lightblue"
    return el.ensure(".glove", "a-entity", {
      "class": "glove",
      "fingerflex": {
        min: hand === "left" ? -10 : 10,
        max: hand === "left" ? -90 : 90,
      }
    }, `<a-box class="palm" color="${color}" position="${hand === "left" ? -0.01 : 0.01} -0.03 0.08" rotation="-35 0 0" width="0.02" height="0.08"
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
    </a-box>`)
  },
  _flexFinger(hand, finger, flex, priority = false) {
    let _hand = "_" + hand
    this[_hand].userFlex = this[_hand].userFlex || []
    if (priority) this[_hand].priorityFlex = true
    if (finger < 5) {
      if (priority || !this[_hand].priorityFlex) this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
      if (!priority) this[_hand].userFlex[finger] = flex
    } else {
      for (finger -= 5; finger < 5; finger++) {
        if (priority || !this[_hand].priorityFlex) this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
        if (!priority) this[_hand].userFlex[finger] = flex
      }
    }
  },
  _restoreUserFlex(hand) {
    let _hand = "_" + hand
    this[_hand].userFlex = this[_hand].userFlex || []
    this[_hand].priorityFlex = false
    for (let finger = 0; finger < 5; finger++) {
      let flex = this[_hand].userFlex[finger] || 0
      this.emit("fingerflex", this[_hand].glove, this[_hand].grabbed, { hand: hand, finger: finger, flex: flex })
    }
  },

  _onKeyDown(e) {
    if (e.code === "KeyE" && !this._keysDown[e.code]) {
      this._setDevice("desktop")
      this.grab()
    }
    this._keysDown[e.code] = true
  },
  _onKeyUp(e) {
    if (e.code === "KeyE" && this._keysDown[e.code]) {
      this.drop()
    }
    this._keysDown[e.code] = false
  },
  _onMouseDown(e) {
    this._setDevice("desktop")
    let btn = e.button
    this.useDown("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _onWheel(e) {
    this._setDevice("desktop")
    let x = 0, y = 0, z = 0
    if (this._keysDown["Digit3"] && e.deltaY > 0) z += -0.125
    if (this._keysDown["Digit3"] && e.deltaY < 0) z += 0.125
    if (this._keysDown["Digit2"] && e.deltaY > 0) y += -0.125
    if (this._keysDown["Digit2"] && e.deltaY < 0) y += 0.125
    if (this._keysDown["Digit1"] && e.deltaY > 0) x += 0.125
    if (this._keysDown["Digit1"] && e.deltaY < 0) x += -0.125
    if (x || y || z) return this.moveHeadHand(0, x, y, z)
    if (e.deltaY > 0) return this.moveHeadHand(0.125)
    if (e.deltaY < 0) return this.moveHeadHand(-0.125)
  },
  _onMouseUp(e) {
    let btn = e.button
    this.useUp("head", btn ? ((btn % 2) ? btn + 1 : btn - 1) : btn)
  },
  _onTouchTap(e) {
    this._setDevice("touch")
    this.use()
  },
  _onTouchHold(e) {
    this._setDevice("touch")
    this.toggleGrab()
  },
  _onButtonChanged(e) {
    this._setDevice("vrcontroller")
    let hand = e.srcElement.getAttribute("tracked-controls").hand
    let _hand = "_" + hand
    let finger = -1
    let flex = 0
    if (e.detail.state.touched) flex = 0.5
    if (e.detail.state.pressed) flex = 1
    if (e.detail.state.value) flex = 0.5 + e.detail.state.value / 2
    this._btnFlex[hand + e.detail.id] = flex
    switch (e.detail.id) {
      case 0: // Trigger
        finger = 1
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.useDown(hand)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.useUp(hand)
        break
      case 1: // Grip
        if (flex <= 0 || flex >= 1) {
          finger = 7
          this._fist = flex > 0.5
        } else {
          this._flexFinger(hand, 2, this._fist ? 0 : 1)
          finger = 3
        }
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.grab(hand)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.drop(hand)
        break
      case 3: // Thumbstick
        finger = 0
        flex = Math.max(this._btnFlex[hand + 3] || 0, this._btnFlex[hand + 4] || 0, this._btnFlex[hand + 5] || 0)
        break
      case 4: // A/X
        finger = 0
        flex = Math.max(this._btnFlex[hand + 3] || 0, this._btnFlex[hand + 4] || 0, this._btnFlex[hand + 5] || 0)
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.useDown(hand, 1)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.useUp(hand, 1)
        break
      case 5: // B/Y
        finger = 0
        flex = Math.max(this._btnFlex[hand + 3] || 0, this._btnFlex[hand + 4] || 0, this._btnFlex[hand + 5] || 0)
        if (e.detail.state.pressed && !this._btnPress[hand + e.detail.id]) this.useDown(hand, 2)
        if (!e.detail.state.pressed && this._btnPress[hand + e.detail.id]) this.useUp(hand, 2)
        break
    }
    this._btnPress[hand + e.detail.id] = e.detail.state.pressed
    this._flexFinger(hand, finger, flex)
  },

  _setDevice(device) {
    if (this.device === device) return
    this.el.removeState(this.device || "noinput")
    this.device = device
    this.el.addState(this.device || "noinput")
  }
})

require("./grabbing/button")
require("./grabbing/climbable")
require("./grabbing/fingerflex")
require("./grabbing/grabbable")
require("./grabbing/receptacle")

},{"./grabbing/button":4,"./grabbing/climbable":5,"./grabbing/fingerflex":6,"./grabbing/grabbable":7,"./grabbing/receptacle":8}],4:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("button", {
  schema: {
  },

})

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("fingerflex", {
  schema: {
    min: { type: "number", default: 10 },
    max: { type: "number", default: 90 },
  },

  init() {
    this._fingers = ["thumb", "index", "middle", "ring", "little"]
    this._currentFlex = [0, 0, 0, 0, 0]
    this._targetFlex = [0, 0, 0, 0, 0]
  },

  tick(time, timeDelta) {
    for (let finger = 0; finger < 5; finger++) {
      let name = this._fingers[finger]
      let current = this._currentFlex[finger]
      let target = this._targetFlex[finger]

      current = current + Math.random() * Math.random() * (target - current)
      let degrees = this.data.min + current * (this.data.max - this.data.min)
      let bend = this.el.querySelector(".bend." + name)
      while (bend) {
        let rot = bend.getAttribute("rotation")
        rot.y = degrees
        bend.setAttribute("rotation", rot)
        bend = bend.querySelector(".bend")
      }

      this._currentFlex[finger] = current
    }
  },

  events: {
    fingerflex(e) {
      this._targetFlex[e.detail.finger] = e.detail.flex
    }
  }
})

},{}],7:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("grabbable", {
  schema: {
    physics: { type: "boolean", default: true },
    kinematicGrab: { type: "boolean", default: true },
    hideOnGrab: { type: "boolean", default: false },
    fixed: { type: "boolean", default: false },
    fixedPosition: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    fingerFlex: { type: "array", default: [0.5] },
    immovable: { type: "boolean", default: false },
  },

  init() {
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:dynamic;")
  },

  events: {
    grab() {
      if (this.data.kinematicGrab) this.el.setAttribute("body", "type", "kinematic")
    },
    drop() {
      if (this.data.physics) this.el.setAttribute("body", "type", "dynamic")
    },
  }
})

},{}],8:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("receptacle", {
  schema: {
    objects: { type: "string", default: "[grabbable]" },
    radius: { type: "number", default: 0.125 },
    onlyGrabbed: { type: "boolean", default: false },
    autoDrop: { type: "boolean", default: false },
  },

  init() {
    this._anchor = this.el.ensure(".receptacle.anchor", "a-entity", {
      class: "receptacle anchor",
      body: "type:kinematic;autoShape:false;"
    })
    this._refreshTO = setInterval(this.refreshObjects.bind(this), 1024)
  },

  remove() {
    clearInterval(this._refreshTO)
  },

  tick() {
    if (!this.nearest) return this.refreshObjects()
    let thisPos = THREE.Vector3.temp()
    let delta = THREE.Vector3.temp()
    this.el.object3D.localToWorld(thisPos.set(0, 0, 0))
    this.nearest.object3D.localToWorld(delta.set(0, 0, 0))
    delta.sub(thisPos)
    if (this._lastNearest && this._lastNearest !== this.nearest) {
      if (this.el.is("occupied")) {
        this._anchor.removeAttribute("joint__put")
        this._anchor.removeAttribute("animation__pos")
        this._anchor.removeAttribute("animation__rot")
        this.el.removeState("occupied")
        this._lastNearest.removeState("put")
        this.el.emit("take", {
          grabbable: this._lastNearest
        })
        this._lastNearest.emit("take", {
          receptacle: this.el
        })
      }
      if (this._hover) {
        this.el.emit("unhover", {
          grabbable: this._lastNearest
        })
        this._lastNearest.emit("unhover", {
          receptacle: this.el
        })
      }
      this._hover = false
      this._grabbed = false
    } else if (delta.length() > this.data.radius) {
      if (this.el.is("occupied")) {
        this._anchor.removeAttribute("joint__put")
        this._anchor.removeAttribute("animation__pos")
        this._anchor.removeAttribute("animation__rot")
        this.el.removeState("occupied")
        this.nearest.removeState("put")
        this.el.emit("take", {
          grabbable: this.nearest
        })
        this.nearest.emit("take", {
          receptacle: this.el
        })
      }
      if (this._hover) {
        this.el.emit("unhover", {
          grabbable: this.nearest
        })
        this.nearest.emit("unhover", {
          receptacle: this.el
        })
      }
      this._hover = false
      this._grabbed = false
    } else if (this.nearest.is("grabbed") || !this._hover) {
      if (!this._hover) {
        this.el.emit("hover", {
          grabbable: this.nearest
        })
        this.nearest.emit("hover", {
          receptacle: this.el
        })
        if (this.data.autoDrop && this._grabber) this._grabber.dropObject(this.nearest)
      }
      this._anchor.removeAttribute("animation__pos")
      this._anchor.removeAttribute("animation__rot")
      this._anchor.copyWorldPosRot(this.nearest)
      this._hover = true
      if (this.nearest.is("grabbed"))
        this._grabbed = true
    } else if (this._grabbed || !this.data.onlyGrabbed) {
      if (!this.el.is("occupied")) {
        this._anchor.copyWorldPosRot(this.nearest)
        this._anchor.components.body.commit()
        if (this.nearest.components.body)
          this._anchor.setAttribute("joint__put", { body2: this.nearest, type: "lock" })
        this.el.addState("occupied")
        this.nearest.addState("put")
        this.el.emit("put", {
          grabbable: this.nearest
        })
        this.nearest.emit("put", {
          receptacle: this.el
        })
      }
      if (!this._anchor.getAttribute("animation__pos")) {
        this._anchor.setAttribute("animation__pos", {
          property: "position",
          to: { x: 0, y: 0, z: 0 },
          dur: 256
        })
        this._anchor.setAttribute("animation__rot", {
          property: "rotation",
          to: { x: 0, y: 0, z: 0 },
          dur: 256
        })
      }
      this.nearest.copyWorldPosRot(this._anchor)
      this._hover = true
    }
    this._lastNearest = this.nearest
  },

  refreshObjects() {
    let shortest = Infinity
    let thisPos = THREE.Vector3.temp()
    let thatPos = THREE.Vector3.temp()
    let delta = THREE.Vector3.temp()
    let els = this.el.sceneEl.querySelectorAll(this.data.objects)
    this.nearest = null
    if (!els) return
    this.el.object3D.localToWorld(thisPos.set(0, 0, 0))
    els.forEach(el => {
      el.object3D.localToWorld(thatPos.set(0, 0, 0))
      delta.copy(thatPos).sub(thisPos)
      if (shortest > delta.length()) {
        shortest = delta.length()
        this.nearest = el
      }
    })

    this._grabber = this.el.sceneEl.querySelector("[grabbing]")?.components.grabbing
  },


})

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("injectplayer", {

  init() {
    this.el.addState("noinput")
    this.el.ensure("a-camera", "a-camera", {
      "look-controls": { pointerLockEnabled: true, touchEnabled: false },
      "wasd-controls": { enabled: false }
    })
    this.el.ensure("a-hand[side=\"left\"]", "a-hand", { side: "left" })
    this.el.ensure("a-hand[side=\"right\"]", "a-hand", { side: "right" })
  }
})

},{}],11:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("locomotion", {
  dependencies: ["position", "injectplayer"],
  schema: {
    speed: { type: "number", default: 4 },
    stepLength: { type: "number", default: 1 },
    rotationSpeed: { type: "number", default: 1 },
    teleportDistance: { type: "number", default: 5 },
    jumpForce: { type: "number", default: 4 },
    gravity: { type: "number", default: 10 },
    godMode: { type: "boolean", default: false }
  },

  init() {
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onAxisMove = this._onAxisMove.bind(this)
    this._onButtonChanged = this._onButtonChanged.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)
    this._onEnterVR = this._onEnterVR.bind(this)
    this._onExitVR = this._onExitVR.bind(this)

    this._keysDown = {}
    this._kbStick = new THREE.Vector2()
    this._axes = [0, 0, 0, 0]
    this._leftTouchCenter = new THREE.Vector2()
    this._leftTouchDir = new THREE.Vector2()
    this._rightTouchCenter = new THREE.Vector2()
    this._rightTouchDir = new THREE.Vector2()
    this._teleporting = true
    this._bumpOverload = 0
    this._vertVelocity = 1
    this.currentFloorPosition = new THREE.Vector3()
    this.centerPos = new THREE.Vector3()
    this.headPos = new THREE.Vector3()
    this.headDir = new THREE.Vector3()
    this.feetPos = new THREE.Vector3()
    this.lastStep = new THREE.Vector3()

    this._config = {
      quantizeMovement: false,
      quantizeRotation: false,
      quantizeMovementVR: !!(this.el.sceneEl.isMobile),
      quantizeRotationVR: true
    }
    if (this.el.sceneEl.is('vr-mode')) this._onEnterVR()
    else this._onExitVR()

    this._camera = this.el.querySelector("a-camera")
    this._leftHand = this.el.querySelector("a-hand[side=\"left\"]")
    this._rightHand = this.el.querySelector("a-hand[side=\"right\"]")
    this._legs = this.el.sceneEl.ensure(".legs", "a-entity", {
      class: "legs", position: "0 0.5 0", // radius: 0.125, color: "blue",
      raycaster: {
        autoRefresh: false,
        objects: "[floor]",
        direction: "0 -1 0",
        far: 0.625,
        // showLine: true
      }
    })
    this._legBumper = this.el.sceneEl.ensure(".leg-bumper", "a-entity", {
      class: "leg-bumper", position: "0 0.5 0", // radius: 0.125, color: "red",
      raycaster: {
        autoRefresh: false,
        objects: "[wall]",
        // showLine: true
      }
    })
    this._headBumper = this.el.sceneEl.ensure(".head-bumper", "a-entity", {
      class: "head-bumper", position: "0 0.5 0", // radius: 0.125, color: "green",
      raycaster: {
        autoRefresh: false,
        objects: "[wall]",
        // showLine: true
      }
    })
    this._teleportBeam = this._camera.ensure(".teleport-ray", "a-entity", {
      class: "teleport-ray",
      raycaster: {
        autoRefresh: false,
        objects: "[wall]",
        // showLine: true
      }
    })
    this._teleportCursor = this.el.ensure(".teleport-cursor", "a-cylinder", {
      class: "teleport-cursor", radius: 0.5, height: 0.0625, material: "opacity:0.5;"
    })
    this._teleportCursor.setAttribute("visible", false)
  },

  update(oldData) {
    // if (this.data.jumpForce) this.data.teleportDistance = 0
    this._godMode = this.data.godMode
  },

  play() {
    document.addEventListener("keydown", this._onKeyDown)
    document.addEventListener("keyup", this._onKeyUp)
    this._leftHand.addEventListener("axismove", this._onAxisMove)
    this._rightHand.addEventListener("axismove", this._onAxisMove)
    this._leftHand.addEventListener("buttonchanged", this._onButtonChanged)
    this._rightHand.addEventListener("buttonchanged", this._onButtonChanged)
    this.el.sceneEl.canvas.addEventListener("touchstart", this._onTouchStart)
    this.el.sceneEl.canvas.addEventListener("touchmove", this._onTouchMove)
    this.el.sceneEl.canvas.addEventListener("touchend", this._onTouchEnd)
    this.el.sceneEl.addEventListener("enter-vr", this._onEnterVR)
    this.el.sceneEl.addEventListener("exit-vr", this._onExitVR)
  },

  pause() {
    document.removeEventListener("keydown", this._onKeyDown)
    document.removeEventListener("keyup", this._onKeyUp)
    this._leftHand.removeEventListener("axismove", this._onAxisMove)
    this._rightHand.removeEventListener("axismove", this._onAxisMove)
    this._leftHand.removeEventListener("buttonchanged", this._onButtonChanged)
    this._rightHand.removeEventListener("buttonchanged", this._onButtonChanged)
    this.el.sceneEl.canvas.removeEventListener("touchstart", this._onTouchStart)
    this.el.sceneEl.canvas.removeEventListener("touchmove", this._onTouchMove)
    this.el.sceneEl.canvas.removeEventListener("touchend", this._onTouchEnd)
    this.el.sceneEl.removeEventListener("enter-vr", this._onEnterVR)
    this.el.sceneEl.removeEventListener("exit-vr", this._onExitVR)
  },

  remove() {
    this.el.sceneEl.removeChild(this._legs)
    this.el.sceneEl.removeChild(this._legBumper)
    this.el.sceneEl.removeChild(this._headBumper)
  },

  tick(time, timeDelta) {
    timeDelta /= 1000
    this.el.object3D.localToWorld(this.centerPos.set(0, 0, 0))
    this.headPos.copy(this._camera.object3D.position)
    this._camera.object3D.parent.localToWorld(this.headPos)
    this.headDir.set(0, 0, -1)
      .applyQuaternion(this._camera.object3D.quaternion)
      .applyQuaternion(this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp()))
    this._legs.object3D.localToWorld(this.feetPos.set(0, 0, 0))
    this.feetPos.y -= 0.5

    this._applyButtons(timeDelta)
    this._applyMoveStick(timeDelta)
    this._applyAuxStick(timeDelta)

    // drag feet
    let head2toe = THREE.Vector3.temp()
      .copy(this.headPos).sub(this.feetPos)
    head2toe.y = 0
    if (head2toe.length() > 0.5 || !this.currentFloor) {
      if (this.currentFloor)
        head2toe.multiplyScalar(0.1)
      this._legs.object3D.position.add(head2toe)
      this.feetPos.add(head2toe)
    }

    // fall
    if (!this._godMode && !this._caution) {
      let ray = this._legs.components.raycaster
      ray.refreshObjects()
      let hit = ray.intersections[0]
      if (hit && this._vertVelocity <= 0) {
        this._vertVelocity = 0
        if (this.currentFloor === hit.el) {
          let delta = THREE.Vector3.temp()
          delta.copy(this.currentFloor.object3D.position).sub(this.currentFloorPosition)
          this.move(delta)
          this.lastStep.add(delta)
          delta.y = 0
          this._legs.object3D.position.add(delta)
        } else {
          if (this.currentFloor) this.currentFloor.emit("leave")
          hit.el.emit("enter")
        }
        this.move(THREE.Vector3.temp().set(0, 0.5 - hit.distance, 0))
        this.currentFloor = hit.el
        this.currentFloorPosition.copy(this.currentFloor.object3D.position)
      } else {
        if (this.currentFloor) this.currentFloor.emit("leave")
        this._vertVelocity -= this.data.gravity * timeDelta
        this.move(THREE.Vector3.temp().set(0, Math.max(-0.5, this._vertVelocity * timeDelta), 0))
        this.currentFloor = null
      }
    }

    // bump walls
    if (this._godMode) {
      this._legBumper.object3D.position.copy(this._legs.object3D.position)
      this._headBumper.object3D.position.copy(this._legs.object3D.position)
    } else if (this._bumpOverload > 4 || Math.abs(this.headPos.y - this.feetPos.y) > 3) {
      this.feetPos.y = this.centerPos.y
      this._legs.object3D.position.y = this.feetPos.y + 0.5
      this.teleport(this._legBumper.object3D.position, true)
      if (this._bumpOverload) this._bumpOverload--
    } else {
      let pos = THREE.Vector3.temp()
      pos.copy(this.feetPos).y += 0.5
      this._bump(pos, this._legBumper)
      pos.copy(this.headPos)
      this._bump(pos, this._headBumper)
    }

    // take step
    let delta = THREE.Vector3.temp()
    delta.copy(this.feetPos).sub(this.lastStep)
    if (delta.length() > this.data.stepLength) {
      if (this.currentFloor) {
        this.el.emit("step")
        this.currentFloor.emit("step")
      }
      while (delta.length() > this.data.stepLength) {
        delta.multiplyScalar(this.data.stepLength / delta.length())
        this.lastStep.add(delta)
        delta.copy(this.feetPos).sub(this.lastStep)
      }
    }

    // Update The Matrix! 🐱‍💻
    this.el.object3D.updateWorldMatrix(true, true)
  },

  teleport(pos, force) {
    let delta = THREE.Vector3.temp()
    delta.copy(pos).sub(this.feetPos)
    this.move(delta)
    this._legs.object3D.position.x = this.feetPos.x = this.headPos.x
    this._legs.object3D.position.z = this.feetPos.z = this.headPos.z
    this._caution = 8
    if (force) {
      this._legBumper.object3D.position.copy(this._legs.object3D.position)
      this._headBumper.object3D.position.copy(this._legs.object3D.position)
    }
  },

  jump() {
    // jump!
    if (this.currentFloor) {
      this._vertVelocity = this.data.jumpForce
    }
  },
  stopFall() {
    this._legs.object3D.position.x = this.feetPos.x = this.headPos.x
    this._legs.object3D.position.z = this.feetPos.z = this.headPos.z
    this._vertVelocity = 0
  },

  toggleCrouch(reset) {
    if (!this.currentFloor) return setTimeout(() => {
      this.toggleCrouch(reset)
    }, 256)
    let head2toe = this.headPos.y - this.feetPos.y
    let delta
    clearTimeout(this._crouchResetTO)
    this._crouchResetTO = null
    if (Math.abs(this.centerPos.y - this.feetPos.y) > 0.03125) {
      delta = this.feetPos.y - this.centerPos.y
    } else if (!reset) {
      if (head2toe > 1) {
        delta = -1
      } else {
        delta = 1
      }
    }
    this.el.removeAttribute("animation")
    if (delta) {
      this.el.setAttribute("animation", {
        property: "object3D.position.y",
        to: this.el.object3D.position.y + delta,
        dur: 256,
        // easing: "easeInOutSine"
      })
    }
  },

  move(delta) {
    this.el.object3D.position.add(delta)
    this.centerPos.add(delta)
    this.headPos.add(delta)
    this._legs.object3D.position.y += delta.y
    this.feetPos.y += delta.y
  },

  _bump(pos, bumper) {
    let matrix = THREE.Matrix3.temp()
    let delta = THREE.Vector3.temp()
    delta.copy(pos)
    delta.sub(bumper.object3D.position)
    let dist = delta.length()
    if (dist) {
      bumper.setAttribute("raycaster", "far", dist + 0.125)
      bumper.setAttribute("raycaster", "direction", `${delta.x} ${delta.y} ${delta.z}`)
      // bumper.setAttribute("raycaster", "origin", delta.multiplyScalar(-0.25))
      let ray = bumper.components.raycaster
      ray.refreshObjects()
      let hit = ray.intersections[0]
      if (hit) {
        this.el.removeAttribute("animation")
        matrix.getNormalMatrix(hit.el.object3D.matrixWorld)
        delta
          .copy(hit.face.normal)
          .applyMatrix3(matrix)
          .normalize()
          .multiplyScalar(dist + 0.125)
        let feety = this._legs.object3D.position.y
        this.move(delta)
        bumper.object3D.position.add(delta)
        if (this._legs.object3D.position.y !== feety) {
          if (bumper === this._headBumper) this._headBumper.object3D.position.copy(this._legBumper.object3D.position)
          clearTimeout(this._crouchResetTO)
          this._crouchResetTO = setTimeout(() => {
            this.toggleCrouch(true)
          }, 4096)
        }
        this._legs.object3D.position.add(delta)
        this._legs.object3D.position.y = Math.max(feety, this.headPos.y - 1.5)
        this._caution = 4
        this._bumpOverload++
        this._vertVelocity = Math.min(0, this._vertVelocity)
        let detail = {
          player: this.el,
          object: hit.el
        }
        this.el.emit("bump", detail)
        hit.el.emit("bump", detail)
      } else if (this._caution) {
        this._caution--
      } else {
        if (this._bumpOverload) this._bumpOverload--
        bumper.object3D.position.lerp(pos, 0.25)
      }
    }
  },

  _callMoveStick() {
    let bestStick = THREE.Vector2.temp().set(0, 0)
    let stick = THREE.Vector2.temp()

    stick.set(0, 0)
    if (this._keysDown["KeyA"]) stick.x--
    if (this._keysDown["KeyD"]) stick.x++
    if (this._keysDown["KeyW"] || this._keysDown["ArrowUp"]) stick.y--
    if (this._keysDown["KeyS"] || this._keysDown["ArrowDown"]) stick.y++
    if (this._kbStick.length() > 0.1) this._kbStick.multiplyScalar((this._kbStick.length() - 0.1) / this._kbStick.length())
    else (this._kbStick.set(0, 0))
    this._kbStick.add(stick.multiplyScalar(0.2))
    if (this._kbStick.length() > 1) this._kbStick.normalize()
    if (this._kbStick.length() > bestStick.length()) bestStick.copy(this._kbStick)

    this._deadZone(stick.set(this._axes[0], this._axes[1]))
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    stick.copy(this._leftTouchDir)
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        this._deadZone(stick.set(gamepad.axes[0], gamepad.axes[1]))
        if (stick.length() > bestStick.length()) {
          this._setDevice("gamepad")
          bestStick.copy(stick)
        }
      }
    }

    if (bestStick.length() > 1) bestStick.normalize()
    if (this._keysDown["ShiftLeft"] || this._keysDown["ShiftRight"]) bestStick.multiplyScalar(0.25)
    return bestStick
  },
  _applyMoveStick(seconds) {
    let stick = this._callMoveStick()
    stick.multiplyScalar(this.data.speed)
    stick.multiplyScalar(seconds)
    let heading = THREE.Vector2.temp().set(this.headDir.z, -this.headDir.x).angle() - Math.PI
    let x2 = Math.cos(heading) * stick.x - Math.sin(heading) * stick.y
    let y2 = Math.sin(heading) * stick.x + Math.cos(heading) * stick.y
    let delta = THREE.Vector3.temp().set(x2, 0, y2)
    if (this.quantizeMovement) {
      this._quantTime = this._quantTime || 0
      this._quantDelta = this._quantDelta || new THREE.Vector3()
      this._quantTime += seconds
      this._quantDelta.add(delta)
      if (this._quantTime > 0.25) {
        this._quantTime -= 0.25
        delta.copy(this._quantDelta)
        this._quantDelta.set(0, 0, 0)
      } else {
        delta.set(0, 0, 0)
      }
    }
    this.move(delta)
  },

  _callAuxStick() {
    let bestStick = THREE.Vector2.temp().set(0, 0)
    let stick = THREE.Vector2.temp()

    stick.set(0, 0)
    if (this._keysDown["ArrowLeft"]) stick.x--
    if (this._keysDown["ArrowRight"]) stick.x++
    if (this._keysDown["KeyQ"]) stick.y--
    if (this._keysDown["KeyC"]) stick.y++
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    this._fourWay(this._deadZone(stick.set(this._axes[2], this._axes[3])))
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    this._fourWay(stick.copy(this._rightTouchDir))
    if (stick.length() > bestStick.length()) bestStick.copy(stick)

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        this._fourWay(this._deadZone(stick.set(gamepad.axes[2], gamepad.axes[3])))
        if (stick.length() > bestStick.length()) {
          this._setDevice("gamepad")
          bestStick.copy(stick)
        }
      }
    }

    if (bestStick.length() > 1) bestStick.normalize()
    if (this._keysDown["ShiftLeft"] || this._keysDown["ShiftRight"]) bestStick.multiplyScalar(0.25)
    return bestStick
  },
  _applyAuxStick(seconds) {
    let stick = this._callAuxStick()
    let rotation = 0

    // Rotation
    if (this.quantizeRotation) {
      if (Math.round(stick.x)) {
        if (!this._rotating) {
          this._rotating = true
          rotation = -Math.round(stick.x) * Math.PI / 4
        }
      } else {
        this._rotating = false
      }
    } else {
      rotation = -stick.x * this.data.rotationSpeed * seconds
    }
    if (rotation) {
      let pos = THREE.Vector2.temp()
      let pivot = THREE.Vector2.temp()
      let delta = THREE.Vector3.temp()
      pos.set(this.feetPos.x, this.feetPos.z)
      pivot.set(this.centerPos.x, this.centerPos.z)
      pos.rotateAround(pivot, -rotation)
      delta.set(this.feetPos.x - pos.x, 0, this.feetPos.z - pos.y)

      this.el.object3D.rotateY(rotation)
      this.el.object3D.position.add(delta)
      this.centerPos.add(delta)
    }

    // Levitating
    if (this._godMode) {
      this.el.object3D.position.y += -stick.y * this.data.speed * seconds
      this._legs.object3D.position.y += -stick.y * this.data.speed * seconds
    } else {
      // Crouching
      if (Math.round(stick.y) > 0) {
        if (!this._crouching) {
          this._crouching = true
          this.toggleCrouch()
        }
      } else {
        this._crouching = false
      }

      // Teleportation and jumping
      if (Math.round(stick.y) < 0) {
        if (!this._teleporting && this.data.teleportDistance) {
          this._teleportCursor.setAttribute("visible", true)
          this._teleporting = true
        }
        let quat = THREE.Quaternion.temp()
        this._teleportCursor.object3D.getWorldQuaternion(quat)
        this._teleportCursor.object3D.quaternion.multiply(quat.conjugate().normalize()).multiply(quat.copy(this.el.object3D.quaternion).multiply(this._camera.object3D.quaternion))
        this._teleportCursor.object3D.quaternion.x = 0
        this._teleportCursor.object3D.quaternion.z = 0
        this._teleportCursor.object3D.quaternion.normalize()

        ray = this._teleportBeam.components.raycaster
        ray.refreshObjects()
        hit = ray.intersections[0]
        if (hit && hit.el.getAttribute("floor") != null) {
          let straight = THREE.Vector3.temp()
          let delta = THREE.Vector3.temp()
          let matrix = THREE.Matrix3.temp()
          delta.copy(hit.point).sub(this.feetPos)
          if (delta.y > 1.5) delta.multiplyScalar(0)
          if (delta.length() > this.data.teleportDistance) delta.normalize().multiplyScalar(this.data.teleportDistance)
          delta.add(this.feetPos)
          this._teleportCursor.object3D.position.copy(delta)
          this._teleportCursor.object3D.parent.worldToLocal(this._teleportCursor.object3D.position)

          matrix.getNormalMatrix(hit.el.object3D.matrixWorld)
          delta
            .copy(hit.face.normal)
            .applyMatrix3(matrix)
            .normalize()
          delta.applyQuaternion(quat.copy(this.el.object3D.quaternion).conjugate())
          straight.set(0, 1, 0)
          quat.setFromUnitVectors(straight, delta)
          this._teleportCursor.object3D.quaternion.premultiply(quat)
        } else {
          this._teleportCursor.object3D.position.copy(this.feetPos)
          this._teleportCursor.object3D.parent.worldToLocal(this._teleportCursor.object3D.position)
        }
      } else if (this._teleporting) {
        let pos = THREE.Vector3.temp()
        this._teleportCursor.object3D.localToWorld(pos.set(0, 0, 0))
        this.teleport(pos)
        this._teleportCursor.setAttribute("visible", false)
        this._teleportCursor.setAttribute("position", "0 0 0")
        this._teleporting = false
      }
    }
  },

  _callButtons() {
    let buttons = 0

    if (this._keysDown["Space"]) buttons = buttons | 1
    if (this._keysDown["KeyG"]) buttons = buttons | 2
    if (this._vrRightClick) buttons = buttons | 1
    if (this._vrLeftClick) buttons = buttons | 2

    for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
      gamepad = navigator.getGamepads()[i]
      if (gamepad) {
        if (gamepad.buttons[3]?.pressed) {
          this._setDevice("gamepad")
          buttons = buttons | 1
        }
        if (gamepad.buttons[11]?.pressed) {
          this._setDevice("gamepad")
          buttons = buttons | 1
        }
        if (gamepad.buttons[10]?.pressed) {
          this._setDevice("gamepad")
          buttons = buttons | 2
        }
      }
    }

    return buttons
  },
  _applyButtons() {
    let buttons = this._callButtons()
    if (buttons) {
      if (!this._toggling) {
        if (buttons & 1) this.jump()
        if (this.data.godMode && buttons & 2) this._godMode = !this._godMode
        if (this._godMode) this._vertVelocity = 0
      }
      this._toggling = true
    } else {
      this._toggling = false
    }
  },

  _deadZone(vec, limit = 0.25) {
    if (vec.length() > limit) {
      vec.multiplyScalar(((vec.length() - limit) / (1 - limit)) / vec.length())
    } else {
      vec.set(0, 0)
    }
    return vec
  },
  _fourWay(vec) {
    let len = vec.length()
    if (Math.abs(vec.x) > Math.abs(vec.y)) {
      vec.y = 0
    } else {
      vec.x = 0
    }
    vec.multiplyScalar(len / vec.length())
    return vec
  },

  _onKeyDown(e) {
    this._setDevice("desktop")
    this._keysDown[e.code] = true
  },
  _onKeyUp(e) { this._keysDown[e.code] = false },
  _onAxisMove(e) {
    this._setDevice("vrcontroller")
    if (e.srcElement.getAttribute("tracked-controls").hand === "left") {
      this._axes[0] = e.detail.axis[2]
      this._axes[1] = e.detail.axis[3]
    } else {
      this._axes[2] = e.detail.axis[2]
      this._axes[3] = e.detail.axis[3]
    }
    if (!this._handEnabled) {
      this._teleportBeam.parentElement.removeChild(this._teleportBeam)
      this._teleportBeam = this._rightHand.ensure(".teleportBeam", "a-entity", {
        class: "teleportBeam", rotation: "-45 0 0",
        raycaster: {
          autoRefresh: false,
          objects: "[wall]",
        }
      })
      this._handEnabled = true
    }
  },
  _onButtonChanged(e) {
    this._setDevice("vrcontroller")
    if (e.srcElement.getAttribute("tracked-controls").hand === "left") {
      if (e.detail.id == 3) this._vrLeftClick = e.detail.state.pressed
    } else {
      if (e.detail.id == 3) this._vrRightClick = e.detail.state.pressed
    }
  },

  _onTouchStart(e) {
    this._setDevice("touch")
    let vw = this.el.sceneEl.canvas.clientWidth
    for (let j = 0; j < e.changedTouches.length; j++) {
      let touchEvent = e.changedTouches[j]
      if (touchEvent.clientX < vw / 2) {
        this._leftTouchId = touchEvent.identifier
        this._leftTouchCenter.set(touchEvent.clientX, touchEvent.clientY)
      }
      if (touchEvent.clientX > vw / 2) {
        this._rightTouchId = touchEvent.identifier
        this._rightTouchCenter.set(touchEvent.clientX, touchEvent.clientY)
      }
    }
    e.preventDefault()
  },
  _onTouchMove(e) {
    let stickRadius = 32
    for (let j = 0; j < e.changedTouches.length; j++) {
      let touchEvent = e.changedTouches[j]
      let touchCenter = null
      let touchDir = null
      if (this._leftTouchId === touchEvent.identifier) {
        touchCenter = this._leftTouchCenter
        touchDir = this._leftTouchDir
      }
      if (this._rightTouchId === touchEvent.identifier) {
        touchCenter = this._rightTouchCenter
        touchDir = this._rightTouchDir
      }
      if (touchDir) {
        touchDir.set(touchEvent.clientX, touchEvent.clientY)
        touchDir.sub(touchCenter)
        if (touchDir.length() > stickRadius) {
          touchDir.multiplyScalar((touchDir.length() - stickRadius) / touchDir.length())
          touchCenter.add(touchDir)
          touchDir.multiplyScalar(stickRadius / touchDir.length())
        }
        touchDir.divideScalar(stickRadius)
      }
    }
    e.preventDefault()
  },
  _onTouchEnd(e) {
    for (let j = 0; j < e.changedTouches.length; j++) {
      let touchEvent = e.changedTouches[j];
      if (this._leftTouchId === touchEvent.identifier) {
        this._leftTouchId = null
        this._leftTouchDir.set(0, 0)
      }
      if (this._rightTouchId === touchEvent.identifier) {
        this._rightTouchId = null
        this._rightTouchDir.set(0, 0)
      }
    }
  },

  _onEnterVR(e) {
    this.isVR = true
    this.quantizeMovement = this._config.quantizeMovementVR
    this.quantizeRotation = this._config.quantizeRotationVR
  },
  _onExitVR(e) {
    this.isVR = false
    this.quantizeMovement = this._config.quantizeMovement
    this.quantizeRotation = this._config.quantizeRotation
  },

  _setDevice(device) {
    if (this.device === device) return
    this.el.removeState(this.device || "noinput")
    this.device = device
    this.el.addState(this.device || "noinput")
  }
})

require("./locomotion/floor")
require("./locomotion/wall")
require("./locomotion/start")

},{"./locomotion/floor":12,"./locomotion/start":13,"./locomotion/wall":14}],12:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("floor", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update() {
    this.el.setAttribute("wall", this.data)
  }
})

},{}],13:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("start", {

  init() {
    let loco = this.el.sceneEl.querySelector("[locomotion]").components.locomotion
    if (!loco) return setTimeout(() => { this.init() }, 256)
    let pos = new THREE.Vector3()
    // console.log("starting at", pos)

    setTimeout(() => {
      this.el.object3D.localToWorld(pos.set(0, 0, 0))
      loco.teleport(pos, true)
      setTimeout(() => {
        loco.toggleCrouch(true)
      }, 256)
    }, 256)
  }
})

},{}],14:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("wall", {
  schema: {
    physics: { type: "boolean", default: true }
  },

  update() {
    if (this.data.physics && !this.el.getAttribute("body")) this.el.setAttribute("body", "type:static")
  }
})

},{}],15:[function(require,module,exports){
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

  trigger(e) {
    let args = this._property.split(".")
    args.push(this._value)
    this._entity.setAttribute(...args)
  }
})

},{}],16:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("onstate", {
  multiple: true,
  schema: {
    state: { type: "string" },
    entity: { type: "selector" },
    property: { type: "string" },
    on: { type: "string" },
    off: { type: "string" },
  },

  init() {
    this.trigger = this.trigger.bind(this)
  },

  update(oldData) {
    this._state = this.data.state || this.id || ""
    this._entity = this.data.entity || this.el
    this._property = this.data.property || ""
    this._on = this.data.on || ""
    this._off = this.data.off || ""
  },

  play() {
    this.trigger()
    this.el.addEventListener("stateadded", this.trigger)
    this.el.addEventListener("stateremoved", this.trigger)
  },

  pause() {
    this.el.removeEventListener("stateadded", this.trigger)
    this.el.removeEventListener("stateremoved", this.trigger)
  },

  trigger(e) {
    if (e && e.detail !== this._state) return
    let args = this._property.split(".")
    args.push(this.el.is(this._state) ? this._on : this._off)
    this._entity.setAttribute(...args)
  }
})

},{}],17:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../libs/cmdCodec")
const pkg = require("../../package")


AFRAME.registerSystem("physics", {
  schema: {
    workerUrl: { type: "string", default: `https://cdn.jsdelivr.net/npm/a-game@${pkg.version}/dist/cannonWorker.min.js` },
    gravity: { type: "vec3", default: { x: 0, y: -10, z: 0 } },
    debug: { type: "boolean", default: false }
  },

  update() {
    if (this.data.workerUrl) {
      if (!this.worker) {
        if (this.data.workerUrl.includes("//")) {
          let script = `importScripts(${JSON.stringify(this.data.workerUrl)})`
          this.worker = new Worker(`data:text/javascript;base64,${btoa(script)}`)
        } else {
          this.worker = new Worker(this.data.workerUrl)
        }
        this.worker.postMessage("log " + cmd.stringifyParam("Physics worker ready!"))
        this.worker.addEventListener("message", this.onMessage.bind(this))
      }
      this.bodies = this.bodies || []
      this.movingBodies = this.movingBodies || []
      this.joints = this.joints || []
      this.buffers = [new Float64Array(8), new Float64Array(8)]
      this.worker.postMessage("world gravity = " + cmd.stringifyParam(this.data.gravity))
      this._debug = this.data.debug
    } else {
      this.remove()
    }
  },

  remove() {
    this.worker && this.worker.terminate()
    this.worker = null
    this.bodies = []
    this.movingBodies = []
  },

  tick(time, timeDelta) {
    if (!this.worker) return
    if (this.buffers.length < 2) return
    let buffer = this.buffers.shift()
    if (buffer.length < 8 * this.movingBodies.length) {
      let len = buffer.length
      while (len < 8 * this.movingBodies.length) {
        len *= 2
      }
      let bods = this.movingBodies
      buffer = new Float64Array(len)
      buffer.fill(NaN)
      let vec = THREE.Vector3.temp()
      let quat = THREE.Quaternion.temp()
      for (let i = 0; i < bods.length; i++) {
        let p = i * 8
        if (bods[i]) {
          bods[i].object3D.localToWorld(vec.set(0, 0, 0))
          buffer[p++] = vec.x
          buffer[p++] = vec.y
          buffer[p++] = vec.z
          p++
          bods[i].object3D.getWorldQuaternion(quat)
          buffer[p++] = quat.x
          buffer[p++] = quat.y
          buffer[p++] = quat.z
          buffer[p++] = quat.w
        }
      }
    }
    this.worker.postMessage(buffer, [buffer.buffer])
  },

  onMessage(e) {
    if (typeof e.data === "string") {
      let command = cmd.parse(e.data)
      switch (command.shift()) {
        case "world":
          this.command(command)
          break
      }
    }
    else if (e.data instanceof Float64Array) {
      this.buffers.push(e.data)
      while (this.buffers.length > 2)
        this.buffers.shift()
    }
  },

  command(params) {
    if (typeof params[0] === "number") {
      params.shift()
    }
    switch (params.shift()) {
      case "body":
        let id = params.shift()
        let body = this.bodies[id]
        if (body)
          body.components.body.command(params)
        break
    }
  },
  eval(expr) {
    this.worker.postMessage("world eval " + cmd.stringifyParam(expr))
  }
})

require("./physics/body")
require("./physics/shape")
require("./physics/joint")

},{"../../package":1,"../libs/cmdCodec":24,"./physics/body":18,"./physics/joint":19,"./physics/shape":20}],18:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("body", {
  dependencies: ["position", "rotation", "scale"],

  schema: {
    type: { type: "string", default: "dynamic" },
    mass: { type: "number", default: 1 },
    friction: { type: "number", default: 0.3 },
    restitution: { type: "number", default: 0.3 },
    belongsTo: { type: "int", default: 1 },
    collidesWith: { type: "int", default: 1 },
    emitsWith: { type: "int", default: 0 },
    sleeping: { type: "boolean", default: false },
    autoShape: { type: "boolean", default: true },
  },

  init() {
    let worker = this.el.sceneEl.systems.physics.worker
    let bodies = this.el.sceneEl.systems.physics.bodies
    let movingBodies = this.el.sceneEl.systems.physics.movingBodies
    let buffer = this.el.sceneEl.systems.physics.buffers[0]
    if (!worker) return
    this.id = bodies.indexOf(null)
    if (this.id < 0) this.id = bodies.length
    bodies[this.id] = this.el
    if (this.data.type !== "static") {
      this.mid = movingBodies.indexOf(null)
      if (this.mid < 0) this.mid = movingBodies.length
      movingBodies[this.mid] = this.el
    } else {
      this.mid = null
    }
    let body = { mid: this.mid }
    body.type = this.data.type
    body.position = this.el.object3D.localToWorld(THREE.Vector3.temp().set(0, 0, 0))
    body.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    if (this.mid !== null) {
      let p = this.mid * 8
      buffer[p++] = body.position.x
      buffer[p++] = body.position.y
      buffer[p++] = body.position.z
      buffer[p++] = this.data.sleeping
      buffer[p++] = body.quaternion.x
      buffer[p++] = body.quaternion.y
      buffer[p++] = body.quaternion.z
      buffer[p++] = body.quaternion.w
    }
    this.shapes = []
    this.sleeping = true
    worker.postMessage("world body " + this.id + " create " + cmd.stringifyParam(body))
    // if (body.type === "static") 
    setTimeout(() => {
      body.position = this.el.object3D.localToWorld(THREE.Vector3.temp().set(0, 0, 0))
      body.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
      worker.postMessage("world body " + this.id + " position = " + cmd.stringifyParam(body.position))
      worker.postMessage("world body " + this.id + " quaternion = " + cmd.stringifyParam(body.quaternion))

      if (this.el.components.shape) this.el.components.shape.play()
      let els = this.el.querySelectorAll("[shape]")
      if (els) els.forEach(el => {
        if (el.components.shape) el.components.shape.play()
      })
      if (this.el.components.joint) this.el.components.joint.play()
      for (let comp in this.el.components) {
        if (comp.substr(0, 7) === "joint__") this.el.components[comp].play()
      }
    })

    if (this.data.autoShape) {
      if (!this.el.getAttribute("shape")) {
        if (this.el.firstElementChild) {
          let els = this.el.querySelectorAll("a-box, a-sphere, a-cylinder")
          if (els) els.forEach(el => {
            if (!el.getAttribute("shape")) el.setAttribute("shape", true)
          })
        } else {
          this.el.setAttribute("shape", true)
        }
      }
    }
    this._initiated = true
  },

  play() {
    if (!this._initiated) {
      this.init()
      this.update({})
    }
  },

  update(oldData) {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    if (this.data.type !== oldData.type)
      worker.postMessage("world body " + this.id + " type = " + cmd.stringifyParam(this.data.type))
    if (this.data.mass !== oldData.mass)
      worker.postMessage("world body " + this.id + " mass = " + cmd.stringifyParam(this.data.mass))
    if (this.data.friction !== oldData.friction)
      worker.postMessage("world body " + this.id + " friction = " + cmd.stringifyParam(this.data.friction))
    if (this.data.restitution !== oldData.restitution)
      worker.postMessage("world body " + this.id + " restitution = " + cmd.stringifyParam(this.data.restitution))
    if (this.data.belongsTo !== oldData.belongsTo)
      worker.postMessage("world body " + this.id + " belongsTo = " + cmd.stringifyParam(this.data.belongsTo))
    if (this.data.collidesWith !== oldData.collidesWith)
      worker.postMessage("world body " + this.id + " collidesWith = " + cmd.stringifyParam(this.data.collidesWith))
    if (this.data.emitsWith !== oldData.emitsWith)
      worker.postMessage("world body " + this.id + " emitsWith = " + cmd.stringifyParam(this.data.emitsWith))
    // if (this.data.sleeping !== oldData.sleeping)
    setTimeout(() => {
      worker.postMessage("world body " + this.id + " sleeping = " + !!(this.data.sleeping))
    })
  },

  sleep() {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    worker.postMessage("world body " + this.id + " sleeping = true")
    this.sleeping = true
  },

  applyWorldImpulse(force, point) {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    worker.postMessage("world body " + this.id + " impulse " + cmd.stringifyParam(force) + " " + cmd.stringifyParam(point))
  },
  applyLocalImpulse(force, point) {
    let _point = this.el.object3D.localToWorld(THREE.Vector3.temp().copy(point))
    let _force = this.el.object3D.localToWorld(THREE.Vector3.temp().copy(force)).sub(this.el.object3D.localToWorld(THREE.Vector3.temp().set(0, 0, 0)))
    this.applyWorldImpulse(_force, _point)
  },

  pause() {
    let worker = this.el.sceneEl.systems.physics.worker
    let bodies = this.el.sceneEl.systems.physics.bodies
    let movingBodies = this.el.sceneEl.systems.physics.movingBodies
    if (!worker) return

    if (this.el.components.joint) this.el.components.joint.pause()
    for (let comp in this.el.components) {
      if (comp.substr(0, 7) === "joint__") this.el.components[comp].pause()
    }
    let els = this.el.querySelectorAll("[shape]")
    if (els) els.forEach(el => {
      if (el.components.shape) el.components.shape.pause()
    })
    if (this.el.components.shape) this.el.components.shape.pause()

    bodies[this.id] = null
    if (this.mid !== null)
      movingBodies[this.mid] = null
    worker.postMessage("world body " + this.id + " remove")
    this._initiated = false
  },

  tick() {
    let worker = this.el.sceneEl.systems.physics.worker
    let buffer = this.el.sceneEl.systems.physics.buffers[0]
    if (!worker) return
    if (this.mid !== null) {
      let p = this.mid * 8
      if (buffer.length <= p) return
      if (this.data.type === "kinematic") {
        let vec = this.el.object3D.localToWorld(THREE.Vector3.temp().set(0, 0, 0))
        buffer[p++] = vec.x
        buffer[p++] = vec.y
        buffer[p++] = vec.z
        this.sleeping = !!(buffer[p++])
        let quat = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
        buffer[p++] = quat.x
        buffer[p++] = quat.y
        buffer[p++] = quat.z
        buffer[p++] = quat.w
      } else if (buffer[p + 1]) {
        let quat = THREE.Quaternion.temp()

        this.el.object3D.position.set(buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.parent.worldToLocal(this.el.object3D.position)
        this.sleeping = !!(buffer[p++])

        this.el.object3D.getWorldQuaternion(quat)
        this.el.object3D.quaternion.multiply(quat.conjugate().normalize())
        quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.quaternion.multiply(quat.normalize())
      }
    }
  },

  command(params) {
    switch (params.shift()) {
      case "emits":
        let e = params.shift()
        switch (e.event) {
          case "collision":
            let bodies = this.el.sceneEl.systems.physics.bodies
            e.body1 = bodies[e.body1]
            e.body2 = bodies[e.body2]
            if (!e.body1 || !e.body2) return
            e.shape1 = e.body1.components.body.shapes[e.shape1]
            e.shape2 = e.body2.components.body.shapes[e.shape2]
            break
        }
        this.el.emit(e.event, e)
        break
    }
  },
  eval(expr) {
    let worker = this.el.sceneEl.systems.physics.worker
    worker.postMessage("world body " + this.id + " eval " + cmd.stringifyParam(expr))
  },

  commit() {
    let worker = this.el.sceneEl.systems.physics.worker
    let pos = THREE.Vector3.temp()
    let quat = THREE.Quaternion.temp()
    this.el.object3D.localToWorld(pos.set(0, 0, 0))
    worker.postMessage("world body " + this.id + " position " + cmd.stringifyParam(pos))
    this.el.object3D.getWorldQuaternion(quat)
    worker.postMessage("world body " + this.id + " quaternion " + cmd.stringifyParam(quat))
  }
})


},{"../../libs/cmdCodec":24}],19:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("joint", {
  // dependencies: ["body", "shape"],
  multiple: true,

  schema: {
    type: { type: "string", default: "ball" },
    body1: { type: "selector" },
    body2: { type: "selector" },
    pivot1: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    pivot2: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    axis1: { type: "vec3", default: { x: 0, y: 1, z: 0 } },
    axis2: { type: "vec3", default: { x: 0, y: 1, z: 0 } },
    min: { type: "number", default: 0 },
    max: { type: "number", default: 1 },
    collision: { type: "boolean", default: true },
    // limit: { type: "array" },
    // motor: { type: "array" },
    // spring: { type: "array" },
  },

  play() {
    if (this._id != null) return
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    if (!this.data.body1.components.body) return this._retry = setTimeout(() => {
      this.play()
    }, 256)
    if (!this.data.body2.components.body) return this._retry = setTimeout(() => {
      this.play()
    }, 256)
    this._id = joints.indexOf(null)
    if (this._id < 0) this._id = joints.length
    joints[this._id] = this.el

    // setTimeout(() => {
    let joint = {}
    joint.type = this.data.type
    joint.body1 = this.data.body1 ? this.data.body1.components.body.id : this.el.components.body.id
    joint.body2 = this.data.body2.components.body.id
    joint.pivot1 = THREE.Vector3.temp().copy(this.data.pivot1)
    joint.pivot2 = THREE.Vector3.temp().copy(this.data.pivot2)
    joint.axis1 = this.data.axis1
    joint.axis2 = this.data.axis2
    joint.min = this.data.min
    joint.max = this.data.max
    joint.collision = this.data.collision
    let scale = this.el.object3D.getWorldScale(THREE.Vector3.temp())
    joint.pivot1.multiply(scale)
    joint.pivot2.multiply(scale)
    worker.postMessage("world joint " + this._id + " create " + cmd.stringifyParam(joint))
    // })
  },

  update(oldData) {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    this.data.body1 = this.data.body1 || this.el
    // if (this.data.type !== oldData.type)
    //   worker.postMessage("world joint " + this._id + " type = " + cmd.stringifyParam(this.data.type))
  },

  pause() {
    clearTimeout(this._retry)
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    joints[this._id] = null
    worker.postMessage("world joint " + this._id + " remove")
    this._id = null
  },
  eval(expr) {
    let worker = this.el.sceneEl.systems.physics.worker
    worker.postMessage("world joint " + this._id + " eval " + cmd.stringifyParam(expr))
  }

})


},{"../../libs/cmdCodec":24}],20:[function(require,module,exports){
/* global AFRAME, THREE */

const cmd = require("../../libs/cmdCodec")

AFRAME.registerComponent("shape", {
  // dependencies: ["body"],
  schema: {
  },

  play() {
    if (this.id != null) return
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return

    this.body = this.el
    while (this.body && !this.body.matches("[body]")) this.body = this.body.parentElement
    if (!this.body) return this._retry = setTimeout(() => {
      this.play()
    }, 256)
    this.bodyId = this.body.components.body.id

    let shapes = this.body.components.body.shapes
    this.id = shapes.indexOf(null)
    if (this.id < 0) this.id = shapes.length
    shapes[this.id] = this.el

    let shape = {}
    shape.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
    this.body.object3D.worldToLocal(shape.position)
    shape.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    let bodyquat = this.body.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    shape.quaternion.multiply(bodyquat.conjugate().normalize()).normalize()
    shape.size = THREE.Vector3.temp().set(1, 1, 1)

    switch (this.el.tagName.toLowerCase()) {
      case "a-sphere":
        shape.type = "sphere"
        shape.size.multiplyScalar(parseFloat(this.el.getAttribute("radius") || 1) * 2)
        break
      case "a-cylinder":
        shape.type = "cylinder"
        shape.size.multiplyScalar(parseFloat(this.el.getAttribute("radius") || 1) * 2).y = parseFloat(this.el.getAttribute("height") || 1)
        break
      case "a-box":
        shape.type = "box"
        shape.size.set(
          parseFloat(this.el.getAttribute("width") || 1),
          parseFloat(this.el.getAttribute("height") || 1),
          parseFloat(this.el.getAttribute("depth") || 1)
        )
        break
      // case "a-plane":
      //   shape.type = "plane"
      //   break
    }
    let scale = this.el.object3D.getWorldScale(THREE.Vector3.temp())
    shape.size.multiply(scale)
    shape.position.multiply(scale)

    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " create " + cmd.stringifyParam(shape))
  },

  pause() {
    clearTimeout(this._retry)
    if (!this.body) return
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    let shapes = this.body.components.body.shapes
    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " remove")
    shapes[this.id] = null
    this.id = null
  },

  eval(expr) {
    let worker = this.el.sceneEl.systems.physics.worker
    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " eval " + cmd.stringifyParam(expr))
  }
})


},{"../../libs/cmdCodec":24}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerComponent("trigger", {
  schema: {
    objects: { type: "string", default: ".head-bumper" },
  },

  init() {
    this._refreshTO = setInterval(this.refreshObjects.bind(this), 1024)
  },

  remove() {
    clearInterval(this._refreshTO)
  },

  tick() {
    if (!this.objects) return this.refreshObjects()
    let local = THREE.Vector3.temp()
    let width = parseFloat(this.el.getAttribute("width") || 1)
    let height = parseFloat(this.el.getAttribute("height") || 1)
    let depth = parseFloat(this.el.getAttribute("depth") || 1)
    let radius = parseFloat(this.el.getAttribute("radius") || 1)
    let inside
    for (let obj of this.objects) {
      obj.object3D.localToWorld(local.set(0, 0, 0))
      this.el.object3D.worldToLocal(local)
      switch (this.el.tagName.toLowerCase()) {
        case "a-sphere":
          inside = local.length() < radius
          break
        case "a-box":
          inside = Math.abs(local.x) < width / 2
            && Math.abs(local.y) < height / 2
            && Math.abs(local.z) < depth / 2
          break
        case "a-cylinder":
          inside = Math.abs(local.y) < height / 2
          local.y = 0
          inside = inside && local.length() < radius
          break
      }
      if (inside && this.triggered.indexOf(obj) < 0) {
        let d = {
          trigger: this.el,
          object: obj,
        }
        this.el.addState("triggered")
        this.el.emit("trigger", d)
        obj.emit("trigger", d)
        this.triggered.push(obj)
      }
      if (!inside && this.triggered.indexOf(obj) >= 0) {
        let d = {
          trigger: this.el,
          object: obj,
        }
        this.el.emit("untrigger", d)
        obj.emit("untrigger", d)
        this.triggered.splice(this.triggered.indexOf(obj), 1)
        if (!this.triggered.length)
          this.el.removeState("triggered")
      }
    }
  },

  refreshObjects() {
    this.objects = this.objects || []
    this.triggered = this.triggered || []
    this.objects.splice(0, this.objects.length)
    let els = this.el.sceneEl.querySelectorAll(this.data.objects)
    if (!els) return
    els.forEach(el => {
      this.objects.push(el)
    })
    for (let i = 0; i < this.triggered.length; i++) {
      let obj = this.triggered[i]
      if (this.objects.indexOf(obj) < 0) {
        this.triggered.splice(i, 1)
        i--
      }
    }
  },


})

},{}],23:[function(require,module,exports){
/* global AFRAME, THREE */

const _update = AFRAME.components.raycaster.Component.prototype.update
const _refreshObjects = AFRAME.components.raycaster.Component.prototype.refreshObjects

AFRAME.components.raycaster.Component.prototype.update = function () {
  this._matchSelector = this.data.objects
  this.data.objects = deepMatch(this.data.objects)
  return _update.apply(this, arguments)
}

AFRAME.components.raycaster.Component.prototype.refreshObjects = function () {
  let result = _refreshObjects.apply(this, arguments)
  let hits = this.intersections
  for (let hit of hits) {
    hit.el = hit.object.el
    while (hit.el && !hit.el.matches(this._matchSelector)) hit.el = hit.el.parentNode
  }
  return result
}


function deepMatch(selector) {
  if (selector.indexOf("*") >= 0) return selector
  let deep = (selector + ", ").replaceAll(",", " *,")
  return deep + selector
}
},{}],24:[function(require,module,exports){
module.exports = {
  parse(cmd) {
    let words = cmd.split(" ")
    let args = []
    for (let word of words) {
      if (word) {
        try {
          args.push(JSON.parse(word))
        } catch (error) {
          if (word !== "=")
            args.push(word)
        }
      }
    }
    return args
  },
  stringifyParam(val) {
    return JSON.stringify(val).replaceAll(" ", "\\u0020").replaceAll("\"_", "\"")
  }
}
},{}],25:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.AEntity.prototype.copyWorldPosRot = function (srcEl) {
  let quat = THREE.Quaternion.temp()
  let src = srcEl.object3D
  let dest = this.object3D
  if (!src) return
  if (!dest) return
  if (!dest.parent) return
  src.localToWorld(dest.position.set(0, 0, 0))
  dest.parent.worldToLocal(dest.position)

  dest.getWorldQuaternion(quat)
  dest.quaternion.multiply(quat.conjugate().normalize())
  src.getWorldQuaternion(quat)
  dest.quaternion.multiply(quat.normalize())
}
},{}],26:[function(require,module,exports){
Element.prototype.ensure = function (selector, name = selector, attrs = {}, innerHTML = "") {
  let _childEl, attr, val
  _childEl = this.querySelector(selector)
  if (!_childEl) {
    _childEl = document.createElement(name)
    this.appendChild(_childEl)
    for (attr in attrs) {
      val = attrs[attr]
      _childEl.setAttribute(attr, val)
    }
    _childEl.innerHTML = innerHTML
  }
  return _childEl
}
},{}],27:[function(require,module,exports){
/* global AFRAME, THREE */

function makePool(Class) {
  Class._pool = []
  Class._inUse = []
  Class.temp = function () {
    let v = Class._pool.pop() || new Class()
    Class._inUse.push(v)
    if (!Class._gc)
      Class._gc = setTimeout(Class._recycle)
    return v
  }
  Class._recycle = function () {
    while (Class._inUse.length)
      Class._pool.push(Class._inUse.pop())
    Class._gc = false
  }
}

makePool(THREE.Vector2)
makePool(THREE.Vector3)
makePool(THREE.Quaternion)
makePool(THREE.Matrix3)
makePool(THREE.Matrix4)

},{}],28:[function(require,module,exports){
let _addEventListener = Element.prototype.addEventListener
let _removeEventListener = Element.prototype.removeEventListener
let init = el => {
  if (el._tgest) return el._tgest
  el._tgest = {
    handlers: {
      swipeup: [],
      swipedown: [],
      swipeleft: [],
      swiperight: [],
      tap: [],
      hold: []
    }
  }
  let cx, cy, to, held
  let emit = (type, e) => {
    if (el._tgest.handlers[type]) {
      for (let handler of el._tgest.handlers[type]) {
        handler(e)
      }
    } else console.log(type, el._tgest.handlers[type])
  }
  el.addEventListener("touchstart", e => {
    cx = e.changedTouches[0].screenX
    cy = e.changedTouches[0].screenY
    held = false
    to = setTimeout(() => {
      held = true
      emit("hold", e)
    }, 512)
  })
  el.addEventListener("touchmove", e => {
    let x = e.changedTouches[0].screenX,
      y = e.changedTouches[0].screenY,
      l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
    if (l > 32) {
      clearTimeout(to)
      if (held) return
      if (Math.abs(cx - x) > Math.abs(cy - y)) {
        if (x < cx) emit("swipeleft", e)
        else emit("swiperight", e)
      } else {
        if (y < cy) emit("swipeup", e)
        else emit("swipedown", e)
      }
      held = true
    }
  })
  el.addEventListener("touchend", e => {
    clearTimeout(to)
    let x = e.changedTouches[0].screenX,
      y = e.changedTouches[0].screenY,
      l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
    if (l < 32) {
      if (held) return
      emit("tap", e)
    }
  })

  return el._tgest
}
Element.prototype.addEventListener = function (eventtype, handler) {
  switch (eventtype) {
    case "swipeup":
    case "swipedown":
    case "swipeleft":
    case "swiperight":
    case "tap":
    case "hold":
      let tg = init(this)
      tg.handlers[eventtype].push(handler)
      break
    default:
      return _addEventListener.call(this, eventtype, handler)
  }
}
Element.prototype.removeEventListener = function (eventtype, handler) {
  switch (eventtype) {
    case "swipeup":
    case "swipedown":
    case "swipeleft":
    case "swiperight":
    case "tap":
    case "hold":
      let tg = init(this)
      let i = tg.handlers[eventtype].indexOf(handler)
      if (i >= 0) tg.handlers[eventtype].splice(i, 1)
      break
    default:
      return _removeEventListener.call(this, eventtype, handler)
  }
}

},{}],29:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerPrimitive("a-hand", {
  mappings: {
    side: "tracked-controls.hand"
  }
})

},{}],30:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerPrimitive("a-main", {})
},{}],31:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.registerPrimitive("a-player", {
  defaultComponents: {
    injectplayer: {}
  }
})
},{}]},{},[2]);
