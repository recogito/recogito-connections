import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

import NetworkCanvas from './NetworkCanvas';

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

    // Monkey-patches the .setAnnotations method of each instance
    // with an interceptor
    const patchInstances = instance => {
      const _setAnnotations = instance.setAnnotations;

      instance.setAnnotations = arg => {
        // Set annotations on instance first
        _setAnnotations(arg);

        // Then create relations
        const annotations = arg || []; // Allow null arg
  
        const connections = annotations
          .map(a => new WebAnnotation(a))
          .filter(isConnection);
    
        // TODO Hack! Until the external API returns a promise we can
        // use to get notified of rendering complete
        window.setTimeout(() =>
          this.canvas.setAnnotations(connections), 200);  
      }

      instance.on('deleteAnnotation', annotation =>
        this.canvas.deleteConnectionsForId(annotation.id));
    }

    this.instances.forEach(i => patchInstances(i));

    this.canvas = new NetworkCanvas(this.instances);
  }

  on = (event, handler) =>
    this.canvas.on(event, handler);

  off = (event, handler) =>
    this.canvas.off(event, handler);

  once = (event, handler) =>
    this.canvas.once(event, handler);

}

export default instances => new ConnectionsPlugin(instances);