# A-Game!

Essential game components for A-Frame!

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/poeticAndroid/a-game@v0.4.1/dist/a-game.min.js"></script>
  </head>
  <body>
    <a-scene physics>
      <a-entity include="./scenes/_assets.html"></a-entity>
      <a-main include="./scenes/main.html">
        <a-box start floor rotation="-90 0 0" width="40" height="40" depth="0.125" color="#7BC8A4"></a-box>
      </a-main>
      <a-player locomotion grabbing></a-player>
    </a-scene>
  </body>
</html>
```

## Primitives

 - [a-main](./src/primitives/a-main.md)
 - [a-player](./src/primitives/a-player.md)
 - [a-hand](./src/primitives/a-hand.md)

## Components

 - [include](./src/components/include.md)
 - [physics](./src/components/physics.md)
 - [locomotion](./src/components/locomotion.md)
 - [grabbing](./src/components/grabbing.md)
 
