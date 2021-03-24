/* global AFRAME, THREE, OIMO */

global.OIMO = require("./libs/oimo")
global.world = new OIMO.World()
global.bodies = []
global.movingBodies = []

let vec = new OIMO.Vec3()
let quat = new OIMO.Quat()

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
    world.step()
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      if (!body) continue
      if (body.isKinematic) {
        vec.set(buffer[mid * 8 + 0], buffer[mid * 8 + 1], buffer[mid * 8 + 2])
        body.setPosition(vec)
        quat.set(buffer[mid * 8 + 4], buffer[mid * 8 + 5], buffer[mid * 8 + 6], buffer[mid * 8 + 7])
        body.setQuaternion(quat)
      } else {
        buffer[mid * 8 + 0] = body.position.x
        buffer[mid * 8 + 1] = body.position.y
        buffer[mid * 8 + 2] = body.position.z
        buffer[mid * 8 + 4] = body.quaternion.x
        buffer[mid * 8 + 5] = body.quaternion.y
        buffer[mid * 8 + 6] = body.quaternion.z
        buffer[mid * 8 + 7] = body.quaternion.w
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
    case "create":
      bodies[id] = body = world.add(params[0])
      body._mid_ = params[0].mid
      if (body._mid_ !== null)
        movingBodies[body._mid_] = body
      break
    case "remove":
      world.removeRigidBody(body)
      bodies[id] = null
      if (body._mid_ !== null)
        movingBodies[body._mid_] = null
      break
    case "position":
      body.position.copy(params[0])
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