import { Path } from '@svgdotjs/svg.js';
import { BooleanOperations, Point, Polygon } from '@flatten-js/core';

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

    // Rendered SVG shapes
    this.shapes = [];
  }

  renderOutline = svg => {
    const path = new Path()
      .attr('class', 'r6o-connections-hover')
      .attr('d', this.faces.svg());

    path.addTo(svg);

    this.shapes.push(path);

    return this; // Fluent method
  }

  renderHandle = () => {
    // TODO
  }

  clearSVG = () =>
    this.shapes.forEach(s => s.remove());

}