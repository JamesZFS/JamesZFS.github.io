const canvas = document.querySelector("#lissajous");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL 2 is not available in this browser.");
}

const vertexSource = `#version 300 es
const vec2 positions[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2(3.0, -1.0),
  vec2(-1.0, 3.0)
);

void main() {
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}
`;

var noteA = 60;  // Middle C
var noteB = 60;
var pitchA = noteToFrequency(noteA);
var pitchB = noteToFrequency(noteB);
var ratio = 1.0;
var volumeA = 0;  // 0 to 1 float
var volumeB = 0;
var velocityA = 0;  // 0 to 1 float
var velocityB = 0;
var curveLength = 1;
const rotationPeriodDefault = 4.0;  // 15 BPM
var rotationPeriod = rotationPeriodDefault;
var accumPhase = 0;
var phaseSign = 1;
const volumeMomentum = 0.8;
const periodMomentum = 0.995;

// UI controls:
var bandedRainbow = true;  // false: full rainbow
var useStack = false;  // Whether to use the note stack when note off events occur
var amplitude = 1.5;   // Scale the velocity to make the curve more visible

const bandedRainbowToggle = document.querySelector("#banded-rainbow-toggle");
const useStackToggle = document.querySelector("#use-stack-toggle");
const amplitudeSlider = document.querySelector("#amplitude-slider");
const controlsShell = document.querySelector(".controls-shell");
const controlsToggle = document.querySelector("#controls-toggle");

function initializeControls() {
  bandedRainbowToggle.checked = !bandedRainbow;
  useStackToggle.checked = useStack;
  amplitudeSlider.value = Math.log10(amplitude);

  bandedRainbowToggle.addEventListener("change", () => {
    bandedRainbow = !bandedRainbowToggle.checked;
  });

  useStackToggle.addEventListener("change", () => {
    useStack = useStackToggle.checked;
  });

  amplitudeSlider.addEventListener("input", () => {
    amplitude = Math.pow(10, amplitudeSlider.value);
    var percent = (amplitudeSlider.value - amplitudeSlider.min) / (amplitudeSlider.max - amplitudeSlider.min) * 100;
    amplitudeSlider.style.setProperty("--progress", `${percent}%`);
  });

  controlsToggle.addEventListener("click", () => {
    const isCollapsed = controlsShell.classList.toggle("is-collapsed");
    controlsToggle.setAttribute("aria-expanded", String(!isCollapsed));
    controlsToggle.setAttribute("aria-label", isCollapsed ? "Show visual options" : "Hide visual options");
  });
}

class LinearEasingHelper {
    constructor(step) {
        this.init = 0.0;
        this.curr = 0.0;
        this.target = 0.0;
        this.step = step;
    }

    update(newValue) {
        if (newValue === this.target) {
            if (this.init <= this.target) {
                this.curr = Math.min(this.curr + this.step, this.target);
            } else {
                this.curr = Math.max(this.curr - this.step, this.target);
            }
        } else {
            this.target = newValue;
            this.init = this.curr;
        }
    }

    set(newValue) {
        this.init = newValue;
        this.curr = newValue;
        this.target = newValue;
    }
}

var accumCurveLength = new LinearEasingHelper(8.0 / 60.0);  // 8 rotations per second

function adaptFragmentSource(source) {
  return source
    .replace("#version 330", "#version 300 es\nprecision highp float;");
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Shader compilation failed.");
  }

  return shader;
}

function createProgram(vertex, fragment) {
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || "Program linking failed.");
  }

  return program;
}

async function loadShader() {
  const response = await fetch("./shaders/lissajous.glsl");
  if (!response.ok) {
    throw new Error(`Could not load shaders/lissajous.glsl: ${response.status}`);
  }
  return response.text();
}

function limitDenominator(x, maxDen) {
    let bestNum = 0;
    let bestDen = 1;
    let bestError = Infinity;

    for (let den = 1; den <= maxDen; den++) {
        const num = Math.round(x * den);
        const error = Math.abs(x - num / den);

        if (error < bestError) {
            bestError = error;
            bestNum = num;
            bestDen = den;
        }
    }

    return [bestNum, bestDen];
}

function noteToFrequency(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function render(program, uniforms, startedAt) {
  const currentTime = performance.now();
  const dt = (currentTime - startedAt) / 1000;  // seconds

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  volumeA = volumeA * volumeMomentum + velocityA * (1 - volumeMomentum);
  volumeB = volumeB * volumeMomentum + velocityB * (1 - volumeMomentum);

  // Modulate curve length
  if (curveLength <= accumCurveLength.curr) {  // Decrease the curve length immediately when the curve becomes more harmonic to avoid long transition
    accumCurveLength.set(curveLength);
  } else {  // Smoothly transition to the new curve length when the curve becomes less harmonic to avoid abrupt change
    accumCurveLength.update(curveLength);
  }

  // Modulate rotation period
  if (rotationPeriod < rotationPeriodDefault) {
    rotationPeriod = periodMomentum * rotationPeriod + (1 - periodMomentum) * rotationPeriodDefault;
  }
  accumPhase += phaseSign * Math.PI * dt / rotationPeriod;

  gl.useProgram(program);
  gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
  if (pitchB >= pitchA)
    gl.uniform2f(uniforms.pitch, 1, ratio);
  else
    gl.uniform2f(uniforms.pitch, ratio, 1);
  gl.uniform2f(uniforms.volume, volumeA, volumeB);
  gl.uniform1f(uniforms.phase, accumPhase);
  gl.uniform1f(uniforms.curveLength, accumCurveLength.curr);
  if (bandedRainbow === false) {
    gl.uniform1i(uniforms.bandA, -1);  // full rainbow
    gl.uniform1i(uniforms.bandB, -1);
  } else {
    gl.uniform1i(uniforms.bandA, noteA % 12);  // banded rainbow based on the first note
    // gl.uniform1i(uniforms.bandB, -1);
    if (velocityB > 0)
      gl.uniform1i(uniforms.bandB, noteB % 12);  // banded rainbow based on the second note
    else
      gl.uniform1i(uniforms.bandB, noteA % 12);
  }

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(() => render(program, uniforms, currentTime));
}

function debug(text) {
  console.log(text);
}

async function initializeMIDIInput() {
  // Install MIDI input listener
  debug("Requesting MIDI Access...");
  try {
    var access = await navigator.requestMIDIAccess();
    debug("MIDI Access obtained.");
    debug(`Number of MIDI input devices: ${access.inputs.size}`);

    var selectedInput = null;
    access.inputs.forEach((input) => {
      debug(`MIDI Input: ${input.name}`);
      // Search for a input with name containing "piano" or "MIDI"
      if (input.name.toLocaleLowerCase().includes("piano") || input.name.toLocaleLowerCase().includes("midi")) {
        selectedInput = input;
      }
    });

    if (selectedInput === null) {
      throw new Error("No MIDI input device with name containing 'piano' or 'MIDI' found.");
    }
    debug(`Selected input: ${selectedInput.name}`);

    selectedInput.onmidimessage = event => {
      const [status, data1, data2] = event.data;
      const command = status & 0xF0;

      if (command === 0x90 && data2 > 0) { // Note on
        onMidiIn(data1, data2, true);
      } else if (command === 0x80 || (command === 0x90 && data2 === 0)) { // Note off
        onMidiIn(data1, data2, false);
      }
    };
  } catch (err) {
    alert("Failed to get MIDI access - " + err 
      + "\nYou can still use the keyboard input to control the Lissajous curve: press two keys to trigger a Lissajous figure at a time.\n"
      + "\n'a' = C4, 'w' = C#4, 's'= D4, … '1' = C4, 'z' = C3, …\nHold shift to increase the octave.");
  }
}

function updateRatio() {
  pitchA = noteToFrequency(noteA);
  pitchB = noteToFrequency(noteB);
  if (pitchB >= pitchA) {
    ratio = pitchB / pitchA;
  } else {
    ratio = pitchA / pitchB;
  }
  var [num, den] = limitDenominator(ratio, 10);  // snap to a nearest rational with denominator <= 10
  ratio = num / den;
  curveLength = den;
}

var noteStack = [];  // Keep track of currently pressed notes
var lastPressTime = 0;  // Timestamp of the last pressed note

// * MIDI event handler
function onMidiIn(note, velocity, isNoteOn) {
  if (isNoteOn) {
    noteStack.push([note, velocity]);
    if (velocityA === 0) {  // overwrite the first note if it's not currently active
      noteA = note;
      velocityA = clamp(amplitude * velocity / 128, 0, 1);
      if (velocityB === 0) {  // overwrite the second note if it's not currently active
        noteB = note;
        velocityB = velocityA;
      }
    } else {   // always overwrite the second note
      noteB = note;
      velocityB = clamp(amplitude * velocity / 128, 0, 1);
    }
    updateRatio();
    var currentTime = performance.now();
    var timeSinceLastPress = (currentTime - lastPressTime) / 1000;
    if (timeSinceLastPress > 0.150) {   // Avoid detecting a chord press (less than 0.150s) as a period change
      rotationPeriod = timeSinceLastPress;
    }
    lastPressTime = currentTime;
    phaseSign *= -1;
  } else {  // Note off
    noteStack = noteStack.filter(([n, v]) => n !== note);
    if (note === noteA) {
      var bottom = noteStack.length > 0 ? noteStack[0] : null;
      if (useStack && bottom !== null) {
        noteA = bottom[0];
        velocityA = clamp(bottom[1] / 90, 0, 1);
      } else {
        velocityA = 0;
      }
      updateRatio();
    }
    if (note === noteB) {
      var top = noteStack.length > 0 ? noteStack[noteStack.length - 1] : null;
      if (useStack && top !== null) {
        noteB = top[0];
        velocityB = clamp(top[1] / 90, 0, 1);
      } else {
        velocityB = 0;
      }
      updateRatio();
    }
  }
  debug(`MIDI ${isNoteOn ? "On" : "Off"}: Note=${note}, Velocity=${velocity}, Period=${rotationPeriod.toFixed(3)}s`);
}

const keyToNoteMap = {
  "a": 60,  // C4
  "w": 61,  // C#4
  "s": 62,  // D4
  "e": 63,  // D#4
  "d": 64,  // E4
  "f": 65,  // F4
  "t": 66,  // F#4
  "g": 67,  // G4
  "y": 68,  // G#4
  "h": 69,  // A4
  "u": 70,  // A#4
  "j": 71,  // B4
  "k": 72,  // C5
  "o": 73,  // C#5
  "l": 74,  // D5
  "p": 75,  // D#5
  ";": 76,  // E5
  "'": 77,  // F5

  "1": 72,  // C5
  "2": 73,  // C#5
  "3": 74,  // D5
  "4": 75,  // D#5
  "5": 76,  // E5
  "6": 77,  // F5
  "7": 78,  // F#5
  "8": 79,  // G5
  "9": 80,  // G#5
  "0": 81,  // A5
  "-": 82,  // A#5
  "=": 83,  // B5

  "!": 84,  // C6
  "@": 85,  // C#6
  "#": 86,  // D6
  "$": 87,  // D#6
  "%": 88,  // E6
  "^": 89,  // F6
  "&": 90,  // F#6
  "*": 91,  // G6
  "(": 92,  // G#6
  ")": 93,  // A6
  "_": 94,  // A#6
  "+": 95,  // B6

  "z": 48,  // C3
  "x": 50,  // D3
  "c": 52,  // E3
  "v": 53,  // F3
  "b": 55,  // G3
  "n": 57,  // A3
  "m": 59,  // B3
}

for (var key in keyToNoteMap) {
  // Map A..P to the next octave
  if (key >= "a" && key <= "z") {
    keyToNoteMap[key.toUpperCase()] = keyToNoteMap[key] + 12;
  }
}

var synth = null;

function initializeSynth() {
  // Tone.js
  synth = new Tone.PolySynth(Tone.Synth).toDestination();
}

function synthNoteOn(note) {
  if (synth === null) initializeSynth();
  const now = Tone.now();
  const noteName = Tone.Frequency(note, "midi").toNote(); 
  synth.triggerAttack(noteName, now);
}

function synthNoteOff(note) {
  if (synth === null) initializeSynth();
  const now = Tone.now();
  const noteName = Tone.Frequency(note, "midi").toNote(); 
  synth.triggerRelease(noteName, now);
}

function synthAllOff() {
  if (synth === null) initializeSynth();
  const now = Tone.now();
  synth.releaseAll(now);
}

function initializeKeyboardInput() {
  document.addEventListener("keydown", (event) => {
    if (event.repeat) return; // Ignore auto-repeat
    debug("Key down: " + event.key);
    if (event.key in keyToNoteMap) {
      var note = keyToNoteMap[event.key];
      onMidiIn(note, 64, true);
      synthNoteOn(note);
    }
    if (event.key === 'r' || event.key === 'R') {
      synthAllOff();
    }
  });
  document.addEventListener("keyup", (event) => {
    // debug("Key up: " + event.key);
    if (event.key in keyToNoteMap) {
      var note = keyToNoteMap[event.key];
      onMidiIn(note, 0, false);
      synthNoteOff(note);
    }
  });
}

async function main() {
  initializeControls();
  await initializeMIDIInput();
  initializeKeyboardInput();
  // Compile shaders and create program
  const fragmentSource = adaptFragmentSource(await loadShader());
  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  const program = createProgram(vertexShader, fragmentShader);
  const uniforms = {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    pitch: gl.getUniformLocation(program, "u_pitch"),
    volume: gl.getUniformLocation(program, "u_volume"),
    phase: gl.getUniformLocation(program, "u_phase"),
    curveLength: gl.getUniformLocation(program, "u_rotation"),
    bandA: gl.getUniformLocation(program, "u_band_a"),
    bandB: gl.getUniformLocation(program, "u_band_b"),
  };

  render(program, uniforms, performance.now());
}

main().catch((error) => {
  console.error(error);
});
