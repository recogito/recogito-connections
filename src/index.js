import NetworkCanvas from './NetworkCanvas';

class ConnectionsPlugin {

  constructor(instances) {
    this.instances = Array.isArray(instances) ? instances : [ instances ];

    this.canvas = new NetworkCanvas(this.instances);
  }

}

export default instances => new ConnectionsPlugin(instances);