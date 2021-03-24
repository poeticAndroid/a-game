/* global AFRAME, THREE, OIMO */

let scripts = document.getElementsByTagName("script")
const workerUrl = scripts[scripts.length - 1].src

function stringify(val) {
  return JSON.stringify(val).replaceAll(" ", "\\u0020")
}

AFRAME.registerSystem("physics", {
  schema: {
    enabled: { type: "boolean", default: false },
    gravity: { type: "vec3", default: { x: 0, y: -9.8, z: 0 } },
    debug: { type: "boolean", default: false }
  },

  update: function () {
    if (this.data.enabled) {
      if (!this.worker) {
        this.worker = new Worker(workerUrl)
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
        if (bods[i]) {
          bods[i].object3D.getWorldPosition(vec)
          b[i * 8 + 0] = vec.x
          b[i * 8 + 1] = vec.y
          b[i * 8 + 2] = vec.z
          bods[i].object3D.getWorldQuaternion(quat)
          b[i * 8 + 4] = quat.x
          b[i * 8 + 5] = quat.y
          b[i * 8 + 6] = quat.z
          b[i * 8 + 7] = quat.w
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
      buffer[this.mid * 8 + 0] = body.position.x
      buffer[this.mid * 8 + 1] = body.position.y
      buffer[this.mid * 8 + 2] = body.position.z
      buffer[this.mid * 8 + 4] = body.quaternion.x
      buffer[this.mid * 8 + 5] = body.quaternion.y
      buffer[this.mid * 8 + 6] = body.quaternion.z
      buffer[this.mid * 8 + 7] = body.quaternion.w
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
      if (this.data.type === "kinematic") {
        let vec = this.el.object3D.getWorldPosition(THREE.Vector3.temp())
        buffer[this.mid * 8 + 0] = vec.x
        buffer[this.mid * 8 + 1] = vec.y
        buffer[this.mid * 8 + 2] = vec.z
        let quat = this.el.object3D.getWorldQuaternion(THREE.Quaternion.temp())
        buffer[this.mid * 8 + 4] = quat.x
        buffer[this.mid * 8 + 5] = quat.y
        buffer[this.mid * 8 + 6] = quat.z
        buffer[this.mid * 8 + 7] = quat.w
      } else {
        let quat = THREE.Quaternion.temp()

        this.el.object3D.position.x = buffer[this.mid * 8 + 0]
        this.el.object3D.position.y = buffer[this.mid * 8 + 1]
        this.el.object3D.position.z = buffer[this.mid * 8 + 2]
        this.el.object3D.parent.worldToLocal(this.el.object3D.position)

        this.el.object3D.getWorldQuaternion(quat)
        this.el.object3D.quaternion.multiply(quat.conjugate().normalize())
        quat.x = buffer[this.mid * 8 + 4]
        quat.y = buffer[this.mid * 8 + 5]
        quat.z = buffer[this.mid * 8 + 6]
        quat.w = buffer[this.mid * 8 + 7]
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

