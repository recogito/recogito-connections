import { SVG } from '@svgdotjs/svg.js';

import Arrow from './connections/Arrow';
import HoverState from './state/HoverState';
// import HoveredAnnotation from './hovered/HoveredAnnotation';

import './NetworkCanvas.scss';

// To be extended...
const isAnnotation = element =>
  element.classList?.contains('r6o-annotation');

export default class NetworkCanvas {

  constructor() {
    this.svg = SVG().addTo('body');
    this.svg.attr('class', 'r6o-connections-canvas');

    this.initEventHandlers();

    this.hoverStack = [];

    this.currentArrow = null;
  }

  initEventHandlers = () => {
    const opts = {
      capture: true,
      passive: true
    }

    document.addEventListener('mouseenter', evt => {
      if (isAnnotation(evt.target))
        this.onEnterAnnotation(evt);
    }, opts);

    document.addEventListener('mouseleave', evt => {
      if (isAnnotation(evt.target))
        this.onLeaveAnnotation(evt);
    }, opts);

    document.addEventListener('mousedown', this.onMouseDown)

    document.addEventListener('mousemove', this.onMouseMove)
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
    this.hoverStack.push(nextState);

    nextState.renderOutline(this.svg);
    
    if (this.currentArrow) {
      this.currentArrow.snapTo(annotation, element);
    } else {
      nextState.renderHandle(this.svg, evt.clientX, evt.clientY);
    }
  }

  /**
   * When leaving an annotation, clear the hover if necessary.
   */
  onLeaveAnnotation = evt =>  {
    const { annotation } = evt.target;

    const state = this.hoverStack.find(state => state.annotation.isEqual(annotation));

    if (state) {
      // Clear this state
      state.clearSVG();
      
      // Remove from the stack
      this.hoverStack = this.hoverStack.filter(s => s !== state);

      // Render previous state, if any
      if (this.hoverStack.length > 0) {
        const top = this.hoverStack[this.hoverStack.length - 1];
        top.renderOutline(this.svg);
        top.renderHandle(this.svg);
      }
    }
  }

  /**
   * If there is no arrow, but a current hover: start arrow. If
   * there is an arrow that's currently snapped: create connection.
   */
  onMouseDown = () => {
    if (!this.currentArrow && this.currentHover) {
      this.currentHover.destroy();
      this.currentArrow = new Arrow(this.currentHover).addTo(this.svg);
    } else if (this.currentArrow?.isSnapped()) {
      // TODO
      console.log('created');
    }
  }

  /**
   * If there is a current arrow and it's not snapped, drag it to mouse position.
   */
  onMousMove = evt => {
    if (this.currentArrow && !this.currentArrow.isSnapped()) {
      this.currentArrow.dragTo({ 
        x: evt.clientX,
        y: evt.clientY
      });
    }
  }

}