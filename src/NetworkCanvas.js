import { SVG } from '@svgdotjs/svg.js';

import HoveredAnnotation from './hovered/HoveredAnnotation';

import './NetworkCanvas.scss';

// To be extended...
const isAnnotation = element =>
  element.classList?.contains('r6o-annotation');

export default class NetworkCanvas {

  constructor() {
    this.svg = SVG().addTo('body');
    this.svg.attr('class', 'r6o-connections-canvas');

    this.initEventHandlers();

    this.currentHover = null;
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

    /*
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
    });
    */
  }

  onEnterAnnotation = (elem, annotation) => {
    this.currentHover = new HoveredAnnotation(elem, annotation, this.svg);
    this.currentHover.addTo(this.svg);
  }

  onLeaveAnnotation = (elem, annotation) => {
    if (this.currentHover)
      this.currentHover.destroy();
  }

}