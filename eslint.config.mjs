import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Root ESLint config — covers the shared packages (poker-core, gto-data, ui, config).
 *
 * apps/web keeps its own flat config (apps/web/eslint.config.mjs) because it
 * needs Next.js-specific rules via `next lint`. When Next 16 drops `next lint`
 * we'll migrate apps/web here too; until then the two configs coexist.
 *
 * Rules here mirror the non-negotiables in the project-root CLAUDE.md:
 *   - no `any`
 *   - no `console.log` (warn/error allowed)
 *   - unused variables / args must be explicitly underscored
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      'apps/**',
      'solver-run/**',
      'solver-wasm/**',
      'prisma/migrations/**',
      // Node build/parse tools: legit process/console, different lint profile
      'packages/*/scripts/**',
      'scripts/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/**/*.{ts,tsx}'],
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
  {
    files: ['packages/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);
