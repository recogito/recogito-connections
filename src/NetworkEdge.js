import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

export default class NetworkEdge {

  constructor(start, end) {
    this.start = start;
    this.end = end;
    
    this.bodies = [];
  }

  matchesAnnotation = annotation => {
    if (!Array.isArray(annotation.targets))
      return false;

    const start = annotation.targets[0].id;
    const end = annotation.targets[1].id;

    return this.start.annotation.id === start && this.end.annotation.id === end;
  }

  toAnnotation = () => WebAnnotation.create({
    body: this.bodies,
    target: [
      { id: this.start.annotation.id },
      { id: this.end.annotation.id }
    ]
  });

}