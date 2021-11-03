# limit.js

Constrain an entity's position to a given range.

```html
<a-box grabbable limit="minPos:0 0 0; maxPos:0 1 0;"></a-box>
```


## Properties

| Property     | Description                 | Default   |
| ------------ | --------------------------- | --------- |
| minPos       | Lowest possible position coordinates | 0 0 0
| maxPos       | Highest possible position coordinates | 0 0 0
| rotationRange | Maximum range of rotation | 0 0 0


## Events

| Event   | Description        |
| ------- | ------------------ |
| limited | object hit the limit |
