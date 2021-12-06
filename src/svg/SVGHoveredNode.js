import EventEmitter from 'tiny-emitter';

import { 
  TETHER_LENGTH,
  DOT_SIZE,
  HANDLE_SIZE,
  MOUSE_BUFFER
} from './Config';

/**
 * A compound SVG shape representing a network node currently
 * under the mouse. Optionally with a drag handle or not.
 */
export default class SVGHoveredNode extends EventEmitter {

  constructor(node, svg, drawHandle) {
    super();

    this.node = node;
    this.drawHandle = drawHandle;

    // SVG shape container
    this.g = svg.group().attr('class', 'r6o-connections-hover');

    // Create outline path
    this.g.path()
      .attr('class', 'r6o-connections-hover-emphasis');

    // Create handle shapes
    if (drawHandle) {
      const handle = this.g.group()
        .attr('class', 'r6o-connections-handle has-events');

      // Connecting line between dot and grab circle
      handle.line()
        .attr('class', 'r6o-connections-handle-tether');

      // Small bottom dot
      handle.circle()
        .attr('class', 'r6o-connections-handle-dot')
        .radius(DOT_SIZE);

      // Handle circles
      handle.circle()
        .attr('class', 'r6o-connections-handle-outer')
        .radius(HANDLE_SIZE);

      handle.circle()
        .attr('class', 'r6o-connections-handle-inner')
        .radius(HANDLE_SIZE / 2);

      // Mouse event trap on top
      handle.rect()
        .attr('width', HANDLE_SIZE * 2 + 2 * MOUSE_BUFFER)
        .attr('height', HANDLE_SIZE + TETHER_LENGTH + DOT_SIZE + 2 * MOUSE_BUFFER)
        .attr('class', 'r6o-connections-handle-mousetrap')
        .mouseout(() => this.emit('mouseout', this.node));

      handle.mousedown(() => this.emit('startConnection', this.node));
    }

    this.eventHandlers = {};

    // Initial render
    this.redraw();
  }
  
  _redrawOutline = () => {
    this.g.find('.r6o-connections-hover-emphasis').attr('d', this.node.faces.svg());
  }

  _redrawHandle = () => {
    const { x, y, width } = this.node.getAttachableRect();

    const cx = Math.round(x + width / 2);
    const cy = Math.round(y);

    this.g.find('.r6o-connections-handle-mousetrap')
      .attr('x', cx - HANDLE_SIZE - MOUSE_BUFFER)
      .attr('y', cy - TETHER_LENGTH - HANDLE_SIZE - MOUSE_BUFFER);

    this.g.find('.r6o-connections-handle-dot')
      .attr('cx', cx)
      .attr('cy', cy + Math.ceil(DOT_SIZE / 2));

    this.g.find('.r6o-connections-handle-tether')
      .attr('x1', cx)
      .attr('y1', cy)
      .attr('x2', cx)
      .attr('y2', cy - TETHER_LENGTH);

    this.g.find('.r6o-connections-handle-inner')
      .attr('cx', cx)
      .attr('cy', cy - TETHER_LENGTH);

    this.g.find('.r6o-connections-handle-outer')
      .attr('cx', cx)
      .attr('cy', cy - TETHER_LENGTH);
  }

  redraw = () => {
    this._redrawOutline();

    if (this.drawHandle)
      this._redrawHandle();
  }

  remove = () =>
    this.g.remove();

}