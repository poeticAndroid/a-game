# trigger.js

Trigger an event when certain objects enter or leave this object.
Only works with `a-box`, `a-sphere` and `a-cylinder` entities.

```html
<a-box trigger width="16" height="3" depth="7"></a-box>
```


## Properties

| Property | Description                                          | Default    |
| -------- | ---------------------------------------------------- | ---------- |
| objects  | selector for the type of objects to get triggered by | `[camera]` |


## Events

These events are emitted by both the triggered and the triggering object.

| Event     | Description        |
| --------- | ------------------ |
| trigger   | object has entered |
| untrigger | object has left    |
