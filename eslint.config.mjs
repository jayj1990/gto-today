import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * Root ESLint config — single source for the whole monorepo.
 *
 * Why one root config (post Next 15.5): `next lint` is deprecated for
 * removal in Next 16, and the flat-config ESLint CLI can consume
 * `eslint-config-next` via FlatCompat. Running `eslint .` from the
 * workspace root now covers apps/web + every shared package with one
 * pipeline, no turbo fan-out needed.
 *
 * Rule groups:
 *   - packages/**: generic TS rules + CLAUDE.md non-negotiables
 *     (no-any, no-console except warn/error, unused vars underscored)
 *   - apps/web/**: Next.js core-web-vitals + typescript presets on top
 *     of the same shared rules
 *   - test files: relaxed (tests assert with console + any)
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      'solver-run/**',
      'solver-wasm/**',
      'prisma/migrations/**',
      // Node build/parse tools: legit process/console, different lint profile
      'packages/*/scripts/**',
      'scripts/**',
      'apps/*/scripts/**',
      // Next auto-generated
      'apps/web/next-env.d.ts',
      // Serwist writes the bundled service worker into public/; treat
      // everything under public/ as static output, not source to lint.
      'apps/*/public/**',
      // Auto-generated solver data — 387K+ line files. ESLint OOMs
      // when forced to parse them via lint-staged. parse-outputs.mjs
      // already emits with /* eslint-disable */; nothing to lint here.
      // Caught 2026-05-17: pre-commit OOM dropped the BB:UTG commit.
      'packages/gto-data/src/ranges/solver-spots.ts',
      'packages/gto-data/data/postflop-solver-spots.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  // Next.js core-web-vitals (next/image, next/script, etc.) for apps/web.
  // 'next/typescript' intentionally omitted — it pulls @typescript-eslint
  // which conflicts with our already-applied tseslint.configs.recommended.
  ...compat.extends('next/core-web-vitals').map((cfg) => ({
    ...cfg,
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
  })),
  {
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
    rules: {
      // App Router only — the Pages-directory link rule emits a noisy
      // "Pages directory cannot be found" info line on every run.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);
