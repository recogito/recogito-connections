import { getBoxToBoxArrow } from 'perfect-arrows';

const CONFIG = {
  bow: 0,
  stretch: 0.3,
  stretchMin: 40,
  stretchMax: 420,
  padStart: 0,
  padEnd: 0,
  straights: false
};

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