# body

A physical body..

```html
<a-scene physics="workerUrl:./oimoWorker.js; gravity:0 -5 0;">
  <a-box body="type:dynamic" position="-1 2.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
  <a-sphere body="type:dynamic" position="0 2.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
  <a-cylinder body="type:dynamic" position="1 2.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
  <a-box body="type:static" position="0 0 -4" rotation="-90 0 0" width="4" height="4" depth="0.0625" color="#7BC8A4"></a-box>
  <a-sphere body="type:kinematic" position="-4 1 -4" animation="property:position; to:4 1 -4; dir:alternate; loop:true; easing:linear; dur:10000;"></a-sphere>
  <a-sky color="#ECECEC"></a-sky>
</a-scene>
```


## Properties

| Property     | Description                                            | Default    |
| ------------ | ------------------------------------------------------ | ---------- |
| type         | `static`, `dynamic` or `kinematic`                     | static     |
| mass         | mass of body                                           | 1          |
| belongsTo    | Bitmask of groups body belongs to                      | 1          |
| collidesWith | Bitmask of groups body collides with                   | 0xffffffff |
| emitsWith    | Bitmask of groups body emits event when colliding with | 0          |
| sleeping     | Whether or not to start sleeping                       | false      |
| autoShape    | Automatically add `shape` components                   | true       |

If `autoShape` is `true`, `shape` components will be added to all applicable descendants (`a-box`, `a-sphere` and `a-cylinder`).. If the body entity has no child nodes, `shape` component will be added to the body entity itself..


## Methods

| Method           | Description                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| eval(expression) | Evaluate an expression in the worker, where `world` and `body` refer to their native instances. |

Note: the `eval` method depends on the specific physics engine that the worker is based on..
