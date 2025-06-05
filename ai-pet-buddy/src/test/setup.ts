import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// scrollIntoView のモック
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true
})
