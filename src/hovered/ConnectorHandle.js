import { Rect } from '@svgdotjs/svg.js';

export default class ConnectorHandle {

  constructor(elem, opts) {
    const { x, y, width, height } = elem.getBoundingClientRect();

    this.element = new Rect()
      .size(width, height)
      .move(x, y)
      .attr('class', 'r6o-connections-hover');
  }

  addTo = svg => 
    this.element.addTo(svg);

  destroy = () =>
    this.element.remove();

}