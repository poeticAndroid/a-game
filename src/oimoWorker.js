/* global AFRAME, THREE, OIMO */

const cmd = require("./libs/cmdCodec")

global.OIMO = require("./libs/oimo")
global.world = new OIMO.World()
global.bodies = []
global.movingBodies = []
global.joints = []

let vec = new OIMO.Vec3()
let quat = new OIMO.Quat()
let lastStep = 0
let nextStep = Date.now()

function init() {
  addEventListener("message", onMessage)
}

function onMessage(e) {
  if (typeof e.data === "string") {
    let command = cmd.parse(e.data)
    switch (command.shift()) {
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
      if (body.isKinematic) {
        vec.set(buffer[p++], buffer[p++], buffer[p++])
        body.setPosition(vec)
        buffer[p++] = body.sleeping
        quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
        body.setQuaternion(quat)
      }
    }
    if (now - lastStep > 1024) nextStep = now
    let deadline = Date.now() + 256
    while (now > nextStep && Date.now() < deadline) {
      world.step()
      nextStep += world.timerate
      emitCollisions()
    }
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      let p = mid * 8
      if (!body) continue
      if (!body.isKinematic) {
        buffer[p++] = body.pos.x
        buffer[p++] = body.pos.y
        buffer[p++] = body.pos.z
        buffer[p++] = body.sleeping
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
  }
}

function bodyCommand(params) {
  let id = params.shift()
  let body = bodies[id]
  switch (params.shift()) {
    case "shape":
      shapeCommand(body, params)
      break
    case "create":
      if (body) {
        world.removeRigidBody(body)
        if (body._mid_ !== null)
          movingBodies[body._mid_] = null
      }
      bodies[id] = body = world.add({
        move: params[0].type !== "static",
        kinematic: params[0].type === "kinematic",
      })
      body.resetPosition(params[0].position.x, params[0].position.y, params[0].position.z)
      body.resetQuaternion(params[0].quaternion)
      body._id_ = id
      body._mid_ = params[0].mid
      if (body._mid_ !== null)
        movingBodies[body._mid_] = body
      body._shapes_ = [body.shapes]
      break
    case "remove":
      world.removeRigidBody(body)
      bodies[id] = null
      if (body._mid_ !== null)
        movingBodies[body._mid_] = null
      break
    case "position":
      body.resetPosition(params[0].x, params[0].y, params[0].z)
      break
    case "quaternion":
      body.resetQuaternion(params[0])
      break
    case "type":
      body.move = params[0] !== "static"
      body.isKinematic = params[0] === "kinematic"

      // body can sleep or not
      if (body.isKinematic) body.allowSleep = false
      else body.allowSleep = true

      // body static or dynamic
      if (body.move) {
        body.setupMass(OIMO.BODY_DYNAMIC)
      } else {
        body.setupMass(OIMO.BODY_STATIC)
      }

      // force sleep on not
      if (body.move) {
        body.awake()
      }
      break
    case "belongsTo":
      body._belongsTo_ = params[0]
      body._shapes_.forEach(shape => { shape.belongsTo = params[0] })
      break
    case "collidesWith":
      body._collidesWith_ = params[0]
      body._shapes_.forEach(shape => { shape.collidesWith = params[0] })
      break
    case "emitsWith":
      body._emitsWith_ = params[0]
      break
    case "sleeping":
      if (params[0]) body.sleep()
      else body.awake()
      break
  }
}

function jointCommand(params) {
  let id = params.shift()
  let joint = joints[id]
  switch (params.shift()) {
    case "create":
      if (joint) {
        world.removeJoint(joint)
      }
      joints[id] = joint = world.add({
        move: params[0].type !== "static",
        kinematic: params[0].type === "kinematic",
      })
      joint.resetPosition(params[0].position.x, params[0].position.y, params[0].position.z)
      joint.resetQuaternion(params[0].quaternion)
      joint._id_ = id
      break
    case "remove":
      world.removeJoint(joint)
      joints[id] = null
      break
  }
}

function shapeCommand(body, params) {
  if (!body) return
  let id = params.shift()
  let shape = body._shapes_[id]
  switch (params.shift()) {
    case "create":
      if (shape)
        body.removeShape(shape)
      let sc = new OIMO.ShapeConfig()
      sc.relativePosition.copy(params[0].position)
      sc.relativeRotation.setQuat(quat.copy(params[0].quaternion))
      switch (params[0].type) {
        case "sphere": shape = new OIMO.Sphere(sc, params[0].size.x / 2); break
        case "cylinder": shape = new OIMO.Cylinder(sc, params[0].size.x / 2, params[0].size.y); break
        // case "plane": shape = new OIMO.Plane(sc); break
        default: shape = new OIMO.Box(sc, params[0].size.x, params[0].size.y, params[0].size.z)
      }
      shape._id_ = id
      shape.belongsTo = body._belongsTo_
      shape.collidesWith = body._collidesWith_
      // shape._emitsWith_ = body._emitsWith_
      body.addShape(body._shapes_[id] = shape)
      break
    case "remove":
      body.removeShape(shape)
      body._shapes_[id] = null
      break
  }
}


function emitCollisions() {
  for (let contact = world.contacts; contact; contact = contact.next) {
    if (contact.touching && !contact.close) {
      let b1 = contact.body1
      let b2 = contact.body2
      if (b1._emitsWith_ & b2._belongsTo_) {
        postMessage("world body " + b1._id_ + " emits " + cmd.stringifyParam({
          event: "collision",
          body1: b1._id_,
          body2: b2._id_,
          shape1: contact.shape1._id_,
          shape2: contact.shape2._id_
        }))
      }
      if (b2._emitsWith_ & b1._belongsTo_) {
        postMessage("world body " + b2._id_ + " emits " + cmd.stringifyParam({
          event: "collision",
          body1: b2._id_,
          body2: b1._id_,
          shape1: contact.shape2._id_,
          shape2: contact.shape1._id_
        }))
      }
    }
  }
}

init()