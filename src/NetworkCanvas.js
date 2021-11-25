import Arrow from './Arrow';
import { SVG_NAMESPACE } from './SVG';

import './NetworkCanvas.scss';

// To be extended...
const isAnnotation = element =>
  element.classList?.contains('r6o-annotation');

export default class NetworkCanvas {

  constructor() {
    this.svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    this.svg.setAttribute('class', 'r6o-connections-canvas');

    this.initEventHandlers();

    document.body.append(this.svg);

    // Currently hovered element
    this.currentHover = null;

    // Hack
    this.currentArrow = null;
  }

  initEventHandlers = () => {
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

    document.addEventListener('mousedown', evt => {
      if (this.currentHover) {
        this.currentArrow = new Arrow(this.currentHover.getBoundingClientRect(), this.svg);
      }
    });

    document.addEventListener('mousemove', evt => {
      if (this.currentArrow) {
        this.currentArrow.setEnd({ 
          x: evt.clientX,
          y: evt.clientY,
          width: 0,
          height: 0
        });
      }
    })
  }

  onEnterAnnotation = (elem, annotation) => {
    const { x, y, width, height } = elem.getBoundingClientRect();

    const hover = document.createElementNS(SVG_NAMESPACE, 'rect');
    hover.setAttribute('class', 'r6o-connections-hover');

    hover.setAttribute('x', x);
    hover.setAttribute('y', y);
    hover.setAttribute('width', width);
    hover.setAttribute('height', height);

    this.svg.appendChild(hover);

    this.currentHover = hover;
  }

  onLeaveAnnotation = (elem, annotation) => {
    if (this.currentHover)
      this.svg.removeChild(this.currentHover);
  }

}