/**
 * Web Audio API synthesizer for zero-dependency sound generation.
 * Generates natural harmonic tones for Athan test, Tasbih haptics/sound, and Du'a chimes.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAudioTone(freq = 440, duration = 0.1, type: OscillatorType = 'sine', volume = 0.12): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio tone error:', e);
  }
}

/**
 * Plays a reverent, warm multi-tone sequence reminiscent of the Adhan call
 */
export function playSampleAthan(): void {
  const chords = [
    { freq: 293.66, time: 0 },    // D4
    { freq: 329.63, time: 260 },  // E4
    { freq: 369.99, time: 520 },  // F#4
    { freq: 440.00, time: 820 },  // A4
    { freq: 369.99, time: 1200 }, // F#4
    { freq: 293.66, time: 1600 }, // D4
  ];

  chords.forEach(({ freq, time }) => {
    setTimeout(() => {
      playAudioTone(freq, 0.6, 'triangle', 0.15);
    }, time);
  });
}

/**
 * Quick soft tactile click for Tasbih beads
 */
export function playTasbihClick(): void {
  playAudioTone(880, 0.04, 'sine', 0.08);
}

/**
 * Celebratory chime when a dhikr cycle is completed (e.g. 33 times)
 */
export function playCompletionChime(): void {
  playAudioTone(523.25, 0.2, 'triangle', 0.14); // C5
  setTimeout(() => playAudioTone(659.25, 0.25, 'triangle', 0.14), 120); // E5
  setTimeout(() => playAudioTone(783.99, 0.4, 'triangle', 0.14), 240); // G5
}

/**
 * Gentle pre-Imsak & Suhoor chime sequence (Fajr wake-up call)
 */
export function playSuhoorChime(): void {
  const notes = [
    { freq: 440.0, time: 0, dur: 0.8 },    // A4
    { freq: 554.37, time: 350, dur: 0.8 }, // C#5
    { freq: 659.25, time: 700, dur: 1.0 }, // E5
    { freq: 880.0, time: 1100, dur: 1.2 }, // A5
  ];
  notes.forEach(({ freq, time, dur }) => {
    setTimeout(() => {
      playAudioTone(freq, dur, 'sine', 0.12);
    }, time);
  });
}

/**
 * Micro-sound for exact Qibla Kaaba precision lock (within ±2°)
 */
export function playQiblaAlignedHapticSound(): void {
  playAudioTone(659.25, 0.15, 'sine', 0.16); // E5
  setTimeout(() => playAudioTone(987.77, 0.35, 'triangle', 0.18), 90); // B5
}

/**
 * Ambient serene chord for reading & reflection meditation
 */
export function playRecitationTadabburChord(): void {
  playAudioTone(220.0, 1.4, 'sine', 0.08); // A3
  playAudioTone(329.63, 1.6, 'sine', 0.06); // E4
  playAudioTone(440.0, 1.8, 'sine', 0.05); // A4
}

