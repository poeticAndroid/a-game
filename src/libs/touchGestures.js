let _addEventListener = Element.prototype.addEventListener
let _removeEventListener = Element.prototype.removeEventListener
let init = el => {
  if (el._tgest) return el._tgest
  el._tgest = {
    handlers: {
      swipeup: [],
      swipedown: [],
      swipeleft: [],
      swiperight: [],
      tap: [],
      hold: []
    }
  }
  let cx, cy, to, held
  let emit = (type, e) => {
    if (el._tgest.handlers[type]) {
      for (let handler of el._tgest.handlers[type]) {
        handler(e)
      }
    } else console.log(type, el._tgest.handlers[type])
  }
  el.addEventListener("touchstart", e => {
    cx = e.changedTouches[0].screenX
    cy = e.changedTouches[0].screenY
    held = false
    to = setTimeout(() => {
      held = true
      emit("hold", e)
    }, 512)
  })
  el.addEventListener("touchmove", e => {
    let x = e.changedTouches[0].screenX,
      y = e.changedTouches[0].screenY,
      l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
    if (l > 32) {
      clearTimeout(to)
      if (held) return
      if (Math.abs(cx - x) > Math.abs(cy - y)) {
        if (x < cx) emit("swipeleft", e)
        else emit("swiperight", e)
      } else {
        if (y < cy) emit("swipeup", e)
        else emit("swipedown", e)
      }
      held = true
    }
  })
  el.addEventListener("touchend", e => {
    clearTimeout(to)
    let x = e.changedTouches[0].screenX,
      y = e.changedTouches[0].screenY,
      l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
    if (l < 32) {
      if (held) return
      emit("tap", e)
    }
  })

  return el._tgest
}
Element.prototype.addEventListener = function (eventtype, handler) {
  switch (eventtype) {
    case "swipeup":
    case "swipedown":
    case "swipeleft":
    case "swiperight":
    case "tap":
    case "hold":
      let tg = init(this)
      tg.handlers[eventtype].push(handler)
      break
    default:
      return _addEventListener.call(this, eventtype, handler)
  }
}
Element.prototype.removeEventListener = function (eventtype, handler) {
  switch (eventtype) {
    case "swipeup":
    case "swipedown":
    case "swipeleft":
    case "swiperight":
    case "tap":
    case "hold":
      let tg = init(this)
      let i = tg.handlers[eventtype].indexOf(handler)
      if (i >= 0) tg.handlers[eventtype].splice(i, 1)
      break
    default:
      return _removeEventListener.call(this, eventtype, handler)
  }
}
