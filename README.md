# A-Game!

Essential game components for [A-Frame](https://aframe.io/)!

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/a-game@0.48.0/dist/a-game.min.js"></script>
  </head>
  <body>
    <a-scene physics>
      <a-entity include="./scenes/_assets.html"></a-entity>
      <a-player locomotion grabbing></a-player>
      <a-main include="./scenes/level1.html">
        <a-box floor color="gray" width="32" height="0.25" depth="32"></a-box>
      </a-main>
    </a-scene>
  </body>
</html>
```

**[Demo!](https://a-game-demo.glitch.me)**


## Primitives

 - [a-hand](./src/primitives/a-hand.md)
 - [a-main](./src/primitives/a-main.md)
 - [a-player](./src/primitives/a-player.md)


## Components

 - [grabbing](./src/components/grabbing.md)
   - [button](./src/components/grabbing/button.md)
   - [climbable](./src/components/grabbing/climbable.md)
   - [fingerflex](./src/components/grabbing/fingerflex.md)
   - [grabbable](./src/components/grabbing/grabbable.md)
   - [receptacle](./src/components/grabbing/receptacle.md)
 - [include](./src/components/include.md)
 - [limit](./src/components/limit.md)
 - [locomotion](./src/components/locomotion.md)
   - [floor](./src/components/locomotion/floor.md)
   - [start](./src/components/locomotion/start.md)
   - [wall](./src/components/locomotion/wall.md)
 - [onevent](./src/components/onevent.md)
 - [onstate](./src/components/onstate.md)
 - [physics](./src/components/physics.md)
   - [body](./src/components/physics/body.md)
   - [joint](./src/components/physics/joint.md)
   - [shape](./src/components/physics/shape.md)
 - [script](./src/components/script.md)
 - [trigger](./src/components/trigger.md)
 
