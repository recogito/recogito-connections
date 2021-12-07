# Recogito Connections

A plugin to enable drawing of connections between annotations.

![Animated screenshot of Recogito Connections in action](screenshot.gif)

## Usage

Import via __script__ tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@recogito/recogito-connections@latest/dist/recogito-connections.js"></script>
```

```js
window.onload = function() {
  var r = Recogito.init({
    content: 'content'
  });

  var connections = recogito.Connections(r);

  connections.on('createConnection', function(c) {
    console.log('created', c);
  });
  
  connections.on('updateConnection', function(updated, previous) {
    console.log('updated', updated, previous);
  });

  connections.on('deleteConnection', function(c) {
    console.log('deleted', c);
  });
};
```

## Development

```sh
$ npm install
$ npm start
```