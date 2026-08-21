import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
  ]),
  {
    files: ['app/**/*.tsx', 'app/**/*.ts', 'components/**/*.tsx'],
    rules: {
      // Existing client components intentionally hydrate browser-only state in effects.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['e2e/utils/test-base.ts'],
    rules: {
      // Playwright's custom page fixture is a callable fixture, not a React component.
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    files: ['e2e/**/*.ts', 'scripts/**/*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
])
