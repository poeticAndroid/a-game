# onevent

Change a property when an event happens.

```html
<a-box grabbable onevent__use1down="property:color; value:green;" onevent__use1up="property:color; value:red;"></a-box>
```


## Properties

| Property     | Description                 | Default   |
| ------------ | --------------------------- | --------- |
| event        | event to listen for         | `this.id` |
| entity       | entity to affect            | `this.el` |
| property     | property to change on event |
| value        | value to set property to    |
