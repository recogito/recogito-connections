import { SVG_NAMESPACE } from './SVG';

import './NetworkCanvas.scss';

export default class NetworkCanvas {

  constructor() {
    this.svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    this.svg.setAttribute('class', 'r6o-connections-canvas');

    document.body.append(this.svg);
  }

}