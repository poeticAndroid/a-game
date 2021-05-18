# a-editor.js

Component for making a scene editor.

## editor

Add the `editor` component to an entity that represents your tool.

```html
<a-gltf-model src="tool.glb" position="0 1 -.25" editor></a-gltf-model>
```

### Properties

| Property      | Description                     | Default  |
| ------------- | ------------------------------- | -------- |
| gridSize      | Size of snapping grid.          | .5 .5 .5 |
| rotationSteps | Number of valid rotation steps. | 8 8 8    |

### Methods

| Method           | Description                      |
| ---------------- | -------------------------------- |
| addEntity(html)  | Add an entity to the scene.      |
| findEntity(el)   | Return index of entity.          |
| removeEntity(el) | Remove an entity to the scene.   |
| load()           | Load scene from localStorage.    |
| save()           | Save scene to localStorage.      |
