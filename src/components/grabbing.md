# grabbing.js

Components to facilitate grabbable and usable items.

Add the `grabbing` component to your player rig like so:

```html
<a-player grabbing></a-player>
```

This makes it possible to grab and use grabbable objects using the following controls.

| Action      | Controller           | Desktop      | Touch    |
| ----------- | -------------------- | ------------ | -------- |
| Grab/drop   | Grip/shoulder Button | E            | Long tap |
| Primary use | Trigger              | Left click   | Tap      |
| Secondary   | A                    | Right click  |
| Tertiary    | B                    | Middle click |


## Properties

| Property     | Description                          | Default |
| ------------ | ------------------------------------ | ------- |
| hideOnGrab   | Hide the glove when grabbing         | false   |
| grabDistance | Maximum distance to grab object from | 1       |


## Methods

`hand` parameter is either `"head"`(default), `"left"` or `"right"`.
`button` parameter is 0 - 2, where 0 is the primary use button.

| Method                | Description                                           |
| --------------------- | ----------------------------------------------------- |
| toggleGrab(hand)      | Drop if holding something, attempt to grab otherwise. |
| grab(hand)            | Attempt to grab something.                            |
| use(hand, button)     | Shortly use grabbable.                                |
| useDown(hand, button) | Start using grabbable.                                |
| useUp(hand, button)   | Stop using grabbable.                                 |
| drop(hand)            | Drop grabbable.                                       |
| dropObject(el)        | Drop specified grabbable if held.                     |


## Related components

 - [grabbable](./grabbing/grabbable.md)
