/* global AFRAME, THREE */

const _update = AFRAME.components.raycaster.Component.prototype.update
const _refreshObjects = AFRAME.components.raycaster.Component.prototype.refreshObjects
AFRAME.components.raycaster.schema.deep = AFRAME.components.raycaster.schema.showLine

AFRAME.components.raycaster.Component.prototype.update = function (oldData) {
  if (this.data.deep && oldData.objects !== this.data.objects) {
    this._matchSelector = this.data.objects
    this.data.objects = deepMatch(this.data.objects)
  }
  return _update.apply(this, arguments)
}

AFRAME.components.raycaster.Component.prototype.refreshObjects = function () {
  let result = _refreshObjects.apply(this, arguments)
  if (this.data.deep) {
    let hits = this.intersections
    for (let hit of hits) {
      hit.el = hit.object.el
      while (hit.el && !hit.el.matches(this._matchSelector)) hit.el = hit.el.parentNode
    }
  }
  return result
}


function deepMatch(selector) {
  if (selector.indexOf("*") >= 0) return selector
  let deep = (selector + ", ").replaceAll(",", " *,")
  return deep + selector
}