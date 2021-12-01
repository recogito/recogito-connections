import { Box, Point, Polygon } from '@flatten-js/core';
import { getFaceBounds, mergePolygons } from './Geom';

/**
 * A utility abstraction - encapsulates an annotation
 * plus all properties we need to render it as a network
 * node.
 */
export default class NetworkNode {

  /**
   * Instantiates a network node from an annotation and an
   * optional 'preferred coordinate'. Annotations can be multipolygons
   * or multiple spans (in case of overlapping annotations).
   * The preferred coordinate indicates which sub-element should
   * be used for rendering handles or connections.
   */
  constructor(annotation, optXY) {
    // The annotation underlying this network node
    this.annotation = annotation;

    // Optionally, the coordinate by which the annotation
    // was grabbed. (Keep in mind that annotations might
    // render as multiple DOM elements!)
    this.xy = optXY;
  }

  /**
   * The polygon faces the annotation is represented by.
   * Note that an annotation might render as multiple DOM elements,
   * and DOM elements != polygon faces. Typical case: an overlapping
   * text annotation consists of multiple spans, but those would
   * only represent a single rectangle face. Vice versa, a multiline
   * text annotation would be a single span, but consist of multiple
   * rectangle faces!
   */
  get faces () {
    // All DOM rects associated with all elements
    const rects = [];

    for (let element of document.querySelectorAll(`*[data-id="${this.annotation.id}"]`)) {
      for (let rect of element.getClientRects()) {
        rects.push(rect);
      }
    }

    // Merge all client-rects to one multi-polygon
    return mergePolygons(rects.map(rect => {
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
   * Works like the DOM element method, but takes an optional
   * xy-argument to determine which sub-element of the annotation
   * should be picked for the bounds. If no arg is provided,
   * this.preferredElement is used. If there's no preferred element,
   * the method will use the bounds of the first sub-element.
   */
  getBoundingClientRect = () => {
    const defaultFace = Array.from(this.faces)[0];

    if (this.xy) {
      const prefFace = this.getFaceUnderPoint(this.xy);
      return prefFace ? getFaceBounds(prefFace) : getFaceBounds(defaultFace);
    } else {
      return getFaceBounds(defaultFace);
    }
  }

}