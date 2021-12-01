/**
 * A compound SVG shape representing a network node currently
 * under the mouse. Optionally with a drag handle or not.
 */
export default class SVGHoveredNode {

  constructor(node, svg, drawHandle) {
    this.node = node;
    this.drawHandle = drawHandle;

    // SVG shape container
    this.g = svg.group().attr('class', 'r6o-connections-hover');
    this.g.mouseout(() => this.fireEvent('mouseout'));

    // Create outline path
    this.g.path()
      .attr('class', 'r6o-connections-hover');

    // Create handle shapes
    if (drawHandle) {
      const handle = this.g.group()
        .attr('class', 'r6o-connections-handle');

      handle.circle()
        .attr('class', 'r6o-connections-handle-outer')
        .radius(9);

      handle.circle()
        .attr('class', 'r6o-connections-handle-inner')
        .radius(5);

      handle.mousedown(() => this.fireEvent('startConnection'));
    }

    this.eventHandlers = {};

    // Initial render
    this.redraw();
  }

  fireEvent = event => {
    const handlers = this.eventHandlers[event] || [];
    handlers.forEach(fn => fn(this.node));
  }

  on = (event, handler) => {
    if (this.eventHandlers[event])
      this.eventHandlers[event].push(handler);
    else
      this.eventHandlers[event] = [ handler ];
  }

  _redrawOutline = () => {
    this.g.find('.r6o-connections-hover').attr('d', this.node.faces.svg());
  }

  _redrawHandle = () => {
    const { x, y, width } = this.node.getBoundingClientRect();

    const cx = Math.round(x + width / 2);
    const cy = Math.round(y);

    this.g.find('.r6o-connections-handle-inner')
      .attr('cx', cx)
      .attr('cy', cy)

    this.g.find('.r6o-connections-handle-outer')
      .attr('cx', cx)
      .attr('cy', cy)
  }

  redraw = () => {
    this._redrawOutline();

    if (this.drawHandle)
      this._redrawHandle();
  }

  remove = () =>
    this.g.remove();

}