import { SVG } from '@svgdotjs/svg.js';
import EventEmitter from 'tiny-emitter';

import NetworkEdge from './NetworkEdge';
import NetworkNode from './NetworkNode';
import SVGEdge from './svg/SVGEdge';
import SVGFloatingEdge from './svg/SVGFloatingEdge';
import SVGHoveredNode from './svg/SVGHoveredNode';

import './NetworkCanvas.scss';

/** Checks if the given DOM element represents an annotation **/
const isAnnotation = element =>
  element.classList?.contains('r6o-annotation');

/** Checks if the given DOM element is a connection handle **/
const isHandle = element =>
  element?.closest && element.closest('.r6o-connections-hover');

export default class NetworkCanvas extends EventEmitter {

  constructor(instances) {
    super();

    // List of RecogitoJS/Annotorious instances
    this.instances = instances;

    this.svg = SVG().addTo('body');
    this.svg.attr('class', 'r6o-connections-canvas');

    this.initGlobalEvents();

    this.connections = [];

    // Current hover highlight
    this.currentHover = null;

    // Current floating network edge (drawn by the user)
    this.currentFloatingEdge = null;
  }

  /** 
   * Deletes all connections connected to the annotation
   * with the given ID.
   */
  deleteConnectionsForId = id => {
    this.connections = this.connections.filter(conn => {
      const start = conn.edge.start.annotation.id;
      const end = conn.edge.end.annotation.id;

      const toDelete = start === id || end === id;
      if (toDelete)
        conn.remove();

      return !toDelete;
    });
  }

  initGlobalEvents = () => {
    const opts = {
      capture: true,
      passive: true
    }

    document.addEventListener('mouseover', evt => {
      if (isAnnotation(evt.target))
        this.onEnterAnnotation(evt);
    }, opts);

    document.addEventListener('mouseout', evt => {
      if (isAnnotation(evt.target)) {
        // Note: entering the connection handle will also cause  a
        // mouseleave event for the annotation!
        if (!isHandle(evt.relatedTarget))
          this.onLeaveAnnotation(evt.target.annotation); 
      }
    });

    document.addEventListener('mousedown', () => {
      if (this.currentFloatingEdge && this.currentFloatingEdge.isSnapped())
        this.onCompleteConnection();
    });

    document.addEventListener('mousemove', this.onMouseMove);

    document.addEventListener('keyup', evt => {
      if (evt.code === 'Escape' && this.currentFloatingEdge)
        this.onCancelConnection(); 
    });

    window.addEventListener('scroll', () => this.redraw(), true);

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() =>
        this.redraw());

      resizeObserver.observe(this.svg.node.parentNode);
    }
  }

  initHoverEvents = hover => {
    hover.on('startConnection', () => this.onStartConnection(hover.node));
    hover.on('mouseout', this.onLeaveAnnotation);
  }

  /**
   * When entering an annotation show hover emphasis. If there's no
   * dragged arrow, show connection handle. If there is a dragged 
   * arrow, snap it.
   */
  onEnterAnnotation = evt => {
    const { annotation } = evt.target;
    const { clientX, clientY } = evt;

    // Destroy previous hover, if any
    if (this.currentHover)
      this.currentHover.remove();

    // Network node for this hover
    const node = new NetworkNode(annotation, { x: clientX, y: clientY });

    // Draw handle if there's no floating edge yet
    const drawHandle = !this.currentFloatingEdge;
    this.currentHover = new SVGHoveredNode(node, this.svg, drawHandle);
    this.initHoverEvents(this.currentHover);

    // If there is a floating connection already, snap
    if (this.currentFloatingEdge)
      this.currentFloatingEdge.snapTo(node);
  }

  onLeaveAnnotation = () =>  {
    this.currentHover.remove();
    this.currentHover = null;
  }

  onMouseMove = evt => {
    // If there is a current floating edge and it's not snapped, 
    // drag it to mouse position
    if (this.currentFloatingEdge) {
      if (this.currentHover) {
        document.body.classList.remove('r6o-hide-cursor');
      } else {
        this.currentFloatingEdge.dragTo(evt.clientX, evt.clientY);
        document.body.classList.add('r6o-hide-cursor');
      }
    }
  }

  onStartConnection = node => {
    this.currentFloatingEdge = new SVGFloatingEdge(node, this.svg);

    // Disable selection on RecogitoJS/Annotorious
    this.instances.forEach(i => i.disableSelect = true);
  }

  /**
   * TODO we still need to incorporate an editor for the 
   * connection body payload.
   */
  onCompleteConnection = () => {
    const { start, end } = this.currentFloatingEdge;

    const edge = new NetworkEdge(start, end);

    const annotation = edge.toAnnotation();

    this.connections.push(new SVGEdge(edge, this.svg));

    this.emit('createConnection', annotation.underlying);
    
    setTimeout(() => this.instances.forEach(i => i.disableSelect = false), 100);

    document.body.classList.remove('r6o-hide-cursor');

    this.currentFloatingEdge.remove();
    this.currentFloatingEdge = null;
  }

  onCancelConnection = () => {
    this.currentFloatingEdge.remove();
    this.currentFloatingEdge = null;

    this.instances.forEach(i => i.disableSelect = false);

    document.body.classList.remove('r6o-hide-cursor');
  }

  redraw = () => {
    if (this.currentHover)
      this.currentHover.redraw();

    this.connections.forEach(connection => connection.redraw());
  }

  setAnnotations = annotations => annotations.forEach(a => {
    const start = NetworkNode.findById(a.targets[0].id);
    const end = NetworkNode.findById(a.targets[1].id);

    const edge = new NetworkEdge(start, end);
    this.connections.push(new SVGEdge(edge, this.svg));
  });

}