import { SVG, Path } from '@svgdotjs/svg.js';
import EventEmitter from 'tiny-emitter';
import NetworkNode from './NetworkNode';
import NetworkEdge from './NetworkEdge';
import SVGHoveredNode from './svg/SVGHoveredNode';

import Arrow from './connections/Arrow';

import './NetworkCanvas.scss';
import SVGFloatingEdge from './svg/SVGFloatingEdge';

const isAnnotation = element =>
  element.classList?.contains('r6o-annotation');

const isHandle = element =>
  element?.closest && element.closest('.r6o-connections-handle');

export default class NetworkCanvas extends EventEmitter {

  constructor(instances) {
    super();

    // List of RecogitoJS/Annotorious instances
    this.instances = instances;

    this.svg = SVG().addTo('body');
    this.svg.attr('class', 'r6o-connections-canvas');

    this.initGlobalEvents();

    // TODO initial load?
    this.connections = [];

    // Current hover highlight
    this.currentHover = null;

    // Current floating network edge (drawn by the user)
    this.currentFloatingEdge = null;
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
      if (this.currentArrow && this.currentArrow.isSnapped())
        this.onCompleteConnection();
    });

    document.addEventListener('mousemove', this.onMouseMove);

    document.addEventListener('keyup', evt => {
      if (evt.code === 27 && this.currentArrow) // Escape
        this.onCancelConnection(); 
    });

    window.addEventListener('scroll', () => this.redraw(), true);

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() =>
        this.redraw());

      resizeObserver.observe(this.svg.node.parentNode);
    }
  }

  initHoverEvents = node => {
    node.on('startConnection', () => this.onStartConnection(node));
    node.on('mouseout', () => this.onLeaveAnnotation(node.annotation));
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

  onCompleteConnection = () => {
    console.log('done');
    /*
    // Create connection
    this.emit('createConnection', this.currentArrow.toAnnotation().underlying);


    // Debugging stuff...
    const fromNode = new NetworkNode(
      this.currentArrow.start.annotation
    );

    const toNode = new NetworkNode(
      this.currentArrow.end.annotation
    );

    const edge = new NetworkEdge(fromNode, toNode);
    this.drawEdge(edge);

    this.currentArrow.destroy();
    this.currentArrow = null;

    setTimeout(() => this.instances.forEach(i => i.disableSelect = false), 100);

    document.body.classList.remove('r6o-hide-cursor');
    */
  }

  /*
  drawEdge = edge => {
    const [ sx, sy, cx, cy, ex, ey, ae, ] = edge.arrow();

    const path = new Path()
      .attr('class', 'r6o-connections-network-edge')
      .attr('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`)
      .addTo(this.svg);
    //this.head.attr('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);

    this.connections.push({
      edge, svg: path
    });

  }
  */

  /*
  onCancelConnection = () => {
    this.currentArrow.destroy();
    this.currentArrow = null;

    setTimeout(() => this.instances.forEach(i => i.disableSelect = false), 100);

    document.body.classList.remove('r6o-hide-cursor');
  }
  */

  redraw = () => {
    if (this.currentHover)
      this.currentHover.redraw();

    /*
    this.connections.forEach(connection => {
      const { edge, svg } = connection;
      const [ sx, sy, cx, cy, ex, ey, ae, ] = edge.arrow();
      svg.attr('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    });
    */
  }

}