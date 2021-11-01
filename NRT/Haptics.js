/**
* @class Functionality for the NRT haptics sub-component.
*
* @author IONIC Research Labs, a division of TSG.
* @version 0.1.0
* @copyright MIT License
*/
class Haptics extends EventTarget {

  /**
  * Creates a new instance.
  */
  constructor() {
    super();
    this._active = false;
  }

  /**
  * @property {Boolean} True if the component is currently producing haptic
  * output.
  * @readonly
  */
  get active() {
    return (this._active);
  }

  /**
  * Starts the haptics output.
  *
  * @param {Number} onms The amount of time for active haptic output, in
  * milliseconds.
  * @param {Number} offms The amount of time to rest (no haptic output),
  * in milliseconds.
  */
  start(onms, offms) {
    if (this.active) {
      this.stop();
    }
    this._interval = setInterval(_ => {
      navigator.vibrate(onms);
    }, (onms+offms));
    this._active = true;
  }

  /**
  * Stops the haptics output.
  */
  stop() {
    try {
      clearInterval(this._interval);
      navigator.vibrate(0);
    } catch (err) {}
  }

  /**
  * @private
  */
  toString() {
    return ("[Haptics]");
  }

}
