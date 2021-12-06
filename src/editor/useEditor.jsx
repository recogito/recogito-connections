import React from 'react';
import ReactDOM from 'react-dom';

import PayloadEditor from './PayloadEditor';

const useEditor = (canvas, config) => {

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
    console.log('created', annotation);
  }

  const handleConnectionUpdated = (annotation, previous) => {
    console.log('updated', annotation);
    console.log('was', previous);
  }

  const handleConnectionDeleted = annotation => {
    canvas.removeConnection(annotation);
    
    console.log('deleted', annotation);
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