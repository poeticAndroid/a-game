(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* global AFRAME, THREE */

let loading = false

AFRAME.registerComponent("include", {
  schema: { type: "string" },

  update: async function () {
    if (this.data && !loading) {
      loading = true
      console.log("Including", this.data)
      this.el.outerHTML = await (await fetch(this.data)).text()
      loading = false
      let next = this.el.sceneEl.querySelector("[include]")
      if (next)
        next.components.include.update()
    }
  }
})

},{}],2:[function(require,module,exports){
/* global AFRAME, THREE, OIMO */

// let scripts = document.getElementsByTagName("script")
// const workerUrl = scripts[scripts.length - 1].src

function stringify(val) {
  return JSON.stringify(val).replaceAll(" ", "\\u0020").replaceAll("\"_", "\"")
}

AFRAME.registerSystem("physics", {
  schema: {
    workerUrl: { type: "string" },
    gravity: { type: "vec3", default: { x: 0, y: -9.8, z: 0 } },
    debug: { type: "boolean", default: false }
  },

  update: function () {
    if (this.data.workerUrl) {
      if (!this.worker) {
        this.worker = new Worker(this.data.workerUrl)
        this.worker.addEventListener("message", this.onMessage.bind(this))
      }
      this.bodies = this.bodies || []
      this.movingBodies = this.movingBodies || []
      this.buffers = [new Float64Array(8), new Float64Array(8)]
      this.worker.postMessage("world gravity = " + stringify(this.data.gravity))
      this._debug = this.data.debug
    } else {
      this.remove()
    }
  },

  remove: function () {
    this.worker && this.worker.terminate()
    this.worker = null
    this.bodies = []
    this.movingBodies = []
  },

  tick: function (time, timeDelta) {
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
          bods[i].object3D.getWorldPosition(vec)
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

  onMessage: function (e) {
    if (e.data instanceof Float64Array) {
      this.buffers.push(e.data)
      while (this.buffers.length > 2)
        this.buffers.shift()
    }
  }
})

AFRAME.registerComponent("body", {
  dependencies: ["position", "rotation", "scale"],

  schema: {
    type: { type: "string", default: "static" }
  },

  init: function () {
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
    body.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
    body.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    if (this.mid !== null) {
      let p = this.mid * 8
      buffer[p++] = body.position.x
      buffer[p++] = body.position.y
      buffer[p++] = body.position.z
      p++
      buffer[p++] = body.quaternion.x
      buffer[p++] = body.quaternion.y
      buffer[p++] = body.quaternion.z
      buffer[p++] = body.quaternion.w
    }
    this.shapes = []
    worker.postMessage("world body " + this.id + " create " + stringify(body))

    if (!this.el.getAttribute("shape")) {
      if (this.el.firstElementChild) {
        let els = this.el.querySelectorAll("a-box, a-sphere, a-cylinder")
        if (els)
          els.forEach(el => {
            if (!el.getAttribute("shape")) el.setAttribute("shape", true)
          })
      } else {
        this.el.setAttribute("shape", true)
      }
    }
  },

  update: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    worker.postMessage("world body " + this.id + " type = " + stringify(this.data.type))
  },

  play: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    worker.postMessage("world body " + this.id + " sleeping = false")
  },
  pause: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    worker.postMessage("world body " + this.id + " sleeping = true")
  },

  remove: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let bodies = this.el.sceneEl.systems.physics.bodies
    let movingBodies = this.el.sceneEl.systems.physics.movingBodies
    if (!worker) return
    bodies[this.id] = null
    if (this.mid !== null)
      movingBodies[this.mid] = null
    worker.postMessage("world body " + this.id + " remove")
  },

  tick: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let buffer = this.el.sceneEl.systems.physics.buffers[0]
    if (!worker) return
    if (this.mid !== null) {
      let p = this.mid * 8
      if (buffer.length <= p) return
      if (this.data.type === "kinematic") {
        let vec = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
        buffer[p++] = vec.x
        buffer[p++] = vec.y
        buffer[p++] = vec.z
        p++
        let quat = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
        buffer[p++] = quat.x
        buffer[p++] = quat.y
        buffer[p++] = quat.z
        buffer[p++] = quat.w
      } else if (!isNaN(buffer[p])) {
        let quat = THREE.Quaternion.temp()

        this.el.object3D.position.set(buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.parent.worldToLocal(this.el.object3D.position)
        p++

        this.el.object3D.getWorldQuaternion(quat)
        this.el.object3D.quaternion.multiply(quat.conjugate().normalize())
        quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.quaternion.multiply(quat.normalize())
        // console.log(this.el.tagName, "updated!", this.el.object3D.position)
      }
    }
  }
})

AFRAME.registerComponent("shape", {
  dependencies: ["body"],
  multiple: true,
  schema: {
    type: { type: "string", default: "box" },
    size: { type: "vec3", default: { x: -1, y: -1, z: -1 } },
    posOffset: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    rotOffset: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    density: { type: "number", default: 1 },
    friction: { type: "number", default: 0.2 },
    restitution: { type: "number", default: 0.2 },
    belongsTo: { type: "int", default: 1 },
    collidesWith: { type: "int", default: 0xffffffff },
  },

  init: function () {
    this.body = this.el
    while (this.body && !this.body.matches("[body]")) this.body = this.body.parentElement
    this.bodyId = this.body.components.body.id

    let worker = this.el.sceneEl.systems.physics.worker
    let shapes = this.body.components.body.shapes
    if (!worker) return
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

    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " create " + stringify(shape))
  },

  update: function () {
  },

  remove: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let shapes = this.body.components.body.shapes
    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " remove")
    shapes[this.id] = null
  }
})

AFRAME.registerComponent("joint", {
  dependencies: ["body", "shape"],

  schema: {
    type: { type: "string", default: "prisme" },
    with: { type: "selector", default: "[body]" },
    min: { type: "number", default: 0 },
    max: { type: "number", default: 0 },
    pos1: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    pos2: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    axe1: { type: "vec3", default: { x: 1, y: 0, z: 0 } },
    axe2: { type: "vec3", default: { x: 1, y: 0, z: 0 } },
    collision: { type: "boolean", default: false },
    limit: { type: "array" },
    motor: { type: "array" },
    spring: { type: "array" },
  },

  update: function () {
    if (!this.el.body) return setTimeout(() => this.update(), 256)
    if (!this.data.with.body) return setTimeout(() => this.update(), 256)
    if (!this.joint) {
      let jc = new OIMO.JointConfig()
      jc.body1 = this.el.body
      jc.body2 = this.data.with.body
      let deg2rad = Math.PI / 180
      switch (this.data.type) {
        case "distance":
          this.joint = new OIMO.DistanceJoint(jc, this.data.min, this.data.max)
          break
        case "hinge":
          this.joint = new OIMO.HingeJoint(jc, this.data.min * deg2rad, this.data.max * deg2rad)
          break
        case "prisme":
          this.joint = new OIMO.PrismaticJoint(jc, this.data.min * deg2rad, this.data.max * deg2rad)
          break
        case "slide":
          this.joint = new OIMO.SliderJoint(jc, this.data.min, this.data.max)
          break
        case "ball":
          this.joint = new OIMO.BallAndSocketJoint(jc)
          break
        case "wheel":
          this.joint = new OIMO.WheelJoint(jc)
          break
      }
      this.el.sceneEl.physicsWorld.addJoint(this.joint)
    }
    this.joint.localAnchorPoint1.copy(this.data.pos1)
    this.joint.localAnchorPoint2.copy(this.data.pos2)
    if (this.joint.localAxis1) {
      this.joint.localAxis1.copy(this.data.axe1)
      this.joint.localAxis2.copy(this.data.axe2)
    }
    this.joint.allowCollision = this.data.collision

    let lm = this.joint.rotationalLimitMotor1 || this.joint.limitMotor
    // if (this.data.limit.length == 2)
    lm.setLimit(parseFloat(this.data.limit[0]) || 0, parseFloat(this.data.limit[1]) || 0)
    // if (this.data.motor.length == 2)
    lm.setMotor(parseFloat(this.data.motor[0]) || 0, parseFloat(this.data.motor[1]) || 0)
    // if (this.data.spring.length == 2)
    lm.setSpring(parseFloat(this.data.spring[0]) || 0, parseFloat(this.data.spring[1]) || 0)
  },

  remove: function () {
    if (this.joint) {
      this.joint.body1.awake()
      this.joint.body2.awake()
      this.joint.remove()
    }
    this.joint = null
  },

})


},{}],3:[function(require,module,exports){
require("./libs/pools")
require("./libs/copyWorldPosRot")

require("./components/include")
require("./components/physics")

},{"./components/include":1,"./components/physics":2,"./libs/copyWorldPosRot":4,"./libs/pools":5}],4:[function(require,module,exports){
/* global AFRAME, THREE */

AFRAME.AEntity.prototype.copyWorldPosRot = function (srcEl) {
  let quat = THREE.Quaternion.temp()
  let src = srcEl.object3D
  let dest = this.object3D
  if (!src) return
  if (!dest) return
  if (!dest.parent) return
  src.getWorldPosition(dest.position)
  dest.parent.worldToLocal(dest.position)

  dest.getWorldQuaternion(quat)
  dest.quaternion.multiply(quat.conjugate().normalize())
  src.getWorldQuaternion(quat)
  dest.quaternion.multiply(quat.normalize())
}
},{}],5:[function(require,module,exports){
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbmNsdWRlLmpzIiwic3JjL2NvbXBvbmVudHMvcGh5c2ljcy5qcyIsInNyYy9nYW1lZnJhbWUuanMiLCJzcmMvbGlicy9jb3B5V29ybGRQb3NSb3QuanMiLCJzcmMvbGlicy9wb29scy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xuXG5sZXQgbG9hZGluZyA9IGZhbHNlXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcImluY2x1ZGVcIiwge1xuICBzY2hlbWE6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxuXG4gIHVwZGF0ZTogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRhdGEgJiYgIWxvYWRpbmcpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlXG4gICAgICBjb25zb2xlLmxvZyhcIkluY2x1ZGluZ1wiLCB0aGlzLmRhdGEpXG4gICAgICB0aGlzLmVsLm91dGVySFRNTCA9IGF3YWl0IChhd2FpdCBmZXRjaCh0aGlzLmRhdGEpKS50ZXh0KClcbiAgICAgIGxvYWRpbmcgPSBmYWxzZVxuICAgICAgbGV0IG5leHQgPSB0aGlzLmVsLnNjZW5lRWwucXVlcnlTZWxlY3RvcihcIltpbmNsdWRlXVwiKVxuICAgICAgaWYgKG5leHQpXG4gICAgICAgIG5leHQuY29tcG9uZW50cy5pbmNsdWRlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG59KVxuIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUsIE9JTU8gKi9cblxuLy8gbGV0IHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVxuLy8gY29uc3Qgd29ya2VyVXJsID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdLnNyY1xuXG5mdW5jdGlvbiBzdHJpbmdpZnkodmFsKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2VBbGwoXCIgXCIsIFwiXFxcXHUwMDIwXCIpLnJlcGxhY2VBbGwoXCJcXFwiX1wiLCBcIlxcXCJcIilcbn1cblxuQUZSQU1FLnJlZ2lzdGVyU3lzdGVtKFwicGh5c2ljc1wiLCB7XG4gIHNjaGVtYToge1xuICAgIHdvcmtlclVybDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXG4gICAgZ3Jhdml0eTogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAtOS44LCB6OiAwIH0gfSxcbiAgICBkZWJ1ZzogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRhdGEud29ya2VyVXJsKSB7XG4gICAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih0aGlzLmRhdGEud29ya2VyVXJsKVxuICAgICAgICB0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKVxuICAgICAgfVxuICAgICAgdGhpcy5ib2RpZXMgPSB0aGlzLmJvZGllcyB8fCBbXVxuICAgICAgdGhpcy5tb3ZpbmdCb2RpZXMgPSB0aGlzLm1vdmluZ0JvZGllcyB8fCBbXVxuICAgICAgdGhpcy5idWZmZXJzID0gW25ldyBGbG9hdDY0QXJyYXkoOCksIG5ldyBGbG9hdDY0QXJyYXkoOCldXG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGdyYXZpdHkgPSBcIiArIHN0cmluZ2lmeSh0aGlzLmRhdGEuZ3Jhdml0eSkpXG4gICAgICB0aGlzLl9kZWJ1ZyA9IHRoaXMuZGF0YS5kZWJ1Z1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZSgpXG4gICAgfVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMud29ya2VyICYmIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpXG4gICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgdGhpcy5ib2RpZXMgPSBbXVxuICAgIHRoaXMubW92aW5nQm9kaWVzID0gW11cbiAgfSxcblxuICB0aWNrOiBmdW5jdGlvbiAodGltZSwgdGltZURlbHRhKSB7XG4gICAgaWYgKCF0aGlzLndvcmtlcikgcmV0dXJuXG4gICAgaWYgKHRoaXMuYnVmZmVycy5sZW5ndGggPCAyKSByZXR1cm5cbiAgICBsZXQgYnVmZmVyID0gdGhpcy5idWZmZXJzLnNoaWZ0KClcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCA8IDggKiB0aGlzLm1vdmluZ0JvZGllcy5sZW5ndGgpIHtcbiAgICAgIGxldCBsZW4gPSBidWZmZXIubGVuZ3RoXG4gICAgICB3aGlsZSAobGVuIDwgOCAqIHRoaXMubW92aW5nQm9kaWVzLmxlbmd0aCkge1xuICAgICAgICBsZW4gKj0gMlxuICAgICAgfVxuICAgICAgbGV0IGJvZHMgPSB0aGlzLm1vdmluZ0JvZGllc1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0NjRBcnJheShsZW4pXG4gICAgICBidWZmZXIuZmlsbChOYU4pXG4gICAgICBsZXQgdmVjID0gVEhSRUUuVmVjdG9yMy50ZW1wKClcbiAgICAgIGxldCBxdWF0ID0gVEhSRUUuUXVhdGVybmlvbi50ZW1wKClcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcCA9IGkgKiA4XG4gICAgICAgIGlmIChib2RzW2ldKSB7XG4gICAgICAgICAgYm9kc1tpXS5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKHZlYylcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy54XG4gICAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMueVxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnpcbiAgICAgICAgICBwKytcbiAgICAgICAgICBib2RzW2ldLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gcXVhdC54XG4gICAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnlcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQuelxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gcXVhdC53XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoYnVmZmVyLCBbYnVmZmVyLmJ1ZmZlcl0pXG4gIH0sXG5cbiAgb25NZXNzYWdlOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLmRhdGEgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpIHtcbiAgICAgIHRoaXMuYnVmZmVycy5wdXNoKGUuZGF0YSlcbiAgICAgIHdoaWxlICh0aGlzLmJ1ZmZlcnMubGVuZ3RoID4gMilcbiAgICAgICAgdGhpcy5idWZmZXJzLnNoaWZ0KClcbiAgICB9XG4gIH1cbn0pXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcImJvZHlcIiwge1xuICBkZXBlbmRlbmNpZXM6IFtcInBvc2l0aW9uXCIsIFwicm90YXRpb25cIiwgXCJzY2FsZVwiXSxcblxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHQ6IFwic3RhdGljXCIgfVxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBsZXQgYm9kaWVzID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5ib2RpZXNcbiAgICBsZXQgbW92aW5nQm9kaWVzID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5tb3ZpbmdCb2RpZXNcbiAgICBsZXQgYnVmZmVyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5idWZmZXJzWzBdXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIHRoaXMuaWQgPSBib2RpZXMuaW5kZXhPZihudWxsKVxuICAgIGlmICh0aGlzLmlkIDwgMCkgdGhpcy5pZCA9IGJvZGllcy5sZW5ndGhcbiAgICBib2RpZXNbdGhpcy5pZF0gPSB0aGlzLmVsXG4gICAgaWYgKHRoaXMuZGF0YS50eXBlICE9PSBcInN0YXRpY1wiKSB7XG4gICAgICB0aGlzLm1pZCA9IG1vdmluZ0JvZGllcy5pbmRleE9mKG51bGwpXG4gICAgICBpZiAodGhpcy5taWQgPCAwKSB0aGlzLm1pZCA9IG1vdmluZ0JvZGllcy5sZW5ndGhcbiAgICAgIG1vdmluZ0JvZGllc1t0aGlzLm1pZF0gPSB0aGlzLmVsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWlkID0gbnVsbFxuICAgIH1cbiAgICBsZXQgYm9keSA9IHsgbWlkOiB0aGlzLm1pZCB9XG4gICAgYm9keS50eXBlID0gdGhpcy5kYXRhLnR5cGVcbiAgICBib2R5LnBvc2l0aW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKFRIUkVFLlZlY3RvcjMudGVtcCgpKVxuICAgIGJvZHkucXVhdGVybmlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgIGlmICh0aGlzLm1pZCAhPT0gbnVsbCkge1xuICAgICAgbGV0IHAgPSB0aGlzLm1pZCAqIDhcbiAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3NpdGlvbi54XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zaXRpb24ueVxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnBvc2l0aW9uLnpcbiAgICAgIHArK1xuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueFxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueVxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24uelxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ud1xuICAgIH1cbiAgICB0aGlzLnNoYXBlcyA9IFtdXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBjcmVhdGUgXCIgKyBzdHJpbmdpZnkoYm9keSkpXG5cbiAgICBpZiAoIXRoaXMuZWwuZ2V0QXR0cmlidXRlKFwic2hhcGVcIikpIHtcbiAgICAgIGlmICh0aGlzLmVsLmZpcnN0RWxlbWVudENoaWxkKSB7XG4gICAgICAgIGxldCBlbHMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJhLWJveCwgYS1zcGhlcmUsIGEtY3lsaW5kZXJcIilcbiAgICAgICAgaWYgKGVscylcbiAgICAgICAgICBlbHMuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBpZiAoIWVsLmdldEF0dHJpYnV0ZShcInNoYXBlXCIpKSBlbC5zZXRBdHRyaWJ1dGUoXCJzaGFwZVwiLCB0cnVlKVxuICAgICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZShcInNoYXBlXCIsIHRydWUpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIHR5cGUgPSBcIiArIHN0cmluZ2lmeSh0aGlzLmRhdGEudHlwZSkpXG4gIH0sXG5cbiAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIHNsZWVwaW5nID0gZmFsc2VcIilcbiAgfSxcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBzbGVlcGluZyA9IHRydWVcIilcbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBsZXQgYm9kaWVzID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5ib2RpZXNcbiAgICBsZXQgbW92aW5nQm9kaWVzID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5tb3ZpbmdCb2RpZXNcbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgYm9kaWVzW3RoaXMuaWRdID0gbnVsbFxuICAgIGlmICh0aGlzLm1pZCAhPT0gbnVsbClcbiAgICAgIG1vdmluZ0JvZGllc1t0aGlzLm1pZF0gPSBudWxsXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiByZW1vdmVcIilcbiAgfSxcblxuICB0aWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IGJ1ZmZlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYnVmZmVyc1swXVxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICBpZiAodGhpcy5taWQgIT09IG51bGwpIHtcbiAgICAgIGxldCBwID0gdGhpcy5taWQgKiA4XG4gICAgICBpZiAoYnVmZmVyLmxlbmd0aCA8PSBwKSByZXR1cm5cbiAgICAgIGlmICh0aGlzLmRhdGEudHlwZSA9PT0gXCJraW5lbWF0aWNcIikge1xuICAgICAgICBsZXQgdmVjID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKFRIUkVFLlZlY3RvcjMudGVtcCgpKVxuICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy54XG4gICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnlcbiAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMuelxuICAgICAgICBwKytcbiAgICAgICAgbGV0IHF1YXQgPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKSlcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnhcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnlcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnpcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LndcbiAgICAgIH0gZWxzZSBpZiAoIWlzTmFOKGJ1ZmZlcltwXSkpIHtcbiAgICAgICAgbGV0IHF1YXQgPSBUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKVxuXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucG9zaXRpb24uc2V0KGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10pXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucGFyZW50LndvcmxkVG9Mb2NhbCh0aGlzLmVsLm9iamVjdDNELnBvc2l0aW9uKVxuICAgICAgICBwKytcblxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnF1YXRlcm5pb24ubXVsdGlwbHkocXVhdC5jb25qdWdhdGUoKS5ub3JtYWxpemUoKSlcbiAgICAgICAgcXVhdC5zZXQoYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10pXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucXVhdGVybmlvbi5tdWx0aXBseShxdWF0Lm5vcm1hbGl6ZSgpKVxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmVsLnRhZ05hbWUsIFwidXBkYXRlZCFcIiwgdGhpcy5lbC5vYmplY3QzRC5wb3NpdGlvbilcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcInNoYXBlXCIsIHtcbiAgZGVwZW5kZW5jaWVzOiBbXCJib2R5XCJdLFxuICBtdWx0aXBsZTogdHJ1ZSxcbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcImJveFwiIH0sXG4gICAgc2l6ZTogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAtMSwgeTogLTEsIHo6IC0xIH0gfSxcbiAgICBwb3NPZmZzZXQ6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMCwgeTogMCwgejogMCB9IH0sXG4gICAgcm90T2Zmc2V0OiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDAsIHk6IDAsIHo6IDAgfSB9LFxuICAgIGRlbnNpdHk6IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMSB9LFxuICAgIGZyaWN0aW9uOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAuMiB9LFxuICAgIHJlc3RpdHV0aW9uOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAuMiB9LFxuICAgIGJlbG9uZ3NUbzogeyB0eXBlOiBcImludFwiLCBkZWZhdWx0OiAxIH0sXG4gICAgY29sbGlkZXNXaXRoOiB7IHR5cGU6IFwiaW50XCIsIGRlZmF1bHQ6IDB4ZmZmZmZmZmYgfSxcbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5ib2R5ID0gdGhpcy5lbFxuICAgIHdoaWxlICh0aGlzLmJvZHkgJiYgIXRoaXMuYm9keS5tYXRjaGVzKFwiW2JvZHldXCIpKSB0aGlzLmJvZHkgPSB0aGlzLmJvZHkucGFyZW50RWxlbWVudFxuICAgIHRoaXMuYm9keUlkID0gdGhpcy5ib2R5LmNvbXBvbmVudHMuYm9keS5pZFxuXG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IHNoYXBlcyA9IHRoaXMuYm9keS5jb21wb25lbnRzLmJvZHkuc2hhcGVzXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIHRoaXMuaWQgPSBzaGFwZXMuaW5kZXhPZihudWxsKVxuICAgIGlmICh0aGlzLmlkIDwgMCkgdGhpcy5pZCA9IHNoYXBlcy5sZW5ndGhcbiAgICBzaGFwZXNbdGhpcy5pZF0gPSB0aGlzLmVsXG5cbiAgICBsZXQgc2hhcGUgPSB7fVxuICAgIHNoYXBlLnBvc2l0aW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKFRIUkVFLlZlY3RvcjMudGVtcCgpKVxuICAgIHRoaXMuYm9keS5vYmplY3QzRC53b3JsZFRvTG9jYWwoc2hhcGUucG9zaXRpb24pXG4gICAgc2hhcGUucXVhdGVybmlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgIGxldCBib2R5cXVhdCA9IHRoaXMuYm9keS5vYmplY3QzRC5nZXRXb3JsZFF1YXRlcm5pb24oVEhSRUUuUXVhdGVybmlvbi50ZW1wKCkpXG4gICAgc2hhcGUucXVhdGVybmlvbi5tdWx0aXBseShib2R5cXVhdC5jb25qdWdhdGUoKS5ub3JtYWxpemUoKSkubm9ybWFsaXplKClcbiAgICBzaGFwZS5zaXplID0gVEhSRUUuVmVjdG9yMy50ZW1wKCkuc2V0KDEsIDEsIDEpXG5cbiAgICBzd2l0Y2ggKHRoaXMuZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlIFwiYS1zcGhlcmVcIjpcbiAgICAgICAgc2hhcGUudHlwZSA9IFwic3BoZXJlXCJcbiAgICAgICAgc2hhcGUuc2l6ZS5tdWx0aXBseVNjYWxhcihwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwicmFkaXVzXCIpIHx8IDEpICogMilcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJhLWN5bGluZGVyXCI6XG4gICAgICAgIHNoYXBlLnR5cGUgPSBcImN5bGluZGVyXCJcbiAgICAgICAgc2hhcGUuc2l6ZS5tdWx0aXBseVNjYWxhcihwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwicmFkaXVzXCIpIHx8IDEpICogMikueSA9IHBhcnNlRmxvYXQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIikgfHwgMSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJhLWJveFwiOlxuICAgICAgICBzaGFwZS50eXBlID0gXCJib3hcIlxuICAgICAgICBzaGFwZS5zaXplLnNldChcbiAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwid2lkdGhcIikgfHwgMSksXG4gICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmVsLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKSB8fCAxKSxcbiAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwiZGVwdGhcIikgfHwgMSlcbiAgICAgICAgKVxuICAgICAgICBicmVha1xuICAgICAgLy8gY2FzZSBcImEtcGxhbmVcIjpcbiAgICAgIC8vICAgc2hhcGUudHlwZSA9IFwicGxhbmVcIlxuICAgICAgLy8gICBicmVha1xuICAgIH1cblxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmJvZHlJZCArIFwiIHNoYXBlIFwiICsgdGhpcy5pZCArIFwiIGNyZWF0ZSBcIiArIHN0cmluZ2lmeShzaGFwZSkpXG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IHNoYXBlcyA9IHRoaXMuYm9keS5jb21wb25lbnRzLmJvZHkuc2hhcGVzXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuYm9keUlkICsgXCIgc2hhcGUgXCIgKyB0aGlzLmlkICsgXCIgcmVtb3ZlXCIpXG4gICAgc2hhcGVzW3RoaXMuaWRdID0gbnVsbFxuICB9XG59KVxuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJqb2ludFwiLCB7XG4gIGRlcGVuZGVuY2llczogW1wiYm9keVwiLCBcInNoYXBlXCJdLFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJwcmlzbWVcIiB9LFxuICAgIHdpdGg6IHsgdHlwZTogXCJzZWxlY3RvclwiLCBkZWZhdWx0OiBcIltib2R5XVwiIH0sXG4gICAgbWluOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAgfSxcbiAgICBtYXg6IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMCB9LFxuICAgIHBvczE6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMCwgeTogMCwgejogMCB9IH0sXG4gICAgcG9zMjogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAwLCB6OiAwIH0gfSxcbiAgICBheGUxOiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDEsIHk6IDAsIHo6IDAgfSB9LFxuICAgIGF4ZTI6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMSwgeTogMCwgejogMCB9IH0sXG4gICAgY29sbGlzaW9uOiB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiBmYWxzZSB9LFxuICAgIGxpbWl0OiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxuICAgIG1vdG9yOiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxuICAgIHNwcmluZzogeyB0eXBlOiBcImFycmF5XCIgfSxcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuZWwuYm9keSkgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSwgMjU2KVxuICAgIGlmICghdGhpcy5kYXRhLndpdGguYm9keSkgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSwgMjU2KVxuICAgIGlmICghdGhpcy5qb2ludCkge1xuICAgICAgbGV0IGpjID0gbmV3IE9JTU8uSm9pbnRDb25maWcoKVxuICAgICAgamMuYm9keTEgPSB0aGlzLmVsLmJvZHlcbiAgICAgIGpjLmJvZHkyID0gdGhpcy5kYXRhLndpdGguYm9keVxuICAgICAgbGV0IGRlZzJyYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgICBzd2l0Y2ggKHRoaXMuZGF0YS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJkaXN0YW5jZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5EaXN0YW5jZUpvaW50KGpjLCB0aGlzLmRhdGEubWluLCB0aGlzLmRhdGEubWF4KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJoaW5nZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5IaW5nZUpvaW50KGpjLCB0aGlzLmRhdGEubWluICogZGVnMnJhZCwgdGhpcy5kYXRhLm1heCAqIGRlZzJyYWQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInByaXNtZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5QcmlzbWF0aWNKb2ludChqYywgdGhpcy5kYXRhLm1pbiAqIGRlZzJyYWQsIHRoaXMuZGF0YS5tYXggKiBkZWcycmFkKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJzbGlkZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5TbGlkZXJKb2ludChqYywgdGhpcy5kYXRhLm1pbiwgdGhpcy5kYXRhLm1heClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwiYmFsbFwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5CYWxsQW5kU29ja2V0Sm9pbnQoamMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIndoZWVsXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLldoZWVsSm9pbnQoamMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWwuc2NlbmVFbC5waHlzaWNzV29ybGQuYWRkSm9pbnQodGhpcy5qb2ludClcbiAgICB9XG4gICAgdGhpcy5qb2ludC5sb2NhbEFuY2hvclBvaW50MS5jb3B5KHRoaXMuZGF0YS5wb3MxKVxuICAgIHRoaXMuam9pbnQubG9jYWxBbmNob3JQb2ludDIuY29weSh0aGlzLmRhdGEucG9zMilcbiAgICBpZiAodGhpcy5qb2ludC5sb2NhbEF4aXMxKSB7XG4gICAgICB0aGlzLmpvaW50LmxvY2FsQXhpczEuY29weSh0aGlzLmRhdGEuYXhlMSlcbiAgICAgIHRoaXMuam9pbnQubG9jYWxBeGlzMi5jb3B5KHRoaXMuZGF0YS5heGUyKVxuICAgIH1cbiAgICB0aGlzLmpvaW50LmFsbG93Q29sbGlzaW9uID0gdGhpcy5kYXRhLmNvbGxpc2lvblxuXG4gICAgbGV0IGxtID0gdGhpcy5qb2ludC5yb3RhdGlvbmFsTGltaXRNb3RvcjEgfHwgdGhpcy5qb2ludC5saW1pdE1vdG9yXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5saW1pdC5sZW5ndGggPT0gMilcbiAgICBsbS5zZXRMaW1pdChwYXJzZUZsb2F0KHRoaXMuZGF0YS5saW1pdFswXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEubGltaXRbMV0pIHx8IDApXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5tb3Rvci5sZW5ndGggPT0gMilcbiAgICBsbS5zZXRNb3RvcihwYXJzZUZsb2F0KHRoaXMuZGF0YS5tb3RvclswXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEubW90b3JbMV0pIHx8IDApXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5zcHJpbmcubGVuZ3RoID09IDIpXG4gICAgbG0uc2V0U3ByaW5nKHBhcnNlRmxvYXQodGhpcy5kYXRhLnNwcmluZ1swXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEuc3ByaW5nWzFdKSB8fCAwKVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmpvaW50KSB7XG4gICAgICB0aGlzLmpvaW50LmJvZHkxLmF3YWtlKClcbiAgICAgIHRoaXMuam9pbnQuYm9keTIuYXdha2UoKVxuICAgICAgdGhpcy5qb2ludC5yZW1vdmUoKVxuICAgIH1cbiAgICB0aGlzLmpvaW50ID0gbnVsbFxuICB9LFxuXG59KVxuXG4iLCJyZXF1aXJlKFwiLi9saWJzL3Bvb2xzXCIpXHJcbnJlcXVpcmUoXCIuL2xpYnMvY29weVdvcmxkUG9zUm90XCIpXHJcblxyXG5yZXF1aXJlKFwiLi9jb21wb25lbnRzL2luY2x1ZGVcIilcclxucmVxdWlyZShcIi4vY29tcG9uZW50cy9waHlzaWNzXCIpXHJcbiIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcblxyXG5BRlJBTUUuQUVudGl0eS5wcm90b3R5cGUuY29weVdvcmxkUG9zUm90ID0gZnVuY3Rpb24gKHNyY0VsKSB7XHJcbiAgbGV0IHF1YXQgPSBUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKVxyXG4gIGxldCBzcmMgPSBzcmNFbC5vYmplY3QzRFxyXG4gIGxldCBkZXN0ID0gdGhpcy5vYmplY3QzRFxyXG4gIGlmICghc3JjKSByZXR1cm5cclxuICBpZiAoIWRlc3QpIHJldHVyblxyXG4gIGlmICghZGVzdC5wYXJlbnQpIHJldHVyblxyXG4gIHNyYy5nZXRXb3JsZFBvc2l0aW9uKGRlc3QucG9zaXRpb24pXHJcbiAgZGVzdC5wYXJlbnQud29ybGRUb0xvY2FsKGRlc3QucG9zaXRpb24pXHJcblxyXG4gIGRlc3QuZ2V0V29ybGRRdWF0ZXJuaW9uKHF1YXQpXHJcbiAgZGVzdC5xdWF0ZXJuaW9uLm11bHRpcGx5KHF1YXQuY29uanVnYXRlKCkubm9ybWFsaXplKCkpXHJcbiAgc3JjLmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxyXG4gIGRlc3QucXVhdGVybmlvbi5tdWx0aXBseShxdWF0Lm5vcm1hbGl6ZSgpKVxyXG59IiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuXHJcbmZ1bmN0aW9uIG1ha2VQb29sKENsYXNzKSB7XHJcbiAgQ2xhc3MuX3Bvb2wgPSBbXVxyXG4gIENsYXNzLl9pblVzZSA9IFtdXHJcbiAgQ2xhc3MudGVtcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCB2ID0gQ2xhc3MuX3Bvb2wucG9wKCkgfHwgbmV3IENsYXNzKClcclxuICAgIENsYXNzLl9pblVzZS5wdXNoKHYpXHJcbiAgICBpZiAoIUNsYXNzLl9nYylcclxuICAgICAgQ2xhc3MuX2djID0gc2V0VGltZW91dChDbGFzcy5fcmVjeWNsZSlcclxuICAgIHJldHVybiB2XHJcbiAgfVxyXG4gIENsYXNzLl9yZWN5Y2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgd2hpbGUgKENsYXNzLl9pblVzZS5sZW5ndGgpXHJcbiAgICAgIENsYXNzLl9wb29sLnB1c2goQ2xhc3MuX2luVXNlLnBvcCgpKVxyXG4gICAgQ2xhc3MuX2djID0gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbm1ha2VQb29sKFRIUkVFLlZlY3RvcjIpXHJcbm1ha2VQb29sKFRIUkVFLlZlY3RvcjMpXHJcbm1ha2VQb29sKFRIUkVFLlF1YXRlcm5pb24pXHJcbm1ha2VQb29sKFRIUkVFLk1hdHJpeDMpXHJcbm1ha2VQb29sKFRIUkVFLk1hdHJpeDQpXHJcbiJdfQ==
