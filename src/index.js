import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

import NetworkCanvas from './NetworkCanvas';

class ConnectionsPlugin {

  constructor(instances) {
    this.instances = Array.isArray(instances) ? instances : [ instances ];

    this.canvas = new NetworkCanvas(this.instances);
  }

  loadAnnotations = url => fetch(url)
    .then(response => response.json()).then(annotations => {
      this.setAnnotations(annotations);
      return annotations;
    });

  on = (event, handler) =>
    this.canvas.on(event, handler);

  off = (event, handler) =>
    this.canvas.off(event, handler);

  once = (event, handler) =>
    this.canvas.once(event, handler);

  setAnnotations = arg => {
    const annotations = arg || []; // Allow null arg
    const webannotations = annotations.map(a => new WebAnnotation(a));
    this.canvas.setAnnotations(webannotations);
  }

}

export default instances => new ConnectionsPlugin(instances);