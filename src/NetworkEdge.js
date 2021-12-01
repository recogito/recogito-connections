import { getBoxToBoxArrow } from 'perfect-arrows';

/**
 * A network edge, between two network nodes.
 */
export default class NetworkEdge {

   /** Constructs a network edge between two nodes **/
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  /** 
   * Returns the PerfectArrow config for this edge, according
   * to the current viewport state. 
   */
  arrow = () => {
    const start = this.from.getBoundingClientRect();
    const end = this.to.getBoundingClientRect();

    return getBoxToBoxArrow(
      start.x,
      start.y,
      start.width,
      start.height,
      end.x,
      end.y,
      end.width,
      end.height,
      CONFIG
    );
  }

}