# shape

A physical shape for a physical body.. The `shape` component are added automatically by default..

```html
  <!-- this will form a chair -->
  <a-entity body="type:dynamic;" position="0 1 -4">
    <a-box color="#f96" width="1.125" height="0.125" depth="1.125"></a-box>
    <a-box color="#fc3" position="-0.5 -0.5 0.5" width="0.125" height="1" depth="0.125"></a-box>
    <a-box color="#fc3" position="0.5 -0.5 0.5" width="0.125" height="1" depth="0.125"></a-box>
    <a-box color="#fc3" position="0.5 0 -0.5" width="0.125" height="2" depth="0.125"></a-box>
    <a-box color="#fc3" position="-0.5 0 -0.5" width="0.125" height="2" depth="0.125"></a-box>
    <a-box color="#f96" position="0 0.75 -0.5" width="1" height="0.5" depth="0.125"></a-box>
  </a-entity>
```
