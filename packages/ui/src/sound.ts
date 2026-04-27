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
 * Card-deal swoosh — short noise burst with a high-pass filter,
 * descending pitch envelope. ~80ms, peaks at ~-18 dBFS.
 *
 * The "swish" is the noise + filter sweep; the click at the start is
 * the attack ramp from 0. Playing this in a stagger reads as one card
 * after another being dealt across the felt.
 */
export function playDeal(): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();

  const now = ac.currentTime;
  const dur = 0.09;

  // Pink-ish noise via short buffer of random samples.
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  const src = ac.createBufferSource();
  src.buffer = buf;

  // Band-pass for the "paper sliding" timbre.
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2400, now);
  filter.frequency.exponentialRampToValueAtTime(900, now + dur);
  filter.Q.value = 0.9;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(now);
  src.stop(now + dur + 0.01);
}

/**
 * Chip clink — two stacked tones (ring + tap) plus a tiny noise tick.
 * Total ~120ms. Sounds like a clay chip landing on a felt + chip stack.
 */
export function playChip(): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();

  const now = ac.currentTime;

  // Tap: short triangle at ~1.4 kHz, decays in 60ms.
  const tap = ac.createOscillator();
  tap.type = 'triangle';
  tap.frequency.setValueAtTime(1400, now);
  tap.frequency.exponentialRampToValueAtTime(900, now + 0.05);
  const tapGain = ac.createGain();
  tapGain.gain.setValueAtTime(0, now);
  tapGain.gain.linearRampToValueAtTime(0.16, now + 0.004);
  tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  tap.connect(tapGain).connect(ac.destination);
  tap.start(now);
  tap.stop(now + 0.08);

  // Ring: a sine ~3.2 kHz, longer tail, gives the ceramic shimmer.
  const ring = ac.createOscillator();
  ring.type = 'sine';
  ring.frequency.setValueAtTime(3200, now);
  ring.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
  const ringGain = ac.createGain();
  ringGain.gain.setValueAtTime(0, now);
  ringGain.gain.linearRampToValueAtTime(0.06, now + 0.006);
  ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
  ring.connect(ringGain).connect(ac.destination);
  ring.start(now);
  ring.stop(now + 0.14);
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
