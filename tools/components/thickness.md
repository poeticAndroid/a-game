# a-tiledwalls.js

Component for help making walls or floors with tiled textures.

## thickness

Add the `thickness` component to your wall to resize it according to `material.repeat`.
The following will make a brick wall that is 10 long, 3 heigh and 0.25 thick.

```html
<a-box thickness="0.25" src="#bricks" material="repeat: 10 3"></a-box>
```
