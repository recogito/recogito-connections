import { G } from '@svgdotjs/svg.js';
import { getBoxToBoxArrow } from 'perfect-arrows';
import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

const CONFIG = {
  bow: 0,
  stretch: 0.3,
  stretchMin: 40,
  stretchMax: 420,
  padStart: 0,
  padEnd: 6,
  straights: false,
};

export default class Arrow {

  constructor(hoveredAnnotation) {
    const { x, y, width, height } = hoveredAnnotation.getBoundingClientRect();

    this.start = {
      annotation: hoveredAnnotation.annotation,
      x, y, width, height  
    };

    this.end = { x: this.start.x, y: this.start.y, width: 0, height: 0};

    this.g = new G().attr('class', 'r6o-connections-arrow');

    // Connection is a group with two paths (inner and outer)
    this.connection = this.g.group()
      .attr('class', 'r6o-connections-arrow-path');

    this.connection.path()
      .attr('class', 'r6o-connections-arrow-path-outer');
    this.connection.path()
      .attr('class', 'r6o-connections-arrow-path-inner');

    // Base is a group with two circles (inner and outer)
    this.base = this.g.group()
      .attr('class', 'r6o-connections-arrow-base');

    this.base.circle()
      .radius(6)
      .attr('class', 'r6o-connections-arrow-base-outer');

    this.base.circle()
      .radius(3)
      .attr('class', 'r6o-connections-arrow-base-inner');

    // Head is a triangle
    this.head = this.g.polygon('0,-8 16,0, 0,8')
      .attr('class', 'r6o-connections-arrow-head');
  }

  addTo = svg => {
    this.g.addTo(svg);

    // Fluent method
    return this;
  }

  destroy = () =>
    this.g.remove();

  render = () => {
    const arrow = getBoxToBoxArrow(
      this.start.x,
      this.start.y,
      this.start.width,
      this.start.height,
      this.end.x,
      this.end.y,
      this.end.width,
      this.end.height,
      CONFIG
    );

    const [ sx, sy, cx, cy, ex, ey, ae, ] = arrow;
    const endAngleAsDegrees = ae * (180 / Math.PI)

    this.base.find('circle').attr('cx', sx).attr('cy', sy);
    this.connection.find('path').attr('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    this.head.attr('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);
  }

  dragTo = (x, y) => window.requestAnimationFrame(() => {
    this.end = { x, y, width: 0, height: 0 };
    this.render();
  });

  snapTo = hoverState => window.requestAnimationFrame(() => {
    const { x, y, width, height } = hoverState.getBoundingClientRect();

    this.end = {
      annotation: hoverState.annotation,
      x, y, width, height
    };

    this.render();
  });

  isSnapped = () =>
    this.end.width > 0 && this.end.height > 0;

  toAnnotation = () => WebAnnotation.create({
    target: [
      { id: this.start.annotation.id },
      { id: this.end.annotation.id }
    ]
  });

}

/*
Arrow.fromAnnotations = (start, end, svgEl) => {
  const fromBox = parseRectFragment(start);
  const toBox = parseRectFragment(end);

  const arrow = new Arrow(fromBox, svgEl);
  arrow.setEnd(toBox);

  return arrow;
} 
*/
