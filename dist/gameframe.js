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
      this.joints = this.joints || []
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
    // if (body.type === "static") 
    setTimeout(() => {
      body.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
      body.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
      worker.postMessage("world body " + this.id + " position = " + cmd.stringifyParam(body.position))
      worker.postMessage("world body " + this.id + " quaternion = " + cmd.stringifyParam(body.quaternion))
    })

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
  multiple: true,

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

  init: function () {
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    this.id = joints.indexOf(null)
    if (this.id < 0) this.id = joints.length
    joints[this.id] = this.el

    let joint = {}
    joint.type = this.data.type
    joint.position = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
    joint.quaternion = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
    worker.postMessage("world joint " + this.id + " create " + cmd.stringifyParam(joint))
  },

  update: function (oldData) {
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
    let worker = this.el.sceneEl.systems.physics.worker
    let joints = this.el.sceneEl.systems.physics.joints
    if (!worker) return
    joints[this.id] = null
    worker.postMessage("world joint " + this.id + " remove")
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9pbmNsdWRlLmpzIiwic3JjL2NvbXBvbmVudHMvcGh5c2ljcy5qcyIsInNyYy9nYW1lZnJhbWUuanMiLCJzcmMvbGlicy9jbWRDb2RlYy5qcyIsInNyYy9saWJzL2NvcHlXb3JsZFBvc1JvdC5qcyIsInNyYy9saWJzL3Bvb2xzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3paQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xuXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoXCJpbmNsdWRlXCIsIHtcbiAgc2NoZW1hOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcblxuICB1cGRhdGU6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5kYXRhICYmICF0aGlzLmVsLnNjZW5lRWwuX2luY2x1ZGluZ18pIHtcbiAgICAgIHRoaXMuZWwuc2NlbmVFbC5faW5jbHVkaW5nXyA9IHRydWVcbiAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHRoaXMuZGF0YSlcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkgdGhpcy5lbC5vdXRlckhUTUwgPSBhd2FpdCAocmVzcG9uc2UpLnRleHQoKVxuICAgICAgZWxzZSB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZShcImluY2x1ZGVcIilcbiAgICAgIHRoaXMuZWwuc2NlbmVFbC5faW5jbHVkaW5nXyA9IGZhbHNlXG4gICAgICBsZXQgbmV4dCA9IHRoaXMuZWwuc2NlbmVFbC5xdWVyeVNlbGVjdG9yKFwiW2luY2x1ZGVdXCIpXG4gICAgICBpZiAobmV4dCkgbmV4dC5jb21wb25lbnRzLmluY2x1ZGUudXBkYXRlKClcbiAgICB9XG4gIH1cbn0pXG4iLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSwgT0lNTyAqL1xuXG5jb25zdCBjbWQgPSByZXF1aXJlKFwiLi4vbGlicy9jbWRDb2RlY1wiKVxuXG5BRlJBTUUucmVnaXN0ZXJTeXN0ZW0oXCJwaHlzaWNzXCIsIHtcbiAgc2NoZW1hOiB7XG4gICAgd29ya2VyVXJsOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcbiAgICBncmF2aXR5OiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDAsIHk6IC05LjgsIHo6IDAgfSB9LFxuICAgIGRlYnVnOiB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiBmYWxzZSB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZGF0YS53b3JrZXJVcmwpIHtcbiAgICAgIGlmICghdGhpcy53b3JrZXIpIHtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKHRoaXMuZGF0YS53b3JrZXJVcmwpXG4gICAgICAgIHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcykpXG4gICAgICB9XG4gICAgICB0aGlzLmJvZGllcyA9IHRoaXMuYm9kaWVzIHx8IFtdXG4gICAgICB0aGlzLm1vdmluZ0JvZGllcyA9IHRoaXMubW92aW5nQm9kaWVzIHx8IFtdXG4gICAgICB0aGlzLmpvaW50cyA9IHRoaXMuam9pbnRzIHx8IFtdXG4gICAgICB0aGlzLmJ1ZmZlcnMgPSBbbmV3IEZsb2F0NjRBcnJheSg4KSwgbmV3IEZsb2F0NjRBcnJheSg4KV1cbiAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgZ3Jhdml0eSA9IFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKHRoaXMuZGF0YS5ncmF2aXR5KSlcbiAgICAgIHRoaXMuX2RlYnVnID0gdGhpcy5kYXRhLmRlYnVnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlKClcbiAgICB9XG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy53b3JrZXIgJiYgdGhpcy53b3JrZXIudGVybWluYXRlKClcbiAgICB0aGlzLndvcmtlciA9IG51bGxcbiAgICB0aGlzLmJvZGllcyA9IFtdXG4gICAgdGhpcy5tb3ZpbmdCb2RpZXMgPSBbXVxuICB9LFxuXG4gIHRpY2s6IGZ1bmN0aW9uICh0aW1lLCB0aW1lRGVsdGEpIHtcbiAgICBpZiAoIXRoaXMud29ya2VyKSByZXR1cm5cbiAgICBpZiAodGhpcy5idWZmZXJzLmxlbmd0aCA8IDIpIHJldHVyblxuICAgIGxldCBidWZmZXIgPSB0aGlzLmJ1ZmZlcnMuc2hpZnQoKVxuICAgIGlmIChidWZmZXIubGVuZ3RoIDwgOCAqIHRoaXMubW92aW5nQm9kaWVzLmxlbmd0aCkge1xuICAgICAgbGV0IGxlbiA9IGJ1ZmZlci5sZW5ndGhcbiAgICAgIHdoaWxlIChsZW4gPCA4ICogdGhpcy5tb3ZpbmdCb2RpZXMubGVuZ3RoKSB7XG4gICAgICAgIGxlbiAqPSAyXG4gICAgICB9XG4gICAgICBsZXQgYm9kcyA9IHRoaXMubW92aW5nQm9kaWVzXG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQ2NEFycmF5KGxlbilcbiAgICAgIGJ1ZmZlci5maWxsKE5hTilcbiAgICAgIGxldCB2ZWMgPSBUSFJFRS5WZWN0b3IzLnRlbXAoKVxuICAgICAgbGV0IHF1YXQgPSBUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBwID0gaSAqIDhcbiAgICAgICAgaWYgKGJvZHNbaV0pIHtcbiAgICAgICAgICBib2RzW2ldLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24odmVjKVxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnhcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy55XG4gICAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMuelxuICAgICAgICAgIHArK1xuICAgICAgICAgIGJvZHNbaV0ub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKHF1YXQpXG4gICAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LnhcbiAgICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueVxuICAgICAgICAgIGJ1ZmZlcltwKytdID0gcXVhdC56XG4gICAgICAgICAgYnVmZmVyW3ArK10gPSBxdWF0LndcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZShidWZmZXIsIFtidWZmZXIuYnVmZmVyXSlcbiAgfSxcblxuICBvbk1lc3NhZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHR5cGVvZiBlLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGxldCBjb21tYW5kID0gY21kLnBhcnNlKGUuZGF0YSlcbiAgICAgIHN3aXRjaCAoY29tbWFuZC5zaGlmdCgpKSB7XG4gICAgICAgIGNhc2UgXCJ3b3JsZFwiOlxuICAgICAgICAgIHRoaXMuY29tbWFuZChjb21tYW5kKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGUuZGF0YSBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSkge1xuICAgICAgdGhpcy5idWZmZXJzLnB1c2goZS5kYXRhKVxuICAgICAgd2hpbGUgKHRoaXMuYnVmZmVycy5sZW5ndGggPiAyKVxuICAgICAgICB0aGlzLmJ1ZmZlcnMuc2hpZnQoKVxuICAgIH1cbiAgfSxcblxuICBjb21tYW5kOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgaWYgKHR5cGVvZiBwYXJhbXNbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIHBhcmFtcy5zaGlmdCgpXG4gICAgfVxuICAgIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcbiAgICAgIGNhc2UgXCJib2R5XCI6XG4gICAgICAgIGxldCBpZCA9IHBhcmFtcy5zaGlmdCgpXG4gICAgICAgIGxldCBib2R5ID0gdGhpcy5ib2RpZXNbaWRdXG4gICAgICAgIGlmIChib2R5KVxuICAgICAgICAgIGJvZHkuY29tcG9uZW50cy5ib2R5LmNvbW1hbmQocGFyYW1zKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxufSlcblxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KFwiYm9keVwiLCB7XG4gIGRlcGVuZGVuY2llczogW1wicG9zaXRpb25cIiwgXCJyb3RhdGlvblwiLCBcInNjYWxlXCJdLFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJzdGF0aWNcIiB9LFxuICAgIGJlbG9uZ3NUbzogeyB0eXBlOiBcImludFwiLCBkZWZhdWx0OiAxIH0sXG4gICAgY29sbGlkZXNXaXRoOiB7IHR5cGU6IFwiaW50XCIsIGRlZmF1bHQ6IDB4ZmZmZmZmZmYgfSxcbiAgICBlbWl0c1dpdGg6IHsgdHlwZTogXCJpbnRcIiwgZGVmYXVsdDogMCB9LFxuICAgIHNsZWVwaW5nOiB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiBmYWxzZSB9LFxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBsZXQgYm9kaWVzID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5ib2RpZXNcbiAgICBsZXQgbW92aW5nQm9kaWVzID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5tb3ZpbmdCb2RpZXNcbiAgICBsZXQgYnVmZmVyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5idWZmZXJzWzBdXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIHRoaXMuaWQgPSBib2RpZXMuaW5kZXhPZihudWxsKVxuICAgIGlmICh0aGlzLmlkIDwgMCkgdGhpcy5pZCA9IGJvZGllcy5sZW5ndGhcbiAgICBib2RpZXNbdGhpcy5pZF0gPSB0aGlzLmVsXG4gICAgaWYgKHRoaXMuZGF0YS50eXBlICE9PSBcInN0YXRpY1wiKSB7XG4gICAgICB0aGlzLm1pZCA9IG1vdmluZ0JvZGllcy5pbmRleE9mKG51bGwpXG4gICAgICBpZiAodGhpcy5taWQgPCAwKSB0aGlzLm1pZCA9IG1vdmluZ0JvZGllcy5sZW5ndGhcbiAgICAgIG1vdmluZ0JvZGllc1t0aGlzLm1pZF0gPSB0aGlzLmVsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubWlkID0gbnVsbFxuICAgIH1cbiAgICBsZXQgYm9keSA9IHsgbWlkOiB0aGlzLm1pZCB9XG4gICAgYm9keS50eXBlID0gdGhpcy5kYXRhLnR5cGVcbiAgICBib2R5LnBvc2l0aW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKFRIUkVFLlZlY3RvcjMudGVtcCgpKVxuICAgIGJvZHkucXVhdGVybmlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgIGlmICh0aGlzLm1pZCAhPT0gbnVsbCkge1xuICAgICAgbGV0IHAgPSB0aGlzLm1pZCAqIDhcbiAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3NpdGlvbi54XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zaXRpb24ueVxuICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnBvc2l0aW9uLnpcbiAgICAgIGJ1ZmZlcltwKytdID0gdGhpcy5kYXRhLnNsZWVwaW5nXG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi54XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi55XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi56XG4gICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi53XG4gICAgfVxuICAgIHRoaXMuc2hhcGVzID0gW11cbiAgICB0aGlzLnNsZWVwaW5nID0gdHJ1ZVxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgY3JlYXRlIFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKGJvZHkpKVxuICAgIC8vIGlmIChib2R5LnR5cGUgPT09IFwic3RhdGljXCIpIFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgYm9keS5wb3NpdGlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbihUSFJFRS5WZWN0b3IzLnRlbXAoKSlcbiAgICAgIGJvZHkucXVhdGVybmlvbiA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBwb3NpdGlvbiA9IFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKGJvZHkucG9zaXRpb24pKVxuICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBxdWF0ZXJuaW9uID0gXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0oYm9keS5xdWF0ZXJuaW9uKSlcbiAgICB9KVxuXG4gICAgaWYgKCF0aGlzLmVsLmdldEF0dHJpYnV0ZShcInNoYXBlXCIpKSB7XG4gICAgICBpZiAodGhpcy5lbC5maXJzdEVsZW1lbnRDaGlsZCkge1xuICAgICAgICBsZXQgZWxzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKFwiYS1ib3gsIGEtc3BoZXJlLCBhLWN5bGluZGVyXCIpXG4gICAgICAgIGlmIChlbHMpIGVscy5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICBpZiAoIWVsLmdldEF0dHJpYnV0ZShcInNoYXBlXCIpKSBlbC5zZXRBdHRyaWJ1dGUoXCJzaGFwZVwiLCB0cnVlKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoXCJzaGFwZVwiLCB0cnVlKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIChvbGREYXRhKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIGlmICh0aGlzLmRhdGEudHlwZSAhPT0gb2xkRGF0YS50eXBlKVxuICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiB0eXBlID0gXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0odGhpcy5kYXRhLnR5cGUpKVxuICAgIGlmICh0aGlzLmRhdGEuYmVsb25nc1RvICE9PSBvbGREYXRhLmJlbG9uZ3NUbylcbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgYmVsb25nc1RvID0gXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0odGhpcy5kYXRhLmJlbG9uZ3NUbykpXG4gICAgaWYgKHRoaXMuZGF0YS5jb2xsaWRlc1dpdGggIT09IG9sZERhdGEuY29sbGlkZXNXaXRoKVxuICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBjb2xsaWRlc1dpdGggPSBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbSh0aGlzLmRhdGEuY29sbGlkZXNXaXRoKSlcbiAgICBpZiAodGhpcy5kYXRhLmVtaXRzV2l0aCAhPT0gb2xkRGF0YS5lbWl0c1dpdGgpXG4gICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIGVtaXRzV2l0aCA9IFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKHRoaXMuZGF0YS5lbWl0c1dpdGgpKVxuICAgIC8vIGlmICh0aGlzLmRhdGEuc2xlZXBpbmcgIT09IG9sZERhdGEuc2xlZXBpbmcpXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuaWQgKyBcIiBzbGVlcGluZyA9IFwiICsgISEodGhpcy5kYXRhLnNsZWVwaW5nKSlcbiAgfSxcblxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5pZCArIFwiIHNsZWVwaW5nID0gdHJ1ZVwiKVxuICAgIHRoaXMuc2xlZXBpbmcgPSB0cnVlXG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IGJvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MuYm9kaWVzXG4gICAgbGV0IG1vdmluZ0JvZGllcyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3MubW92aW5nQm9kaWVzXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIGJvZGllc1t0aGlzLmlkXSA9IG51bGxcbiAgICBpZiAodGhpcy5taWQgIT09IG51bGwpXG4gICAgICBtb3ZpbmdCb2RpZXNbdGhpcy5taWRdID0gbnVsbFxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyB0aGlzLmlkICsgXCIgcmVtb3ZlXCIpXG4gIH0sXG5cbiAgdGljazogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBidWZmZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmJ1ZmZlcnNbMF1cbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgaWYgKHRoaXMubWlkICE9PSBudWxsKSB7XG4gICAgICBsZXQgcCA9IHRoaXMubWlkICogOFxuICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPD0gcCkgcmV0dXJuXG4gICAgICBpZiAodGhpcy5kYXRhLnR5cGUgPT09IFwia2luZW1hdGljXCIpIHtcbiAgICAgICAgbGV0IHZlYyA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbihUSFJFRS5WZWN0b3IzLnRlbXAoKSlcbiAgICAgICAgYnVmZmVyW3ArK10gPSB2ZWMueFxuICAgICAgICBidWZmZXJbcCsrXSA9IHZlYy55XG4gICAgICAgIGJ1ZmZlcltwKytdID0gdmVjLnpcbiAgICAgICAgdGhpcy5zbGVlcGluZyA9ICEhKGJ1ZmZlcltwKytdKVxuICAgICAgICBsZXQgcXVhdCA9IHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKFRIUkVFLlF1YXRlcm5pb24udGVtcCgpKVxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueFxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQueVxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQuelxuICAgICAgICBidWZmZXJbcCsrXSA9IHF1YXQud1xuICAgICAgfSBlbHNlIGlmIChidWZmZXJbcCArIDFdKSB7XG4gICAgICAgIGxldCBxdWF0ID0gVEhSRUUuUXVhdGVybmlvbi50ZW1wKClcblxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnBvc2l0aW9uLnNldChidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdKVxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnBhcmVudC53b3JsZFRvTG9jYWwodGhpcy5lbC5vYmplY3QzRC5wb3NpdGlvbilcbiAgICAgICAgdGhpcy5zbGVlcGluZyA9ICEhKGJ1ZmZlcltwKytdKVxuXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRRdWF0ZXJuaW9uKHF1YXQpXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucXVhdGVybmlvbi5tdWx0aXBseShxdWF0LmNvbmp1Z2F0ZSgpLm5vcm1hbGl6ZSgpKVxuICAgICAgICBxdWF0LnNldChidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSlcbiAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5xdWF0ZXJuaW9uLm11bHRpcGx5KHF1YXQubm9ybWFsaXplKCkpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGNvbW1hbmQ6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICBzd2l0Y2ggKHBhcmFtcy5zaGlmdCgpKSB7XG4gICAgICBjYXNlIFwiZW1pdHNcIjpcbiAgICAgICAgbGV0IGUgPSBwYXJhbXMuc2hpZnQoKVxuICAgICAgICBzd2l0Y2ggKGUuZXZlbnQpIHtcbiAgICAgICAgICBjYXNlIFwiY29sbGlzaW9uXCI6XG4gICAgICAgICAgICBsZXQgYm9kaWVzID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy5ib2RpZXNcbiAgICAgICAgICAgIGUuYm9keTEgPSBib2RpZXNbZS5ib2R5MV1cbiAgICAgICAgICAgIGUuYm9keTIgPSBib2RpZXNbZS5ib2R5Ml1cbiAgICAgICAgICAgIGlmICghZS5ib2R5MSB8fCAhZS5ib2R5MikgcmV0dXJuXG4gICAgICAgICAgICBlLnNoYXBlMSA9IGUuYm9keTEuY29tcG9uZW50cy5ib2R5LnNoYXBlc1tlLnNoYXBlMV1cbiAgICAgICAgICAgIGUuc2hhcGUyID0gZS5ib2R5Mi5jb21wb25lbnRzLmJvZHkuc2hhcGVzW2Uuc2hhcGUyXVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsLmVtaXQoZS5ldmVudCwgZSlcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbn0pXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcInNoYXBlXCIsIHtcbiAgZGVwZW5kZW5jaWVzOiBbXCJib2R5XCJdLFxuICBtdWx0aXBsZTogdHJ1ZSxcbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcImJveFwiIH0sXG4gICAgZGVuc2l0eTogeyB0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAxIH0sXG4gICAgZnJpY3Rpb246IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMC4yIH0sXG4gICAgcmVzdGl0dXRpb246IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMC4yIH0sXG4gICAgYmVsb25nc1RvOiB7IHR5cGU6IFwiaW50XCIsIGRlZmF1bHQ6IDEgfSxcbiAgICBjb2xsaWRlc1dpdGg6IHsgdHlwZTogXCJpbnRcIiwgZGVmYXVsdDogMHhmZmZmZmZmZiB9LFxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmJvZHkgPSB0aGlzLmVsXG4gICAgd2hpbGUgKHRoaXMuYm9keSAmJiAhdGhpcy5ib2R5Lm1hdGNoZXMoXCJbYm9keV1cIikpIHRoaXMuYm9keSA9IHRoaXMuYm9keS5wYXJlbnRFbGVtZW50XG4gICAgdGhpcy5ib2R5SWQgPSB0aGlzLmJvZHkuY29tcG9uZW50cy5ib2R5LmlkXG5cbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBsZXQgc2hhcGVzID0gdGhpcy5ib2R5LmNvbXBvbmVudHMuYm9keS5zaGFwZXNcbiAgICBpZiAoIXdvcmtlcikgcmV0dXJuXG4gICAgdGhpcy5pZCA9IHNoYXBlcy5pbmRleE9mKG51bGwpXG4gICAgaWYgKHRoaXMuaWQgPCAwKSB0aGlzLmlkID0gc2hhcGVzLmxlbmd0aFxuICAgIHNoYXBlc1t0aGlzLmlkXSA9IHRoaXMuZWxcblxuICAgIGxldCBzaGFwZSA9IHt9XG4gICAgc2hhcGUucG9zaXRpb24gPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oVEhSRUUuVmVjdG9yMy50ZW1wKCkpXG4gICAgdGhpcy5ib2R5Lm9iamVjdDNELndvcmxkVG9Mb2NhbChzaGFwZS5wb3NpdGlvbilcbiAgICBzaGFwZS5xdWF0ZXJuaW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFF1YXRlcm5pb24oVEhSRUUuUXVhdGVybmlvbi50ZW1wKCkpXG4gICAgbGV0IGJvZHlxdWF0ID0gdGhpcy5ib2R5Lm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKSlcbiAgICBzaGFwZS5xdWF0ZXJuaW9uLm11bHRpcGx5KGJvZHlxdWF0LmNvbmp1Z2F0ZSgpLm5vcm1hbGl6ZSgpKS5ub3JtYWxpemUoKVxuICAgIHNoYXBlLnNpemUgPSBUSFJFRS5WZWN0b3IzLnRlbXAoKS5zZXQoMSwgMSwgMSlcblxuICAgIHN3aXRjaCAodGhpcy5lbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgXCJhLXNwaGVyZVwiOlxuICAgICAgICBzaGFwZS50eXBlID0gXCJzcGhlcmVcIlxuICAgICAgICBzaGFwZS5zaXplLm11bHRpcGx5U2NhbGFyKHBhcnNlRmxvYXQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJyYWRpdXNcIikgfHwgMSkgKiAyKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImEtY3lsaW5kZXJcIjpcbiAgICAgICAgc2hhcGUudHlwZSA9IFwiY3lsaW5kZXJcIlxuICAgICAgICBzaGFwZS5zaXplLm11bHRpcGx5U2NhbGFyKHBhcnNlRmxvYXQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJyYWRpdXNcIikgfHwgMSkgKiAyKS55ID0gcGFyc2VGbG9hdCh0aGlzLmVsLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKSB8fCAxKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImEtYm94XCI6XG4gICAgICAgIHNoYXBlLnR5cGUgPSBcImJveFwiXG4gICAgICAgIHNoYXBlLnNpemUuc2V0KFxuICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiKSB8fCAxKSxcbiAgICAgICAgICBwYXJzZUZsb2F0KHRoaXMuZWwuZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpIHx8IDEpLFxuICAgICAgICAgIHBhcnNlRmxvYXQodGhpcy5lbC5nZXRBdHRyaWJ1dGUoXCJkZXB0aFwiKSB8fCAxKVxuICAgICAgICApXG4gICAgICAgIGJyZWFrXG4gICAgICAvLyBjYXNlIFwiYS1wbGFuZVwiOlxuICAgICAgLy8gICBzaGFwZS50eXBlID0gXCJwbGFuZVwiXG4gICAgICAvLyAgIGJyZWFrXG4gICAgfVxuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIHRoaXMuYm9keUlkICsgXCIgc2hhcGUgXCIgKyB0aGlzLmlkICsgXCIgY3JlYXRlIFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKHNoYXBlKSlcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgfSxcblxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgd29ya2VyID0gdGhpcy5lbC5zY2VuZUVsLnN5c3RlbXMucGh5c2ljcy53b3JrZXJcbiAgICBsZXQgc2hhcGVzID0gdGhpcy5ib2R5LmNvbXBvbmVudHMuYm9keS5zaGFwZXNcbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBib2R5IFwiICsgdGhpcy5ib2R5SWQgKyBcIiBzaGFwZSBcIiArIHRoaXMuaWQgKyBcIiByZW1vdmVcIilcbiAgICBzaGFwZXNbdGhpcy5pZF0gPSBudWxsXG4gIH1cbn0pXG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudChcImpvaW50XCIsIHtcbiAgZGVwZW5kZW5jaWVzOiBbXCJib2R5XCIsIFwic2hhcGVcIl0sXG4gIG11bHRpcGxlOiB0cnVlLFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6IHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJwcmlzbWVcIiB9LFxuICAgIHdpdGg6IHsgdHlwZTogXCJzZWxlY3RvclwiLCBkZWZhdWx0OiBcIltib2R5XVwiIH0sXG4gICAgbWluOiB7IHR5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDAgfSxcbiAgICBtYXg6IHsgdHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMCB9LFxuICAgIHBvczE6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMCwgeTogMCwgejogMCB9IH0sXG4gICAgcG9zMjogeyB0eXBlOiBcInZlYzNcIiwgZGVmYXVsdDogeyB4OiAwLCB5OiAwLCB6OiAwIH0gfSxcbiAgICBheGUxOiB7IHR5cGU6IFwidmVjM1wiLCBkZWZhdWx0OiB7IHg6IDEsIHk6IDAsIHo6IDAgfSB9LFxuICAgIGF4ZTI6IHsgdHlwZTogXCJ2ZWMzXCIsIGRlZmF1bHQ6IHsgeDogMSwgeTogMCwgejogMCB9IH0sXG4gICAgY29sbGlzaW9uOiB7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0OiBmYWxzZSB9LFxuICAgIGxpbWl0OiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxuICAgIG1vdG9yOiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxuICAgIHNwcmluZzogeyB0eXBlOiBcImFycmF5XCIgfSxcbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHdvcmtlciA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Mud29ya2VyXG4gICAgbGV0IGpvaW50cyA9IHRoaXMuZWwuc2NlbmVFbC5zeXN0ZW1zLnBoeXNpY3Muam9pbnRzXG4gICAgaWYgKCF3b3JrZXIpIHJldHVyblxuICAgIHRoaXMuaWQgPSBqb2ludHMuaW5kZXhPZihudWxsKVxuICAgIGlmICh0aGlzLmlkIDwgMCkgdGhpcy5pZCA9IGpvaW50cy5sZW5ndGhcbiAgICBqb2ludHNbdGhpcy5pZF0gPSB0aGlzLmVsXG5cbiAgICBsZXQgam9pbnQgPSB7fVxuICAgIGpvaW50LnR5cGUgPSB0aGlzLmRhdGEudHlwZVxuICAgIGpvaW50LnBvc2l0aW9uID0gdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKFRIUkVFLlZlY3RvcjMudGVtcCgpKVxuICAgIGpvaW50LnF1YXRlcm5pb24gPSB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbihUSFJFRS5RdWF0ZXJuaW9uLnRlbXAoKSlcbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJ3b3JsZCBqb2ludCBcIiArIHRoaXMuaWQgKyBcIiBjcmVhdGUgXCIgKyBjbWQuc3RyaW5naWZ5UGFyYW0oam9pbnQpKVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKG9sZERhdGEpIHtcbiAgICBpZiAoIXRoaXMuZWwuYm9keSkgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSwgMjU2KVxuICAgIGlmICghdGhpcy5kYXRhLndpdGguYm9keSkgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSwgMjU2KVxuICAgIGlmICghdGhpcy5qb2ludCkge1xuICAgICAgbGV0IGpjID0gbmV3IE9JTU8uSm9pbnRDb25maWcoKVxuICAgICAgamMuYm9keTEgPSB0aGlzLmVsLmJvZHlcbiAgICAgIGpjLmJvZHkyID0gdGhpcy5kYXRhLndpdGguYm9keVxuICAgICAgbGV0IGRlZzJyYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgICBzd2l0Y2ggKHRoaXMuZGF0YS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJkaXN0YW5jZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5EaXN0YW5jZUpvaW50KGpjLCB0aGlzLmRhdGEubWluLCB0aGlzLmRhdGEubWF4KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJoaW5nZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5IaW5nZUpvaW50KGpjLCB0aGlzLmRhdGEubWluICogZGVnMnJhZCwgdGhpcy5kYXRhLm1heCAqIGRlZzJyYWQpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInByaXNtZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5QcmlzbWF0aWNKb2ludChqYywgdGhpcy5kYXRhLm1pbiAqIGRlZzJyYWQsIHRoaXMuZGF0YS5tYXggKiBkZWcycmFkKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJzbGlkZVwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5TbGlkZXJKb2ludChqYywgdGhpcy5kYXRhLm1pbiwgdGhpcy5kYXRhLm1heClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwiYmFsbFwiOlxuICAgICAgICAgIHRoaXMuam9pbnQgPSBuZXcgT0lNTy5CYWxsQW5kU29ja2V0Sm9pbnQoamMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcIndoZWVsXCI6XG4gICAgICAgICAgdGhpcy5qb2ludCA9IG5ldyBPSU1PLldoZWVsSm9pbnQoamMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWwuc2NlbmVFbC5waHlzaWNzV29ybGQuYWRkSm9pbnQodGhpcy5qb2ludClcbiAgICB9XG4gICAgdGhpcy5qb2ludC5sb2NhbEFuY2hvclBvaW50MS5jb3B5KHRoaXMuZGF0YS5wb3MxKVxuICAgIHRoaXMuam9pbnQubG9jYWxBbmNob3JQb2ludDIuY29weSh0aGlzLmRhdGEucG9zMilcbiAgICBpZiAodGhpcy5qb2ludC5sb2NhbEF4aXMxKSB7XG4gICAgICB0aGlzLmpvaW50LmxvY2FsQXhpczEuY29weSh0aGlzLmRhdGEuYXhlMSlcbiAgICAgIHRoaXMuam9pbnQubG9jYWxBeGlzMi5jb3B5KHRoaXMuZGF0YS5heGUyKVxuICAgIH1cbiAgICB0aGlzLmpvaW50LmFsbG93Q29sbGlzaW9uID0gdGhpcy5kYXRhLmNvbGxpc2lvblxuXG4gICAgbGV0IGxtID0gdGhpcy5qb2ludC5yb3RhdGlvbmFsTGltaXRNb3RvcjEgfHwgdGhpcy5qb2ludC5saW1pdE1vdG9yXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5saW1pdC5sZW5ndGggPT0gMilcbiAgICBsbS5zZXRMaW1pdChwYXJzZUZsb2F0KHRoaXMuZGF0YS5saW1pdFswXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEubGltaXRbMV0pIHx8IDApXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5tb3Rvci5sZW5ndGggPT0gMilcbiAgICBsbS5zZXRNb3RvcihwYXJzZUZsb2F0KHRoaXMuZGF0YS5tb3RvclswXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEubW90b3JbMV0pIHx8IDApXG4gICAgLy8gaWYgKHRoaXMuZGF0YS5zcHJpbmcubGVuZ3RoID09IDIpXG4gICAgbG0uc2V0U3ByaW5nKHBhcnNlRmxvYXQodGhpcy5kYXRhLnNwcmluZ1swXSkgfHwgMCwgcGFyc2VGbG9hdCh0aGlzLmRhdGEuc3ByaW5nWzFdKSB8fCAwKVxuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCB3b3JrZXIgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLndvcmtlclxuICAgIGxldCBqb2ludHMgPSB0aGlzLmVsLnNjZW5lRWwuc3lzdGVtcy5waHlzaWNzLmpvaW50c1xuICAgIGlmICghd29ya2VyKSByZXR1cm5cbiAgICBqb2ludHNbdGhpcy5pZF0gPSBudWxsXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwid29ybGQgam9pbnQgXCIgKyB0aGlzLmlkICsgXCIgcmVtb3ZlXCIpXG4gIH0sXG5cbn0pXG5cbiIsInJlcXVpcmUoXCIuL2xpYnMvcG9vbHNcIilcclxucmVxdWlyZShcIi4vbGlicy9jb3B5V29ybGRQb3NSb3RcIilcclxuXHJcbnJlcXVpcmUoXCIuL2NvbXBvbmVudHMvaW5jbHVkZVwiKVxyXG5yZXF1aXJlKFwiLi9jb21wb25lbnRzL3BoeXNpY3NcIilcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcGFyc2U6IGZ1bmN0aW9uIChjbWQpIHtcclxuICAgIGxldCB3b3JkcyA9IGNtZC5zcGxpdChcIiBcIilcclxuICAgIGxldCBhcmdzID0gW11cclxuICAgIGZvciAobGV0IHdvcmQgb2Ygd29yZHMpIHtcclxuICAgICAgaWYgKHdvcmQpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXJncy5wdXNoKEpTT04ucGFyc2Uod29yZCkpXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGlmICh3b3JkICE9PSBcIj1cIilcclxuICAgICAgICAgICAgYXJncy5wdXNoKHdvcmQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJnc1xyXG4gIH0sXHJcbiAgc3RyaW5naWZ5UGFyYW06IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2VBbGwoXCIgXCIsIFwiXFxcXHUwMDIwXCIpLnJlcGxhY2VBbGwoXCJcXFwiX1wiLCBcIlxcXCJcIilcclxuICB9XHJcbn0iLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xyXG5cclxuQUZSQU1FLkFFbnRpdHkucHJvdG90eXBlLmNvcHlXb3JsZFBvc1JvdCA9IGZ1bmN0aW9uIChzcmNFbCkge1xyXG4gIGxldCBxdWF0ID0gVEhSRUUuUXVhdGVybmlvbi50ZW1wKClcclxuICBsZXQgc3JjID0gc3JjRWwub2JqZWN0M0RcclxuICBsZXQgZGVzdCA9IHRoaXMub2JqZWN0M0RcclxuICBpZiAoIXNyYykgcmV0dXJuXHJcbiAgaWYgKCFkZXN0KSByZXR1cm5cclxuICBpZiAoIWRlc3QucGFyZW50KSByZXR1cm5cclxuICBzcmMuZ2V0V29ybGRQb3NpdGlvbihkZXN0LnBvc2l0aW9uKVxyXG4gIGRlc3QucGFyZW50LndvcmxkVG9Mb2NhbChkZXN0LnBvc2l0aW9uKVxyXG5cclxuICBkZXN0LmdldFdvcmxkUXVhdGVybmlvbihxdWF0KVxyXG4gIGRlc3QucXVhdGVybmlvbi5tdWx0aXBseShxdWF0LmNvbmp1Z2F0ZSgpLm5vcm1hbGl6ZSgpKVxyXG4gIHNyYy5nZXRXb3JsZFF1YXRlcm5pb24ocXVhdClcclxuICBkZXN0LnF1YXRlcm5pb24ubXVsdGlwbHkocXVhdC5ub3JtYWxpemUoKSlcclxufSIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcblxyXG5mdW5jdGlvbiBtYWtlUG9vbChDbGFzcykge1xyXG4gIENsYXNzLl9wb29sID0gW11cclxuICBDbGFzcy5faW5Vc2UgPSBbXVxyXG4gIENsYXNzLnRlbXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQgdiA9IENsYXNzLl9wb29sLnBvcCgpIHx8IG5ldyBDbGFzcygpXHJcbiAgICBDbGFzcy5faW5Vc2UucHVzaCh2KVxyXG4gICAgaWYgKCFDbGFzcy5fZ2MpXHJcbiAgICAgIENsYXNzLl9nYyA9IHNldFRpbWVvdXQoQ2xhc3MuX3JlY3ljbGUpXHJcbiAgICByZXR1cm4gdlxyXG4gIH1cclxuICBDbGFzcy5fcmVjeWNsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHdoaWxlIChDbGFzcy5faW5Vc2UubGVuZ3RoKVxyXG4gICAgICBDbGFzcy5fcG9vbC5wdXNoKENsYXNzLl9pblVzZS5wb3AoKSlcclxuICAgIENsYXNzLl9nYyA9IGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG5tYWtlUG9vbChUSFJFRS5WZWN0b3IyKVxyXG5tYWtlUG9vbChUSFJFRS5WZWN0b3IzKVxyXG5tYWtlUG9vbChUSFJFRS5RdWF0ZXJuaW9uKVxyXG5tYWtlUG9vbChUSFJFRS5NYXRyaXgzKVxyXG5tYWtlUG9vbChUSFJFRS5NYXRyaXg0KVxyXG4iXX0=
