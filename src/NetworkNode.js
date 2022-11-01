import { BooleanOperations, Box, Point, Polygon } from '@flatten-js/core';

/** Returns the bounding box of the given polygon face **/
const getFaceBounds = face => {
  const { xmin, ymin, xmax, ymax } = face.box;
  return {
    x: xmin,
    y: ymin,
    width: xmax - xmin,
    height: ymax - ymin
  };
}

/**  Merges N (multi-)polygons into one **/
const mergePolygons = polygons => {
  const [ first, ...rest ] = polygons;

  return rest.reduce((merged, next) => {
    return BooleanOperations.unify(merged, next);
  }, first);
}

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
   * The polygon faces the annotation is represented by in the DOM.
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
    return rects.length > 0 ? mergePolygons(rects.map(rect => {
      const { x, y, width, height } = rect;

      return new Polygon([
        new Point(x, y),
        new Point(x + width, y),
        new Point(x + width, y + height),
        new Point(x, y + height)
      ]); 
    })).faces : null;
  }

  /**
   * Returns the multipolygon face intersecting the given point.
   */
  getFaceUnderPoint = xy => {
    // From the multipolygon, find the face that's currently
    // under the given coordinate
    const box = new Box(xy.x - 1, xy.y - 1, xy.x + 1, xy.y + 1);
    const [ intersecting, ] = this.faces?.search(box) || [];
    return intersecting;
  }

  getAttachableRect = optReference => {
    // Just a bit of defensive programming - users
    // might deregister an instance, and then there wouldn't
    // be any faces for a node.
    if (!this.faces) {
      return;
    }

    const faces = Array.from(this.faces);
    if (faces.length === 0) {
      return;
    }

    if (this.xy) {
      const f = this.getFaceUnderPoint(this.xy);
      return f ? getFaceBounds(f) : getFaceBounds(faces[0]);
    } else if (optReference) {
      const { x, y, width, height } = optReference;

      // Compute distance between the reference shape and each face
      const a = new Polygon(new Box(x, y, x + width, y + height));
      
      const sorted = faces.map(face => {
        const [ distance, ] = new Polygon(face.shapes).distanceTo(a);
        return { face, distance }; 
      }).sort((a,b) => a.distance - b.distance);

      return getFaceBounds(sorted[0].face);
    } else {
      return getFaceBounds(faces[0]);
    }
  }

  resetAttachment = () => 
    this.xy = null;

}

NetworkNode.findById = id => {
  const annotation = document.querySelector(`*[data-id="${id}"]`)?.annotation;

  if (annotation)
    return new NetworkNode(annotation);
}