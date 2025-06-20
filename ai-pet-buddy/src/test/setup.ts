import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// scrollIntoView のモック
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true
})

// PWA API mocks for test environment
// ServiceWorkerRegistration mock
class MockServiceWorkerRegistration {}

// ServiceWorker mock
const mockServiceWorker = {
  register: vi.fn().mockResolvedValue(new MockServiceWorkerRegistration()),
  getRegistration: vi.fn().mockResolvedValue(new MockServiceWorkerRegistration()),
  controller: null,
  ready: Promise.resolve(new MockServiceWorkerRegistration())
}

// Mock ServiceWorkerRegistration globally
Object.defineProperty(globalThis, 'ServiceWorkerRegistration', {
  value: MockServiceWorkerRegistration,
  writable: true
})

// Define `sync` on the prototype of ServiceWorkerRegistration
Object.defineProperty(globalThis.ServiceWorkerRegistration.prototype, 'sync', {
  value: true,
  writable: true,
  configurable: true
})

// Mock navigator.serviceWorker
Object.defineProperty(globalThis.navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
  configurable: true
})

// Mock Notification API
class MockNotification {
  static permission = 'default'
  static requestPermission = vi.fn().mockResolvedValue('granted')
  
  constructor(title: string, options?: NotificationOptions) {
    // Mock notification instance
  }
}

Object.defineProperty(globalThis, 'Notification', {
  value: MockNotification,
  writable: true,
  configurable: true
})

// Mock PushManager
class MockPushManager {
  subscribe = vi.fn()
  getSubscription = vi.fn()
}

Object.defineProperty(globalThis, 'PushManager', {
  value: MockPushManager,
  writable: true,
  configurable: true
})

// Mock BeforeInstallPromptEvent
class MockBeforeInstallPromptEvent extends Event {
  prompt = vi.fn().mockResolvedValue(undefined)
  userChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' })
}

Object.defineProperty(globalThis, 'BeforeInstallPromptEvent', {
  value: MockBeforeInstallPromptEvent,
  writable: true,
  configurable: true
})

// Mock matchMedia
const mockMatchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}))

Object.defineProperty(globalThis, 'matchMedia', {
  value: mockMatchMedia,
  writable: true
})

// Mock localStorage (jsdom should provide this, but ensure it's available)
const mockLocalStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true
})

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(globalThis, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
  configurable: true
})

// Mock navigator.share
Object.defineProperty(globalThis.navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true,
  configurable: true
})

// Mock navigator.onLine
Object.defineProperty(globalThis.navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true
})

// Mock connection API
const mockConnection = {
  effectiveType: '4g',
  downlink: 10,
  rtt: 100
}

Object.defineProperty(globalThis.navigator, 'connection', {
  value: mockConnection,
  writable: true,
  configurable: true
})
