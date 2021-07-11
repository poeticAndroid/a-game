# button

Add the `button` component to any object you want the player to be able to press.

```html
<a-box button onstate__pressed="property:color; off:green; on:lime;"></a-box>
```


## Events

| Event   | Description                 |
| ------- | --------------------------- |
| hover   | button is pointed at        |
| press   | button got pressed          |
| unpress | button no longer pressed    |
| unhover | button no longer pointed at |


## States

| State   | Description             |
| ------- | ----------------------- |
| pressed | currently being pressed |
