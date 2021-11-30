import { Circle, G, Path } from '@svgdotjs/svg.js';
import { BooleanOperations, Box, Point, Polygon } from '@flatten-js/core';

/** Helper to merge N (multi-)polygons into one **/
const mergePolygons = polygons => {
  const [ first, ...rest ] = polygons;

  return rest.reduce((merged, next) => {
    return BooleanOperations.unify(merged, next);
  }, first);
}

/**
 * A helper class to represent current mouse hover state.
 * The state encapsulates: i) the currently hovered annotation;
 * ii) the currently hovered DOM element (which is part of the 
 * annotation); iii) all other DOM elements that represent the
 * annotation, but are not currently under the mouse. 
 */
export default class HoverState {

  constructor(annotation, element) {
    this.annotation = annotation;
    this.element = element;

    // All DOM rects associated with all elements
    const rects = [];

    for (let element of document.querySelectorAll(`*[data-id="${annotation.id}"]`)) {
      for (let rect of element.getClientRects()) {
        rects.push(rect);
      }
    }

    // Convert to polygons and merge
    this.faces = mergePolygons(rects.map(rect => {
      const { x, y, width, height } = rect;

      return new Polygon([
        new Point(x, y),
        new Point(x + width, y),
        new Point(x + width, y + height),
        new Point(x, y + height)
      ]); 
    })).faces;

    // Rendered SVG group
    this.g = null;

    // Registered event handlers
    this.handlers = {};
  }

  getBoundingClientRect= () => {
    // TODO return the bounds of the multipolygon face under the mousey
    return this.element.getBoundingClientRect();
  }

  /** Lazily returns the SVG group */
  getContainer = svg => {
    if (!this.g) {
      this.g = new G().attr('class', 'r6o-connections-hover').addTo(svg);
      this.g.mouseout(() => this.fireEvent('mouseout'));
    }

    return this.g;
  }

  on = (event, handler) => {
    if (this.handlers[event])
      this.handlers[event].push(handler);
    else
      this.handlers[event] = [ handler ];
  }

  /** Shorthand **/
  fireEvent = event => {
    const handlers = this.handlers[event] || [];
    handlers.forEach(fn => fn(this.annotation, this.element));
  }

  renderOutline = svg => {
    const container = this.getContainer(svg);

    const path = new Path()
      .attr('class', 'r6o-connections-hover')
      .attr('d', this.faces.svg());

    path.addTo(container);

    return this; // Fluent method
  }

  renderHandle = (svg, x, y) => {
    const container = this.getContainer(svg);

    // From the multipolygon, find the face that's currently
    // under the mouse poiner
    const box = new Box(x - 1, y - 1, x + 1, y + 1);

    const [ intersecting, ] = this.faces.search(box);
    if (intersecting) {
      // Place handle top/middle of the multipolygon face
      // under the mouse
      const { xmin, xmax, ymin } = intersecting.box;
      
      const cx = Math.round((xmin + xmax) / 2);
      const cy = Math.round(ymin);

      const g = new G()
        .attr('class', 'r6o-connections-handle')
        .addTo(container);

      // Outer circle
      new Circle()
        .radius(9)
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('class', 'r6o-connections-handle-outer')
        .addTo(g);

      // Inner dot
      new Circle()
        .radius(5)
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('class', 'r6o-connections-handle-inner')
        .addTo(g);

      // Mousedown on the handle should start connecting
      g.mousedown(() => this.fireEvent('startConnection'));
    }

    return this;
  }

  clearSVG = () => {
    if (this.g)
      this.g.remove();

    this.handlers = {};
  }

}