import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation((query: string): MediaQueryList => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  })),
})

// Reveal falls back to immediately-visible content when this API is unavailable.
Reflect.deleteProperty(window, 'IntersectionObserver')

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  document.body.className = ''
  document.body.removeAttribute('data-modal-open')
  document.body.removeAttribute('data-invitation-state')
  document.body.style.removeProperty('overflow')
  vi.clearAllMocks()
  vi.useRealTimers()
})
