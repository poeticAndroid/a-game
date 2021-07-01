# fingerflex

The `fingerflex` component "bends" fingers on a glove object according to `fingerflex` events.

E.g. if the glove recieves an event with `event.detail.finger == 1` (index finger), then the component will find the entity matching `.bend.index` selector, rotate it around the Y-axis between `min` and `max` property values according to `event.detail.flex`.. It will then do the same with any descendant `.bend` entity..

```html
<a-hand side="left" tracked-controls="" tracked-controls-webxr="">
  <a-entity class="glove" fingerflex="min:10;max:90;">
    <a-box class="palm" color="gray" position="-0.01 -0.03 0.08" rotation="-35 0 0" width="0.02" height="0.08" depth="0.08">
      <a-entity class="index bend" position="0 0.03 -0.04">
        <a-box color="gray" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
          <a-entity class="bend" position="0 0 -0.02">
            <a-box color="gray" position="0 0 -0.02" width="0.02" height="0.02" depth="0.04">
            </a-box>
          </a-entity>
        </a-box>
      </a-entity>
    </a-box>
  </a-entity>
</a-hand>
```


## Properties

| Property | Description                            |
| -------- | -------------------------------------- |
| min      | Angle for when the finger is straight. |
| max      | Angle for when the finger is bent.     |
