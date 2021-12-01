/**
 * A compound SVG shape representing an existing network 
 * edge between two nodes.
 */
export default class SVGEdge {

  constructor(edge, svg) {
    this.edge;

    this.connection = this.g.group()
      .attr('class', 'r6o-connections-arrow-path');

    this.connection.path()
      .attr('class', 'r6o-connections-arrow-path-outer');
    this.connection.path()
      .attr('class', 'r6o-connections-arrow-path-inner');

    // Base is a group with two circles (inner and outer)
    this.base = this.g.group()
      .attr('class', 'r6o-connections-arrow-base');

    this.base.circle()
      .radius(6)
      .attr('class', 'r6o-connections-arrow-base-outer');

    this.base.circle()
      .radius(3)
      .attr('class', 'r6o-connections-arrow-base-inner');

    // Head is a triangle
    this.head = this.g.polygon('0,-8 16,0, 0,8')
      .attr('class', 'r6o-connections-arrow-head');
  }



  redraw = () => {

  }

}