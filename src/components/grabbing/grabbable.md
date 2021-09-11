# grabbable

Add the `grabbable` component to any object you want the player to be able to pick up.

```html
<a-entity grabbable></a-entity>
```


## Properties

| Property      | Description                                                                | Default |
| ------------- | -------------------------------------------------------------------------- | ------- |
| physics       | Whether or not to add physics body automatically.                          | true    |
| kinematicGrab | Whether or not to make physics kinematic during grab.                      | true    |
| hideOnGrab    | Hide the glove when grabbing                                               | false   |
| fixed         | If `true` the object will have a fixed position and rotation when grabbed. | false   |
| fixedPosition | Relative position in hand, if `fixed` is `true`.                           | 0 0 0   |
| fingerFlex    | How much to flex each finger when grabbed.                                 | 0.5, 0.5, 0.5, 0.5, 0.5 |


## Events

| Event       | Description                |
| ----------- | -------------------------- |
| reachable   | grabbable is within reach. |
| unreachable | grabbable is out of reach. |
| grab        | grabbing.                  |
| usedown     | use-button is pressed.     |
| useup       | use-button is released.    |
| drop        | dropping.                  |
| fingerflex  | a finger is flexing.       |


## States

| State   | Description                 |
| ------- | --------------------------- |
| grabbed | currently being grabbed     |
| put     | currently in a `receptacle` |
