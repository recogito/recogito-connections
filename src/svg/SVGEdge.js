import { getBoxToBoxArrow } from 'perfect-arrows';

import { ARROW_CONFIG } from './Config';

/**
 * A compound SVG shape representing an existing network 
 * edge between two nodes.
 */
export default class SVGEdge {

  constructor(edge, svg) {
    this.edge = edge;

    this.g = svg.group()
      .attr('class', 'r6o-connections-edge');

    // Edge path
    const svgEdge = this.g.group()
      .attr('class', 'r6o-connections-edge-path');

    svgEdge.path()
      .attr('class', 'r6o-connections-edge-path-outer');

    svgEdge.path()
      .attr('class', 'r6o-connections-edge-path-inner');

    // Edge base is a single circles
    this.g.circle()
      .radius(3)
      .attr('class', 'r6o-connections-edge-base');

    // Edge head is a triangle
    this.g.polygon('0,-6 12,0, 0,6')
      .attr('class', 'r6o-connections-edge-head');

    // Initial render
    this.redraw();
  }

  redraw = () => {
    let start = this.edge.start.getAttachableRect();
    const end = this.edge.end.getAttachableRect(start);
    start = this.edge.start.getAttachableRect(end);

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

    // Base circle
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

  resetAttachment = () => {
    this.edge.start.resetAttachment();
    this.edge.end.resetAttachment();
  }

  remove = () => 
    this.g.remove();

}