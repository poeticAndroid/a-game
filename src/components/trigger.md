# trigger

Trigger an event when certain objects enter or leave this object.
Only works with `a-box`, `a-sphere` and `a-cylinder` entities.

```html
<a-box trigger width="16" height="3" depth="7"></a-box>
```


## Properties

| Property | Description                                          | Default    |
| -------- | ---------------------------------------------------- | ---------- |
| objects  | selector for the type of objects to get triggered by | `.head-bumper` |


## Events

These events are emitted by both the triggered and the triggering object.

| Event     | Description        |
| --------- | ------------------ |
| trigger   | object has entered |
| untrigger | object has left    |


## States

| State     | Description                               |
| --------- | ----------------------------------------- |
| triggered | at least one object is inside the trigger |
