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
 * Chip-place sound — three layers stacked at the same instant:
 *   1. Click attack — 900Hz square wave, 12ms decay (the "tk").
 *   2. Mid body — triangle 1.7→1.1kHz, 90ms tail (clay shimmer).
 *   3. Sub thump — 110Hz lowpass noise, 40ms (clay-disc weight).
 *
 * Previous version was a triangle "tap" + high sine "ring" that
 * sounded like a small bell. The new mix has actual percussive
 * attack + real low-end weight, plus a ringy mid body, so it lands
 * as a clay chip on felt instead of a music note.
 */
export function playChip(): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();

  const now = ac.currentTime;

  // Layer 1: click attack — square pulse with a fast decay.
  const click = ac.createOscillator();
  click.type = 'square';
  click.frequency.value = 900;
  const clickGain = ac.createGain();
  clickGain.gain.setValueAtTime(0, now);
  clickGain.gain.linearRampToValueAtTime(0.09, now + 0.001);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
  click.connect(clickGain).connect(ac.destination);
  click.start(now);
  click.stop(now + 0.02);

  // Layer 2: ringy body — triangle that drops in pitch as it decays.
  const body = ac.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(1700, now);
  body.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
  const bodyGain = ac.createGain();
  bodyGain.gain.setValueAtTime(0, now);
  bodyGain.gain.linearRampToValueAtTime(0.07, now + 0.003);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  body.connect(bodyGain).connect(ac.destination);
  body.start(now);
  body.stop(now + 0.1);

  // Layer 3: weight thump — sub-frequency noise burst.
  const subDur = 0.04;
  const subBuf = ac.createBuffer(1, Math.ceil(ac.sampleRate * subDur), ac.sampleRate);
  const subData = subBuf.getChannelData(0);
  for (let i = 0; i < subData.length; i++) subData[i] = (Math.random() * 2 - 1) * 0.8;
  const subSrc = ac.createBufferSource();
  subSrc.buffer = subBuf;
  const subFilter = ac.createBiquadFilter();
  subFilter.type = 'lowpass';
  subFilter.frequency.value = 110;
  const subGain = ac.createGain();
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.16, now + 0.003);
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
