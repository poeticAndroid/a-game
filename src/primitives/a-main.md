# a-main

Just a semantic primitive to wrap all the main content of the scene, that is not assets, scene setup or other boilerplate..
Useful for loading scenes and levels using the `include` component and have a place to dynamically add new entities without cluttering up the root of the `a-scene`..

```html
<a-scene physics="workerUrl:./cannonWorker.js;">
  <a-entity include="./scenes/_assets.html"></a-entity>
  <a-player locomotion></a-player>
  <a-main include="./scenes/myscene.html"></a-main>
</a-scene>
```
