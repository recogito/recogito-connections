import { getBoxToBoxArrow } from 'perfect-arrows';
import { SVG_NAMESPACE } from './SVG';

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

  constructor(fromBox, svgEl) {
    this.from = fromBox;
    this.to = fromBox;

    this.g = document.createElementNS(SVG_NAMESPACE, 'g');
    this.g.setAttribute('class', 'connection-arrow');

    this.path = document.createElementNS(SVG_NAMESPACE, 'path');

    this.base = document.createElementNS(SVG_NAMESPACE, 'circle');
    this.base.setAttribute('r', 5);

    this.head = document.createElementNS(SVG_NAMESPACE, 'polygon');
    this.head.setAttribute('points', '0,-6 12,0, 0,6');

    this.g.appendChild(this.path);
    this.g.appendChild(this.base);
    this.g.appendChild(this.head);

    svgEl.appendChild(this.g);
  }

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

    const [sx, sy, cx, cy, ex, ey, ae, as, ec] = arrow;
    const endAngleAsDegrees = ae * (180 / Math.PI)

    this.base.setAttribute('cx', sx);
    this.base.setAttribute('cy', sy);

    this.path.setAttribute('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    
    this.head.setAttribute('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);
  }

  setEnd = to => window.requestAnimationFrame(() => {
    this.to = to;
    this.render();
  })

  setStart = from => window.requestAnimationFrame(() => {
    this.from = from;
    this.render();
  })  

  destroy = () =>
    this.g.parentNode.removeChild(this.g);

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
