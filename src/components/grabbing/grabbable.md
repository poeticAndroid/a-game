## grabbable

Add the `grabbable` component to any object you want the player to be able to pick up.

```html
<a-entity grabbable></a-entity>
```

### Properties

| Property      | Description                                                                | Default |
| ------------- | -------------------------------------------------------------------------- | ------- |
| physics       | Whether or not to add physics components automatically.                    | true    |
| fixed         | If `true` the object will have a fixed position and rotation when grabbed. | false   |
| fixedPosition | Relative position in hand, if `fixed` is `true`.                           | 0 0 0   |

### Events

These event are emitted on the grabbable as well as the hand that initiated the event.

| Event   | Description                                                    |
| ------- | -------------------------------------------------------------- |
| grab    | Emitted when grabbed.                                          |
| usedown | Emitted when use-button is pressed while holding this object.  |
| useup   | Emitted when use-button is released while holding this object. |
| drop    | Emitted when dropped.                                          |
