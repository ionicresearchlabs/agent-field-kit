/**
* @class Functionality for Spot Situational Analysis component.
*
* @author IONIC Research Labs, a division of TSG.
* @version 0.1.0
* @copyright MIT License
*/
class SSA extends EventTarget {

  /**
  * Creates a new instance.
  */
  constructor() {
    super();
    this._stats = [];
    this._timerValue = 0;
    this._wakeLock = null;
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
    document.querySelector("section#SSA").instance = this;
    document.querySelector("#SSA  > #startStopButton > #stop").style = "display:none";
    var inputFields = document.querySelectorAll("section#SSA  input");
    for (var count = 0; count < inputFields.length; count++) {
      inputFields[count].addEventListener("change", this.onInputFieldChange.bind(this));
      inputFields[count].addEventListener("click", this.onInputFieldClick.bind(this));
      inputFields[count].addEventListener("touch", this.onInputFieldClick.bind(this));
    }
    this.restoreSession();
    this.showStats();
  }

  /**
  * @property {String} Returns the HTML entity codes for a sequential clockface
  * animation.
  * @readonly
  */
  get HTMLClockFaces() {
    return([
      "&#x1f55b;",
      "&#x1f567;",
      "&#x1f550;",
      "&#x1f55c;",
      "&#x1f551;",
      "&#x1f55d;",
      "&#x1f552;",
      "&#x1f55e;",
      "&#x1f553;",
      "&#x1f55f;",
      "&#x1f554;",
      "&#x1f560;",
      "&#x1f555;",
      "&#x1f561;",
      "&#x1f556;",
      "&#x1f562;",
      "&#x1f557;",
      "&#x1f563;",
      "&#x1f558;",
      "&#x1f564;",
      "&#x1f559;",
      "&#x1f565;",
      "&#x1f55a;",
      "&#x1f566;"
    ])
  }

  /**
  * @property {String} Returns the browser's default audio context object.
  * @readonly
  * @static
  */
  static get audioContext() {
    if ((SSA._audioContext == null) || (SSA._audioContext == undefined)) {
      SSA._audioContext = new AudioContext({
         latencyHint: "playback",
         sampleRate: 8000
      });
    }
    return (SSA._audioContext);
  }

  /**
  * @property {Number} The resolution of the SSA timer clock, in seconds.
  */
  get timerResolution() {
    if ((this._timerresolution == null) || (this._timerresolution == undefined)) {
      this._timerresolution = 1;
    }
    return (this._timerresolution);
  }

  set timerResolution(resSet) {
    this._timerresolution = resSet;
  }

  /**
  * Restores the SSA component's previous statefrom local storage, if available,
  * or sets default values.
  */
  restoreSession() {
    var bbSettings = localStorage.getItem("AFK_SSA");
    if (bbSettings != null) {
      bbSettings = JSON.parse(bbSettings);
      this._stats = bbSettings.stats;
      if ((this._stats == undefined) || (this._stats == null)) {
        this._stats = [];
      } else {
        //restore last time for trend calculation
        if (this._stats.length > 0) {
          this._timerValue = this._stats[this._stats.length-1];
        } else {
          this._timerValue = 0;
        }
      }
      for (var selector in bbSettings.fields) {
        document.querySelector("#"+selector).value = bbSettings.fields[selector];
      }
      console.log("Restored settings:"+JSON.stringify(bbSettings));
    } else {
      console.warn ("No previous settings to restore.");
    }
  }

  /**
  * Saves the SSA component's current state to local storage.
  */
  saveSession() {
    var bbSettings = new Object();
    bbSettings.fields = new Object();
    var inputFields = document.querySelectorAll("section#SSA input");
    for (var count = 0; count < inputFields.length; count++) {
      bbSettings.fields[inputFields[count].id] = inputFields[count].value;
    }
    bbSettings.stats = this._stats;
    localStorage.AFK_SSA = JSON.stringify(bbSettings);
  }

  /**
  * Handles changes to any SSA input field.
  * @param {Event} event The "change" event dispatched from an input field
  * instance.
  */
  onInputFieldChange(event) {
    this.saveSession();
  }

  /**
  * Handles click or touch events on any SSA input field.
  * @param {Event} event The "click" or "touch" event dispatched from an
  * input field instance.
  */
  onInputFieldClick(event) {
    event.target.style.backgroundColor = "#FFFFFF";
    event.target.style.color = "#000000";
    event.target.complete = true;
    var inputFields = document.querySelectorAll("section#SSA > input[id^='item']");
    for (var count=0; count < inputFields.length; count++) {
      if (inputFields[count].complete != true){
        return;
      }
    }
    if (this._playing == true) {
      var minRandom = parseInt(document.querySelector("#SSA > div > #minRandomSeconds").value);
      var maxRandom = parseInt(document.querySelector("#SSA > div > #maxRandomSeconds").value);
      var randomSecs = Math.floor((Math.random()*(maxRandom-minRandom+1))+minRandom);
      this.stopTimer();
      this.start(randomSecs);
    }
  }

  /**
  * Plays an alert and vibrates the device (if available).
  *
  * @param {Number} hz The tone of the alert sound, in hertz.
  * @param {Number} durationSecs The duration of the alert, in seconds.
  */
  playAlert(hz=440, durationSecs=2) {
    if ((this._volume == null) || (this._volume == undefined)) {
      this._volume = SSA.audioContext.createGain();
      this._volume.connect(SSA.audioContext.destination);
    }
    this._volume.gain.value = 1;
    this._oscillator = SSA.audioContext.createOscillator();
    this._oscillator.type = "square";
    this._oscillator.frequency.value = hz;
    this._oscillator.connect(this._volume);
    this._oscillator.start();
    this._oscillator.stop(SSA.audioContext.currentTime + durationSecs);
    try {
      navigator.vibrate(durationSecs*1000); //ms
    } catch (err) {}
    this._playing = true;
  }

  /**
  * Starts the SSA countdown timer.
  *
  * @param {Number} countdown The duration of the countdown, in seconds.
  * Default is 1.
  * @async
  * @return {Boolean} True if successfully started, false otherwise.
  */
  async start(countdown=1) {
    if (this.checkInputFields() == false) {
      var startLabel = document.querySelector("#SSA > #startStopButton > #start");
      var stopLabel = document.querySelector("#SSA  > #startStopButton > #stop");
      stopLabel.style = "display:none";
      startLabel.style = "display:block";
      alert ("At least one SSA parameter must be set.");
      this.lockInputFields(false);
      return (false);
    }
    if ((this._volume == null) || (this._volume == undefined)) {
      this._volume = SSA.audioContext.createGain();
      this._volume.connect(SSA.audioContext.destination);
    }
    this._volume.gain.value = 0;
    this._oscillator = SSA.audioContext.createOscillator();
    this._oscillator.type = "sine";
    this._oscillator.frequency.value = 1;
    this._oscillator.connect(this._volume);
    this._boundTickListener = this.onClockTick.bind(this, countdown);
    this._oscillator.addEventListener("ended", this._boundTickListener);
    this._oscillator.start();
    this._oscillator.stop(SSA.audioContext.currentTime + this.timerResolution);
    this._playing = true;
    return (true);
  }

  /**
  * Starts or stops the SSA counter, depending on current state.
  * @async
  */
  async startStop() {
    var startLabel = document.querySelector("#SSA > #startStopButton > #start");
    var stopLabel = document.querySelector("#SSA  > #startStopButton > #stop");
    if (this._playing == true) {
      this.stop();
      this.stopTimer(false);
      stopLabel.style = "display:none";
      startLabel.style = "display:block";
      this.lockInputFields(false);
      try {
        this._wakeLock.removeEventListener("release", this._wakeLock._listener);
      } catch (err) {
      }
      try {
        await this._wakeLock.release();
      } catch (err) {}
      this._wakeLock = null;
      return (false);
    } else {
      var minRandom = parseInt(document.querySelector("#SSA > div > #minRandomSeconds").value);
      var maxRandom = parseInt(document.querySelector("#SSA > div > #maxRandomSeconds").value);
      var randomSecs = Math.floor((Math.random()*(maxRandom-minRandom+1))+minRandom);
      this.lockInputFields(true);
      this._clockIndex = 0;
      stopLabel.style = "display:block";
      startLabel.style = "display:none";
      try {
        this._wakeLock = await navigator.wakeLock.request("screen");
        this._wakeLock._listener = this.stop.bind(this);
        this._wakeLock.addEventListener("release", this._wakeLock._listener);
      } catch (err) {
      }
      this.start(randomSecs);
      return (true);
    }
  }

  /**
  * Stops the current SSA counter, if active.
  * @async
  */
  async stop() {
    if ((this._oscillator != null) && (this._oscillator != undefined)) {
      this._oscillator.removeEventListener("ended", this._boundTickListener);
      this._oscillator.stop(0);
      this._oscillator.disconnect(this._volume);
      this._oscillator = null;
      delete this._oscillator;
      this._boundTickListener = null;
      delete this._boundTickListener;
    }
    this.setInputFields();
    this._playing = false;
    return (true);
  }

  /**
  * Handles a single iteration (tick) of the SSA counter.
  *
  * @param {Number} countdown The current countdown tick value.
  * @param {Event} event The timer event object.
  * @async
  */
  async onClockTick (countdown, event) {
    countdown--;
    this.stop();
    if (countdown > 0) {
      this.start(countdown);
    } else {
      var activeFields = this.setInputFields("#FF0000", "#FFFFFF");
      try {
        this._wakeLock.removeEventListener("release", this._wakeLock._listener);
      } catch (err) {
      }
      try {
        await this._wakeLock.release();
      } catch (err) {}
      this._wakeLock = null;
      if (activeFields > 0) {
        this.playAlert();
        this.startTimer();
      }
    }
    var clockElement = document.querySelector("section#SSA > #clock");
    clockElement.innerHTML = this.HTMLClockFaces[this._clockIndex];
    this._clockIndex += 1;
    this._clockIndex %= this.HTMLClockFaces.length;
  }

  /**
  * Checks the SSA input fields for valid input.
  *
  * @param {String} selector The CSS selector of the input fields to check.
  * @return {Boolean} True if at least one input field has been set, false
  * otherwise.
  */
  checkInputFields(selector="section#SSA > input[id^='item']") {
    var fields = document.querySelectorAll(selector);
    for (var count=0; count<fields.length; count++) {
      if (fields[count].value != "") {
        return (true);
      }
    }
    return (false);
  }

  /**
  * Updates the styles of the SSA input fields.
  *
  * @param {String} bgcolor The background color to set the fields to.
  * @param {String} fgcolor The foreground (text) color to set the fields to.
  * @param {String} selector The CSS selector of the input fields to update.
  */
  setInputFields(bgcolor="#FFFFFF", fgcolor="#000000", selector="section#SSA > input[id^='item']") {
    var fieldsUpdated = 0;
    var fields = document.querySelectorAll(selector);
    for (var count=0; count<fields.length; count++) {
      if (fields[count].value != "") {
        fields[count].complete = false;
        fields[count].style.backgroundColor=bgcolor;
        fields[count].style.color=fgcolor;
        fieldsUpdated++;
      } else {
        fields[count].complete = true;
      }
    }
    return (fieldsUpdated);
  }

  /**
  * Locks or unlocks the SSA input fields.
  *
  * @param {Boolean} locked True if fields should be locked (not allow input).
  * @param {String} selector The CSS selector of the input fields to lock or unlock.
  */
  lockInputFields(locked=true, selector="section#SSA > input[id^='item']") {
    var fields = document.querySelectorAll(selector);
    for (var count=0; count<fields.length; count++) {
      try {
        if (locked == true) {
          fields[count].setAttribute("readonly", "1");
        } else {
          fields[count].removeAttribute("readonly");
        }
      } catch (err) {}
    }
  }

  /**
  * Starts the SSA reaction timer.
  */
  startTimer() {
    this._timer = setInterval(this.onTimerTick.bind(this), 100);
    this._timerValue = 0;
  }

  /**
  * Invoked on every tick of the SSA reaction timer.
  */
  onTimerTick() {
    this._timerValue += 100;
    var currentTimeElement = document.querySelector("section#SSA #currentTime");
    var secs = Math.floor (this._timerValue / 1000);
    var msecs = (this._timerValue / 10) % 100;
    if (secs < 10) {
      secs = "0" + String(secs);
    } else {
      secs = String(secs);
    }
    if (msecs < 10) {
      msecs = "0" + String(msecs);
    } else {
      msecs = String(msecs);
    }
    currentTimeElement.innerHTML = `${secs}:${msecs}`;
  }

  /**
  * Displays the current and average statistics of the SSA reaction time.
  */
  showStats() {
    var currentTimeElement = document.querySelector("section#SSA #averageTime");
    if (this._stats.length == 0) {
      var totalTimerValue = 0;
      var secs = "00";
      var msecs = "00";
    } else {
      totalTimerValue = 0;
      for (var count=0; count < this._stats.length; count++) {
        totalTimerValue += this._stats[count];
      }
      totalTimerValue = Math.round(totalTimerValue / this._stats.length);
      secs = Math.floor (totalTimerValue / 1000);
      msecs = Math.floor (totalTimerValue / 10) % 100;
      if (secs < 10) {
        secs = "0" + String(secs);
      } else {
        secs = String(secs);
      }
      if (msecs < 10) {
        msecs = "0" + String(msecs);
      } else {
        msecs = String(msecs);
      }
    }
    if (totalTimerValue == this._timerValue) {
      var trend = "";
    } else if (totalTimerValue > this._timerValue) {
      trend = "&darr;";
    } else {
      trend = "&uarr;";
    }
    currentTimeElement.innerHTML = `${secs}:${msecs} (${this._stats.length})${trend}`;
  }

  /**
  * Stops the SSA reaction timer.
  *
  * @param {Boolean} save If true, current SSA reaction timer statistics will also
  * be saved to local storage.
  */
  stopTimer(save = true) {
    try {
      clearInterval(this._timer);
      this._timer = null;
      if (save == true) {
        this._stats.push(this._timerValue);
        this.saveSession();
        this.showStats();
      }
    } catch (err) {}
  }

  /**
  * Resets the SSA reaction timer.
  */
  resetTimer() {
    this._timerValue = 0;
    var currentTimeElement = document.querySelector("section#SSA #currentTime");
    currentTimeElement.innerHTML = `00:00`;
    this._stats = [];
    this.saveSession();
    this.showStats();
  }

  /**
  * Disables the SSA component.
  */
  disable() {
    this.stop();
    this.stopTimer(false);
    var startLabel = document.querySelector("#SSA > #startStopButton > #start");
    var stopLabel = document.querySelector("#SSA  > #startStopButton > #stop");
    stopLabel.style = "display:none";
    startLabel.style = "display:block";
  }

  /**
  * Enables the SSA component.
  */
  enable() {
  }

  /**
  * @private
  */
  toString() {
    return ("[SSA]");
  }

}
