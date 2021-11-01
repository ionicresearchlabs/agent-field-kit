/**
* @class Functionality for the NRT Binaural Beat sub-component.
*
* @author IONIC Research Labs, a division of TSG.
* @version 0.1.0
* @copyright MIT License
*/
class BinauralBeat extends EventTarget {

  /**
  * Creates a new instance.
  */
  constructor() {
    super();
    this._oscillator1 = null;
    this._oscillator2 = null;
  }

  /**
  * @property {AudioContext} An AudioContext object for use by any instance.
  * animation.
  * @readonly
  * @static
  */
  static get audioContext() {
    if ((BinauralBeat._audioContext == null) || (BinauralBeat._audioContext == undefined)) {
      BinauralBeat._audioContext = new AudioContext({
         latencyHint: "playback",
         sampleRate: 44100
      });
    }
    return (BinauralBeat._audioContext);
  }

  /**
  * @property {Boolean} True if the component is currently producing audio output.
  * @readonly
  */
  get playing() {
    if ((this._playing == null) || (this._playing ==undefined)) {
      this._playing = false;
    }
    return (this._playing);
  }

  /**
  * @property {Number} The current playback volume (0 to 100);
  */
  get volume() {
    if ((this._volume == null) || (this._volume == undefined)) {
      this._volume = BinauralBeat.audioContext.createGain();
      this._volume.connect(BinauralBeat.audioContext.destination);
    }
    return (this._volume.gain.value * 100);
  }

  set volume (volSet) {
    if ((this._volume == null) || (this._volume == undefined)) {
      this._volume = BinauralBeat.audioContext.createGain();
      this._volume.connect(BinauralBeat.audioContext.destination);
    }
    this._volume.gain.value = volSet / 100;
  }

  /**
  * @property {Number} The current base frequency to use, in hertz.
  * May be updated while playing.
  */
  get baseFrequency() {
    if ((this._baseFreq == undefined) || (this._baseFreq == null)) {
      this._baseFreq = 220;
    }
    return (this._baseFreq);
  }

  set baseFrequency(freqSet) {
    this._baseFreq = freqSet;
    if (this.playing) {
      var leftFreq = this._baseFreq - (this.beatFrequency/2);
      var rightFreq = this._baseFreq + (this.beatFrequency/2);
      this._oscillator1.frequency.value = leftFreq;
      this._oscillator2.frequency.value = rightFreq;
    }
  }

  /**
  * @property {Number} The current beat frequency to use, in hertz.
  * May be updated while playing.
  */
  get beatFrequency() {
    if ((this._beatFreq == undefined) || (this._beatFreq == null)) {
      this._beatFreq = 20;
    }
    return (this._beatFreq);
  }

  set beatFrequency(freqSet) {
    this._beatFreq = freqSet;
    if (this.playing) {
      var leftFreq = this.baseFrequency - (this._beatFreq/2);
      var rightFreq = this.baseFrequency + (this._beatFreq/2);
      this._oscillator1.frequency.value = leftFreq;
      this._oscillator2.frequency.value = rightFreq;
    }
  }

  /**
  * Starts NRT playback, stopping any current playback first.
  */
  start() {
    if (this.playing) {
      this.stop();
    }
    if ((this._volume == null) || (this._volume == undefined)) {
      this._volume = BinauralBeat.audioContext.createGain();
      this._volume.connect(BinauralBeat.audioContext.destination);
    }
    var leftFreq = this.baseFrequency - (this.beatFrequency/2);
    var rightFreq = this.baseFrequency + (this.beatFrequency/2);
    this._oscillator1 = BinauralBeat.audioContext.createOscillator();
    this._oscillator1.type = "sine";
    this._oscillator1.frequency.value = leftFreq;
    this._oscillator2 = BinauralBeat.audioContext.createOscillator();
    this._oscillator2.type = "sine";
    this._oscillator2.frequency.value = rightFreq;
    var panner = BinauralBeat.audioContext.createStereoPanner();
    this._oscillator1.connect(panner);
    panner.connect(this._volume);
    panner.pan.value = -1;
    panner = BinauralBeat.audioContext.createStereoPanner();
    this._oscillator2.connect(panner);
    panner.connect(this._volume);
    panner.pan.value = 1;
    this._oscillator1.start();
    this._oscillator2.start();
    this._playing = true;
  }

  /**
  * Stops NRT playback.
  */
  stop() {
    if (this._oscillator1 != null) {
      this._oscillator1.stop();
      this._oscillator1 = null;
      delete this._oscillator1;
    }
    if (this._oscillator2 != null) {
      this._oscillator2.stop();
      this._oscillator2 = null;
      delete this._oscillator2;
    }
    this._playing = false;
  }

  /**
  * @private
  */
  toString() {
    return ("[BinauralBeat]");
  }

}
