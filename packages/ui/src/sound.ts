/**
 * Web Audio SFX — no audio file assets, sounds are synthesized live.
 *
 * Why synthesize instead of ship MP3s:
 *   • Zero binary weight, zero LCP impact, zero SW caching to worry about.
 *   • Easy to tune timing in code (deal sweep matches animation delay).
 *   • Polyphonic by construction — six chips can play overlapping clinks.
 *
 * Browser quirks:
 *   • iOS Safari + Firefox start AudioContexts in 'suspended' state.
 *     They unlock on any user gesture — we call resume() lazily on
 *     every play, so the first hand on cold load is silent until the
 *     user clicks any button (after that all subsequent hands play).
 *   • prefers-reduced-motion users almost certainly want silence too.
 *     Same toggle for both — the mute state is persisted.
 */

let ctx: AudioContext | null = null;
const STORAGE_KEY = 'gto.sound.muted';

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const W = window as Window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = W.AudioContext ?? W.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function isMuted(): boolean {
  if (typeof window === 'undefined') return true;
  // Default ON (sound playing) — silent by default would frustrate
  // users who want feedback. The mute toggle in settings flips it OFF.
  // Reduced-motion preference overrides — we treat motion-reduce as
  // "minimize stimulus", which extends to audio.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // localStorage quota / Safari private — silently degrade.
  }
}

/**
 * Card-deal sound — two-stage percussion mimicking a card flick into
 * the felt:
 *   1. "Flick" — short high-frequency noise burst (45ms, band-pass
 *      ~2.8kHz) for the paper-on-paper friction at release.
 *   2. "Tap" — softer low-frequency noise burst (60ms, low-pass
 *      380Hz) ~25ms later for the card landing on felt.
 *
 * Previous version was a single descending band-pass burst — sounded
 * more like a "shhh" than a card. The flick → tap sequence reads as
 * a card actually being dealt.
 */
export function playDeal(): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();

  const now = ac.currentTime;

  // Layer 1: flick — high-frequency band-pass noise.
  const flickDur = 0.045;
  const flickBuf = ac.createBuffer(1, Math.ceil(ac.sampleRate * flickDur), ac.sampleRate);
  const flickData = flickBuf.getChannelData(0);
  for (let i = 0; i < flickData.length; i++) flickData[i] = (Math.random() * 2 - 1) * 0.5;
  const flickSrc = ac.createBufferSource();
  flickSrc.buffer = flickBuf;
  const flickFilter = ac.createBiquadFilter();
  flickFilter.type = 'bandpass';
  flickFilter.frequency.value = 2800;
  flickFilter.Q.value = 1.4;
  const flickGain = ac.createGain();
  flickGain.gain.setValueAtTime(0, now);
  flickGain.gain.linearRampToValueAtTime(0.14, now + 0.004);
  flickGain.gain.exponentialRampToValueAtTime(0.001, now + flickDur);
  flickSrc.connect(flickFilter).connect(flickGain).connect(ac.destination);
  flickSrc.start(now);
  flickSrc.stop(now + flickDur + 0.005);

  // Layer 2: card-on-felt thump — softer low-frequency noise 25ms later.
  const tapStart = now + 0.025;
  const tapDur = 0.06;
  const tapBuf = ac.createBuffer(1, Math.ceil(ac.sampleRate * tapDur), ac.sampleRate);
  const tapData = tapBuf.getChannelData(0);
  for (let i = 0; i < tapData.length; i++) tapData[i] = (Math.random() * 2 - 1) * 0.7;
  const tapSrc = ac.createBufferSource();
  tapSrc.buffer = tapBuf;
  const tapFilter = ac.createBiquadFilter();
  tapFilter.type = 'lowpass';
  tapFilter.frequency.value = 380;
  tapFilter.Q.value = 0.7;
  const tapGain = ac.createGain();
  tapGain.gain.setValueAtTime(0, tapStart);
  tapGain.gain.linearRampToValueAtTime(0.18, tapStart + 0.005);
  tapGain.gain.exponentialRampToValueAtTime(0.001, tapStart + tapDur);
  tapSrc.connect(tapFilter).connect(tapGain).connect(ac.destination);
  tapSrc.start(tapStart);
  tapSrc.stop(tapStart + tapDur + 0.005);
}

/**
 * Chip-place sound — three layers of FILTERED NOISE stacked at the
 * same instant. Tonal oscillators (square / triangle) read as
 * "뿅뿅" beeps because the human ear hears them as musical pitch.
 * Real chips hitting felt are aperiodic transients — clay rim
 * scraping clay, then a thump. Noise + bandpass/lowpass mimics that.
 *
 *   1. Rim attack — 35ms bandpass (~3.2kHz, Q=2) for the clay-on-clay
 *      "click" of the chip striking the stack. Sharp, no pitch.
 *   2. Mid body — 80ms bandpass (~900Hz, Q=1) for the rim resonance.
 *      Adds the chip's "clack" identity without turning into a tone.
 *   3. Sub thump — 50ms lowpass (~120Hz) for the disc's mass landing
 *      on felt. The weight that makes a chip feel solid.
 */
export function playChip(): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();

  const now = ac.currentTime;

  // Helper — fill a buffer with white noise of the given duration.
  const noiseBuf = (durSec: number, amp = 1): AudioBuffer => {
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * durSec), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * amp;
    return buf;
  };

  // Layer 1: rim attack — bandpass click around 3.2kHz.
  const rimDur = 0.035;
  const rimSrc = ac.createBufferSource();
  rimSrc.buffer = noiseBuf(rimDur, 0.6);
  const rimFilter = ac.createBiquadFilter();
  rimFilter.type = 'bandpass';
  rimFilter.frequency.value = 3200;
  rimFilter.Q.value = 2;
  const rimGain = ac.createGain();
  rimGain.gain.setValueAtTime(0, now);
  rimGain.gain.linearRampToValueAtTime(0.18, now + 0.002);
  rimGain.gain.exponentialRampToValueAtTime(0.001, now + rimDur);
  rimSrc.connect(rimFilter).connect(rimGain).connect(ac.destination);
  rimSrc.start(now);
  rimSrc.stop(now + rimDur + 0.005);

  // Layer 2: clack body — bandpass around 900Hz (chip identity).
  const clackDur = 0.08;
  const clackSrc = ac.createBufferSource();
  clackSrc.buffer = noiseBuf(clackDur, 0.7);
  const clackFilter = ac.createBiquadFilter();
  clackFilter.type = 'bandpass';
  clackFilter.frequency.value = 900;
  clackFilter.Q.value = 1.0;
  const clackGain = ac.createGain();
  clackGain.gain.setValueAtTime(0, now);
  clackGain.gain.linearRampToValueAtTime(0.16, now + 0.003);
  clackGain.gain.exponentialRampToValueAtTime(0.001, now + clackDur);
  clackSrc.connect(clackFilter).connect(clackGain).connect(ac.destination);
  clackSrc.start(now);
  clackSrc.stop(now + clackDur + 0.005);

  // Layer 3: weight thump — sub-frequency lowpass noise.
  const subDur = 0.05;
  const subSrc = ac.createBufferSource();
  subSrc.buffer = noiseBuf(subDur, 0.85);
  const subFilter = ac.createBiquadFilter();
  subFilter.type = 'lowpass';
  subFilter.frequency.value = 120;
  const subGain = ac.createGain();
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.18, now + 0.004);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + subDur);
  subSrc.connect(subFilter).connect(subGain).connect(ac.destination);
  subSrc.start(now);
  subSrc.stop(now + subDur + 0.005);
}

/**
 * Win chime — short 3-note arpeggio (G→B→D, perfect-major triad).
 * Played on a sharp grade so the user hears confirmation alongside
 * the chip-toss visual.
 */
export function playWin(): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();

  const now = ac.currentTime;
  const notes = [784, 988, 1175]; // G5, B5, D6
  for (let i = 0; i < notes.length; i++) {
    const t = now + i * 0.07;
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = notes[i]!;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }
}
