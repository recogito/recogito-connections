import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

export default class NetworkEdge {

  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  toAnnotation = () => WebAnnotation.create({
    target: [
      { id: this.start.annotation.id },
      { id: this.end.annotation.id }
    ]
  });

}