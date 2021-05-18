# locomotion

Component to facilitate moving about and stuff.

Add the `locomotion` component to your player rig like so:

```html
<a-player locomotion></a-player>
```

This makes it possible to move around the using the following controls.

| Action                                  | Controller             | Desktop | Touch                       |
| --------------------------------------- | ---------------------- | ------- | --------------------------- |
| Move                                    | Left stick             | WASD    | Left side swipe             |
| Rotate                                  | Right stick left/right | Arrows  | Right side swipe left/right |
| Teleport/jump                           | Right stick up         | Space   | Right side swipe up         |
| Crouch                                  | Right stick down       | C       | Right side swipe down       |
| Toggle quantized movement (or God mode) | Click left stick       | G       |
| Toggle quantized rotation               | Click right stick      | H       |

## Properties

| Property         | Description                                                      | Default |
| ---------------- | ---------------------------------------------------------------- | ------- |
| speed            | Speed of movement                                                | 4       |
| rotationSpeed    | Speed of rotation                                                | 1       |
| teleportDistance | Maximum teleportation distance                                   | 5       |
| jumpForce        | Amount of force to jump                                          | 0       |
| gravity          | Amount of gravity when jumping and falling                       | 10      |
| godMode          | Enable ability to fly through walls and floors in any direction  | false   |

## Methods

| Method               | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| teleport(pos, force) | Teleport to given position. if `force` is `true`, player will pass through walls/floors along the way. |
| toggleCrouch()       | Toggle crouch mode.                                                                                    |

## Related components

 - [floor](./locomotion/floor.md)
 - [wall](./locomotion/wall.md)
 - [start](./locomotion/start.md)
 