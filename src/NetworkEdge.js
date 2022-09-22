import WebAnnotation from '@recogito/recogito-client-core/src/WebAnnotation';

export default class NetworkEdge {

  constructor(id, start, end) {
    this.id = id;

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
    id: this.id,
    body: this.bodies,
    motivation: 'linking',
    target: [
      { id: this.start.annotation.id },
      { id: this.end.annotation.id }
    ]
  });

}