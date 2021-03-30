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
        body.components.body.command(params)
        break
    }
  }
})

AFRAME.registerComponent("body", {
  dependencies: ["position", "rotation", "scale"],

  schema: {
    type: { type: "string", default: "static" },
    belongsTo: { type: "number", default: 1 },
    collidesWith: { type: "number", default: 0xffffffff },
    emitsWith: { type: "number", default: 0 },
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
      } else if (buffer[p + 1]) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbmNsdWRlLmpzIiwic3JjL2NvbXBvbmVudHMvcGh5c2ljcy5qcyIsInNyYy9nYW1lZnJhbWUuanMiLCJzcmMvbGlicy9jbWRDb2RlYy5qcyIsInNyYy9saWJzL2NvcHlXb3JsZFBvc1JvdC5qcyIsInNyYy9saWJzL3Bvb2xzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cblxubGV0IGxvYWRpbmcgPSBmYWxzZVxuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJpbmNsdWRlXCIsIHtcbiAgc2NoZW1hOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcblxuICB1cGRhdGU6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5kYXRhICYmICFsb2FkaW5nKSB7XG4gICAgICBsb2FkaW5nID0gdHJ1ZVxuICAgICAgY29uc29sZS5sb2coXCJJbmNsdWRpbmdcIiwgdGhpcy5kYXRhKVxuICAgICAgdGhpcy5lbC5vdXRlckhUTUwgPSBhd2FpdCAoYXdhaXQgZmV0Y2godGhpcy5kYXRhKSkudGV4dCgpXG4gICAgICBsb2FkaW5nID0gZmFsc2VcbiAgICAgIGxldCBuZXh0ID0gdGhpcy5lbC5zY2VuZUVsLnF1ZXJ5U2VsZWN0b3IoXCJbaW5jbHVkZV1cIilcbiAgICAgIGlmIChuZXh0KVxuICAgICAgICBuZXh0LmNvbXBvbmVudHMuaW5jbHVkZS51cGRhdGUoKVxuICAgIH1cbiAgfVxufSlcbiIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFLCBPSU1PICovXG5cbmNvbnN0IGNtZCA9IHJlcXVpcmUoXCIuLi9saWJzL2NtZENvZGVjXCIpXG5cbkFGUkFNRS5yZWdpc3RlclN5c3RlbShcInBoeXNpY3NcIiwge1xuICBzY2hlbWE6IHtcbiAgICB3b3JrZXJVcmw6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxuICAgIGdyYXZpdHk6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMCwgeTogLTkuOCwgejogMCB9IH0sXG4gICAgZGVidWc6IHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IGZhbHNlIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5kYXRhLndvcmtlclVybCkge1xuICAgICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIodGhpcy5kYXRhLndvcmtlclVybClcbiAgICAgICAgdGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKSlcbiAgICAgIH1cbiAgICAgIHRoaXMuYm9kaWVzID0gdGhpcy5ib2RpZXMgfHwgW11cbiAgICAgIHRoaXMubW92aW5nQm9kaWVzID0gdGhpcy5tb3ZpbmdCb2RpZXMgfHwgW11cbiAgICAgIHRoaXMuYnVmZmVycyA9IFtuZXcgRmxvYXQ2NEFycmF5KDgpLCBuZXcgRmxvYXQ2NEFycmF5KDgpXVxuICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBncmF2aXR5ID0gXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0odGhpcy5kYXRhLmdyYXZpdHkpKVxuICAgICAgdGhpcy5fZGVidWcgPSB0aGlzLmRhdGEuZGVidWdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmUoKVxuICAgIH1cbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLndvcmtlciAmJiB0aGlzLndvcmtlci50ZXJtaW5hdGUoKVxuICAgIHRoaXMud29ya2VyID0gbnVsbFxuICAgIHRoaXMuYm9kaWVzID0gW11cbiAgICB0aGlzLm1vdmluZ0JvZGllcyA9IFtdXG4gIH0sXG5cbiAgdGljazogZnVuY3Rpb24gKHRpbWUsIHRpbWVEZWx0YSkge1xuICAgIGlmICghdGhpcy53b3JrZXIpIHJldHVyblxuICAgIGlmICh0aGlzLmJ1ZmZlcnMubGVuZ3RoIDwgMikgcmV0dXJuXG4gICAgbGV0IGJ1ZmZlciA9IHRoaXMuYnVmZmVycy5zaGlmdCgpXG4gICAgaWYgKGJ1ZmZlci5sZW5ndGggPCA4ICogdGhpcy5tb3ZpbmdCb2RpZXMubGVuZ3RoKSB7XG4gICAgICBsZXQgbGVuID0gYnVmZmVyLmxlbmd0aFxuICAgICAgd2hpbGUgKGxlbiA8IDggKiB0aGlzLm1vdmluZ0JvZGllcy5sZW5ndGgpIHtcbiAgICAgICAgbGVuICo9IDJcbiAgICAgIH1cbiAgICAgIGxldCBib2RzID0gdGhpcy5tb3ZpbmdCb2RpZXNcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDY0QXJyYXkobGVuKVxuICAgICAgYnVmZmVyLmZpbGwoTmFOKVxuICAgICAgbGV0IHZlYyA9IFRIUkVFLlZlY3RvcjMudGVtcCgpXG4gICAgICBsZXQgcXVhdCA9IFRIUkVFLlF1YXRlcm5pb24udGVtcCgpXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHAgPSBpICogOFxuICAgICAgICBpZiAoYm9kc1tpXSkge1xuICAgICAgICAgIGJvZHNbaV0ub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbih2ZWMpXG4gICAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMueFxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnlcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy56XG4gICAgICAgICAgcCsrXG4gICAgICAgICAgYm9kc1tpXS5vYmplY3QzRC5nZXRXb3JsZFF1YXRlcm5pb24ocXVhdClcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueFxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gcXVhdC55XG4gICAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnpcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQud1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKGJ1ZmZlciwgW2J1ZmZlci5idWZmZXJdKVxuICB9LFxuXG4gIG9uTWVzc2FnZTogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAodHlwZW9mIGUuZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbGV0IGNvbW1hbmQgPSBjbWQucGFyc2UoZS5kYXRhKVxuICAgICAgc3dpdGNoIChjb21tYW5kLnNoaWZ0KCkpIHtcbiAgICAgICAgY2FzZSBcIndvcmxkXCI6XG4gICAgICAgICAgdGhpcy5jb21tYW5kKGNvbW1hbmQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoZS5kYXRhIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KSB7XG4gICAgICB0aGlzLmJ1ZmZlcnMucHVzaChlLmRhdGEpXG4gICAgICB3aGlsZSAodGhpcy5idWZmZXJzLmxlbmd0aCA+IDIpXG4gICAgICAgIHRoaXMuYnVmZmVycy5zaGlmdCgpXG4gICAgfVxuICB9LFxuXG4gIGNvbW1hbmQ6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICBpZiAodHlwZW9mIHBhcmFtc1swXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcGFyYW1zLnNoaWZ0KClcbiAgICB9XG4gICAgc3dpdGNoIChwYXJhbXMuc2hpZnQoKSkge1xuICAgICAgY2FzZSBcImJvZHlcIjpcbiAgICAgICAgbGV0IGlkID0gcGFyYW1zLnNoaWZ0KClcbiAgICAgICAgbGV0IGJvZHkgPSB0aGlzLmJvZGllc1tpZF1cbiAgICAgICAgYm9keS5jb21wb25lbnRzLmJvZHkuY29tbWFuZChwYXJhbXMpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG59KVxuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJib2R5XCIsIHtcbiAgZGVwZW5kZW5jaWVzOiBbXCJwb3NpdGlvblwiLCBcInJvdGF0aW9uXCIsIFwic2NhbGVcIl0sXG5cbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcInN0YXRpY1wiIH0sXG4gICAgYmVsb25nc1RvOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDEgfSxcbiAgICBjb2xsaWRlc1dpdGg6IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMHhmZmZmZmZmZiB9LFxuICAgIGVtaXRzV2l0aDogeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAwIH0sXG4gIH0sXG5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBib2RpZXMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmJvZGllc1xuICAgIGxldCBtb3ZpbmdCb2RpZXMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLm1vdmluZ0JvZGllc1xuICAgIGxldCBidWZmZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmJ1ZmZlcnNbMF1cbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgdGhpcy5pZCA9IGJvZGllcy5pbmRleE9mKG51bGwpXG4gICAgaWYgKHRoaXMuaWQgPCAwKSB0aGlzLmlkID0gYm9kaWVzLmxlbmd0aFxuICAgIGJvZGllc1t0aGlzLmlkXSA9IHRoaXMuZWxcbiAgICBpZiAodGhpcy5kYXRhLnR5cGUgIT09IFwic3RhdGljXCIpIHtcbiAgICAgIHRoaXMubWlkID0gbW92aW5nQm9kaWVzLmluZGV4T2YobnVsbClcbiAgICAgIGlmICh0aGlzLm1pZCA8IDApIHRoaXMubWlkID0gbW92aW5nQm9kaWVzLmxlbmd0aFxuICAgICAgbW92aW5nQm9kaWVzW3RoaXMubWlkXSA9IHRoaXMuZWxcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5taWQgPSBudWxsXG4gICAgfVxuICAgIGxldCBib2R5ID0geyBtaWQ6IHRoaXMubWlkIH1cbiAgICBib2R5LnR5cGUgPSB0aGlzLmRhdGEudHlwZVxuICAgIGJvZHkucG9zaXRpb24gPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oVEhSRUUuVmVjdG9yMy50ZW1wKCkpXG4gICAgYm9keS5xdWF0ZXJuaW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFF1YXRlcm5pb24oVEhSRUUuUXVhdGVybmlvbi50ZW1wKCkpXG4gICAgaWYgKHRoaXMubWlkICE9PSBudWxsKSB7XG4gICAgICBsZXQgcCA9IHRoaXMubWlkICogOFxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnBvc2l0aW9uLnhcbiAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3NpdGlvbi55XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zaXRpb24uelxuICAgICAgcCsrXG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi54XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi55XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi56XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi53XG4gICAgfVxuICAgIHRoaXMuc2hhcGVzID0gW11cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIGNyZWF0ZSBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbShib2R5KSlcblxuICAgIGlmICghdGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJzaGFwZVwiKSkge1xuICAgICAgaWYgKHRoaXMuZWwuZmlyc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgICAgbGV0IGVscyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbChcImEtYm94LCBhLXNwaGVyZSwgYS1jeWxpbmRlclwiKVxuICAgICAgICBpZiAoZWxzKVxuICAgICAgICAgIGVscy5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGlmICghZWwuZ2V0QXR0cmlidXRlKFwic2hhcGVcIikpIGVsLnNldEF0dHJpYnV0ZShcInNoYXBlXCIsIHRydWUpXG4gICAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKFwic2hhcGVcIiwgdHJ1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAob2xkRGF0YSkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICBpZiAodGhpcy5kYXRhLnR5cGUgIT09IG9sZERhdGEudHlwZSlcbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgdHlwZSA9IFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKHRoaXMuZGF0YS50eXBlKSlcbiAgICBpZiAodGhpcy5kYXRhLmJlbG9uZ3NUbyAhPT0gb2xkRGF0YS5iZWxvbmdzVG8pXG4gICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIGJlbG9uZ3NUbyA9IFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKHRoaXMuZGF0YS5iZWxvbmdzVG8pKVxuICAgIGlmICh0aGlzLmRhdGEuY29sbGlkZXNXaXRoICE9PSBvbGREYXRhLmNvbGxpZGVzV2l0aClcbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgY29sbGlkZXNXaXRoID0gXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0odGhpcy5kYXRhLmNvbGxpZGVzV2l0aCkpXG4gICAgaWYgKHRoaXMuZGF0YS5lbWl0c1dpdGggIT09IG9sZERhdGEuZW1pdHNXaXRoKVxuICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBlbWl0c1dpdGggPSBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbSh0aGlzLmRhdGEuZW1pdHNXaXRoKSlcbiAgfSxcblxuICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgc2xlZXBpbmcgPSBmYWxzZVwiKVxuICB9LFxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIHNsZWVwaW5nID0gdHJ1ZVwiKVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBib2RpZXMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmJvZGllc1xuICAgIGxldCBtb3ZpbmdCb2RpZXMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLm1vdmluZ0JvZGllc1xuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICBib2RpZXNbdGhpcy5pZF0gPSBudWxsXG4gICAgaWYgKHRoaXMubWlkICE9PSBudWxsKVxuICAgICAgbW92aW5nQm9kaWVzW3RoaXMubWlkXSA9IG51bGxcbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIHJlbW92ZVwiKVxuICB9LFxuXG4gIHRpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBsZXQgYnVmZmVyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5idWZmZXJzWzBdXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIGlmICh0aGlzLm1pZCAhPT0gbnVsbCkge1xuICAgICAgbGV0IHAgPSB0aGlzLm1pZCAqIDhcbiAgICAgIGlmIChidWZmZXIubGVuZ3RoIDw9IHApIHJldHVyblxuICAgICAgaWYgKHRoaXMuZGF0YS50eXBlID09PSBcImtpbmVtYXRpY1wiKSB7XG4gICAgICAgIGxldCB2ZWMgPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oVEhSRUUuVmVjdG9yMy50ZW1wKCkpXG4gICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnhcbiAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMueVxuICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy56XG4gICAgICAgIHArK1xuICAgICAgICBsZXQgcXVhdCA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueFxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueVxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQuelxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQud1xuICAgICAgfSBlbHNlIGlmIChidWZmZXJbcCArIDFdKSB7XG4gICAgICAgIGxldCBxdWF0ID0gVEhSRUUuUXVhdGVybmlvbi50ZW1wKClcblxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnBvc2l0aW9uLnNldChidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdKVxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnBhcmVudC53b3JsZFRvTG9jYWwodGhpcy5lbC5vYmplY3QzRC5wb3NpdGlvbilcbiAgICAgICAgcCsrXG5cbiAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFF1YXRlcm5pb24ocXVhdClcbiAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5xdWF0ZXJuaW9uLm11bHRpcGx5KHF1YXQuY29uanVnYXRlKCkubm9ybWFsaXplKCkpXG4gICAgICAgIHF1YXQuc2V0KGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdKVxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnF1YXRlcm5pb24ubXVsdGlwbHkocXVhdC5ub3JtYWxpemUoKSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tbWFuZDogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcbiAgICAgIGNhc2UgXCJlbWl0c1wiOlxuICAgICAgICBsZXQgZSA9IHBhcmFtcy5zaGlmdCgpXG4gICAgICAgIHN3aXRjaCAoZS5ldmVudCkge1xuICAgICAgICAgIGNhc2UgXCJjb2xsaXNpb25cIjpcbiAgICAgICAgICAgIGxldCBib2RpZXMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmJvZGllc1xuICAgICAgICAgICAgZS5ib2R5MSA9IGJvZGllc1tlLmJvZHkxXVxuICAgICAgICAgICAgZS5ib2R5MiA9IGJvZGllc1tlLmJvZHkyXVxuICAgICAgICAgICAgZS5zaGFwZTEgPSBlLmJvZHkxLmNvbXBvbmVudHMuYm9keS5zaGFwZXNbZS5zaGFwZTFdXG4gICAgICAgICAgICBlLnNoYXBlMiA9IGUuYm9keTIuY29tcG9uZW50cy5ib2R5LnNoYXBlc1tlLnNoYXBlMl1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbC5lbWl0KGUuZXZlbnQsIGUpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG59KVxuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJzaGFwZVwiLCB7XG4gIGRlcGVuZGVuY2llczogW1wiYm9keVwiXSxcbiAgbXVsdGlwbGU6IHRydWUsXG4gIHNjaGVtYToge1xuICAgIHR5cGU6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJib3hcIiB9LFxuICAgIHNpemU6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogLTEsIHk6IC0xLCB6OiAtMSB9IH0sXG4gICAgcG9zT2Zmc2V0OiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDAsIHk6IDAsIHo6IDAgfSB9LFxuICAgIHJvdE9mZnNldDogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAwLCB6OiAwIH0gfSxcbiAgICBkZW5zaXR5OiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDEgfSxcbiAgICBmcmljdGlvbjogeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAwLjIgfSxcbiAgICByZXN0aXR1dGlvbjogeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAwLjIgfSxcbiAgICBiZWxvbmdzVG86IHsgdHlwZTogXCJpbnRcIiwgZGVmYXVsdDogMSB9LFxuICAgIGNvbGxpZGVzV2l0aDogeyB0eXBlOiBcImludFwiLCBkZWZhdWx0OiAweGZmZmZmZmZmIH0sXG4gIH0sXG5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYm9keSA9IHRoaXMuZWxcbiAgICB3aGlsZSAodGhpcy5ib2R5ICYmICF0aGlzLmJvZHkubWF0Y2hlcyhcIltib2R5XVwiKSkgdGhpcy5ib2R5ID0gdGhpcy5ib2R5LnBhcmVudEVsZW1lbnRcbiAgICB0aGlzLmJvZHlJZCA9IHRoaXMuYm9keS5jb21wb25lbnRzLmJvZHkuaWRcblxuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBzaGFwZXMgPSB0aGlzLmJvZHkuY29tcG9uZW50cy5ib2R5LnNoYXBlc1xuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICB0aGlzLmlkID0gc2hhcGVzLmluZGV4T2YobnVsbClcbiAgICBpZiAodGhpcy5pZCA8IDApIHRoaXMuaWQgPSBzaGFwZXMubGVuZ3RoXG4gICAgc2hhcGVzW3RoaXMuaWRdID0gdGhpcy5lbFxuXG4gICAgbGV0IHNoYXBlID0ge31cbiAgICBzaGFwZS5wb3NpdGlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbihUSFJFRS5WZWN0b3IzLnRlbXAoKSlcbiAgICB0aGlzLmJvZHkub2JqZWN0M0Qud29ybGRUb0xvY2FsKHNoYXBlLnBvc2l0aW9uKVxuICAgIHNoYXBlLnF1YXRlcm5pb24gPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKSlcbiAgICBsZXQgYm9keXF1YXQgPSB0aGlzLmJvZHkub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgIHNoYXBlLnF1YXRlcm5pb24ubXVsdGlwbHkoYm9keXF1YXQuY29uanVnYXRlKCkubm9ybWFsaXplKCkpLm5vcm1hbGl6ZSgpXG4gICAgc2hhcGUuc2l6ZSA9IFRIUkVFLlZlY3RvcjMudGVtcCgpLnNldCgxLCAxLCAxKVxuXG4gICAgc3dpdGNoICh0aGlzLmVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSBcImEtc3BoZXJlXCI6XG4gICAgICAgIHNoYXBlLnR5cGUgPSBcInNwaGVyZVwiXG4gICAgICAgIHNoYXBlLnNpemUubXVsdGlwbHlTY2FsYXIocGFyc2VGbG9hdCh0aGlzLmVsLmdldEF0dHJpYnV0ZShcInJhZGl1c1wiKSB8fCAxKSAqIDIpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiYS1jeWxpbmRlclwiOlxuICAgICAgICBzaGFwZS50eXBlID0gXCJjeWxpbmRlclwiXG4gICAgICAgIHNoYXBlLnNpemUubXVsdGlwbHlTY2FsYXIocGFyc2VGbG9hdCh0aGlzLmVsLmdldEF0dHJpYnV0ZShcInJhZGl1c1wiKSB8fCAxKSAqIDIpLnkgPSBwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpIHx8IDEpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFwiYS1ib3hcIjpcbiAgICAgICAgc2hhcGUudHlwZSA9IFwiYm94XCJcbiAgICAgICAgc2hhcGUuc2l6ZS5zZXQoXG4gICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmVsLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpIHx8IDEpLFxuICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIikgfHwgMSksXG4gICAgICAgICAgcGFyc2VGbG9hdCh0aGlzLmVsLmdldEF0dHJpYnV0ZShcImRlcHRoXCIpIHx8IDEpXG4gICAgICAgIClcbiAgICAgICAgYnJlYWtcbiAgICAgIC8vIGNhc2UgXCJhLXBsYW5lXCI6XG4gICAgICAvLyAgIHNoYXBlLnR5cGUgPSBcInBsYW5lXCJcbiAgICAgIC8vICAgYnJlYWtcbiAgICB9XG5cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5ib2R5SWQgKyBcIiBzaGFwZSBcIiArIHRoaXMuaWQgKyBcIiBjcmVhdGUgXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0oc2hhcGUpKVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBzaGFwZXMgPSB0aGlzLmJvZHkuY29tcG9uZW50cy5ib2R5LnNoYXBlc1xuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmJvZHlJZCArIFwiIHNoYXBlIFwiICsgdGhpcy5pZCArIFwiIHJlbW92ZVwiKVxuICAgIHNoYXBlc1t0aGlzLmlkXSA9IG51bGxcbiAgfVxufSlcblxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KFwiam9pbnRcIiwge1xuICBkZXBlbmRlbmNpZXM6IFtcImJvZHlcIiwgXCJzaGFwZVwiXSxcblxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiB7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHQ6IFwicHJpc21lXCIgfSxcbiAgICB3aXRoOiB7IHR5cGU6IFwic2VsZWN0b3JcIiwgZGVmYXVsdDogXCJbYm9keV1cIiB9LFxuICAgIG1pbjogeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAwIH0sXG4gICAgbWF4OiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAgfSxcbiAgICBwb3MxOiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDAsIHk6IDAsIHo6IDAgfSB9LFxuICAgIHBvczI6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMCwgeTogMCwgejogMCB9IH0sXG4gICAgYXhlMTogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAxLCB5OiAwLCB6OiAwIH0gfSxcbiAgICBheGUyOiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDEsIHk6IDAsIHo6IDAgfSB9LFxuICAgIGNvbGxpc2lvbjogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfSxcbiAgICBsaW1pdDogeyB0eXBlOiBcImFycmF5XCIgfSxcbiAgICBtb3RvcjogeyB0eXBlOiBcImFycmF5XCIgfSxcbiAgICBzcHJpbmc6IHsgdHlwZTogXCJhcnJheVwiIH0sXG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVsLmJvZHkpIHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlKCksIDI1NilcbiAgICBpZiAoIXRoaXMuZGF0YS53aXRoLmJvZHkpIHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlKCksIDI1NilcbiAgICBpZiAoIXRoaXMuam9pbnQpIHtcbiAgICAgIGxldCBqYyA9IG5ldyBPSU1PLkpvaW50Q29uZmlnKClcbiAgICAgIGpjLmJvZHkxID0gdGhpcy5lbC5ib2R5XG4gICAgICBqYy5ib2R5MiA9IHRoaXMuZGF0YS53aXRoLmJvZHlcbiAgICAgIGxldCBkZWcycmFkID0gTWF0aC5QSSAvIDE4MFxuICAgICAgc3dpdGNoICh0aGlzLmRhdGEudHlwZSkge1xuICAgICAgICBjYXNlIFwiZGlzdGFuY2VcIjpcbiAgICAgICAgICB0aGlzLmpvaW50ID0gbmV3IE9JTU8uRGlzdGFuY2VKb2ludChqYywgdGhpcy5kYXRhLm1pbiwgdGhpcy5kYXRhLm1heClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwiaGluZ2VcIjpcbiAgICAgICAgICB0aGlzLmpvaW50ID0gbmV3IE9JTU8uSGluZ2VKb2ludChqYywgdGhpcy5kYXRhLm1pbiAqIGRlZzJyYWQsIHRoaXMuZGF0YS5tYXggKiBkZWcycmFkKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJwcmlzbWVcIjpcbiAgICAgICAgICB0aGlzLmpvaW50ID0gbmV3IE9JTU8uUHJpc21hdGljSm9pbnQoamMsIHRoaXMuZGF0YS5taW4gKiBkZWcycmFkLCB0aGlzLmRhdGEubWF4ICogZGVnMnJhZClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwic2xpZGVcIjpcbiAgICAgICAgICB0aGlzLmpvaW50ID0gbmV3IE9JTU8uU2xpZGVySm9pbnQoamMsIHRoaXMuZGF0YS5taW4sIHRoaXMuZGF0YS5tYXgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcImJhbGxcIjpcbiAgICAgICAgICB0aGlzLmpvaW50ID0gbmV3IE9JTU8uQmFsbEFuZFNvY2tldEpvaW50KGpjKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJ3aGVlbFwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5XaGVlbEpvaW50KGpjKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICB0aGlzLmVsLnNjZW5lRWwucGh5c2ljc1dvcmxkLmFkZEpvaW50KHRoaXMuam9pbnQpXG4gICAgfVxuICAgIHRoaXMuam9pbnQubG9jYWxBbmNob3JQb2ludDEuY29weSh0aGlzLmRhdGEucG9zMSlcbiAgICB0aGlzLmpvaW50LmxvY2FsQW5jaG9yUG9pbnQyLmNvcHkodGhpcy5kYXRhLnBvczIpXG4gICAgaWYgKHRoaXMuam9pbnQubG9jYWxBeGlzMSkge1xuICAgICAgdGhpcy5qb2ludC5sb2NhbEF4aXMxLmNvcHkodGhpcy5kYXRhLmF4ZTEpXG4gICAgICB0aGlzLmpvaW50LmxvY2FsQXhpczIuY29weSh0aGlzLmRhdGEuYXhlMilcbiAgICB9XG4gICAgdGhpcy5qb2ludC5hbGxvd0NvbGxpc2lvbiA9IHRoaXMuZGF0YS5jb2xsaXNpb25cblxuICAgIGxldCBsbSA9IHRoaXMuam9pbnQucm90YXRpb25hbExpbWl0TW90b3IxIHx8IHRoaXMuam9pbnQubGltaXRNb3RvclxuICAgIC8vIGlmICh0aGlzLmRhdGEubGltaXQubGVuZ3RoID09IDIpXG4gICAgbG0uc2V0TGltaXQocGFyc2VGbG9hdCh0aGlzLmRhdGEubGltaXRbMF0pIHx8IDAsIHBhcnNlRmxvYXQodGhpcy5kYXRhLmxpbWl0WzFdKSB8fCAwKVxuICAgIC8vIGlmICh0aGlzLmRhdGEubW90b3IubGVuZ3RoID09IDIpXG4gICAgbG0uc2V0TW90b3IocGFyc2VGbG9hdCh0aGlzLmRhdGEubW90b3JbMF0pIHx8IDAsIHBhcnNlRmxvYXQodGhpcy5kYXRhLm1vdG9yWzFdKSB8fCAwKVxuICAgIC8vIGlmICh0aGlzLmRhdGEuc3ByaW5nLmxlbmd0aCA9PSAyKVxuICAgIGxtLnNldFNwcmluZyhwYXJzZUZsb2F0KHRoaXMuZGF0YS5zcHJpbmdbMF0pIHx8IDAsIHBhcnNlRmxvYXQodGhpcy5kYXRhLnNwcmluZ1sxXSkgfHwgMClcbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5qb2ludCkge1xuICAgICAgdGhpcy5qb2ludC5ib2R5MS5hd2FrZSgpXG4gICAgICB0aGlzLmpvaW50LmJvZHkyLmF3YWtlKClcbiAgICAgIHRoaXMuam9pbnQucmVtb3ZlKClcbiAgICB9XG4gICAgdGhpcy5qb2ludCA9IG51bGxcbiAgfSxcblxufSlcblxuIiwicmVxdWlyZShcIi4vbGlicy9wb29sc1wiKVxyXG5yZXF1aXJlKFwiLi9saWJzL2NvcHlXb3JsZFBvc1JvdFwiKVxyXG5cclxucmVxdWlyZShcIi4vY29tcG9uZW50cy9pbmNsdWRlXCIpXHJcbnJlcXVpcmUoXCIuL2NvbXBvbmVudHMvcGh5c2ljc1wiKVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBwYXJzZTogZnVuY3Rpb24gKGNtZCkge1xyXG4gICAgbGV0IHdvcmRzID0gY21kLnNwbGl0KFwiIFwiKVxyXG4gICAgbGV0IGFyZ3MgPSBbXVxyXG4gICAgZm9yIChsZXQgd29yZCBvZiB3b3Jkcykge1xyXG4gICAgICBpZiAod29yZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBhcmdzLnB1c2goSlNPTi5wYXJzZSh3b3JkKSlcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgaWYgKHdvcmQgIT09IFwiPVwiKVxyXG4gICAgICAgICAgICBhcmdzLnB1c2god29yZClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcmdzXHJcbiAgfSxcclxuICBzdHJpbmdpZnlQYXJhbTogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZUFsbChcIiBcIiwgXCJcXFxcdTAwMjBcIikucmVwbGFjZUFsbChcIlxcXCJfXCIsIFwiXFxcIlwiKVxyXG4gIH1cclxufSIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcblxyXG5BRlJBTUUuQUVudGl0eS5wcm90b3R5cGUuY29weVdvcmxkUG9zUm90ID0gZnVuY3Rpb24gKHNyY0VsKSB7XHJcbiAgbGV0IHF1YXQgPSBUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKVxyXG4gIGxldCBzcmMgPSBzcmNFbC5vYmplY3QzRFxyXG4gIGxldCBkZXN0ID0gdGhpcy5vYmplY3QzRFxyXG4gIGlmICghc3JjKSByZXR1cm5cclxuICBpZiAoIWRlc3QpIHJldHVyblxyXG4gIGlmICghZGVzdC5wYXJlbnQpIHJldHVyblxyXG4gIHNyYy5nZXRXb3JsZFBvc2l0aW9uKGRlc3QucG9zaXRpb24pXHJcbiAgZGVzdC5wYXJlbnQud29ybGRUb0xvY2FsKGRlc3QucG9zaXRpb24pXHJcblxyXG4gIGRlc3QuZ2V0V29ybGRRdWF0ZXJuaW9uKHF1YXQpXHJcbiAgZGVzdC5xdWF0ZXJuaW9uLm11bHRpcGx5KHF1YXQuY29uanVnYXRlKCkubm9ybWFsaXplKCkpXHJcbiAgc3JjLmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxyXG4gIGRlc3QucXVhdGVybmlvbi5tdWx0aXBseShxdWF0Lm5vcm1hbGl6ZSgpKVxyXG59IiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuXHJcbmZ1bmN0aW9uIG1ha2VQb29sKENsYXNzKSB7XHJcbiAgQ2xhc3MuX3Bvb2wgPSBbXVxyXG4gIENsYXNzLl9pblVzZSA9IFtdXHJcbiAgQ2xhc3MudGVtcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCB2ID0gQ2xhc3MuX3Bvb2wucG9wKCkgfHwgbmV3IENsYXNzKClcclxuICAgIENsYXNzLl9pblVzZS5wdXNoKHYpXHJcbiAgICBpZiAoIUNsYXNzLl9nYylcclxuICAgICAgQ2xhc3MuX2djID0gc2V0VGltZW91dChDbGFzcy5fcmVjeWNsZSlcclxuICAgIHJldHVybiB2XHJcbiAgfVxyXG4gIENsYXNzLl9yZWN5Y2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgd2hpbGUgKENsYXNzLl9pblVzZS5sZW5ndGgpXHJcbiAgICAgIENsYXNzLl9wb29sLnB1c2goQ2xhc3MuX2luVXNlLnBvcCgpKVxyXG4gICAgQ2xhc3MuX2djID0gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbm1ha2VQb29sKFRIUkVFLlZlY3RvcjIpXHJcbm1ha2VQb29sKFRIUkVFLlZlY3RvcjMpXHJcbm1ha2VQb29sKFRIUkVFLlF1YXRlcm5pb24pXHJcbm1ha2VQb29sKFRIUkVFLk1hdHJpeDMpXHJcbm1ha2VQb29sKFRIUkVFLk1hdHJpeDQpXHJcbiJdfQ==
