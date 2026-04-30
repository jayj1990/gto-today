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
 * Chip-place sound — physical-modeling-inspired stack: a sharp clay-
 * on-clay strike, the woody clack body that gives a chip its
 * identity, and a brief disc-mass thump. Two passes 35ms apart fake
 * the "two chips kissing as the bet lands" doubling that real clay
 * chips make when tossed onto a stack.
 *
 *   Strike   — 8ms highpassed noise (>5kHz) for the percussive ceramic
 *              attack. Pure transient, no body.
 *   Clack    — 70ms bandpass noise around 480Hz (Q=4) with the centre
 *              frequency sliding down ~520→440Hz. The slight pitch
 *              droop is what reads as "clay" rather than "drum hit".
 *   Ring     — 90ms bandpass noise at ~2.4kHz (Q=2.5) for the high
 *              overtones a clay chip emits as it settles.
 *   Body     — 28ms lowpass noise (~150Hz) for a touch of disc mass.
 *
 * Two strikes ~35ms apart make it sound like a chip stack rather
 * than a single clack — the way a real bet lands when chips touch
 * the felt then settle into the existing pile.
 */
export function playChip(): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  void ac.resume();

  const t0 = ac.currentTime;

  const noiseBuf = (durSec: number, amp = 1): AudioBuffer => {
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * durSec), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * amp;
    return buf;
  };

  /** One full chip "clack" — strike + clack body + ring + sub at `at`. */
  const playOne = (at: number, gainScale: number) => {
    // Strike — highpassed noise transient. The percussive bite.
    const strikeDur = 0.008;
    const strikeSrc = ac.createBufferSource();
    strikeSrc.buffer = noiseBuf(strikeDur, 1);
    const strikeFilter = ac.createBiquadFilter();
    strikeFilter.type = 'highpass';
    strikeFilter.frequency.value = 5000;
    const strikeGain = ac.createGain();
    strikeGain.gain.setValueAtTime(0, at);
    strikeGain.gain.linearRampToValueAtTime(0.22 * gainScale, at + 0.001);
    strikeGain.gain.exponentialRampToValueAtTime(0.0005, at + strikeDur);
    strikeSrc.connect(strikeFilter).connect(strikeGain).connect(ac.destination);
    strikeSrc.start(at);
    strikeSrc.stop(at + strikeDur + 0.005);

    // Clack body — narrow bandpass noise with a downward sweep.
    // The pitch droop is the "clay" tell. Q=4 is tight enough to
    // ring slightly without sounding like a synth note.
    const clackDur = 0.07;
    const clackSrc = ac.createBufferSource();
    clackSrc.buffer = noiseBuf(clackDur, 0.85);
    const clackFilter = ac.createBiquadFilter();
    clackFilter.type = 'bandpass';
    clackFilter.frequency.setValueAtTime(520, at);
    clackFilter.frequency.exponentialRampToValueAtTime(440, at + 0.05);
    clackFilter.Q.value = 4;
    const clackGain = ac.createGain();
    clackGain.gain.setValueAtTime(0, at);
    clackGain.gain.linearRampToValueAtTime(0.28 * gainScale, at + 0.003);
    clackGain.gain.exponentialRampToValueAtTime(0.001, at + clackDur);
    clackSrc.connect(clackFilter).connect(clackGain).connect(ac.destination);
    clackSrc.start(at);
    clackSrc.stop(at + clackDur + 0.005);

    // Ring — high overtones. Adds the bright shimmer real chips make.
    const ringDur = 0.09;
    const ringSrc = ac.createBufferSource();
    ringSrc.buffer = noiseBuf(ringDur, 0.6);
    const ringFilter = ac.createBiquadFilter();
    ringFilter.type = 'bandpass';
    ringFilter.frequency.value = 2400;
    ringFilter.Q.value = 2.5;
    const ringGain = ac.createGain();
    ringGain.gain.setValueAtTime(0, at);
    ringGain.gain.linearRampToValueAtTime(0.1 * gainScale, at + 0.004);
    ringGain.gain.exponentialRampToValueAtTime(0.001, at + ringDur);
    ringSrc.connect(ringFilter).connect(ringGain).connect(ac.destination);
    ringSrc.start(at);
    ringSrc.stop(at + ringDur + 0.005);

    // Body — quick subby thump for disc mass.
    const bodyDur = 0.028;
    const bodySrc = ac.createBufferSource();
    bodySrc.buffer = noiseBuf(bodyDur, 0.85);
    const bodyFilter = ac.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.value = 150;
    const bodyGain = ac.createGain();
    bodyGain.gain.setValueAtTime(0, at);
    bodyGain.gain.linearRampToValueAtTime(0.16 * gainScale, at + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, at + bodyDur);
    bodySrc.connect(bodyFilter).connect(bodyGain).connect(ac.destination);
    bodySrc.start(at);
    bodySrc.stop(at + bodyDur + 0.005);
  };

  // First clack at full volume; second clack 35ms later at 60% — the
  // settling kiss against the stack.
  playOne(t0, 1);
  playOne(t0 + 0.035, 0.6);
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
