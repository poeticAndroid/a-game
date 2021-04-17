require("./libs/pools")
require("./libs/copyWorldPosRot")
require("./libs/ensureElement")
require("./libs/touchGestures")

setTimeout(() => {
  document.body.addEventListener("swipeup", e => {
    document.body.requestFullscreen()
  })
})

require("./components/include")
require("./components/physics")
require("./components/injectplayer")
require("./components/locomotion")

require("./primitives/a-main")
require("./primitives/a-player")
require("./primitives/a-hand")

const pkg = require("../package")
console.log(`${pkg.title} Version ${pkg.version} by ${pkg.author}`)
