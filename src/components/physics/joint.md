# joint

A way to connect bodies together..

```html
<a-scene physics="workerUrl:./oimoWorker.js; gravity:0 -5 0;">
  <a-sky color="lightblue"></a-sky>
  <a-box id="torso" body="type:kinematic;" position="0 2 -4" animation="property:position; to:0 2 -5; loop:true; easing:linear; dir:alternate;" animation__2="property:rotation; to:0 360 0; loop:true; easing:linear; dur:30000;" width="1" height="1.75" depth="0.5"></a-box>
  <a-sphere id="head" body="type:dynamic;" joint="type:point; body2:#torso; pivot1:0 -0.5 0; pivot2:0 0.875 0;" position="0 4 -4" radius="0.5"></a-sphere>
  <a-cylinder id="leftArm" body="type:dynamic;" joint="type:point; body2:#torso; pivot1:0 -0.6 0; pivot2:-0.6 0.875 0;" position="-1.5 3 -4" radius="0.25" height="1" rotation="0 0 90"></a-cylinder>
  <a-cylinder id="leftForeArm" body="type:dynamic;" joint="type:point; body2:#leftArm; pivot1:0 -0.6 0; pivot2:0 0.5 0;" position="-2.5 3 -4" radius="0.25" height="1" rotation="0 0 90"></a-cylinder>
  <a-cylinder id="rightArm" body="type:dynamic;" joint="type:point; body2:#torso; pivot1:0 -0.6 0; pivot2:0.6 0.875 0;" position="1.5 3 -4" radius="0.25" height="1" rotation="0 0 -90"></a-cylinder>
  <a-cylinder id="rightForeArm" body="type:dynamic;" joint="type:point; body2:#rightArm; pivot1:0 -0.6 0; pivot2:0 0.5 0;" position="2.5 3 -4" radius="0.25" height="1" rotation="0 0 -90"></a-cylinder>
  <a-cylinder id="leftThigh" body="type:dynamic;" joint="type:point; body2:#torso; pivot1:0 0.6 0; pivot2:-0.5 -0.75 0;" position="-0.5 0 -4" radius="0.25" height="1"></a-cylinder>
  <a-cylinder id="leftLeg" body="type:dynamic;" joint="type:point; body2:#leftThigh; pivot1:0 0.6 0; pivot2:0 -0.5 0;" position="-0.5 -1 -4" radius="0.25" height="1"></a-cylinder>
  <a-cylinder id="rightThigh" body="type:dynamic;" joint="type:point; body2:#torso; pivot1:0 0.6 0; pivot2:0.5 -0.75 0;" position="0.5 0 -4" radius="0.25" height="1"></a-cylinder>
  <a-cylinder id="rightLeg" body="type:dynamic;" joint="type:point; body2:#rightThigh; pivot1:0 0.6 0; pivot2:0 -0.5 0;" position="0.5 -1 -4" radius="0.25" height="1"></a-cylinder>
</a-scene>
```

## Properties

| Property  | Description                            | Default  |
| --------- | -------------------------------------- | -------- |
| type      | `distance`, `hinge`, `lock` or `point` | point    |
| body1     | first body to join                     | this one |
| body2     | second body to join                    | null     |
| pivot1    | pivot point of first body              | 0 0 0    |
| pivot2    | pivot point of second body             | 0 0 0    |
| axis1     | axis of first body                     | 0 1 0    |
| axis2     | axis of second body                    | 0 1 0    |
| min       | minimum distance between bodies        | 0        |
| max       | maximum distance between bodies        | 1        |
| collision | connected bodies allowed to collide    | true     |


## Methods

| Method           | Description                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| eval(expression) | Evaluate an expression in the worker, where `world` and `joint` refer to their native instances. |

Note: the `eval` method depends on the specific physics engine that the worker is based on..
