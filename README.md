# A-Game!

Essential game components for A-Frame!

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/poeticAndroid/a-game@v0.8.0/dist/a-game.min.js"></script>
  </head>
  <body>
    <a-scene physics>
      <a-entity include="./scenes/_assets.html"></a-entity>
      <a-main include="./scenes/main.html">
        <a-box color="gray" floor width="32" height="0.25" depth="32"></a-box>
      </a-main>
      <a-player locomotion grabbing></a-player>
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
 - [locomotion](./src/components/locomotion.md)
 - [grabbing](./src/components/grabbing.md)
 
