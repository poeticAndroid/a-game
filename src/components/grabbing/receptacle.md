# receptacle

Add the `receptacle` component to any object you want to attract and hold another object within a given radius.

```html
<a-entity receptacle></a-entity>
```


## Properties

| Property    | Description                                               | Default       |
| ----------- | --------------------------------------------------------- | ------------- |
| objects     | Selector for the type of objects this receptacle attracts | `[grabbable]` |
| radius      | Radius of attraction                                      | 0.125         |
| onlyGrabbed | Only accept grabbed objects                               | false         |


## Events

These event are emitted on the receptacle as well as the object it attracts.

| Event   | Description                                                    |
| ------- | -------------------------------------------------------------- |
| put     | object is placed in the receptacle                |
| take    | object is taken out of the receptacle             |
| hover   | attractive object is within radius                |
| unhover | attractive object is out of radius                |


## States

| Event  | Description                 |
| ------ | --------------------------- |
| filled | currently holding something |
