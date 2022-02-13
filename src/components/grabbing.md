# grabbing

Components to facilitate grabbable and usable items.

Add the `grabbing` component to your player rig like so:

```html
<a-player grabbing></a-player>
```

This makes it possible to grab and use grabbable objects using the following controls.

| Action           | Controller           | Desktop          | Touch    |
| ---------------- | -------------------- | ---------------- | -------- |
| Grab/drop        | Grip/shoulder Button | E                | Long tap |
| Primary use      | Trigger              | Left click       | Tap      |
| Secondary        | A                    | Right click      |
| Tertiary         | B                    | Middle click     |
| Move/rotate hand | X + D-pad            | 1/2/3 + scroll wheel |


## Properties

| Property     | Description                                   | Default |
| ------------ | --------------------------------------------- | ------- |
| hideOnGrab   | Hide the glove when grabbing                  | false   |
| grabDistance | Maximum distance to grab object from          | 1       |
| attractHand  | Make object attract to your hand when grabbed | true    |
| avoidWalls   | Keep hands from passing through walls         | true    |


## Methods

`hand` parameter is either `"head"`(default), `"left"` or `"right"`.
`button` parameter is 0 - 2, where 0 is the primary use button.

| Method                    | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| toggleGrab(hand)          | Drop if holding something, attempt to grab otherwise. |
| grab(hand)                | Attempt to grab something.                            |
| use(hand, button)         | Shortly use grabbable.                                |
| useDown(hand, button)     | Start using grabbable.                                |
| useUp(hand, button)       | Stop using grabbable.                                 |
| drop(hand)                | Drop grabbable.                                       |
| dropObject(el)            | Drop specified grabbable if held.                     |
| moveHeadHand(pz,rx,ry,rz) | Move/rotate non-VR hand.                              |


## Events

These events are emitted by both the glove and the `grabbable` that it's grabbing, if any.
Events will bubble.

| Event       | Description                |
| ----------- | -------------------------- |
| reachable   | grabbable is within reach. |
| unreachable | grabbable is out of reach. |
| grab        | grabbing.                  |
| usedown     | a use-button is pressed.     |
| use1down    | primary use-button is pressed. |
| use2down    | secondary use-button is pressed. |
| use3down    | tertiary use-button is pressed. |
| useup       | a use-button is released.    |
| use1up      | primary use-button is released. |
| use2up      | secondary use-button is released. |
| use3up      | tertiary use-button is released. |
| drop        | dropping.                  |
| fingerflex  | a finger is flexing.       |
| hover       | button is pointed at        |
| press       | button got pressed          |
| unpress     | button no longer pressed    |
| unhover     | button no longer pointed at |


## States

| State        | Description                           |
| ------------ | ------------------------------------- |
| grabbing     | currently grabbing something          |
| noinput      | Input method has yet to be determined |
| desktop      | Player is using mouse and keyboard    |
| touch        | Player is using touch screen          |
| gamepad      | Player is using gamepad               |
| vrcontroller | Player is using VR controllers        |


## Related components

 - [button](./grabbing/button.md)
 - [climbable](./grabbing/climbable.md)
 - [fingerflex](./grabbing/fingerflex.md)
 - [grabbable](./grabbing/grabbable.md)
 - [receptacle](./grabbing/receptacle.md)
