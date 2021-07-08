# script

Component for including external scripts into the scene.

```html
<a-main script="src:scenes/level1.js">
  <a-cylinder trigger onstate__triggered="entity:a-main; property:script.call; on:inside; off:outside;" visible="false">
  </a-cylinder>
</a-main>
```

The script file is expected to be an object of named functions that can be called by setting the `call` property. This can work well in combination with the [onevent](./onevent.md), [onstate](./onstate.md) and [trigger](./trigger.md) components.

It can even act like its own component, with most of the same methods regular components have, except for `schema` and `update`.

```js
({
  init() {
    console.log("Hello demo!")
  },

  inside() {
    console.log("I just went in!")
  },
  outside() {
    console.log("I left!")
  },
})
```


## Properties

| Property | Description                                               |
| -------- | --------------------------------------------------------- |
| src      | url to the script file                                    |
| call     | name of a function to call                                |
| args     | comma-separated list of arguments to pass to the function |
