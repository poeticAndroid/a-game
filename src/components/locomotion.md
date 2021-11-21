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
| Teleport/Move up                        | Right stick up         | Q       | Right side swipe up         |
| Jump                                    | Y or Click right stick | Space   |
| Crouch/Move down                        | Right stick down       | C       | Right side swipe down       |
| Toggle god mode (if enabled)            | Click left stick       | G       |


## Properties

| Property         | Description                                                      | Default |
| ---------------- | ---------------------------------------------------------------- | ------- |
| speed            | Speed of movement                                                | 4       |
| stepLength       | Distance between `step` events                                   | 1       |
| teleportDistance | Maximum teleportation distance                                   | 5       |
| jumpForce        | Amount of force to jump                                          | 4       |
| gravity          | Amount of gravity when jumping and falling                       | 10      |
| godMode          | Enable ability to fly through walls and floors in any direction  | false   |


## Methods

| Method               | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| teleport(pos, force) | Teleport to given position. if `force` is `true`, player will pass through walls/floors along the way. |
| move(delta)          | Move by given vector.                                                                                  |
| toggleCrouch(reset)  | Toggle crouch mode. if `reset` is `true`, player height will be reset to default.                      |
| jump()               | Make the player jump if possible.                                                                      |
| stopFall()           | Stop the fall momentarily.                                                                             |


## Events

| Event | Description                                  |
| ----- | -------------------------------------------- |
| step  | Every time the player takes a simulated step |
| bump  | Player bumps into wall                       |


## States

| State        | Description                           |
| ------------ | ------------------------------------- |
| noinput      | Input method has yet to be determined |
| desktop      | Player is using mouse and keyboard    |
| touch        | Player is using touch screen          |
| gamepad      | Player is using gamepad               |
| vrcontroller | Player is using VR controllers        |


## Related components

 - [floor](./locomotion/floor.md)
 - [wall](./locomotion/wall.md)
 - [start](./locomotion/start.md)
 