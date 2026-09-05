/* eslint-disable @next/next/no-assign-module-variable */
// Mock for CSS/SCSS imports in Jest/Vitest
// Compatible with Next.js styleMock and CSS Modules (identity-obj-proxy)
// Used by Vitest (jsdom) via manual mock or automock; global CSS returns empty object, CSS Modules return identity proxy.

const styleMock = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === '__esModule') return false
      if (prop === 'default') return styleMock
      // For CSS Modules: return class name identity (e.g., `styles.button` -> "button")
      return prop
    },
  },
)

export default styleMock

// CJS interop for Jest (`module.exports = {}` fallback + identity proxy)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any | undefined

if (typeof module !== 'undefined' && module?.exports) {
  // eslint-disable-next-line @next/next/no-assign-module-variable
  module.exports = styleMock
  // eslint-disable-next-line @next/next/no-assign-module-variable
  module.exports.default = styleMock
}
