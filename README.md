# Agent Field Kit
## Load

#### Live:
[https://ionicresearchlabs.github.io/agent-field-kit/](https://ionicresearchlabs.github.io/agent-field-kit/)

#### Offline:
Load above and use while disconnected or load [index-device.html](https://github.com/ionicresearchlabs/agent-field-kit/blob/main/index-device.html) locally from device (some functionality unavailable).

## Use
#### NRT

Base frequency, beat frequency, and volume can be set using sliders or input fields. Visual colors can be set using two color selectors. Settings, haptics, and visuals can be enabled or changed while playing.


Haptics can be enabled using 'hand' switch.<br>
Visuals can be enabled using 'eye' switch.<br>
Click/touch fullscreen visuals to return to main interface.

#### SSA

Leave device **on** and application focused while active (some browsers may support background operation).

Set SSA input fields and random minimum/maximum time range (seconds) when component is stopped.

Non-empty SSA input fields will turn red when random timer has elapsed. Perform SSA evaluation and click/touch each field when completed. When all active fields have been clicked/touched, timer will restart with new random interval in the specified range.

Average response time to complete all fields in the statistics area is followed in brackets by number of times that the process has been completed and an arrow indicating improvement (down arrow), worsening (up arrow), or blank (no change or not enough data for an average).

Use 'RESET' button to clear average and current response time statistics.
