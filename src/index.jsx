import EventEmitter from 'tiny-emitter';
import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

import NetworkCanvas from './NetworkCanvas';
import mountEditor from './editor/mountEditor';

/** Checks if the given annotation represents a connection **/
const isConnection = annotation => {
  const { targets } = annotation;

  if (targets.length !== 2)
    return false;

  return targets.every(t => t.id);
}

class ConnectionsPlugin extends EventEmitter {

  constructor(instances, conf) {
    super();
    
    // Configuration options
    const config = conf || {};

    // RecogitoJS/Annotorious instances
    this.instances = Array.isArray(instances) ? 
      instances : [ instances ];

    // Single network canvas, covering the browser viewport
    this.canvas = new NetworkCanvas(this.instances);

    this.instances.forEach(this.patchInstance);
  
    // TODO if (config.useEditor)
    mountEditor(this.canvas, this, config); 
  }

  /**
   * Applies plugin intercepts to a RecogitoJS/Annotorious instance.
   */
  patchInstance = instance => {

    // Intercept setAnnotation API method
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

    // When annotations are deleted, also delete
    // in-/outgoing connections
    instance.on('deleteAnnotation', annotation =>
      this.canvas.deleteConnectionsForId(annotation.id));
  }

}

export default (instances, config) => new ConnectionsPlugin(instances, config);