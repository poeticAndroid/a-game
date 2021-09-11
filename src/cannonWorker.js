/* global AFRAME, THREE, CANNON */
if (typeof window !== "undefined")
  return

const cmd = require("./libs/cmdCodec")

global.CANNON = require("./libs/cannon")
global.world = new CANNON.World()
global.bodies = []
global.movingBodies = []
global.joints = []

let vec = new CANNON.Vec3()
let quat = new CANNON.Quaternion()
let cyloff = new CANNON.Quaternion()
let lastStep = 0

function init() {
  cyloff.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
  addEventListener("message", onMessage)
}

function onMessage(e) {
  if (typeof e.data === "string") {
    let command = cmd.parse(e.data)
    switch (command.shift()) {
      case "log":
        console.log(...command)
        break
      case "world":
        worldCommand(command)
        break
    }
  }
  else if (e.data instanceof Float64Array) {
    let buffer = e.data
    let now = Date.now()
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      let p = mid * 8
      if (!body) continue
      if (body.type === CANNON.Body.KINEMATIC) {
        vec.set(buffer[p++], buffer[p++], buffer[p++])
        body.position.copy(vec)
        buffer[p++] = body.sleepState === CANNON.Body.SLEEPING
        quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
        body.quaternion.copy(quat)
      }
    }
    if (now - lastStep < 128) {
      world.step((now - lastStep) / 1000)
    }
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      let p = mid * 8
      if (!body) continue
      if (body.type !== CANNON.Body.KINEMATIC) {
        buffer[p++] = body.position.x
        buffer[p++] = body.position.y
        buffer[p++] = body.position.z
        buffer[p++] = body.sleepState === CANNON.Body.SLEEPING
        buffer[p++] = body.quaternion.x
        buffer[p++] = body.quaternion.y
        buffer[p++] = body.quaternion.z
        buffer[p++] = body.quaternion.w
      }
    }
    postMessage(buffer, [buffer.buffer])
    lastStep = now
  }
}

function worldCommand(params) {
  if (typeof params[0] === "number") {
    params.shift()
  }
  switch (params.shift()) {
    case "body":
      bodyCommand(params)
      break
    case "joint":
      jointCommand(params)
      break
    case "gravity":
      world.gravity.copy(params[0])
      break
    case "eval":
      eval(params[0])
      break
  }
}

function bodyCommand(params) {
  let id = params.shift()
  let body = bodies[id]
  if (!body && params[0] !== "create") return
  switch (params.shift()) {
    case "shape":
      shapeCommand(body, params)
      break
    case "create":
      if (body) {
        world.removeBody(body)
        if (body._mid_ !== null)
          movingBodies[body._mid_] = null
      }
      body = new CANNON.Body({
        type: params[0].type === "dynamic" ? CANNON.Body.DYNAMIC : params[0].type === "kinematic" ? CANNON.Body.KINEMATIC : CANNON.Body.STATIC,
        sleepSpeedLimit: 1,
        position: new CANNON.Vec3().copy(params[0].position),
        quaternion: new CANNON.Quaternion().copy(params[0].quaternion),
      })
      body.material = new CANNON.Material()
      body._id_ = id
      body._mid_ = params[0].mid
      if (body._mid_ !== null)
        movingBodies[body._mid_] = body
      body._shapes_ = []
      world.addBody(bodies[id] = body)
      break
    case "remove":
      world.removeBody(body)
      bodies[id] = null
      if (body._mid_ !== null)
        movingBodies[body._mid_] = null
      break
    case "position":
      body.position.copy(params[0])
      break
    case "quaternion":
      body.quaternion.copy(params[0])
      break
    case "type":
      body.type = params[0] === "dynamic" ? CANNON.Body.DYNAMIC : params[0] === "kinematic" ? CANNON.Body.KINEMATIC : CANNON.Body.STATIC
      break
    case "mass":
      body.mass = body.type === CANNON.Body.STATIC ? 0 : params[0]
      body.updateMassProperties()
      break
    case "friction":
      body.material.friction = params[0]
      break
    case "restitution":
      body.material.restitution = params[0]
      break
    case "belongsTo":
      body.collisionFilterGroup = params[0]
      break
    case "collidesWith":
      body.collisionFilterMask = params[0]
      break
    case "emitsWith":
      if (params[0] && !body._emitsWith_) {
        body.addEventListener("collide", onCollide)
      }
      if (body._emitsWith_ && !params[0]) {
        body.removeEventListener("collide", onCollide)
      }
      body._emitsWith_ = params[0]
      break
    case "sleeping":
      if (params[0]) body.sleep()
      else body.wakeUp()
      break
    case "impulse":
      body.applyImpulse(new CANNON.Vec3().copy(params[0]), new CANNON.Vec3().copy(params[1]))
      break
    case "eval":
      eval("const body = bodies[" + id + "];" + params[0])
      break
  }
}

function jointCommand(params) {
  let id = params.shift()
  let joint = joints[id]
  if (!joint && params[0] !== "create") return
  switch (params.shift()) {
    case "create":
      if (joint) {
        world.removeConstraint(joint)
      }
      switch (params[0].type) {
        case "hinge":
          joint = new CANNON.HingeConstraint(
            bodies[params[0].body1],
            bodies[params[0].body2],
            {
              pivotA: new CANNON.Vec3().copy(params[0].pivot1),
              pivotB: new CANNON.Vec3().copy(params[0].pivot2),
              axisA: new CANNON.Vec3().copy(params[0].axis1),
              axisB: new CANNON.Vec3().copy(params[0].axis2)
            }
          )
          break
        case "distance":
          joint = new CANNON.DistanceConstraint(
            bodies[params[0].body1],
            bodies[params[0].body2]
          )
          break
        case "lock":
          joint = new CANNON.LockConstraint(
            bodies[params[0].body1],
            bodies[params[0].body2]
          )
          break
        default:
          joint = new CANNON.PointToPointConstraint(
            bodies[params[0].body1],
            new CANNON.Vec3().copy(params[0].pivot1),
            bodies[params[0].body2],
            new CANNON.Vec3().copy(params[0].pivot2)
          )
          break
      }
      joint.collideConnected = params[0].collision
      joint._id_ = id
      world.addConstraint(joints[id] = joint)
      break
    case "remove":
      world.removeConstraint(joint)
      joints[id] = null
      break
    case "eval":
      eval("const joint = joints[" + id + "];" + params[0])
      break
  }
}

function shapeCommand(body, params) {
  if (!body) return
  let id = params.shift()
  let shape = body._shapes_[id]
  if (!shape && params[0] !== "create") return
  switch (params.shift()) {
    case "create":
      if (shape)
        body.removeShape(shape)
      let quat = (new CANNON.Quaternion()).copy(params[0].quaternion)
      switch (params[0].type) {
        case "sphere": shape = new CANNON.Sphere(params[0].size.x / 2); break
        case "cylinder": shape = new CANNON.Cylinder(params[0].size.x / 2, params[0].size.x / 2, params[0].size.y, 16); quat.mult(cyloff, quat); break
        default: shape = new CANNON.Box(new CANNON.Vec3().copy(params[0].size).scale(0.5))
      }
      shape.material = body.material
      shape._id_ = id
      body.addShape(body._shapes_[id] = shape, (new CANNON.Vec3()).copy(params[0].position), quat)
      body.updateMassProperties()
      break
    case "remove":
      // body.removeShape(shape)
      let i = body.shapes.indexOf(shape)
      if (i >= 0) body.shapes.splice(i, 1)
      body._shapes_[id] = null
      body.updateMassProperties()
      break
    case "eval":
      eval("const body = bodies[" + body._id_ + "],shape = body._shapes_[" + id + "];" + params[0])
      break
  }
}




function onCollide(e) {
  let b1 = e.contact.bi
  let b2 = e.contact.bj
  if (this === b1 && (b1._emitsWith_ & b2.collisionFilterGroup)) {
    postMessage("world body " + b1._id_ + " emits " + cmd.stringifyParam({
      event: "collision",
      body1: b1._id_,
      body2: b2._id_,
      shape1: e.contact.si._id_,
      shape2: e.contact.sj._id_
    }))
  }
  if (this === b2 && (b2._emitsWith_ & b1.collisionFilterGroup)) {
    postMessage("world body " + b2._id_ + " emits " + cmd.stringifyParam({
      event: "collision",
      body1: b2._id_,
      body2: b1._id_,
      shape1: e.contact.sj._id_,
      shape2: e.contact.si._id_
    }))
  }
}
init()