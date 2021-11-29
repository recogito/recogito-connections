import { G } from '@svgdotjs/svg.js';
import { getBoxToBoxArrow } from 'perfect-arrows';

const CONFIG = {
  bow: 0,
  stretch: 0.3,
  stretchMin: 40,
  stretchMax: 420,
  padStart: 0,
  padEnd: 10,
  flip: true,
  straights: false,
};

export default class Arrow {

  constructor(hoveredAnnotation) {
    this.from = hoveredAnnotation.getBox();
    this.to = { x: this.from.x, y: this.from.y, width: 0, height: 0};

    this.g = new G().attr('class', 'connection-arrow');

    this.path = this.g.path();
    this.base = this.g.circle(5);
    this.head = this.g.polygon('0,-6 12,0, 0,6');
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
      this.from.x,
      this.from.y,
      this.from.width,
      this.from.height,
      this.to.x,
      this.to.y,
      this.to.width,
      this.to.height,
      CONFIG
    );

    const [ sx, sy, cx, cy, ex, ey, ae, as, ec ] = arrow;
    const endAngleAsDegrees = ae * (180 / Math.PI)

    this.base.move(sx, sy);
    this.path.attr('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    this.head.attr('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);
  }

  dragTo = to => window.requestAnimationFrame(() => {
    this.to = to;
    this.render();
  })

  snapTo = (elem, annotation) => window.requestAnimationFrame(() => {

  });

  isSnapped = () => {

  }

  setStart = from => window.requestAnimationFrame(() => {
    this.from = from;
    this.render();
  })  

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
