import React from 'react';
import ReactDOM from 'react-dom';
import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

import NetworkCanvas from './NetworkCanvas';
import PayloadEditor from './editor/PayloadEditor';

/** Checks if the given annotation represents a connection **/
const isConnection = annotation => {
  const { targets } = annotation;

  if (targets.length !== 2)
    return false;

  return targets.every(t => t.id);
}

class ConnectionsPlugin {

  constructor(instances) {
    this.instances = Array.isArray(instances) ? instances : [ instances ];

    this._editor = React.createRef();

    // Monkey-patches the .setAnnotations method of each instance
    // with an interceptor
    const patchInstances = instance => {
      const _setAnnotations = instance.setAnnotations;

      instance.setAnnotations = arg =>
        // Set annotations on instance first
        _setAnnotations(arg).then(() => {
          // Then create relations
          const annotations = arg || []; // Allow null arg
    
          const connections = annotations
            .map(a => new WebAnnotation(a))
            .filter(isConnection);
    
          this.canvas.setAnnotations(connections);
        });

      instance.on('deleteAnnotation', annotation =>
        this.canvas.deleteConnectionsForId(annotation.id));
    }

    this.instances.forEach(i => patchInstances(i));

    this.canvas = new NetworkCanvas(this.instances);
    
    this.canvas.on('createConnection', connection => {
      this._editor.current.editConnection(connection);
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    ReactDOM.render(<PayloadEditor ref={this._editor} />, container);
  }

  on = (event, handler) => {
    // this.canvas.on(event, handler);
  }

  off = (event, handler) => {
    // this.canvas.off(event, handler);
  }

  once = (event, handler) => {
    // this.canvas.once(event, handler);
  }

}

export default instances => new ConnectionsPlugin(instances);