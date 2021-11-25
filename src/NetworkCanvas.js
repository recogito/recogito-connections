import { SVG_NAMESPACE } from './SVG';

import './NetworkCanvas.scss';

// To be extended...
const isAnnotation = element =>
  element.classList?.contains('r6o-annotation');

export default class NetworkCanvas {

  constructor() {
    this.svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    this.svg.setAttribute('class', 'r6o-connections-canvas');

    const opts = {
      capture: true,
      passive: true
    }

    document.addEventListener('mouseenter', evt => {
      if (isAnnotation(evt.target))
        this.onEnterAnnotation(evt.target, evt.target.annotation);
    }, opts);

    document.addEventListener('mouseleave', evt => {
      if (isAnnotation(evt.target))
        this.onLeaveAnnotation(evt.target, evt.target.annotation);
    }, opts);

    document.body.append(this.svg);
  }

  onEnterAnnotation = (elem, annotation) => {
    console.log(elem, annotation);
  }

  onLeaveAnnotation = (elem, annotation) => {
    console.log('leave');
  }

}