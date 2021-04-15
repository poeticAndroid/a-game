# locomotion

Component to facilitate moving about and stuff.

Add the `locomotion` component to your player rig like so:

```html
<a-player locomotion></a-player>
```

This makes it possible to move around the using the following controls.

| Action                                  | Controller             | Desktop | Touch            |
| --------------------------------------- | ---------------------- | ------- | ---------------- |
| Move                                    | Left stick             | WASD    |
| Rotate                                  | Right stick left/right | Mouse   | Swipe left/right |
| Teleport                                | Right stick up         | Space   | Swipe up         |
| Crouch                                  | Right stick down       | C       | Swipe down       |
| Toggle quantized movement (or God mode) | Click left stick       | G       |
| Toggle quantized rotation               | Click right stick      |

## Properties

| Property         | Description                                                      | Default |
| ---------------- | ---------------------------------------------------------------- | ------- |
| speed            | Speed of movement                                                | 4       |
| rotationSpeed    | Speed of rotation                                                | 1       |
| quantizeMovement | Quantize movement                                                | false   |
| quantizeRotation | Quantize rotation                                                | true    |
| teleportDistance | Maximum teleportation distance                                   | 3       |
| godMode          | Enable ability to fly through walls and floors in any direction  | false   |

## Methods

| Method         | Description                 |
| -------------- | --------------------------- |
| teleport(pos)  | Teleport to given position. |
| toggleCrouch() | Toggle crouch mode.         |

## Related components

 - [floor](./locomotion/floor.md)
 - [wall](./locomotion/wall.md)
 - [start](./locomotion/start.md)
 