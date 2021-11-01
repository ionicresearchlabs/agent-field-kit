/**
* @class Functionality for the NRT visuals sub-component.
*
* @author IONIC Research Labs, a division of TSG.
* @version 0.1.0
* @copyright MIT License
*/
class Visuals extends EventTarget {

  /**
  * Creates a new instance.
  *
  * @param {String} parentSelector The selector of the parent element to use
  * to render visuals.
  * @param {String} id The CSS selector id of the element containing the
  * component UI.
  */
  constructor(parentSelector, id="visuals") {
    super();
    this._parentElement = null;
    this._colorBlockElement = null;
    this._color = null;
    this._playing = false;
    if (document.readyState != "complete") {
      document.addEventListener("readystatechange", event => {
        if (document.readyState == "complete") {
          this.initialize(parentSelector, id);
        }
      });
    } else {
      this.initialize(parentSelector, id);
    }
  }

  /**
  * Initializes the instance by setting default values, restoring the previous
  * session, and updating the UI.
  *
  * @param {String} parentSelector The selector of the parent element.
  * @param {String} id The selector of the child element.
  */
  initialize(parentSelector, id="visual") {
    this.createColorBlock(parentSelector, id);
    this.createCSSPulse();
  }

  /**
  * @property {Boolean} True if the component is currently producing visual output.
  * @readonly
  */
  get playing() {
    return (this._playing);
  }

  /**
  * @property {Array} A two-element array containing the two pulse animation colors.
  */
  set colors(colSet) {
    this._colSet = colSet;
    this.draw(this._colorBlockElement, colSet[0]);
    this.createCSSPulse(colSet[0], colSet[1])
  }

  get colors() {
    if (this._colSet == undefined) {
      this._colSet = [];
    }
    return (this._colSet);
  }

  /**
  * The current maximum display width reported by the browser.
  * @return {Number} The current maximum display width reported by the browser.
  */
  getWidth() {
    var max = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
    return (max);
  }

  /**
  * The current maximum display height reported by the browser.
  * @return {Number} The current maximum display height reported by the browser.
  */
  getHeight() {
    var max = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
    return (max);
  }

  /**
  * Creates a single color block within a DOM container.
  *
  * @param {String} parentSelector The selector of the parent element to which to append the color block.
  * @param {String} id The seletor id to apply to the newly created color block.
  */
  createColorBlock (parentSelector, id) {
    var parentElement = document.querySelector(parentSelector);
    this._parentElement = parentElement;
    this._colorBlockElement = document.createElement("div");
    this._colorBlockElement.id = id;
    this._colorBlockElement.onclick = this.onBlockClick.bind(this);
    this._colorBlockElement.ontouch = this.onBlockClick.bind(this);
    this._colorBlockElement.style.display = "block";
    this._colorBlockElement.style.width = "150%";
    this._colorBlockElement.style.height = this.getHeight()+"px";
    this._colorBlockElement.style.margin = "0";
    this._colorBlockElement.style.padding = "0";
    parentElement.appendChild(this._colorBlockElement);
  }

  /**
  * Invoked on a click or touch event registered on the color block.
  *
  * @param {Event} event A 'click' or 'touch' event object.
  */
  onBlockClick(event) {
    this.stop();
    this._colorBlockElement.style.width = 0;
    this._colorBlockElement.style.height = 0;
    var event = new Event("stop");
    this.dispatchEvent(event);
  }

  /**
  * Hides the color block.
  */
  hide() {
    this._colorBlockElement.style.display = "none";
  }

  /**
  * Shows / unhides the color block.
  */
  show() {
    this._colorBlockElement.style.display = "block";
  }

  /**
  * Creates a pulsing CSS animation using two colors and appends it to the document's DOM.
  *
  * @param {String} color1 The first color of the pulse animation.
  * @param {String} color2 The second color of the pulse animation.
  * @param {String} className The CSS class name to apply to the animation definition.
  */
  createCSSPulse(color1="#FFFFFF", color2="#000000", className="pulseAnimation") {
    var CSS = `
    @keyframes ${className} {
      0%   { background-color:${color1}; }
      50%  { background-color:${color2}; }
      100% { background-color:${color1}; }
    }
    @-o-keyframes ${className}{
      0%   { background-color:${color1}; }
      50%  { background-color:${color2}; }
      100% { background-color:${color1}; }
    }
    @-moz-keyframes ${className}{
      0%   { background-color:${color1}; }
      50%  { background-color:${color2}; }
      100% { background-color:${color1}; }
    }
    @-webkit-keyframes ${className} {
      0%   { background-color:${color1}; }
      50%  { background-color:${color2}; }
      100% { background-color:${color1}; }
    }
    `;
    if ((this._styleElement == undefined) || (this._styleElement == null)) {
      var styleElement = document.createElement("style");
      this._styleElement = styleElement;
      this._colorBlockElement.insertBefore(styleElement, this._colorBlockElement.firstChild);
    }
    this._styleElement.innerHTML = CSS;
  }

  /**
  * Styles an element as a color box.
  *
  * @param {HTMLElement} element The element to style.
  * @param {String} color The background color style to apply to the element.
  */
  draw(element, color) {
     element.style.position = "absolute";
     element.style.left = "0px";
     element.style.top = "0px";
     element.style.overflow = "hidden";
     element.style.width = "150%";
     element.style.height = "100%";
     element.style.zIndex = 100000;
     element.style["background-color"] = color;
  }

  /**
  * Starts the visual pulse animation and attempts to set the display to fullscreen mode.
  *
  * @param {HTMLElement} element The element (box) to use for the animation cycle.
  * @param {Number} hz The frequency at which to cycle the animation, in hertz.
  * @param {String} className The CSS class name containing the pulse animation definition.
  */
  startPulse (element, hz, className="pulseAnimation") {
    var ms = Math.floor((1/hz)*1000);
    var animationStyle = `${className} ${ms}ms ease-in-out infinite`;
    element.style.animation = animationStyle;
    element.style.display = "block";
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  /**
  * Stops the visual pulse animation.
  *
  * @param {HTMLElement} element The element (box) to stop the animation for.
  */
  stopPulse (element) {
    element.style.animation = "";
    element.style.display = "none";
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(_ => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(_ => {});
      }
    } catch (err) {}
  }

  /**
  * Starts the visual pulse animation.
  *
  * @param {Number} hz The frequency to pulse the animation at, in hertz.
  */
  start(hz) {
    if (this.playing) {
      this.stop();
    }
    this.startPulse(this._colorBlockElement, hz);
    this._playing = true;
  }

  /**
  * Stops the visual pulse animation.
  */
  stop() {
    this.stopPulse(this._colorBlockElement);
    this._playing = false;
  }

  /**
  * @private
  */
  toString() {
    return ("[Visuals]");
  }

}
