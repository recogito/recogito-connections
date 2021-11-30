import NetworkCanvas from './NetworkCanvas';

class ConnectionsPlugin {

  constructor(instances) {
    this.instances = Array.isArray(instances) ? instances : [ instances ];

    this.canvas = new NetworkCanvas(this.instances);
  }

  on = (event, handler) => this.canvas.on(event, handler);

  off = (event, handler) => this.canvas.off(event, handler);

  once = (event, handler) => this.canvas.once(event, handler);

}

export default instances => new ConnectionsPlugin(instances);