import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  globalIgnores(['.next/**', 'node_modules/**', 'public/**', 'coverage/**']),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Existing client effects synchronize browser/session state; keep these as warnings
      // until each surface is migrated to a data-fetching boundary.
      'react-hooks/set-state-in-effect': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
])
