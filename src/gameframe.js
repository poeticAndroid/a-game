if (typeof window == "undefined") {
  require("./oimoWorker")
} else {
  require("./libs/pools")
  require("./libs/copyWorldPosRot")

  require("./components/include")
  require("./components/physics")
}