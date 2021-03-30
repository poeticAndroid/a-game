/* global AFRAME, THREE, OIMO */

const cmd = require("./libs/cmdCodec")

global.OIMO = require("./libs/oimo")
global.world = new OIMO.World()
global.bodies = []
global.movingBodies = []

let vec = new OIMO.Vec3()
let quat = new OIMO.Quat()
let nextStep = 0

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
    if (now > nextStep) {
      for (let mid = 0; mid < movingBodies.length; mid++) {
        let body = movingBodies[mid]
        let p = mid * 8
        if (!body) continue
        if (body.isKinematic) {
          vec.set(buffer[p++], buffer[p++], buffer[p++])
          body.setPosition(vec)
          p++
          quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
          body.setQuaternion(quat)
        }
      }
      world.step()
      nextStep += world.timerate
      if (now > nextStep)
        nextStep = now + world.timerate / 2
    }
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      let p = mid * 8
      if (!body) continue
      if (!body.isKinematic) {
        buffer[p++] = body.pos.x
        buffer[p++] = body.pos.y
        buffer[p++] = body.pos.z
        p++
        buffer[p++] = body.quaternion.x
        buffer[p++] = body.quaternion.y
        buffer[p++] = body.quaternion.z
        buffer[p++] = body.quaternion.w
      }
      emitCollisions(body)
    }
    postMessage(buffer, [buffer.buffer])
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
      // body._shapes_.forEach(shape => { shape._emitsWith_ = params[0] })
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


function emitCollisions(body) {
  let b1, b2
  let contact = world.contacts
  while (contact !== null) {
    b1 = contact.body1
    b2 = contact.body2
    if ((b1 === body && (b2._belongsTo_ & b1._emitsWith_)) || (b2 === body && (b1._belongsTo_ & b2._emitsWith_))) {
      if (contact.touching && !contact.close) {
        let other = b1 === body ? b2 : b1
        let shape1 = b1 === body ? contact.shape1 : contact.shape2
        let shape2 = b1 === body ? contact.shape2 : contact.shape1
        let event = {
          event: "collision",
          body1: body._id_,
          body2: other._id_,
          shape1: shape1._id_,
          shape2: shape2._id_
        }
        postMessage("world body " + body._id_ + " emits " + cmd.stringifyParam(event))
      }
    }
    contact = contact.next
  }
}

init()