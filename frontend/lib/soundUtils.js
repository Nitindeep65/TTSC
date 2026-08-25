// QueryCraft — Web Audio API Synthesizer Utility
// Generates zero-latency, harmonic chime sound effects without external audio file dependencies.

let sharedAudioContext = null;

export function resetAudioContext() {
  sharedAudioContext = null;
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    try {
      sharedAudioContext = new AudioCtx();
    } catch (e) {
      console.warn("Failed to initialize AudioContext:", e);
      return null;
    }
  }

  if (sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}

/**
 * Check if sound notifications are enabled in local preferences.
 */
export function isSoundEnabled() {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem("querycraft_sound_enabled");
  return val !== "false"; // default true
}

/**
 * Toggle sound notification preference.
 */
export function setSoundEnabled(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem("querycraft_sound_enabled", enabled ? "true" : "false");
}

/**
 * Play a lush, harmonic 4-note bell chime (C5 -> E5 -> G5 -> C6).
 * Used when the Extension Promotion popup appears.
 */
export function playExtensionPromptSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Harmonic notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 523.25, time: now + 0.00, duration: 0.55, gain: 0.12 },
      { freq: 659.25, time: now + 0.09, duration: 0.55, gain: 0.14 },
      { freq: 783.99, time: now + 0.18, duration: 0.65, gain: 0.15 },
      { freq: 1046.50, time: now + 0.27, duration: 0.85, gain: 0.18 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, now);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, time, duration, gain }) => {
      // Primary sine oscillator for pure bell chime
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      // Overtone oscillator for warm shimmer resonance
      const overtone = ctx.createOscillator();
      overtone.type = "triangle";
      overtone.frequency.setValueAtTime(freq * 2, time);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, time);
      // Soft attack
      noteGain.gain.exponentialRampToValueAtTime(gain, time + 0.015);
      // Exponential decay
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.0001, time);
      overtoneGain.gain.exponentialRampToValueAtTime(gain * 0.25, time + 0.01);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.6);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      overtone.connect(overtoneGain);
      overtoneGain.connect(masterGain);

      osc.start(time);
      osc.stop(time + duration);

      overtone.start(time);
      overtone.stop(time + duration);
    });
  } catch (e) {
    console.warn("Unable to play extension prompt audio chime:", e);
  }
}

/**
 * Play a short 2-note success chime (G5 -> C6).
 */
export function playSuccessSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 783.99, time: now + 0.00, duration: 0.35, gain: 0.15 },
      { freq: 1046.50, time: now + 0.10, duration: 0.55, gain: 0.20 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.6, now);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.exponentialRampToValueAtTime(gain, time + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  } catch (e) {
    console.warn("Unable to play success audio chime:", e);
  }
}
