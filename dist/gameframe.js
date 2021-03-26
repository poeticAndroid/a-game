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
      let b = new Float64Array(len)
      let vec = THREE.Vector3.temp()
      let quat = THREE.Quaternion.temp()
      b.set(buffer)
      for (let i = buffer.length / 8; i < bods.length; i++) {
        let p = i * 8
        if (bods[i]) {
          bods[i].object3D.getWorldPosition(vec)
          b[p++] = vec.x
          b[p++] = vec.y
          b[p++] = vec.z
          p++
          bods[i].object3D.getWorldQuaternion(quat)
          b[p++] = quat.x
          b[p++] = quat.y
          b[p++] = quat.z
          b[p++] = quat.w
        }
      }
      buffer = b
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
    worker.postMessage("world body " + this.id + " create " + stringify(body))
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
      } else {
        let quat = THREE.Quaternion.temp()

        this.el.object3D.position.set(buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.parent.worldToLocal(this.el.object3D.position)
        p++

        this.el.object3D.getWorldQuaternion(quat)
        this.el.object3D.quaternion.multiply(quat.conjugate().normalize())
        quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
        this.el.object3D.quaternion.multiply(quat.normalize())
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

  update: function () {
    if (!this.el.body) return setTimeout(() => this.update(), 256)
    if (!this.shape) {
      let sc = new OIMO.ShapeConfig()
      switch (this.data.type) {
        case "box":
          this.shape = new OIMO.Box(sc, 1, 1, 1)
          break
        case "cylinder":
          this.shape = new OIMO.Cylinder(sc, 1, 1)
          break
        case "sphere":
          this.shape = new OIMO.Sphere(sc, 1)
          break
        case "plane":
          this.shape = new OIMO.Plane(sc)
          break
      }
      this.el.body.addShape(this.shape)
    }
    this.shape.density = this.data.density
    this.shape.friction = this.data.friction
    this.shape.restitution = this.data.restitution
    this.shape.belongsTo = this.data.belongsTo
    this.shape.collidesWith = this.data.collidesWith
    this.shape.relativePosition.copy(this.data.posOffset)
    if (this.data.rotOffset.x || this.data.rotOffset.y || this.data.rotOffset.z) console.warn("rotOffset property not yet impemented!")
    // this.shape.relativeRotation.copy(this.data.rotOffset)

    let scale = THREE.Vector3.reuse()
    let size = THREE.Vector3.reuse().copy(this.data.size)
    if (size.x < 0) {
      size.set(1, 1, 1)
      let mesh = this.el.getObject3D("mesh")
      if (mesh && mesh.geometry) {
        mesh.geometry.computeBoundingBox()
        let box = mesh.geometry.boundingBox
        size.copy(box.max).sub(box.min)
      } else {
        this.el.addEventListener("model-loaded", this.update.bind(this))
      }
    }
    size.multiply(this.el.object3D.getWorldScale(scale))
    switch (this.data.type) {
      case "box":
        this.shape.width = size.x
        this.shape.height = size.y
        this.shape.depth = size.z
        this.shape.halfWidth = size.x / 2
        this.shape.halfHeight = size.y / 2
        this.shape.halfDepth = size.z / 2
        break
      case "cylinder":
        size.x = (size.x + size.z) / 4
        this.shape.radius = size.x
        this.shape.height = size.y
        this.shape.halfHeight = size.y / 2
        break
      case "sphere":
        size.x = (size.x + size.y + size.z) / 6
        this.shape.radius = size.x
        break
    }
    this.el.body.setupMass(this.el.body.type)

    size.recycle()
    scale.recycle()
  },

  remove: function () {
    if (this.shape) this.el.body.removeShape(this.shape)
    this.shape = null
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbmNsdWRlLmpzIiwic3JjL2NvbXBvbmVudHMvcGh5c2ljcy5qcyIsInNyYy9nYW1lZnJhbWUuanMiLCJzcmMvbGlicy9jb3B5V29ybGRQb3NSb3QuanMiLCJzcmMvbGlicy9wb29scy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xuXG5sZXQgbG9hZGluZyA9IGZhbHNlXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcImluY2x1ZGVcIiwge1xuICBzY2hlbWE6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxuXG4gIHVwZGF0ZTogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRhdGEgJiYgIWxvYWRpbmcpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlXG4gICAgICBjb25zb2xlLmxvZyhcIkluY2x1ZGluZ1wiLCB0aGlzLmRhdGEpXG4gICAgICB0aGlzLmVsLm91dGVySFRNTCA9IGF3YWl0IChhd2FpdCBmZXRjaCh0aGlzLmRhdGEpKS50ZXh0KClcbiAgICAgIGxvYWRpbmcgPSBmYWxzZVxuICAgICAgbGV0IG5leHQgPSB0aGlzLmVsLnNjZW5lRWwucXVlcnlTZWxlY3RvcihcIltpbmNsdWRlXVwiKVxuICAgICAgaWYgKG5leHQpXG4gICAgICAgIG5leHQuY29tcG9uZW50cy5pbmNsdWRlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG59KVxuIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUsIE9JTU8gKi9cblxuLy8gbGV0IHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVxuLy8gY29uc3Qgd29ya2VyVXJsID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdLnNyY1xuXG5mdW5jdGlvbiBzdHJpbmdpZnkodmFsKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2VBbGwoXCIgXCIsIFwiXFxcXHUwMDIwXCIpLnJlcGxhY2VBbGwoXCJcXFwiX1wiLCBcIlxcXCJcIilcbn1cblxuQUZSQU1FLnJlZ2lzdGVyU3lzdGVtKFwicGh5c2ljc1wiLCB7XG4gIHNjaGVtYToge1xuICAgIHdvcmtlclVybDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXG4gICAgZ3Jhdml0eTogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAtOS44LCB6OiAwIH0gfSxcbiAgICBkZWJ1ZzogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRhdGEud29ya2VyVXJsKSB7XG4gICAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih0aGlzLmRhdGEud29ya2VyVXJsKVxuICAgICAgICB0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKVxuICAgICAgfVxuICAgICAgdGhpcy5ib2RpZXMgPSB0aGlzLmJvZGllcyB8fCBbXVxuICAgICAgdGhpcy5tb3ZpbmdCb2RpZXMgPSB0aGlzLm1vdmluZ0JvZGllcyB8fCBbXVxuICAgICAgdGhpcy5idWZmZXJzID0gW25ldyBGbG9hdDY0QXJyYXkoOCksIG5ldyBGbG9hdDY0QXJyYXkoOCldXG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGdyYXZpdHkgPSBcIiArIHN0cmluZ2lmeSh0aGlzLmRhdGEuZ3Jhdml0eSkpXG4gICAgICB0aGlzLl9kZWJ1ZyA9IHRoaXMuZGF0YS5kZWJ1Z1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZSgpXG4gICAgfVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMud29ya2VyICYmIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpXG4gICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgdGhpcy5ib2RpZXMgPSBbXVxuICAgIHRoaXMubW92aW5nQm9kaWVzID0gW11cbiAgfSxcblxuICB0aWNrOiBmdW5jdGlvbiAodGltZSwgdGltZURlbHRhKSB7XG4gICAgaWYgKCF0aGlzLndvcmtlcikgcmV0dXJuXG4gICAgaWYgKHRoaXMuYnVmZmVycy5sZW5ndGggPCAyKSByZXR1cm5cbiAgICBsZXQgYnVmZmVyID0gdGhpcy5idWZmZXJzLnNoaWZ0KClcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCA8IDggKiB0aGlzLm1vdmluZ0JvZGllcy5sZW5ndGgpIHtcbiAgICAgIGxldCBsZW4gPSBidWZmZXIubGVuZ3RoXG4gICAgICB3aGlsZSAobGVuIDwgOCAqIHRoaXMubW92aW5nQm9kaWVzLmxlbmd0aCkge1xuICAgICAgICBsZW4gKj0gMlxuICAgICAgfVxuICAgICAgbGV0IGJvZHMgPSB0aGlzLm1vdmluZ0JvZGllc1xuICAgICAgbGV0IGIgPSBuZXcgRmxvYXQ2NEFycmF5KGxlbilcbiAgICAgIGxldCB2ZWMgPSBUSFJFRS5WZWN0b3IzLnRlbXAoKVxuICAgICAgbGV0IHF1YXQgPSBUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKVxuICAgICAgYi5zZXQoYnVmZmVyKVxuICAgICAgZm9yIChsZXQgaSA9IGJ1ZmZlci5sZW5ndGggLyA4OyBpIDwgYm9kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcCA9IGkgKiA4XG4gICAgICAgIGlmIChib2RzW2ldKSB7XG4gICAgICAgICAgYm9kc1tpXS5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKHZlYylcbiAgICAgICAgICBiW3ArK10gPSB2ZWMueFxuICAgICAgICAgIGJbcCsrXSA9IHZlYy55XG4gICAgICAgICAgYltwKytdID0gdmVjLnpcbiAgICAgICAgICBwKytcbiAgICAgICAgICBib2RzW2ldLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxuICAgICAgICAgIGJbcCsrXSA9IHF1YXQueFxuICAgICAgICAgIGJbcCsrXSA9IHF1YXQueVxuICAgICAgICAgIGJbcCsrXSA9IHF1YXQuelxuICAgICAgICAgIGJbcCsrXSA9IHF1YXQud1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBidWZmZXIgPSBiXG4gICAgfVxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKGJ1ZmZlciwgW2J1ZmZlci5idWZmZXJdKVxuICB9LFxuXG4gIG9uTWVzc2FnZTogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS5kYXRhIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KSB7XG4gICAgICB0aGlzLmJ1ZmZlcnMucHVzaChlLmRhdGEpXG4gICAgICB3aGlsZSAodGhpcy5idWZmZXJzLmxlbmd0aCA+IDIpXG4gICAgICAgIHRoaXMuYnVmZmVycy5zaGlmdCgpXG4gICAgfVxuICB9XG59KVxuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJib2R5XCIsIHtcbiAgZGVwZW5kZW5jaWVzOiBbXCJwb3NpdGlvblwiLCBcInJvdGF0aW9uXCIsIFwic2NhbGVcIl0sXG5cbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcInN0YXRpY1wiIH1cbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IGJvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYm9kaWVzXG4gICAgbGV0IG1vdmluZ0JvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MubW92aW5nQm9kaWVzXG4gICAgbGV0IGJ1ZmZlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYnVmZmVyc1swXVxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICB0aGlzLmlkID0gYm9kaWVzLmluZGV4T2YobnVsbClcbiAgICBpZiAodGhpcy5pZCA8IDApIHRoaXMuaWQgPSBib2RpZXMubGVuZ3RoXG4gICAgYm9kaWVzW3RoaXMuaWRdID0gdGhpcy5lbFxuICAgIGlmICh0aGlzLmRhdGEudHlwZSAhPT0gXCJzdGF0aWNcIikge1xuICAgICAgdGhpcy5taWQgPSBtb3ZpbmdCb2RpZXMuaW5kZXhPZihudWxsKVxuICAgICAgaWYgKHRoaXMubWlkIDwgMCkgdGhpcy5taWQgPSBtb3ZpbmdCb2RpZXMubGVuZ3RoXG4gICAgICBtb3ZpbmdCb2RpZXNbdGhpcy5taWRdID0gdGhpcy5lbFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWlkID0gbnVsbFxuICAgIH1cbiAgICBsZXQgYm9keSA9IHsgbWlkOiB0aGlzLm1pZCB9XG4gICAgYm9keS50eXBlID0gdGhpcy5kYXRhLnR5cGVcbiAgICBib2R5LnBvc2l0aW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKFRIUkVFLlZlY3RvcjMudGVtcCgpKVxuICAgIGJvZHkucXVhdGVybmlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgIGlmICh0aGlzLm1pZCAhPT0gbnVsbCkge1xuICAgICAgbGV0IHAgPSB0aGlzLm1pZCAqIDhcbiAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3NpdGlvbi54XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zaXRpb24ueVxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnBvc2l0aW9uLnpcbiAgICAgIHArK1xuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueFxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueVxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24uelxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ud1xuICAgIH1cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIGNyZWF0ZSBcIiArIHN0cmluZ2lmeShib2R5KSlcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiB0eXBlID0gXCIgKyBzdHJpbmdpZnkodGhpcy5kYXRhLnR5cGUpKVxuICB9LFxuXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBzbGVlcGluZyA9IGZhbHNlXCIpXG4gIH0sXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgc2xlZXBpbmcgPSB0cnVlXCIpXG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IGJvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYm9kaWVzXG4gICAgbGV0IG1vdmluZ0JvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MubW92aW5nQm9kaWVzXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIGJvZGllc1t0aGlzLmlkXSA9IG51bGxcbiAgICBpZiAodGhpcy5taWQgIT09IG51bGwpXG4gICAgICBtb3ZpbmdCb2RpZXNbdGhpcy5taWRdID0gbnVsbFxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgcmVtb3ZlXCIpXG4gIH0sXG5cbiAgdGljazogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBidWZmZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmJ1ZmZlcnNbMF1cbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgaWYgKHRoaXMubWlkICE9PSBudWxsKSB7XG4gICAgICBsZXQgcCA9IHRoaXMubWlkICogOFxuICAgICAgaWYgKHRoaXMuZGF0YS50eXBlID09PSBcImtpbmVtYXRpY1wiKSB7XG4gICAgICAgIGxldCB2ZWMgPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oVEhSRUUuVmVjdG9yMy50ZW1wKCkpXG4gICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnhcbiAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMueVxuICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy56XG4gICAgICAgIHArK1xuICAgICAgICBsZXQgcXVhdCA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueFxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueVxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQuelxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQud1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHF1YXQgPSBUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKVxuXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucG9zaXRpb24uc2V0KGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10pXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucGFyZW50LndvcmxkVG9Mb2NhbCh0aGlzLmVsLm9iamVjdDNELnBvc2l0aW9uKVxuICAgICAgICBwKytcblxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnF1YXRlcm5pb24ubXVsdGlwbHkocXVhdC5jb25qdWdhdGUoKS5ub3JtYWxpemUoKSlcbiAgICAgICAgcXVhdC5zZXQoYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10pXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucXVhdGVybmlvbi5tdWx0aXBseShxdWF0Lm5vcm1hbGl6ZSgpKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KFwic2hhcGVcIiwge1xuICBkZXBlbmRlbmNpZXM6IFtcImJvZHlcIl0sXG4gIG11bHRpcGxlOiB0cnVlLFxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHQ6IFwiYm94XCIgfSxcbiAgICBzaXplOiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IC0xLCB5OiAtMSwgejogLTEgfSB9LFxuICAgIHBvc09mZnNldDogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAwLCB6OiAwIH0gfSxcbiAgICByb3RPZmZzZXQ6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMCwgeTogMCwgejogMCB9IH0sXG4gICAgZGVuc2l0eTogeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAxIH0sXG4gICAgZnJpY3Rpb246IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMC4yIH0sXG4gICAgcmVzdGl0dXRpb246IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMC4yIH0sXG4gICAgYmVsb25nc1RvOiB7IHR5cGU6IFwiaW50XCIsIGRlZmF1bHQ6IDEgfSxcbiAgICBjb2xsaWRlc1dpdGg6IHsgdHlwZTogXCJpbnRcIiwgZGVmYXVsdDogMHhmZmZmZmZmZiB9LFxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5lbC5ib2R5KSByZXR1cm4gc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZSgpLCAyNTYpXG4gICAgaWYgKCF0aGlzLnNoYXBlKSB7XG4gICAgICBsZXQgc2MgPSBuZXcgT0lNTy5TaGFwZUNvbmZpZygpXG4gICAgICBzd2l0Y2ggKHRoaXMuZGF0YS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJib3hcIjpcbiAgICAgICAgICB0aGlzLnNoYXBlID0gbmV3IE9JTU8uQm94KHNjLCAxLCAxLCAxKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJjeWxpbmRlclwiOlxuICAgICAgICAgIHRoaXMuc2hhcGUgPSBuZXcgT0lNTy5DeWxpbmRlcihzYywgMSwgMSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwic3BoZXJlXCI6XG4gICAgICAgICAgdGhpcy5zaGFwZSA9IG5ldyBPSU1PLlNwaGVyZShzYywgMSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwicGxhbmVcIjpcbiAgICAgICAgICB0aGlzLnNoYXBlID0gbmV3IE9JTU8uUGxhbmUoc2MpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWwuYm9keS5hZGRTaGFwZSh0aGlzLnNoYXBlKVxuICAgIH1cbiAgICB0aGlzLnNoYXBlLmRlbnNpdHkgPSB0aGlzLmRhdGEuZGVuc2l0eVxuICAgIHRoaXMuc2hhcGUuZnJpY3Rpb24gPSB0aGlzLmRhdGEuZnJpY3Rpb25cbiAgICB0aGlzLnNoYXBlLnJlc3RpdHV0aW9uID0gdGhpcy5kYXRhLnJlc3RpdHV0aW9uXG4gICAgdGhpcy5zaGFwZS5iZWxvbmdzVG8gPSB0aGlzLmRhdGEuYmVsb25nc1RvXG4gICAgdGhpcy5zaGFwZS5jb2xsaWRlc1dpdGggPSB0aGlzLmRhdGEuY29sbGlkZXNXaXRoXG4gICAgdGhpcy5zaGFwZS5yZWxhdGl2ZVBvc2l0aW9uLmNvcHkodGhpcy5kYXRhLnBvc09mZnNldClcbiAgICBpZiAodGhpcy5kYXRhLnJvdE9mZnNldC54IHx8IHRoaXMuZGF0YS5yb3RPZmZzZXQueSB8fCB0aGlzLmRhdGEucm90T2Zmc2V0LnopIGNvbnNvbGUud2FybihcInJvdE9mZnNldCBwcm9wZXJ0eSBub3QgeWV0IGltcGVtZW50ZWQhXCIpXG4gICAgLy8gdGhpcy5zaGFwZS5yZWxhdGl2ZVJvdGF0aW9uLmNvcHkodGhpcy5kYXRhLnJvdE9mZnNldClcblxuICAgIGxldCBzY2FsZSA9IFRIUkVFLlZlY3RvcjMucmV1c2UoKVxuICAgIGxldCBzaXplID0gVEhSRUUuVmVjdG9yMy5yZXVzZSgpLmNvcHkodGhpcy5kYXRhLnNpemUpXG4gICAgaWYgKHNpemUueCA8IDApIHtcbiAgICAgIHNpemUuc2V0KDEsIDEsIDEpXG4gICAgICBsZXQgbWVzaCA9IHRoaXMuZWwuZ2V0T2JqZWN0M0QoXCJtZXNoXCIpXG4gICAgICBpZiAobWVzaCAmJiBtZXNoLmdlb21ldHJ5KSB7XG4gICAgICAgIG1lc2guZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KClcbiAgICAgICAgbGV0IGJveCA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3hcbiAgICAgICAgc2l6ZS5jb3B5KGJveC5tYXgpLnN1Yihib3gubWluKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwibW9kZWwtbG9hZGVkXCIsIHRoaXMudXBkYXRlLmJpbmQodGhpcykpXG4gICAgICB9XG4gICAgfVxuICAgIHNpemUubXVsdGlwbHkodGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFNjYWxlKHNjYWxlKSlcbiAgICBzd2l0Y2ggKHRoaXMuZGF0YS50eXBlKSB7XG4gICAgICBjYXNlIFwiYm94XCI6XG4gICAgICAgIHRoaXMuc2hhcGUud2lkdGggPSBzaXplLnhcbiAgICAgICAgdGhpcy5zaGFwZS5oZWlnaHQgPSBzaXplLnlcbiAgICAgICAgdGhpcy5zaGFwZS5kZXB0aCA9IHNpemUuelxuICAgICAgICB0aGlzLnNoYXBlLmhhbGZXaWR0aCA9IHNpemUueCAvIDJcbiAgICAgICAgdGhpcy5zaGFwZS5oYWxmSGVpZ2h0ID0gc2l6ZS55IC8gMlxuICAgICAgICB0aGlzLnNoYXBlLmhhbGZEZXB0aCA9IHNpemUueiAvIDJcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJjeWxpbmRlclwiOlxuICAgICAgICBzaXplLnggPSAoc2l6ZS54ICsgc2l6ZS56KSAvIDRcbiAgICAgICAgdGhpcy5zaGFwZS5yYWRpdXMgPSBzaXplLnhcbiAgICAgICAgdGhpcy5zaGFwZS5oZWlnaHQgPSBzaXplLnlcbiAgICAgICAgdGhpcy5zaGFwZS5oYWxmSGVpZ2h0ID0gc2l6ZS55IC8gMlxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcInNwaGVyZVwiOlxuICAgICAgICBzaXplLnggPSAoc2l6ZS54ICsgc2l6ZS55ICsgc2l6ZS56KSAvIDZcbiAgICAgICAgdGhpcy5zaGFwZS5yYWRpdXMgPSBzaXplLnhcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgdGhpcy5lbC5ib2R5LnNldHVwTWFzcyh0aGlzLmVsLmJvZHkudHlwZSlcblxuICAgIHNpemUucmVjeWNsZSgpXG4gICAgc2NhbGUucmVjeWNsZSgpXG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc2hhcGUpIHRoaXMuZWwuYm9keS5yZW1vdmVTaGFwZSh0aGlzLnNoYXBlKVxuICAgIHRoaXMuc2hhcGUgPSBudWxsXG4gIH1cbn0pXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcImpvaW50XCIsIHtcbiAgZGVwZW5kZW5jaWVzOiBbXCJib2R5XCIsIFwic2hhcGVcIl0sXG5cbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcInByaXNtZVwiIH0sXG4gICAgd2l0aDogeyB0eXBlOiBcInNlbGVjdG9yXCIsIGRlZmF1bHQ6IFwiW2JvZHldXCIgfSxcbiAgICBtaW46IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMCB9LFxuICAgIG1heDogeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAwIH0sXG4gICAgcG9zMTogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAwLCB6OiAwIH0gfSxcbiAgICBwb3MyOiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDAsIHk6IDAsIHo6IDAgfSB9LFxuICAgIGF4ZTE6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMSwgeTogMCwgejogMCB9IH0sXG4gICAgYXhlMjogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAxLCB5OiAwLCB6OiAwIH0gfSxcbiAgICBjb2xsaXNpb246IHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IGZhbHNlIH0sXG4gICAgbGltaXQ6IHsgdHlwZTogXCJhcnJheVwiIH0sXG4gICAgbW90b3I6IHsgdHlwZTogXCJhcnJheVwiIH0sXG4gICAgc3ByaW5nOiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5lbC5ib2R5KSByZXR1cm4gc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZSgpLCAyNTYpXG4gICAgaWYgKCF0aGlzLmRhdGEud2l0aC5ib2R5KSByZXR1cm4gc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZSgpLCAyNTYpXG4gICAgaWYgKCF0aGlzLmpvaW50KSB7XG4gICAgICBsZXQgamMgPSBuZXcgT0lNTy5Kb2ludENvbmZpZygpXG4gICAgICBqYy5ib2R5MSA9IHRoaXMuZWwuYm9keVxuICAgICAgamMuYm9keTIgPSB0aGlzLmRhdGEud2l0aC5ib2R5XG4gICAgICBsZXQgZGVnMnJhZCA9IE1hdGguUEkgLyAxODBcbiAgICAgIHN3aXRjaCAodGhpcy5kYXRhLnR5cGUpIHtcbiAgICAgICAgY2FzZSBcImRpc3RhbmNlXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLkRpc3RhbmNlSm9pbnQoamMsIHRoaXMuZGF0YS5taW4sIHRoaXMuZGF0YS5tYXgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcImhpbmdlXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLkhpbmdlSm9pbnQoamMsIHRoaXMuZGF0YS5taW4gKiBkZWcycmFkLCB0aGlzLmRhdGEubWF4ICogZGVnMnJhZClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwicHJpc21lXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLlByaXNtYXRpY0pvaW50KGpjLCB0aGlzLmRhdGEubWluICogZGVnMnJhZCwgdGhpcy5kYXRhLm1heCAqIGRlZzJyYWQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInNsaWRlXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLlNsaWRlckpvaW50KGpjLCB0aGlzLmRhdGEubWluLCB0aGlzLmRhdGEubWF4KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJiYWxsXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLkJhbGxBbmRTb2NrZXRKb2ludChqYylcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwid2hlZWxcIjpcbiAgICAgICAgICB0aGlzLmpvaW50ID0gbmV3IE9JTU8uV2hlZWxKb2ludChqYylcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgdGhpcy5lbC5zY2VuZUVsLnBoeXNpY3NXb3JsZC5hZGRKb2ludCh0aGlzLmpvaW50KVxuICAgIH1cbiAgICB0aGlzLmpvaW50LmxvY2FsQW5jaG9yUG9pbnQxLmNvcHkodGhpcy5kYXRhLnBvczEpXG4gICAgdGhpcy5qb2ludC5sb2NhbEFuY2hvclBvaW50Mi5jb3B5KHRoaXMuZGF0YS5wb3MyKVxuICAgIGlmICh0aGlzLmpvaW50LmxvY2FsQXhpczEpIHtcbiAgICAgIHRoaXMuam9pbnQubG9jYWxBeGlzMS5jb3B5KHRoaXMuZGF0YS5heGUxKVxuICAgICAgdGhpcy5qb2ludC5sb2NhbEF4aXMyLmNvcHkodGhpcy5kYXRhLmF4ZTIpXG4gICAgfVxuICAgIHRoaXMuam9pbnQuYWxsb3dDb2xsaXNpb24gPSB0aGlzLmRhdGEuY29sbGlzaW9uXG5cbiAgICBsZXQgbG0gPSB0aGlzLmpvaW50LnJvdGF0aW9uYWxMaW1pdE1vdG9yMSB8fCB0aGlzLmpvaW50LmxpbWl0TW90b3JcbiAgICAvLyBpZiAodGhpcy5kYXRhLmxpbWl0Lmxlbmd0aCA9PSAyKVxuICAgIGxtLnNldExpbWl0KHBhcnNlRmxvYXQodGhpcy5kYXRhLmxpbWl0WzBdKSB8fCAwLCBwYXJzZUZsb2F0KHRoaXMuZGF0YS5saW1pdFsxXSkgfHwgMClcbiAgICAvLyBpZiAodGhpcy5kYXRhLm1vdG9yLmxlbmd0aCA9PSAyKVxuICAgIGxtLnNldE1vdG9yKHBhcnNlRmxvYXQodGhpcy5kYXRhLm1vdG9yWzBdKSB8fCAwLCBwYXJzZUZsb2F0KHRoaXMuZGF0YS5tb3RvclsxXSkgfHwgMClcbiAgICAvLyBpZiAodGhpcy5kYXRhLnNwcmluZy5sZW5ndGggPT0gMilcbiAgICBsbS5zZXRTcHJpbmcocGFyc2VGbG9hdCh0aGlzLmRhdGEuc3ByaW5nWzBdKSB8fCAwLCBwYXJzZUZsb2F0KHRoaXMuZGF0YS5zcHJpbmdbMV0pIHx8IDApXG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuam9pbnQpIHtcbiAgICAgIHRoaXMuam9pbnQuYm9keTEuYXdha2UoKVxuICAgICAgdGhpcy5qb2ludC5ib2R5Mi5hd2FrZSgpXG4gICAgICB0aGlzLmpvaW50LnJlbW92ZSgpXG4gICAgfVxuICAgIHRoaXMuam9pbnQgPSBudWxsXG4gIH0sXG5cbn0pXG5cbiIsInJlcXVpcmUoXCIuL2xpYnMvcG9vbHNcIilcclxucmVxdWlyZShcIi4vbGlicy9jb3B5V29ybGRQb3NSb3RcIilcclxuXHJcbnJlcXVpcmUoXCIuL2NvbXBvbmVudHMvaW5jbHVkZVwiKVxyXG5yZXF1aXJlKFwiLi9jb21wb25lbnRzL3BoeXNpY3NcIilcclxuIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuXHJcbkFGUkFNRS5BRW50aXR5LnByb3RvdHlwZS5jb3B5V29ybGRQb3NSb3QgPSBmdW5jdGlvbiAoc3JjRWwpIHtcclxuICBsZXQgcXVhdCA9IFRIUkVFLlF1YXRlcm5pb24udGVtcCgpXHJcbiAgbGV0IHNyYyA9IHNyY0VsLm9iamVjdDNEXHJcbiAgbGV0IGRlc3QgPSB0aGlzLm9iamVjdDNEXHJcbiAgaWYgKCFzcmMpIHJldHVyblxyXG4gIGlmICghZGVzdCkgcmV0dXJuXHJcbiAgaWYgKCFkZXN0LnBhcmVudCkgcmV0dXJuXHJcbiAgc3JjLmdldFdvcmxkUG9zaXRpb24oZGVzdC5wb3NpdGlvbilcclxuICBkZXN0LnBhcmVudC53b3JsZFRvTG9jYWwoZGVzdC5wb3NpdGlvbilcclxuXHJcbiAgZGVzdC5nZXRXb3JsZFF1YXRlcm5pb24ocXVhdClcclxuICBkZXN0LnF1YXRlcm5pb24ubXVsdGlwbHkocXVhdC5jb25qdWdhdGUoKS5ub3JtYWxpemUoKSlcclxuICBzcmMuZ2V0V29ybGRRdWF0ZXJuaW9uKHF1YXQpXHJcbiAgZGVzdC5xdWF0ZXJuaW9uLm11bHRpcGx5KHF1YXQubm9ybWFsaXplKCkpXHJcbn0iLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xyXG5cclxuZnVuY3Rpb24gbWFrZVBvb2woQ2xhc3MpIHtcclxuICBDbGFzcy5fcG9vbCA9IFtdXHJcbiAgQ2xhc3MuX2luVXNlID0gW11cclxuICBDbGFzcy50ZW1wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IHYgPSBDbGFzcy5fcG9vbC5wb3AoKSB8fCBuZXcgQ2xhc3MoKVxyXG4gICAgQ2xhc3MuX2luVXNlLnB1c2godilcclxuICAgIGlmICghQ2xhc3MuX2djKVxyXG4gICAgICBDbGFzcy5fZ2MgPSBzZXRUaW1lb3V0KENsYXNzLl9yZWN5Y2xlKVxyXG4gICAgcmV0dXJuIHZcclxuICB9XHJcbiAgQ2xhc3MuX3JlY3ljbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB3aGlsZSAoQ2xhc3MuX2luVXNlLmxlbmd0aClcclxuICAgICAgQ2xhc3MuX3Bvb2wucHVzaChDbGFzcy5faW5Vc2UucG9wKCkpXHJcbiAgICBDbGFzcy5fZ2MgPSBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxubWFrZVBvb2woVEhSRUUuVmVjdG9yMilcclxubWFrZVBvb2woVEhSRUUuVmVjdG9yMylcclxubWFrZVBvb2woVEhSRUUuUXVhdGVybmlvbilcclxubWFrZVBvb2woVEhSRUUuTWF0cml4MylcclxubWFrZVBvb2woVEhSRUUuTWF0cml4NClcclxuIl19
