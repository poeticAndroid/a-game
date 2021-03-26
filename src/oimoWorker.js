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
    }
    if (now > nextStep) {
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
    case "create":
      console.log(params)
      bodies[id] = body = world.add({
        move: params[0].type === "dynamic",
        kinematic: params[0].type === "kinematic",
      })
      body.resetQuaternion(params[0].quaternion)
      body.resetPosition(params[0].position.x, params[0].position.y, params[0].position.z)
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