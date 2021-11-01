/**
* @class Functionality for Neural Resonance Technology component.
*/
class NRT extends EventTarget {

  /**
  * Creates a new instance.
  */
  constructor() {
    super();
    if (document.readyState != "complete") {
      document.addEventListener("readystatechange", event => {
        if (document.readyState == "complete") {
          this.initialize();
        }
      });
    } else {
      this.initialize();
    }
  }

  /**
  * Initializes the instance by setting default values, restoring the previous
  * session, and updating the UI.
  */
  initialize() {
    document.querySelector("section#NRT").instance = this;
    this._binauralbeat = new BinauralBeat();
    this._haptics = new Haptics();
    this._visuals = new Visuals("body");
    this._playing = false;
    this._hapticsEnabled = false;
    this._visualsEnabled = false;
    this.restoreSession();
    document.querySelector("#basefreq").addEventListener("change", this.paramsChanged.bind(this));
    document.querySelector("#beatfreq").addEventListener("change", this.paramsChanged.bind(this));
    let slider = document.querySelector("#baseFSlider");
    slider.oninput = this.onBaseFSliderUpdate.bind(this, slider);
    slider.onchange = this.saveSession.bind(this);
    slider = document.querySelector("#beatFSlider");
    slider.oninput = this.onBeatFSliderUpdate.bind(this, slider);
    slider.onchange = this.saveSession.bind(this);
    slider = document.querySelector("#volumeSlider");
    slider.oninput = this.onVolumeSliderUpdate.bind(this, slider);
    slider.onchange = this.saveSession.bind(this);
    document.querySelector("#hapticsSwitch").addEventListener("change", this.onHapticsSwitchUpdate.bind(this));
    document.querySelector("#visualsSwitch").addEventListener("change", this.onVisualsSwitchUpdate.bind(this));
    document.querySelector("#visualscolor1").addEventListener("change", this.saveSession.bind(this));
    document.querySelector("#visualscolor2").addEventListener("change", this.saveSession.bind(this));
    this._visuals.addEventListener("stop", this.onVisualsStop.bind(this));
  }

  /**
  * Restores to the previously saved session settings from local storage,
  * or to defaults if none saved.
  */
  restoreSession() {
    var bbSettings = localStorage.getItem("AFK_NRT");
    if (bbSettings != null) {
      bbSettings = JSON.parse(bbSettings);
      document.querySelector("#basefreq").value = bbSettings.baseFreq;
      document.querySelector("#baseFSlider").value = bbSettings.baseFreq;
      document.querySelector("#beatfreq").value = bbSettings.beatFreq;
      document.querySelector("#beatFSlider").value = bbSettings.beatFreq;
      document.querySelector("#volumeSlider").value = bbSettings.volume;
      document.querySelector("#hapticsSwitch").checked = bbSettings.hapticsEnabled;
      document.querySelector("#visualsSwitch").checked = bbSettings.visualsEnabled;
      document.querySelector("#visualscolor1").value = bbSettings.visualscolor1;
      document.querySelector("#visualscolor2").value = bbSettings.visualscolor2;
      this._hapticsEnabled = bbSettings.hapticsEnabled;
      this._visualsEnabled = bbSettings.visualsEnabled;
      console.log("Restored settings:"+JSON.stringify(bbSettings));
    } else {
      console.warn ("No previous settings to restore.");
    }
  }

  /**
  * Saves the current session settings to local storage.
  */
  saveSession() {
    var bbSettings = new Object();
    bbSettings.baseFreq = Number(document.querySelector("#basefreq").value);
    bbSettings.beatFreq = Number(document.querySelector("#beatfreq").value);
    bbSettings.volume = Number(document.querySelector("#volumeSlider").value);
    bbSettings.hapticsEnabled = document.querySelector("#hapticsSwitch").checked;
    bbSettings.visualsEnabled = document.querySelector("#visualsSwitch").checked;
    bbSettings.visualscolor1 = document.querySelector("#visualscolor1").value; //hex string
    bbSettings.visualscolor2 = document.querySelector("#visualscolor2").value;
    console.log ("New settings:\n"+JSON.stringify(bbSettings));
    localStorage.AFK_NRT = JSON.stringify(bbSettings);
  }

  /**
  * Invoked whenever either core NRT parameter has changed in the UI.
  *
  * @param {Event} event A 'change' event object.
  */
  paramsChanged(event) {
    var baseElement = document.querySelector("#basefreq");
    var beatElement = document.querySelector("#beatfreq");
    var baseFreq = Number(baseElement.value);
    var beatFreq = Number(beatElement.value);
    this._binauralbeat.baseFrequency = baseFreq;
    this._binauralbeat.beatFrequency = beatFreq;
    document.querySelector("#baseFSlider").value = baseFreq;
    document.querySelector("#beatFSlider").value = beatFreq;
    if (this._playing == true) {
      this.stopHaptics();
      this.startHaptics();
    }
    this.saveSession();
  }

  /**
  * Invoked when the haptics switch is toggled.
  *
  * @param {Event} event A 'change' event.
  */
  onHapticsSwitchUpdate(event) {
    var switchElement = document.querySelector("#hapticsSwitch");
    var enabled = switchElement.checked;
    if (enabled == true) {
      this._hapticsEnabled = true;
      if (this._playing) {
        this.startHaptics();
      }
    } else {
      this.stopHaptics();
      this._hapticsEnabled = false;
    }
    this.saveSession();
  }

  /**
  * Invoked when the visuals switch is toggled.
  *
  * @param {Event} event A 'change' event.
  */
  onVisualsSwitchUpdate(event) {
    var switchElement = document.querySelector("#visualsSwitch");
    var enabled = switchElement.checked;
    if (enabled == true) {
      this._visualsEnabled = true;
      if (this._playing) {
        this.startVisuals();
      }
    } else {
      this._visualsEnabled = false;
    }
    this.saveSession();
  }

  /**
  * Invoked when the visuals object reports that it has stopped playing.
  *
  * @param {Event} event A 'stop' event.
  */
  onVisualsStop(event) {
    document.querySelector("#visualsSwitch").checked = false;
    showSection("NRT");
    this._visualsEnabled = false;
  }

  /**
  * Starts the haptics using current beat frequency setting.
  */
  startHaptics() {
    var beatElement = document.querySelector("#beatfreq");
    var beatFreq = (1 / Number(beatElement.value))*1000;
    this._haptics.start((beatFreq/2), (beatFreq/2));
  }

  /**
  * Stops the haptics object's playback.
  */
  stopHaptics() {
    this._haptics.stop();
  }

  /**
  * Starts the visuals object at the specified beat frequency.
  */
  startVisuals() {
    this._visuals.show();
    var beatElement = document.querySelector("#beatfreq");
    this._visuals.colors = [document.querySelector("#visualscolor1").value,
                            document.querySelector("#visualscolor2").value];
    this._visuals.start(Number(beatElement.value));
  }

  /**
  * Stops the visuals object's playback.
  */
  stopVisuals() {
    this._visuals.stop();
    this._visuals.hide();
  }

  /**
  * Invoked when the volume slider is changed.
  *
  * @param {Event} event An 'input' event object.
  */
  onVolumeSliderUpdate(event) {
    var volSlider = document.querySelector("#volumeSlider");
    var volume = Number(volSlider.value);
    this._binauralbeat.volume = volume;
  }

  /**
  * Invoked when the base frequency slider is changed.
  *
  * @param {Event} event An 'input' event object.
  */
  onBaseFSliderUpdate(event) {
    let bFSlider = document.querySelector("#baseFSlider");
    var freq = Number(bFSlider.value);
    this._binauralbeat.baseFrequency = freq;
    document.querySelector("#basefreq").value = freq;
  }

  /**
  * Invoked when the beat frequency slider is changed.
  *
  * @param {Event} event An 'input' event object.
  */
  onBeatFSliderUpdate(event) {
    let bFSlider = document.querySelector("#beatFSlider");
    var freq = Number(bFSlider.value);
    this._binauralbeat.beatFrequency = freq;
    document.querySelector("#beatfreq").value = freq;
    if (this._playing == true) {
      this.stopHaptics();
      this.startHaptics();
    }
  }

  /**
  * Toggles NRT playback, including all sub-components.
  */
  startStopPlayback() {
    if (this._playing != false) {
      this.stopPlayback();
      this._playing = false;
    } else {
      this._playing = true;
      this.startPlayback();
    }
  }

  /**
  * Starts NRT playback, including all sub-components if enabled.
  */
  startPlayback() {
    var baseElement = document.querySelector("#basefreq");
    var beatElement = document.querySelector("#beatfreq");
    var volSlider = document.querySelector("#volumeSlider");
    var baseFreq = Number(baseElement.value);
    var beatFreq = Number(beatElement.value);
    var volume = Number(volSlider.value);
    var startLabel = document.querySelector("#NRT > #parameters > #startStopButton > #start");
    var stopLabel = document.querySelector("#NRT > #parameters > #startStopButton > #stop");
    stopLabel.style = "display:block";
    startLabel.style = "display:none";
    this._binauralbeat.baseFrequency = baseFreq;
    this._binauralbeat.beatFrequency = beatFreq;
    this._binauralbeat.start();
    this._binauralbeat.volume = volume;
    if (this._hapticsEnabled == true) {
      this.startHaptics();
    }
    if (this._visualsEnabled == true) {
      this.startVisuals();
    }
  }

  /**
  * Stops NRT playback, including all sub-components.
  */
  stopPlayback() {
    try {
      this._binauralbeat.stop();
    } catch (err) {}
    try {
      this.stopHaptics();
    } catch (err) {}
    try {
      this.stopVisuals();
    } catch (err) {}
    this._playing = false;
    var startLabel = document.querySelector("#NRT > #parameters > #startStopButton > #start");
    var stopLabel = document.querySelector("#NRT > #parameters > #startStopButton > #stop");
    stopLabel.style = "display:none";
    startLabel.style = "display:block";
  }

  /**
  * Disables the NRT component.
  */
  disable() {
    this.stopPlayback();
    var startLabel = document.querySelector("#NRT > #parameters > #startStopButton > #start");
    var stopLabel = document.querySelector("#NRT > #parameters > #startStopButton > #stop");
    stopLabel.style = "display:none";
    startLabel.style = "display:block";
  }

  /**
  * Enables the NRT component.
  */
  enable() {
  }

  /**
  * @private
  */
  toString() {
    return ("[NRT]");
  }

}
