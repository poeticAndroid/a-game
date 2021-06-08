# include

Component for including external files into the scene.

```html
<a-main include="scenes/level1.html"></a-main>
```

Any attributes except the `include` attribute will be added to the root of the included content.

```html
<a-entity include="./models/chair.html" position="0 9 -4"></a-entity>
<a-entity include="./models/chair.html" position="0 6 -4" rotation="180 0 0"></a-entity>
<a-entity include="./models/chair.html" position="0 3 -4"></a-entity>
```
