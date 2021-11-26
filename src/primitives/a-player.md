# a-player

Primitive entity for the player space..

```html
<a-player locomotion grabbing></a-player>
```

`a-player` will ensure that it's populated with at least these entities:

```html
<a-player>
  <a-camera look-controls="pointerLockEnabled:true; touchEnabled:false;" wasd-controls="enabled:false;"></a-camera>
  <a-hand side="left"></a-hand>
  <a-hand side="right"></a-hand>
</a-player>
```

If `grabbing` component is added, `a-hand` entities will be populated with [`a-glove`](a-glove.md) entities..

Any of these entities can be overruled with custom properties and additional entities can be added..