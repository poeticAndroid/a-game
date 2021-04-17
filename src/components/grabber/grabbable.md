## grabbable

Add the `grabbable` component to any object you want the player to be able to pick up.

```html
<a-entity grabbable></a-entity>
```

### Properties

| Property        | Description                                                                                          | Default |
| --------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| freeOrientation | When enabled grabbed object keep their orientation, otherwise it resets to same orientation as hand. | true    |
| physics         | Whether or not to add physics components automatically.                                              | true    |

### Events

These event are emitted on the grabbable as well as the hand that initiated the event.

| Event   | Description                                                    |
| ------- | -------------------------------------------------------------- |
| grab    | Emitted when grabbed.                                          |
| usedown | Emitted when use-button is pressed while holding this object.  |
| useup   | Emitted when use-button is released while holding this object. |
| drop    | Emitted when dropped.                                          |
