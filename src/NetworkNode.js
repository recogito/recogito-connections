import { BooleanOperations, Box, Point, Polygon } from '@flatten-js/core';

/** 
 * Helper to merge N (multi-)polygons into one.
 */
const mergePolygons = polygons => {
  const [ first, ...rest ] = polygons;

  return rest.reduce((merged, next) => {
    return BooleanOperations.unify(merged, next);
  }, first);
}

/**
 * Returns the { x, y, width, height } bounding box of the given
 * face.
 */
const getFaceBounds = face => {
  const { xmin, ymin, xmax, ymax } = face.box;
  return {
    x: xmin,
    y: ymin,
    width: xmax - xmin,
    height: ymax - ymin
  };
}

/**
 * A utility abstraction - encapsulates an annotation
 * plus all properties we need to render it as a network
 * node.
 */
export default class NetworkNode {

  /**
   * Instantiates a network node from an annotation and an
   * optional 'preferred element'. Annotations can be multipolygons
   * or multiple spans (in case of overlapping annotations).
   * The preferred element indicates which preferred sub-element 
   * edge should connect to.
   */
  constructor(annotation, optPreferredElement) {
    this.annotation = annotation;

    this.preferredElement = optPreferredElement;

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
  }

  /**
   * Returns the multipolygon face intersecting the given point.
   */
  getFaceUnderPoint = xy => {
    // From the multipolygon, find the face that's currently
    // under the given coordinate
    const box = new Box(xy.x - 1, xy.y - 1, xy.x + 1, xy.y + 1);
    const [ intersecting, ] = this.faces.search(box);
    return intersecting;
  }

  /**
   * Returns the 'preferred face', i.e. the face intersecting 
   * the preferred element (or, basically, a random face, if none).
   */
  getPreferredFace = () => {
    if (this.preferredElement) {
      const { x, y, width, height } = this.preferredElement.getBoundingClientRect();
      const box = new Box(x, y, x + width, y + height);
      const [ intersecting, _ ] = this.faces.search(box);
      return intersecting;
    } else {
      return Array.from(this.faces)[0];
    }
  }

  /**
   * Works like the DOM element method, but takes an optional
   * xy-argument to determine which sub-element of the annotation
   * should be picked for the bounds. If no arg is provided,
   * this.preferredElement is used. If there's no preferred element,
   * the method will use the bounds of the first sub-element.
   */
  getBoundingClientRect = optXY => {
    if (optXY) {
      return getFaceBounds(this.getFaceUnderPoint(optXY));
    } else {
      return getFaceBounds(this.getPreferredFace());
    }
  }

}