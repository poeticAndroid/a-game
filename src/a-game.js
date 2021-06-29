require("./libs/pools")
require("./libs/copyWorldPosRot")
require("./libs/ensureElement")
require("./libs/touchGestures")
require("./libs/betterRaycaster")

setTimeout(() => {
  document.body.addEventListener("swipeup", e => {
    document.body.requestFullscreen()
  })
})

require("./components/grabbing")
require("./components/include")
require("./components/injectplayer")
require("./components/locomotion")
require("./components/onevent")
require("./components/onstate")
require("./components/physics")

require("./primitives/a-hand")
require("./primitives/a-main")
require("./primitives/a-player")

const pkg = require("../package")
console.log(`${pkg.title} Version ${pkg.version} by ${pkg.author}\n(${pkg.homepage})`)
