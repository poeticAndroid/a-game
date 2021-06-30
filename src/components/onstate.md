# onstate.js

Change a property when an state is added or removed.

```html
<a-box grabbable onstate__grabbed="property:color; on:green; off:red;" ></a-box>
```


## Properties

| Property     | Description                                    | Default   |
| ------------ | ---------------------------------------------- | --------- |
| state        | state to listen for                            | `this.id` |
| entity       | entity to affect                               | `this.el` |
| property     | property to change on state change             |
| on           | value to set property to when state is added   |
| off          | value to set property to when state is removed |
