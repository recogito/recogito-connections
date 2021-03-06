import { G } from '@svgdotjs/svg.js';
import { getBoxToBoxArrow } from 'perfect-arrows';

import { ARROW_CONFIG } from './Config';

/**
 * A compound SVG shape representing a network edge currently being 
 * drawn between a starting node and the mouse position.
 */
export default class SVGFloatingEdge {
  
  constructor(startNode, svg) {
    // Start is always a NetworkNode
    this.start = startNode;

    // End is null initiall, then either x/y or a network node
    this.end = null;

    this.svg = svg;

    // SVG container group
    this.g = new G()
      .attr('class', 'r6o-connections-float');

    // Edge path
    const edge = this.g.group()
      .attr('class', 'r6o-connections-float-path');

    edge.path()
      .attr('class', 'r6o-connections-float-path-outer');

    edge.path()
      .attr('class', 'r6o-connections-float-path-inner');

    // Edge base is a group with inner/outer circles
    const base = this.g.group()
      .attr('class', 'r6o-connections-float-base');

    base.circle()
      .radius(6)
      .attr('class', 'r6o-connections-float-base-outer');

    base.circle()
      .radius(3)
      .attr('class', 'r6o-connections-float-base-inner');

    // Edge head is a triangle
    this.g.polygon('0,-8 16,0, 0,8')
      .attr('class', 'r6o-connections-float-head');

    // Remain hidden until .dragTo is first called
    this.hidden = true;
  }

  dragTo = (x, y) => {
    if (this.hidden) {
      this.g.addTo(this.svg);
      this.hidden = false;
    }

    this.end = { x, y };
    this.redraw();
  }

  isSnapped = () =>
    !!this.end?.annotation;

  redraw = () => window.requestAnimationFrame(() => {
    if (this.end) {
      const start = this.start.getAttachableRect();
      const end = this.end.annotation ? this.end.getAttachableRect() : this.end;

      const [ sx, sy, cx, cy, ex, ey, ae, ] = getBoxToBoxArrow(
        start.x,
        start.y,
        start.width,
        start.height,
        end.x,
        end.y,
        end.width || 0,
        end.height || 0,
        ARROW_CONFIG
      );

      const endAngleAsDegrees = ae * (180 / Math.PI);

      // Base circles
      this.g.find('circle')
        .attr('cx', sx)
        .attr('cy', sy);

      // Inner and outer paths
      this.g.find('path')
        .attr('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);

      // Arrow head
      this.g.find('polygon')
        .attr('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);
    }
  });

  remove = () =>
    this.g.remove();

  snapTo = node => {
    this.end = node;
    this.redraw();
  }

}