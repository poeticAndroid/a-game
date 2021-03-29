/* global AFRAME, THREE, OIMO */

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
    let command = parseCommand(e.data)
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
      world.step()
      nextStep += world.timerate
      if (now > nextStep)
        nextStep = now
    }
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
      } else {
        buffer[p++] = body.pos.x
        buffer[p++] = body.pos.y
        buffer[p++] = body.pos.z
        p++
        buffer[p++] = body.quaternion.x
        buffer[p++] = body.quaternion.y
        buffer[p++] = body.quaternion.z
        buffer[p++] = body.quaternion.w
      }
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
        move: params[0].type === "dynamic",
        kinematic: params[0].type === "kinematic",
      })
      body.resetPosition(params[0].position.x, params[0].position.y, params[0].position.z)
      body.resetQuaternion(params[0].quaternion)
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
      body.resetPosition(params[0])
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
      body.addShape(body._shapes_[id] = shape)
      break
    case "remove":
      body.removeShape(shape)
      body._shapes_[id] = null
      break
  }
}

function parseCommand(cmd) {
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
}

init()