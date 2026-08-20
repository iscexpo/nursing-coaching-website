import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**']),
  {
    rules: {
      // Existing client components intentionally hydrate browser-only state in effects.
      'react-hooks/set-state-in-effect': 'off',
      // Playwright's custom page fixture is a callable fixture, not a React component.
      'react-hooks/rules-of-hooks': 'off',
    },
  },
])
