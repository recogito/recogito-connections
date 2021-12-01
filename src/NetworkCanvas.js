import { SVG } from '@svgdotjs/svg.js';
import EventEmitter from 'tiny-emitter';

import Arrow from './connections/Arrow';
import HoverState from './state/HoverState';

import './NetworkCanvas.scss';
import NetworkNode from './NetworkNode';
import NetworkEdge from './NetworkEdge';

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

    // TODO I think after switching from mouseenter to mouseover, we don't need this anymore!
    this.hoverStack = [];

    this.currentArrow = null;
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
      // Escape
      if (evt.which === 27 && this.currentArrow)
        this.onCancelConnection(); 
    });

    window.addEventListener('scroll', () => this.redraw(), opts);

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() =>
        this.redraw());

      resizeObserver.observe(this.svg.node.parentNode);
    }
  }

  initHoverEvents = hoverState => {
    hoverState.on('startConnection', () => this.onStartConnection(hoverState));
    hoverState.on('mouseout', () => this.onLeaveAnnotation(hoverState.annotation));
  }

  /**
   * When entering an annotation show hover emphasis. If there's no
   * dragged arrow, show connection handle. If there is a dragged 
   * arrow, snap it.
   */
  onEnterAnnotation = evt => {
    const element = evt.target;
    const { annotation } = element;

    const previousState = this.hoverStack.length > 0 &&
      this.hoverStack[this.hoverStack.length - 1];

    // Destroy previous, if any
    if (previousState)
      previousState.clearSVG();

    const nextState = new HoverState(annotation, element);
    this.initHoverEvents(nextState);
    this.hoverStack.push(nextState);

    nextState.renderOutline(this.svg);
    
    if (this.currentArrow) {
      this.currentArrow.snapTo(nextState);
    } else {
      nextState.renderHandle(this.svg, evt.clientX, evt.clientY);
    }
  }

  /**
   * When leaving an annotation, clear the hover if necessary.
   */
  onLeaveAnnotation = annotation =>  {
    const state = this.hoverStack.find(state => state.annotation.isEqual(annotation));

    if (state) {
      // Clear this state
      state.clearSVG();
      
      // Remove from the stack
      this.hoverStack = this.hoverStack.filter(s => s !== state);

      // Render previous state, if any
      if (this.hoverStack.length > 0) {
        const topState = this.hoverStack[this.hoverStack.length - 1];
        this.initHoverEvents(topState);
        topState.renderOutline(this.svg);
        topState.renderHandle(this.svg);
      }
    }
  }

  /**
   * If there is a current arrow and it's not snapped, drag it to mouse position.
   */
  onMouseMove = evt => {
    if (this.currentArrow) {
      const [ currentHover, ] = this.hoverStack;

      if (currentHover) {
        this.currentArrow.snapTo(currentHover);
        document.body.classList.remove('r6o-hide-cursor');
      } else {
        // No hover - just follow the mouse
        this.currentArrow.dragTo(evt.clientX, evt.clientY);
        document.body.classList.add('r6o-hide-cursor');
      }
    }
  }

  onStartConnection = hoverState => {
    this.currentArrow = new Arrow(hoverState).addTo(this.svg);

    // Disable selection on RecogitoJS/Annotorious
    this.instances.forEach(i => i.disableSelect = true);
  }

  onCompleteConnection = () => {
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
  }

  drawEdge = edge => {
    console.log(edge);
    console.log(edge.arrow())
    const [ sx, sy, cx, cy, ex, ey, ae, ] = edge.arrow();

    this.svg.path()
      .attr('class', 'r6o-connections-network-edge')
      .attr('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    //this.head.attr('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);

  }

  onCancelConnection = () => {
    this.currentArrow.destroy();
    this.currentArrow = null;

    setTimeout(() => this.instances.forEach(i => i.disableSelect = false), 100);

    document.body.classList.remove('r6o-hide-cursor');
  }

  redraw = () => {
    const [ currentHover, ] = this.hoverStack;
    if (currentHover)
      currentHover.redraw();
  }

}