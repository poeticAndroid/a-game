(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
/* global AFRAME, THREE, OIMO */

const cmd = require("../libs/cmdCodec")

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
      this.worker.postMessage("world gravity = " + cmd.stringifyParam(this.data.gravity))
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

  command: function (params) {
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
  }
})

AFRAME.registerComponent("body", {
  dependencies: ["position", "rotation", "scale"],

  schema: {
    type: { type: "string", default: "static" },
    belongsTo: { type: "int", default: 1 },
    collidesWith: { type: "int", default: 0xffffffff },
    emitsWith: { type: "int", default: 0 },
    sleeping: { type: "boolean", default: false },
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
      buffer[p++] = this.data.sleeping
      buffer[p++] = body.quaternion.x
      buffer[p++] = body.quaternion.y
      buffer[p++] = body.quaternion.z
      buffer[p++] = body.quaternion.w
    }
    this.shapes = []
    this.sleeping = true
    worker.postMessage("world body " + this.id + " create " + cmd.stringifyParam(body))

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

  update: function (oldData) {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    if (this.data.type !== oldData.type)
      worker.postMessage("world body " + this.id + " type = " + cmd.stringifyParam(this.data.type))
    if (this.data.belongsTo !== oldData.belongsTo)
      worker.postMessage("world body " + this.id + " belongsTo = " + cmd.stringifyParam(this.data.belongsTo))
    if (this.data.collidesWith !== oldData.collidesWith)
      worker.postMessage("world body " + this.id + " collidesWith = " + cmd.stringifyParam(this.data.collidesWith))
    if (this.data.emitsWith !== oldData.emitsWith)
      worker.postMessage("world body " + this.id + " emitsWith = " + cmd.stringifyParam(this.data.emitsWith))
    // if (this.data.sleeping !== oldData.sleeping)
    worker.postMessage("world body " + this.id + " sleeping = " + !!(this.data.sleeping))
  },

  pause: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    if (!worker) return
    worker.postMessage("world body " + this.id + " sleeping = true")
    this.sleeping = true
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

  command: function (params) {
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
  }
})

AFRAME.registerComponent("shape", {
  dependencies: ["body"],
  multiple: true,
  schema: {
    type: { type: "string", default: "box" },
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

    worker.postMessage("world body " + this.bodyId + " shape " + this.id + " create " + cmd.stringifyParam(shape))
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


},{"../libs/cmdCodec":4}],3:[function(require,module,exports){
require("./libs/pools")
require("./libs/copyWorldPosRot")

require("./components/include")
require("./components/physics")

},{"./components/include":1,"./components/physics":2,"./libs/copyWorldPosRot":5,"./libs/pools":6}],4:[function(require,module,exports){
module.exports = {
  parse: function (cmd) {
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
  stringifyParam: function (val) {
    return JSON.stringify(val).replaceAll(" ", "\\u0020").replaceAll("\"_", "\"")
  }
}
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbmNsdWRlLmpzIiwic3JjL2NvbXBvbmVudHMvcGh5c2ljcy5qcyIsInNyYy9nYW1lZnJhbWUuanMiLCJzcmMvbGlicy9jbWRDb2RlYy5qcyIsInNyYy9saWJzL2NvcHlXb3JsZFBvc1JvdC5qcyIsInNyYy9saWJzL3Bvb2xzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cblxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KFwiaW5jbHVkZVwiLCB7XG4gIHNjaGVtYTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXG5cbiAgdXBkYXRlOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZGF0YSAmJiAhdGhpcy5lbC5zY2VuZUVsLl9pbmNsdWRpbmdfKSB7XG4gICAgICB0aGlzLmVsLnNjZW5lRWwuX2luY2x1ZGluZ18gPSB0cnVlXG4gICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLmRhdGEpXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHRoaXMuZWwub3V0ZXJIVE1MID0gYXdhaXQgKHJlc3BvbnNlKS50ZXh0KClcbiAgICAgIGVsc2UgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoXCJpbmNsdWRlXCIpXG4gICAgICB0aGlzLmVsLnNjZW5lRWwuX2luY2x1ZGluZ18gPSBmYWxzZVxuICAgICAgbGV0IG5leHQgPSB0aGlzLmVsLnNjZW5lRWwucXVlcnlTZWxlY3RvcihcIltpbmNsdWRlXVwiKVxuICAgICAgaWYgKG5leHQpIG5leHQuY29tcG9uZW50cy5pbmNsdWRlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG59KVxuIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUsIE9JTU8gKi9cblxuY29uc3QgY21kID0gcmVxdWlyZShcIi4uL2xpYnMvY21kQ29kZWNcIilcblxuQUZSQU1FLnJlZ2lzdGVyU3lzdGVtKFwicGh5c2ljc1wiLCB7XG4gIHNjaGVtYToge1xuICAgIHdvcmtlclVybDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXG4gICAgZ3Jhdml0eTogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAtOS44LCB6OiAwIH0gfSxcbiAgICBkZWJ1ZzogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRhdGEud29ya2VyVXJsKSB7XG4gICAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih0aGlzLmRhdGEud29ya2VyVXJsKVxuICAgICAgICB0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpKVxuICAgICAgfVxuICAgICAgdGhpcy5ib2RpZXMgPSB0aGlzLmJvZGllcyB8fCBbXVxuICAgICAgdGhpcy5tb3ZpbmdCb2RpZXMgPSB0aGlzLm1vdmluZ0JvZGllcyB8fCBbXVxuICAgICAgdGhpcy5idWZmZXJzID0gW25ldyBGbG9hdDY0QXJyYXkoOCksIG5ldyBGbG9hdDY0QXJyYXkoOCldXG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGdyYXZpdHkgPSBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbSh0aGlzLmRhdGEuZ3Jhdml0eSkpXG4gICAgICB0aGlzLl9kZWJ1ZyA9IHRoaXMuZGF0YS5kZWJ1Z1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZSgpXG4gICAgfVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMud29ya2VyICYmIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpXG4gICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgdGhpcy5ib2RpZXMgPSBbXVxuICAgIHRoaXMubW92aW5nQm9kaWVzID0gW11cbiAgfSxcblxuICB0aWNrOiBmdW5jdGlvbiAodGltZSwgdGltZURlbHRhKSB7XG4gICAgaWYgKCF0aGlzLndvcmtlcikgcmV0dXJuXG4gICAgaWYgKHRoaXMuYnVmZmVycy5sZW5ndGggPCAyKSByZXR1cm5cbiAgICBsZXQgYnVmZmVyID0gdGhpcy5idWZmZXJzLnNoaWZ0KClcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCA8IDggKiB0aGlzLm1vdmluZ0JvZGllcy5sZW5ndGgpIHtcbiAgICAgIGxldCBsZW4gPSBidWZmZXIubGVuZ3RoXG4gICAgICB3aGlsZSAobGVuIDwgOCAqIHRoaXMubW92aW5nQm9kaWVzLmxlbmd0aCkge1xuICAgICAgICBsZW4gKj0gMlxuICAgICAgfVxuICAgICAgbGV0IGJvZHMgPSB0aGlzLm1vdmluZ0JvZGllc1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0NjRBcnJheShsZW4pXG4gICAgICBidWZmZXIuZmlsbChOYU4pXG4gICAgICBsZXQgdmVjID0gVEhSRUUuVmVjdG9yMy50ZW1wKClcbiAgICAgIGxldCBxdWF0ID0gVEhSRUUuUXVhdGVybmlvbi50ZW1wKClcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcCA9IGkgKiA4XG4gICAgICAgIGlmIChib2RzW2ldKSB7XG4gICAgICAgICAgYm9kc1tpXS5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKHZlYylcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy54XG4gICAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMueVxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnpcbiAgICAgICAgICBwKytcbiAgICAgICAgICBib2RzW2ldLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gcXVhdC54XG4gICAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnlcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQuelxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gcXVhdC53XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoYnVmZmVyLCBbYnVmZmVyLmJ1ZmZlcl0pXG4gIH0sXG5cbiAgb25NZXNzYWdlOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0eXBlb2YgZS5kYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBsZXQgY29tbWFuZCA9IGNtZC5wYXJzZShlLmRhdGEpXG4gICAgICBzd2l0Y2ggKGNvbW1hbmQuc2hpZnQoKSkge1xuICAgICAgICBjYXNlIFwid29ybGRcIjpcbiAgICAgICAgICB0aGlzLmNvbW1hbmQoY29tbWFuZClcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChlLmRhdGEgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpIHtcbiAgICAgIHRoaXMuYnVmZmVycy5wdXNoKGUuZGF0YSlcbiAgICAgIHdoaWxlICh0aGlzLmJ1ZmZlcnMubGVuZ3RoID4gMilcbiAgICAgICAgdGhpcy5idWZmZXJzLnNoaWZ0KClcbiAgICB9XG4gIH0sXG5cbiAgY29tbWFuZDogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgICBwYXJhbXMuc2hpZnQoKVxuICAgIH1cbiAgICBzd2l0Y2ggKHBhcmFtcy5zaGlmdCgpKSB7XG4gICAgICBjYXNlIFwiYm9keVwiOlxuICAgICAgICBsZXQgaWQgPSBwYXJhbXMuc2hpZnQoKVxuICAgICAgICBsZXQgYm9keSA9IHRoaXMuYm9kaWVzW2lkXVxuICAgICAgICBpZiAoYm9keSlcbiAgICAgICAgICBib2R5LmNvbXBvbmVudHMuYm9keS5jb21tYW5kKHBhcmFtcylcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbn0pXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcImJvZHlcIiwge1xuICBkZXBlbmRlbmNpZXM6IFtcInBvc2l0aW9uXCIsIFwicm90YXRpb25cIiwgXCJzY2FsZVwiXSxcblxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHQ6IFwic3RhdGljXCIgfSxcbiAgICBiZWxvbmdzVG86IHsgdHlwZTogXCJpbnRcIiwgZGVmYXVsdDogMSB9LFxuICAgIGNvbGxpZGVzV2l0aDogeyB0eXBlOiBcImludFwiLCBkZWZhdWx0OiAweGZmZmZmZmZmIH0sXG4gICAgZW1pdHNXaXRoOiB7IHR5cGU6IFwiaW50XCIsIGRlZmF1bHQ6IDAgfSxcbiAgICBzbGVlcGluZzogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfSxcbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IGJvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYm9kaWVzXG4gICAgbGV0IG1vdmluZ0JvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MubW92aW5nQm9kaWVzXG4gICAgbGV0IGJ1ZmZlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYnVmZmVyc1swXVxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICB0aGlzLmlkID0gYm9kaWVzLmluZGV4T2YobnVsbClcbiAgICBpZiAodGhpcy5pZCA8IDApIHRoaXMuaWQgPSBib2RpZXMubGVuZ3RoXG4gICAgYm9kaWVzW3RoaXMuaWRdID0gdGhpcy5lbFxuICAgIGlmICh0aGlzLmRhdGEudHlwZSAhPT0gXCJzdGF0aWNcIikge1xuICAgICAgdGhpcy5taWQgPSBtb3ZpbmdCb2RpZXMuaW5kZXhPZihudWxsKVxuICAgICAgaWYgKHRoaXMubWlkIDwgMCkgdGhpcy5taWQgPSBtb3ZpbmdCb2RpZXMubGVuZ3RoXG4gICAgICBtb3ZpbmdCb2RpZXNbdGhpcy5taWRdID0gdGhpcy5lbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1pZCA9IG51bGxcbiAgICB9XG4gICAgbGV0IGJvZHkgPSB7IG1pZDogdGhpcy5taWQgfVxuICAgIGJvZHkudHlwZSA9IHRoaXMuZGF0YS50eXBlXG4gICAgYm9keS5wb3NpdGlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbihUSFJFRS5WZWN0b3IzLnRlbXAoKSlcbiAgICBib2R5LnF1YXRlcm5pb24gPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKSlcbiAgICBpZiAodGhpcy5taWQgIT09IG51bGwpIHtcbiAgICAgIGxldCBwID0gdGhpcy5taWQgKiA4XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zaXRpb24ueFxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnBvc2l0aW9uLnlcbiAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3NpdGlvbi56XG4gICAgICBidWZmZXJbcCsrXSA9IHRoaXMuZGF0YS5zbGVlcGluZ1xuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueFxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueVxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24uelxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ud1xuICAgIH1cbiAgICB0aGlzLnNoYXBlcyA9IFtdXG4gICAgdGhpcy5zbGVlcGluZyA9IHRydWVcbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIGNyZWF0ZSBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbShib2R5KSlcblxuICAgIGlmICghdGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJzaGFwZVwiKSkge1xuICAgICAgaWYgKHRoaXMuZWwuZmlyc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgbGV0IGVscyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbChcImEtYm94LCBhLXNwaGVyZSwgYS1jeWxpbmRlclwiKVxuICAgICAgICBpZiAoZWxzKVxuICAgICAgICAgIGVscy5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGlmICghZWwuZ2V0QXR0cmlidXRlKFwic2hhcGVcIikpIGVsLnNldEF0dHJpYnV0ZShcInNoYXBlXCIsIHRydWUpXG4gICAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKFwic2hhcGVcIiwgdHJ1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAob2xkRGF0YSkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICBpZiAodGhpcy5kYXRhLnR5cGUgIT09IG9sZERhdGEudHlwZSlcbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgdHlwZSA9IFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKHRoaXMuZGF0YS50eXBlKSlcbiAgICBpZiAodGhpcy5kYXRhLmJlbG9uZ3NUbyAhPT0gb2xkRGF0YS5iZWxvbmdzVG8pXG4gICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIGJlbG9uZ3NUbyA9IFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKHRoaXMuZGF0YS5iZWxvbmdzVG8pKVxuICAgIGlmICh0aGlzLmRhdGEuY29sbGlkZXNXaXRoICE9PSBvbGREYXRhLmNvbGxpZGVzV2l0aClcbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgY29sbGlkZXNXaXRoID0gXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0odGhpcy5kYXRhLmNvbGxpZGVzV2l0aCkpXG4gICAgaWYgKHRoaXMuZGF0YS5lbWl0c1dpdGggIT09IG9sZERhdGEuZW1pdHNXaXRoKVxuICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBlbWl0c1dpdGggPSBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbSh0aGlzLmRhdGEuZW1pdHNXaXRoKSlcbiAgICAvLyBpZiAodGhpcy5kYXRhLnNsZWVwaW5nICE9PSBvbGREYXRhLnNsZWVwaW5nKVxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgc2xlZXBpbmcgPSBcIiArICEhKHRoaXMuZGF0YS5zbGVlcGluZykpXG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBzbGVlcGluZyA9IHRydWVcIilcbiAgICB0aGlzLnNsZWVwaW5nID0gdHJ1ZVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBib2RpZXMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmJvZGllc1xuICAgIGxldCBtb3ZpbmdCb2RpZXMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLm1vdmluZ0JvZGllc1xuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICBib2RpZXNbdGhpcy5pZF0gPSBudWxsXG4gICAgaWYgKHRoaXMubWlkICE9PSBudWxsKVxuICAgICAgbW92aW5nQm9kaWVzW3RoaXMubWlkXSA9IG51bGxcbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIHJlbW92ZVwiKVxuICB9LFxuXG4gIHRpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBsZXQgYnVmZmVyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5idWZmZXJzWzBdXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIGlmICh0aGlzLm1pZCAhPT0gbnVsbCkge1xuICAgICAgbGV0IHAgPSB0aGlzLm1pZCAqIDhcbiAgICAgIGlmIChidWZmZXIubGVuZ3RoIDw9IHApIHJldHVyblxuICAgICAgaWYgKHRoaXMuZGF0YS50eXBlID09PSBcImtpbmVtYXRpY1wiKSB7XG4gICAgICAgIGxldCB2ZWMgPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oVEhSRUUuVmVjdG9yMy50ZW1wKCkpXG4gICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnhcbiAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMueVxuICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy56XG4gICAgICAgIHRoaXMuc2xlZXBpbmcgPSAhIShidWZmZXJbcCsrXSlcbiAgICAgICAgbGV0IHF1YXQgPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKSlcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnhcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnlcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnpcbiAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LndcbiAgICAgIH0gZWxzZSBpZiAoYnVmZmVyW3AgKyAxXSkge1xuICAgICAgICBsZXQgcXVhdCA9IFRIUkVFLlF1YXRlcm5pb24udGVtcCgpXG5cbiAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5wb3NpdGlvbi5zZXQoYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSlcbiAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5wYXJlbnQud29ybGRUb0xvY2FsKHRoaXMuZWwub2JqZWN0M0QucG9zaXRpb24pXG4gICAgICAgIHRoaXMuc2xlZXBpbmcgPSAhIShidWZmZXJbcCsrXSlcblxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnF1YXRlcm5pb24ubXVsdGlwbHkocXVhdC5jb25qdWdhdGUoKS5ub3JtYWxpemUoKSlcbiAgICAgICAgcXVhdC5zZXQoYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10pXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucXVhdGVybmlvbi5tdWx0aXBseShxdWF0Lm5vcm1hbGl6ZSgpKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBjb21tYW5kOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgc3dpdGNoIChwYXJhbXMuc2hpZnQoKSkge1xuICAgICAgY2FzZSBcImVtaXRzXCI6XG4gICAgICAgIGxldCBlID0gcGFyYW1zLnNoaWZ0KClcbiAgICAgICAgc3dpdGNoIChlLmV2ZW50KSB7XG4gICAgICAgICAgY2FzZSBcImNvbGxpc2lvblwiOlxuICAgICAgICAgICAgbGV0IGJvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYm9kaWVzXG4gICAgICAgICAgICBlLmJvZHkxID0gYm9kaWVzW2UuYm9keTFdXG4gICAgICAgICAgICBlLmJvZHkyID0gYm9kaWVzW2UuYm9keTJdXG4gICAgICAgICAgICBpZiAoIWUuYm9keTEgfHwgIWUuYm9keTIpIHJldHVyblxuICAgICAgICAgICAgZS5zaGFwZTEgPSBlLmJvZHkxLmNvbXBvbmVudHMuYm9keS5zaGFwZXNbZS5zaGFwZTFdXG4gICAgICAgICAgICBlLnNoYXBlMiA9IGUuYm9keTIuY29tcG9uZW50cy5ib2R5LnNoYXBlc1tlLnNoYXBlMl1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbC5lbWl0KGUuZXZlbnQsIGUpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG59KVxuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJzaGFwZVwiLCB7XG4gIGRlcGVuZGVuY2llczogW1wiYm9keVwiXSxcbiAgbXVsdGlwbGU6IHRydWUsXG4gIHNjaGVtYToge1xuICAgIHR5cGU6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJib3hcIiB9LFxuICAgIGRlbnNpdHk6IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMSB9LFxuICAgIGZyaWN0aW9uOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAuMiB9LFxuICAgIHJlc3RpdHV0aW9uOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAuMiB9LFxuICAgIGJlbG9uZ3NUbzogeyB0eXBlOiBcImludFwiLCBkZWZhdWx0OiAxIH0sXG4gICAgY29sbGlkZXNXaXRoOiB7IHR5cGU6IFwiaW50XCIsIGRlZmF1bHQ6IDB4ZmZmZmZmZmYgfSxcbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5ib2R5ID0gdGhpcy5lbFxuICAgIHdoaWxlICh0aGlzLmJvZHkgJiYgIXRoaXMuYm9keS5tYXRjaGVzKFwiW2JvZHldXCIpKSB0aGlzLmJvZHkgPSB0aGlzLmJvZHkucGFyZW50RWxlbWVudFxuICAgIHRoaXMuYm9keUlkID0gdGhpcy5ib2R5LmNvbXBvbmVudHMuYm9keS5pZFxuXG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IHNoYXBlcyA9IHRoaXMuYm9keS5jb21wb25lbnRzLmJvZHkuc2hhcGVzXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIHRoaXMuaWQgPSBzaGFwZXMuaW5kZXhPZihudWxsKVxuICAgIGlmICh0aGlzLmlkIDwgMCkgdGhpcy5pZCA9IHNoYXBlcy5sZW5ndGhcbiAgICBzaGFwZXNbdGhpcy5pZF0gPSB0aGlzLmVsXG5cbiAgICBsZXQgc2hhcGUgPSB7fVxuICAgIHNoYXBlLnBvc2l0aW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKFRIUkVFLlZlY3RvcjMudGVtcCgpKVxuICAgIHRoaXMuYm9keS5vYmplY3QzRC53b3JsZFRvTG9jYWwoc2hhcGUucG9zaXRpb24pXG4gICAgc2hhcGUucXVhdGVybmlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgIGxldCBib2R5cXVhdCA9IHRoaXMuYm9keS5vYmplY3QzRC5nZXRXb3JsZFF1YXRlcm5pb24oVEhSRUUuUXVhdGVybmlvbi50ZW1wKCkpXG4gICAgc2hhcGUucXVhdGVybmlvbi5tdWx0aXBseShib2R5cXVhdC5jb25qdWdhdGUoKS5ub3JtYWxpemUoKSkubm9ybWFsaXplKClcbiAgICBzaGFwZS5zaXplID0gVEhSRUUuVmVjdG9yMy50ZW1wKCkuc2V0KDEsIDEsIDEpXG5cbiAgICBzd2l0Y2ggKHRoaXMuZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlIFwiYS1zcGhlcmVcIjpcbiAgICAgICAgc2hhcGUudHlwZSA9IFwic3BoZXJlXCJcbiAgICAgICAgc2hhcGUuc2l6ZS5tdWx0aXBseVNjYWxhcihwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwicmFkaXVzXCIpIHx8IDEpICogMilcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJhLWN5bGluZGVyXCI6XG4gICAgICAgIHNoYXBlLnR5cGUgPSBcImN5bGluZGVyXCJcbiAgICAgICAgc2hhcGUuc2l6ZS5tdWx0aXBseVNjYWxhcihwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwicmFkaXVzXCIpIHx8IDEpICogMikueSA9IHBhcnNlRmxvYXQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIikgfHwgMSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJhLWJveFwiOlxuICAgICAgICBzaGFwZS50eXBlID0gXCJib3hcIlxuICAgICAgICBzaGFwZS5zaXplLnNldChcbiAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwid2lkdGhcIikgfHwgMSksXG4gICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmVsLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKSB8fCAxKSxcbiAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwiZGVwdGhcIikgfHwgMSlcbiAgICAgICAgKVxuICAgICAgICBicmVha1xuICAgICAgLy8gY2FzZSBcImEtcGxhbmVcIjpcbiAgICAgIC8vICAgc2hhcGUudHlwZSA9IFwicGxhbmVcIlxuICAgICAgLy8gICBicmVha1xuICAgIH1cblxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmJvZHlJZCArIFwiIHNoYXBlIFwiICsgdGhpcy5pZCArIFwiIGNyZWF0ZSBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbShzaGFwZSkpXG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IHNoYXBlcyA9IHRoaXMuYm9keS5jb21wb25lbnRzLmJvZHkuc2hhcGVzXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuYm9keUlkICsgXCIgc2hhcGUgXCIgKyB0aGlzLmlkICsgXCIgcmVtb3ZlXCIpXG4gICAgc2hhcGVzW3RoaXMuaWRdID0gbnVsbFxuICB9XG59KVxuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJqb2ludFwiLCB7XG4gIGRlcGVuZGVuY2llczogW1wiYm9keVwiLCBcInNoYXBlXCJdLFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJwcmlzbWVcIiB9LFxuICAgIHdpdGg6IHsgdHlwZTogXCJzZWxlY3RvclwiLCBkZWZhdWx0OiBcIltib2R5XVwiIH0sXG4gICAgbWluOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAgfSxcbiAgICBtYXg6IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMCB9LFxuICAgIHBvczE6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMCwgeTogMCwgejogMCB9IH0sXG4gICAgcG9zMjogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAwLCB6OiAwIH0gfSxcbiAgICBheGUxOiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDEsIHk6IDAsIHo6IDAgfSB9LFxuICAgIGF4ZTI6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMSwgeTogMCwgejogMCB9IH0sXG4gICAgY29sbGlzaW9uOiB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiBmYWxzZSB9LFxuICAgIGxpbWl0OiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxuICAgIG1vdG9yOiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxuICAgIHNwcmluZzogeyB0eXBlOiBcImFycmF5XCIgfSxcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuZWwuYm9keSkgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSwgMjU2KVxuICAgIGlmICghdGhpcy5kYXRhLndpdGguYm9keSkgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSwgMjU2KVxuICAgIGlmICghdGhpcy5qb2ludCkge1xuICAgICAgbGV0IGpjID0gbmV3IE9JTU8uSm9pbnRDb25maWcoKVxuICAgICAgamMuYm9keTEgPSB0aGlzLmVsLmJvZHlcbiAgICAgIGpjLmJvZHkyID0gdGhpcy5kYXRhLndpdGguYm9keVxuICAgICAgbGV0IGRlZzJyYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgICBzd2l0Y2ggKHRoaXMuZGF0YS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJkaXN0YW5jZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5EaXN0YW5jZUpvaW50KGpjLCB0aGlzLmRhdGEubWluLCB0aGlzLmRhdGEubWF4KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJoaW5nZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5IaW5nZUpvaW50KGpjLCB0aGlzLmRhdGEubWluICogZGVnMnJhZCwgdGhpcy5kYXRhLm1heCAqIGRlZzJyYWQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInByaXNtZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5QcmlzbWF0aWNKb2ludChqYywgdGhpcy5kYXRhLm1pbiAqIGRlZzJyYWQsIHRoaXMuZGF0YS5tYXggKiBkZWcycmFkKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJzbGlkZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5TbGlkZXJKb2ludChqYywgdGhpcy5kYXRhLm1pbiwgdGhpcy5kYXRhLm1heClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwiYmFsbFwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5CYWxsQW5kU29ja2V0Sm9pbnQoamMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIndoZWVsXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLldoZWVsSm9pbnQoamMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWwuc2NlbmVFbC5waHlzaWNzV29ybGQuYWRkSm9pbnQodGhpcy5qb2ludClcbiAgICB9XG4gICAgdGhpcy5qb2ludC5sb2NhbEFuY2hvclBvaW50MS5jb3B5KHRoaXMuZGF0YS5wb3MxKVxuICAgIHRoaXMuam9pbnQubG9jYWxBbmNob3JQb2ludDIuY29weSh0aGlzLmRhdGEucG9zMilcbiAgICBpZiAodGhpcy5qb2ludC5sb2NhbEF4aXMxKSB7XG4gICAgICB0aGlzLmpvaW50LmxvY2FsQXhpczEuY29weSh0aGlzLmRhdGEuYXhlMSlcbiAgICAgIHRoaXMuam9pbnQubG9jYWxBeGlzMi5jb3B5KHRoaXMuZGF0YS5heGUyKVxuICAgIH1cbiAgICB0aGlzLmpvaW50LmFsbG93Q29sbGlzaW9uID0gdGhpcy5kYXRhLmNvbGxpc2lvblxuXG4gICAgbGV0IGxtID0gdGhpcy5qb2ludC5yb3RhdGlvbmFsTGltaXRNb3RvcjEgfHwgdGhpcy5qb2ludC5saW1pdE1vdG9yXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5saW1pdC5sZW5ndGggPT0gMilcbiAgICBsbS5zZXRMaW1pdChwYXJzZUZsb2F0KHRoaXMuZGF0YS5saW1pdFswXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEubGltaXRbMV0pIHx8IDApXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5tb3Rvci5sZW5ndGggPT0gMilcbiAgICBsbS5zZXRNb3RvcihwYXJzZUZsb2F0KHRoaXMuZGF0YS5tb3RvclswXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEubW90b3JbMV0pIHx8IDApXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5zcHJpbmcubGVuZ3RoID09IDIpXG4gICAgbG0uc2V0U3ByaW5nKHBhcnNlRmxvYXQodGhpcy5kYXRhLnNwcmluZ1swXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEuc3ByaW5nWzFdKSB8fCAwKVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmpvaW50KSB7XG4gICAgICB0aGlzLmpvaW50LmJvZHkxLmF3YWtlKClcbiAgICAgIHRoaXMuam9pbnQuYm9keTIuYXdha2UoKVxuICAgICAgdGhpcy5qb2ludC5yZW1vdmUoKVxuICAgIH1cbiAgICB0aGlzLmpvaW50ID0gbnVsbFxuICB9LFxuXG59KVxuXG4iLCJyZXF1aXJlKFwiLi9saWJzL3Bvb2xzXCIpXHJcbnJlcXVpcmUoXCIuL2xpYnMvY29weVdvcmxkUG9zUm90XCIpXHJcblxyXG5yZXF1aXJlKFwiLi9jb21wb25lbnRzL2luY2x1ZGVcIilcclxucmVxdWlyZShcIi4vY29tcG9uZW50cy9waHlzaWNzXCIpXHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHBhcnNlOiBmdW5jdGlvbiAoY21kKSB7XHJcbiAgICBsZXQgd29yZHMgPSBjbWQuc3BsaXQoXCIgXCIpXHJcbiAgICBsZXQgYXJncyA9IFtdXHJcbiAgICBmb3IgKGxldCB3b3JkIG9mIHdvcmRzKSB7XHJcbiAgICAgIGlmICh3b3JkKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGFyZ3MucHVzaChKU09OLnBhcnNlKHdvcmQpKVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBpZiAod29yZCAhPT0gXCI9XCIpXHJcbiAgICAgICAgICAgIGFyZ3MucHVzaCh3b3JkKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyZ3NcclxuICB9LFxyXG4gIHN0cmluZ2lmeVBhcmFtOiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlQWxsKFwiIFwiLCBcIlxcXFx1MDAyMFwiKS5yZXBsYWNlQWxsKFwiXFxcIl9cIiwgXCJcXFwiXCIpXHJcbiAgfVxyXG59IiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuXHJcbkFGUkFNRS5BRW50aXR5LnByb3RvdHlwZS5jb3B5V29ybGRQb3NSb3QgPSBmdW5jdGlvbiAoc3JjRWwpIHtcclxuICBsZXQgcXVhdCA9IFRIUkVFLlF1YXRlcm5pb24udGVtcCgpXHJcbiAgbGV0IHNyYyA9IHNyY0VsLm9iamVjdDNEXHJcbiAgbGV0IGRlc3QgPSB0aGlzLm9iamVjdDNEXHJcbiAgaWYgKCFzcmMpIHJldHVyblxyXG4gIGlmICghZGVzdCkgcmV0dXJuXHJcbiAgaWYgKCFkZXN0LnBhcmVudCkgcmV0dXJuXHJcbiAgc3JjLmdldFdvcmxkUG9zaXRpb24oZGVzdC5wb3NpdGlvbilcclxuICBkZXN0LnBhcmVudC53b3JsZFRvTG9jYWwoZGVzdC5wb3NpdGlvbilcclxuXHJcbiAgZGVzdC5nZXRXb3JsZFF1YXRlcm5pb24ocXVhdClcclxuICBkZXN0LnF1YXRlcm5pb24ubXVsdGlwbHkocXVhdC5jb25qdWdhdGUoKS5ub3JtYWxpemUoKSlcclxuICBzcmMuZ2V0V29ybGRRdWF0ZXJuaW9uKHF1YXQpXHJcbiAgZGVzdC5xdWF0ZXJuaW9uLm11bHRpcGx5KHF1YXQubm9ybWFsaXplKCkpXHJcbn0iLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xyXG5cclxuZnVuY3Rpb24gbWFrZVBvb2woQ2xhc3MpIHtcclxuICBDbGFzcy5fcG9vbCA9IFtdXHJcbiAgQ2xhc3MuX2luVXNlID0gW11cclxuICBDbGFzcy50ZW1wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IHYgPSBDbGFzcy5fcG9vbC5wb3AoKSB8fCBuZXcgQ2xhc3MoKVxyXG4gICAgQ2xhc3MuX2luVXNlLnB1c2godilcclxuICAgIGlmICghQ2xhc3MuX2djKVxyXG4gICAgICBDbGFzcy5fZ2MgPSBzZXRUaW1lb3V0KENsYXNzLl9yZWN5Y2xlKVxyXG4gICAgcmV0dXJuIHZcclxuICB9XHJcbiAgQ2xhc3MuX3JlY3ljbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB3aGlsZSAoQ2xhc3MuX2luVXNlLmxlbmd0aClcclxuICAgICAgQ2xhc3MuX3Bvb2wucHVzaChDbGFzcy5faW5Vc2UucG9wKCkpXHJcbiAgICBDbGFzcy5fZ2MgPSBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxubWFrZVBvb2woVEhSRUUuVmVjdG9yMilcclxubWFrZVBvb2woVEhSRUUuVmVjdG9yMylcclxubWFrZVBvb2woVEhSRUUuUXVhdGVybmlvbilcclxubWFrZVBvb2woVEhSRUUuTWF0cml4MylcclxubWFrZVBvb2woVEhSRUUuTWF0cml4NClcclxuIl19
