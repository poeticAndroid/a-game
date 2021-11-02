/* global AFRAME, THREE */

const cmd = require("../libs/cmdCodec")
const pkg = require("../../package")


AFRAME.registerSystem("physics", {
  schema: {
    workerUrl: { type: "string", default: `https://cdn.jsdelivr.net/npm/a-game@${pkg.version}/dist/cannonWorker.min.js` },
    gravity: { type: "vec3", default: { x: 0, y: -10, z: 0 } },
    debug: { type: "boolean", default: false }
  },

  update() {
    if (this.data.workerUrl) {
      if (!this.worker) {
        if (this.data.workerUrl.includes("//")) {
          let script = `importScripts(${JSON.stringify(this.data.workerUrl)})`
          this.worker = new Worker(`data:text/javascript;base64,${btoa(script)}`)
        } else {
          this.worker = new Worker(this.data.workerUrl)
        }
        this.worker.postMessage("log " + cmd.stringifyParam("Physics worker ready!"))
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

  remove() {
    this.worker && this.worker.terminate()
    this.worker = null
    this.bodies = []
    this.movingBodies = []
  },

  tick(time, timeDelta) {
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
          bods[i].object3D.localToWorld(vec.set(0, 0, 0))
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

  onMessage(e) {
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

  command(params) {
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
  },
  eval(expr) {
    this.worker.postMessage("world eval " + cmd.stringifyParam(expr))
  }
})

require("./physics/body")
require("./physics/shape")
require("./physics/joint")
