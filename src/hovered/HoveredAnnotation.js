import ConnectorHandle from './ConnectorHandle';

/**
 * A container class, for convenience. Wraps the
 * an annotation, it's associated shape bounds set, 
 * and the connector handles.
 */
export default class HoveredAnnotation {

  constructor(elem, annotation) {
    this.elements = Array.isArray(elem) ? elem : [ elem ];
    this.annotation = annotation;

    this.connectorHandles = this.elements.map(elem => new ConnectorHandle(elem));        
  }

  getBox = () => 
    this.elements[0].getBoundingClientRect();

  addTo = parentNode =>
    this.connectorHandles.forEach(h => h.addTo(parentNode));

  destroy = () =>
    this.connectorHandles.forEach(h => h.destroy());

}