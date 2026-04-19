import type { Config } from 'tailwindcss';
import { colors, fontFamily, fontSize, radius, spacing } from './tokens.js';

/**
 * Tailwind 4 preset for gto.today.
 * Consumers extend this via `presets: [preset]` in their tailwind.config.
 * The primary theming path for Tailwind 4 is the CSS `@theme` block in
 * apps/web/src/app/styles/tokens.css — this preset mostly exists to expose
 * semantic classes (bg-felt, text-gold, etc.) for autocompletion.
 */
export const preset = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        felt: colors.felt,
        'felt-deep': colors.feltDeep,
        'felt-night': colors.feltNight,
        gold: colors.gold,
        'gold-soft': colors.goldSoft,
        'gold-deep': colors.goldDeep,
        'gold-cool': colors.goldCool,
        noir: colors.noir,
        charcoal: colors.charcoal,
        graphite: colors.graphite,
        ivory: colors.ivory,
        cream: colors.cream,
        raise: colors.raise,
        call: colors.call,
        fold: colors.fold,
        warning: colors.warning,
        info: colors.info,
      },
      fontFamily: fontFamily as unknown as Record<string, string[]>,
      fontSize: fontSize as unknown as Record<string, [string, { lineHeight: string }]>,
      spacing,
      borderRadius: radius,
    },
  },
} satisfies Partial<Config>;

export default preset;
