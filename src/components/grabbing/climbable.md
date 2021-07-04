# climbable

Add the `climbable` component to any object you want the player to be able to pick up.

```html
<a-entity climbable></a-entity>
```


## Properties

| Property      | Description                                                                | Default |
| ------------- | -------------------------------------------------------------------------- | ------- |
| physics       | Whether or not to add physics body automatically.                          | true    |
| kinematicGrab | Whether or not to make physics kinematic during grab.                      | true    |
| fixed         | If `true` the object will have a fixed position and rotation when grabbed. | false   |
| fixedPosition | Relative position in hand, if `fixed` is `true`.                           | 0 0 0   |


## Events

| Event       | Description                |
| ----------- | -------------------------- |
| reachable   | climbable is within reach. |
| unreachable | climbable is out of reach. |
| grab        | grabbing.                  |
| usedown     | use-button is pressed.     |
| useup       | use-button is released.    |
| drop        | dropping.                  |
| fingerflex  | a finger is flexing.       |
