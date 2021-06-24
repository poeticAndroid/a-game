# A-Game!

Essential game components for [A-Frame](https://aframe.io/)!

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/poeticAndroid/a-game@v0.12.0/dist/a-game.min.js"></script>
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

 - [a-main](./src/primitives/a-main.md)
 - [a-player](./src/primitives/a-player.md)
 - [a-hand](./src/primitives/a-hand.md)

## Components

 - [include](./src/components/include.md)
 - [physics](./src/components/physics.md)
   - [body](./src/components/physics/body.md)
   - [shape](./src/components/physics/shape.md)
   - [joint](./src/components/physics/joint.md)
 - [locomotion](./src/components/locomotion.md)
   - [floor](./src/components/locomotion/floor.md)
   - [wall](./src/components/locomotion/wall.md)
   - [start](./src/components/locomotion/start.md)
 - [grabbing](./src/components/grabbing.md)
   - [grabbable](./src/components/grabbing/grabbable.md)
   - [receptacle](./src/components/grabbing/receptacle.md)
   - [fingerflex](./src/components/grabbing/fingerflex.md)
 
