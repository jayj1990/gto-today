/**
 * gto.today — Design Tokens
 * Casino Noir × Daily Ritual
 *
 * Surface these via Tailwind 4's @theme directive and/or raw CSS variables.
 * All color values are authored as OKLCH where practical for dark/light parity.
 */

export const colors = {
  // Brand core
  felt: '#0E3B2E',
  feltDeep: '#082018',
  feltNight: '#051612', // Tonight mode (22:00–04:59 local)
  gold: '#D4AF37',
  goldSoft: '#E8CC72',
  goldDeep: '#B8912A',
  goldCool: '#C9A635', // Dark-mode adjusted gold

  // Neutral
  noir: '#0A0A0A',
  charcoal: '#1C1C1E',
  graphite: '#2E2E30',
  ivory: '#F4EFE6',
  cream: '#EDE5D3',

  // Semantic
  raise: '#C8102E',
  raiseDeep: '#7F0A1B', // all-in escalation — deeper than raise
  call: '#1F9D55',
  fold: '#2B5F8F', // blue — matches in-app chart fold color for consistency
  warning: '#E6A817',
  info: '#4A9EFF',

  // Card suits — 2-color deck (traditional)
  spade: '#0A0A0A',
  heart: '#D63B3B',
  diamond2c: '#D63B3B',
  club2c: '#0A0A0A',

  // Card suits — 4-color deck (accessibility + advanced)
  diamond4c: '#2B6CB0',
  club4c: '#1F6F3F',
} as const;

export const gradients = {
  felt: 'linear-gradient(180deg, #0E3B2E 0%, #082018 100%)',
  gold: 'linear-gradient(135deg, #D4AF37 0%, #E8CC72 50%, #B8912A 100%)',
  today: 'linear-gradient(90deg, #0E3B2E 0%, #D4AF37 100%)',
} as const;

export const fontFamily = {
  display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  body: ['Inter', 'Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
  kr: ['Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  serifAccent: ['Fraunces', 'Playfair Display', 'serif'],
} as const;

export const fontSize = {
  'display-xl': ['3.5rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em' }],
  'display-lg': ['2.5rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
  heading: ['1.75rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
  subheading: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
  'body-lg': ['1.0625rem', { lineHeight: '1.625rem' }],
  body: ['0.9375rem', { lineHeight: '1.5rem' }],
  caption: ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.04em' }],
  'mono-lg': ['2rem', { lineHeight: '2.5rem' }],
  mono: ['0.9375rem', { lineHeight: '1.375rem' }],
} as const;

export const spacing = {
  '4p': '4px',
  '8p': '8px',
  '12p': '12px',
  '16p': '16px',
  '24p': '24px',
  '32p': '32px',
  '48p': '48px',
  '64p': '64px',
  touch: '44px',
  cta: '56px',
} as const;

export const radius = {
  card: '16px',
  chip: '999px',
  panel: '20px',
  button: '12px',
  input: '10px',
} as const;

export const motion = {
  ease: {
    quart: 'cubic-bezier(0.22, 1, 0.36, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  duration: {
    instant: '80ms',
    fast: '180ms',
    base: '240ms',
    decisive: '320ms',
    flip: '480ms',
    countup: '400ms',
    mixBar: '600ms',
  },
} as const;

export const shadow = {
  card: '0 4px 20px rgba(0, 0, 0, 0.25)',
  cardHover: '0 8px 32px rgba(0, 0, 0, 0.32)',
  panel: '0 12px 40px rgba(0, 0, 0, 0.18)',
  focus: '0 0 0 2px var(--color-gold)',
  innerGold: 'inset 0 1px 0 rgba(232, 204, 114, 0.4)',
} as const;

export const z = {
  base: 0,
  sticky: 10,
  dropdown: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

export type ColorToken = keyof typeof colors;
export type GradientToken = keyof typeof gradients;
