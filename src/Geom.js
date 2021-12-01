import { BooleanOperations } from '@flatten-js/core';

export const ARROW_CONFIG = {
  bow: 0,
  stretch: 0.3,
  stretchMin: 40,
  stretchMax: 420,
  padStart: 0,
  padEnd: 6,
  straights: false,
  flip: true
};

/**  Merges N (multi-)polygons into one **/
export const mergePolygons = polygons => {
  const [ first, ...rest ] = polygons;

  return rest.reduce((merged, next) => {
    return BooleanOperations.unify(merged, next);
  }, first);
}

/** Returns the bounding box of the given polygon face **/
export const getFaceBounds = face => {
  const { xmin, ymin, xmax, ymax } = face.box;
  return {
    x: xmin,
    y: ymin,
    width: xmax - xmin,
    height: ymax - ymin
  };
}