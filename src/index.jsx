import EventEmitter from 'tiny-emitter';
import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

import NetworkCanvas from './NetworkCanvas';
import mountEditor from './editor/mountEditor';

/** Checks if the given annotation represents a connection **/
const isConnection = annotation => {
  const targets = Array.isArray(annotation.target) ?
    annotation.target : [ annotation.target ];

  if (targets.length !== 2)
    return false;

  return targets.every(t => t.id);
}

class ConnectionsPlugin extends EventEmitter {

  constructor(arg, conf) {
    super();

    const instances = arg || [];
    
    // Configuration options
    const config = conf || {};

    // RecogitoJS/Annotorious instances
    this.instances = Array.isArray(instances) ? 
      instances : [ instances ];

    // Single network canvas, covering the browser viewport
    this.canvas = new NetworkCanvas(this.instances, config);

    this.instances.forEach(this.patchInstance);
  
    if (!config.disableEditor)
      mountEditor(this.canvas, this, config); 
  }

  /**
   * Applies plugin intercepts to a RecogitoJS/Annotorious instance.
   */
  patchInstance = instance => {

    // Intercept setAnnotation API method
    const _setAnnotations = instance.setAnnotations;

    instance.setAnnotations = arg => {
      const all = (arg || []);

      // Split text annotations from connections
      const annotations = all.filter(a => !isConnection(a));
      const connections = all.filter(a => isConnection(a));
      
      // Set annotations on instance first
      return _setAnnotations(annotations).then(() => {
        // Then create relations
        const wrapped = connections.map(a => new WebAnnotation(a));
        this.canvas.setAnnotations(wrapped);
      });
    }

    // When annotations are deleted, also delete
    // in-/outgoing connections
    instance.on('deleteAnnotation', annotation => {
      const deleted = this.canvas.deleteConnectionsForId(annotation.id);
      deleted.forEach(annotation => {
        this.emit('deleteConnection', annotation.underlying);
      });
    });
  }

  register = instance => {
    this.patchInstance(instance);

    this.canvas.registerInstance(instance);

    this.instances.push(instance);
  }

  unregister = instance => {
    // TODO need to remove patching!
    this.instances = this.instances.filter(i => i !== instance);
    this.canvas.unregisterInstance(instance);
  }

}

export default (instances, config) => new ConnectionsPlugin(instances, config);