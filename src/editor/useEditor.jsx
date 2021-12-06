import React from 'react';
import ReactDOM from 'react-dom';

import PayloadEditor from './PayloadEditor';

const useEditor = (canvas, emitter, config) => {

  // A div container to hold the editor
  const container = document.createElement('div');
  document.body.appendChild(container);

  // React editor ref
  const editor = React.createRef();

  // Attach handlers to NetworkCanvas
  canvas.on('createConnection', (connection, pos) =>
    editor.current.editConnection(connection, pos, true));

  canvas.on('selectConnection', (connection, pos) =>
    editor.current.editConnection(connection, pos, false));

  const handleConnectionCreated = annotation => {
    emitter.emit('createConnection', annotation.underlying);
    canvas.updateConnectionData(annotation, annotation.bodies);
  }

  const handleConnectionUpdated = (annotation, previous) => {
    emitter.emit('updateConnection', annotation.underlying, previous.underlying);
    canvas.updateConnectionData(previous, annotation.bodies);
  }

  const handleConnectionDeleted = annotation => {
    emitter.emit('deleteConnection', annotation.underlying);
    canvas.removeConnection(annotation);
  }

  // JSX editor component
  ReactDOM.render(
    <PayloadEditor 
      ref={editor} 
      config={config} 
      onConnectionCreated={handleConnectionCreated}
      onConnectionUpdated={handleConnectionUpdated}
      onConnectionDeleted={handleConnectionDeleted} />, container);

}

export default useEditor;