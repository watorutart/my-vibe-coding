import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  registerServiceWorker,
  unregisterServiceWorker,
  updateServiceWorker,
  getServiceWorkerState,
  getServiceWorkerUpdateInfo,
  isServiceWorkerSupported,
  isServiceWorkerControlling,
  clearServiceWorkerCache,
  getCurrentRegistration,
  getServiceWorkerStats,
  addEventListener,
  removeEventListener
} from './serviceWorker'
import type { PWAEvent } from '../types/PWA'

// Service Worker APIをモック
const mockRegistration = {
  scope: '/',
  unregister: vi.fn(),
  update: vi.fn(),
  installing: null,
  waiting: null,
  active: null,
  addEventListener: vi.fn()
}

const mockServiceWorker = {
  state: 'activated',
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  scriptURL: 'http://localhost/sw.js'
}

// global navigatorをモック
const mockNavigator = {
  serviceWorker: {
    register: vi.fn(),
    controller: null,
    addEventListener: vi.fn()
  }
}

describe('Service Worker Utilities', () => {
  beforeEach(() => {
    // グローバルオブジェクトをモック
    vi.stubGlobal('navigator', mockNavigator)
    vi.stubGlobal('window', {
      setInterval: vi.fn(),
      clearInterval: vi.fn(),
      location: { reload: vi.fn() },
      MessageChannel: vi.fn(() => ({
        port1: { onmessage: null },
        port2: {}
      })),
      caches: {
        keys: vi.fn().mockResolvedValue(['cache1', 'cache2'])
      }
    })
    
    // console をモック
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // モックをリセット
    vi.clearAllMocks()
    
    // navigator.serviceWorker.controllerをリセット
    mockNavigator.serviceWorker.controller = null
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('registerServiceWorker', () => {
    it('should return error when service worker is not supported', async () => {
      // Service Workerサポートなしをモック
      vi.stubGlobal('navigator', {})
      
      const result = await registerServiceWorker()
      
      expect(result).toEqual({
        isRegistered: false,
        isControlling: false,
        hasUpdate: false,
        error: 'Service Worker is not supported'
      })
    })

    it('should successfully register service worker', async () => {
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      
      const result = await registerServiceWorker()
      
      expect(mockNavigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      expect(result.isRegistered).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should handle registration error', async () => {
      const error = new Error('Registration failed')
      mockNavigator.serviceWorker.register.mockRejectedValue(error)
      
      const result = await registerServiceWorker()
      
      expect(result).toEqual({
        isRegistered: false,
        isControlling: false,
        hasUpdate: false,
        error: 'Registration failed'
      })
    })
  })

  describe('unregisterServiceWorker', () => {
    it('should return true when no registration exists', async () => {
      const result = await unregisterServiceWorker()
      expect(result).toBe(true)
    })

    it('should successfully unregister service worker', async () => {
      // まず登録
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      mockRegistration.unregister.mockResolvedValue(true)
      
      await registerServiceWorker()
      const result = await unregisterServiceWorker()
      
      expect(mockRegistration.unregister).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle unregistration error', async () => {
      // まず登録
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      await registerServiceWorker()
      
      // unregister失敗をモック
      mockRegistration.unregister.mockRejectedValue(new Error('Unregister failed'))
      
      const result = await unregisterServiceWorker()
      expect(result).toBe(false)
    })
  })

  describe('updateServiceWorker', () => {
    it('should return false when no registration exists', async () => {
      // まず現在の登録をクリア
      await unregisterServiceWorker()
      
      const result = await updateServiceWorker()
      expect(result).toBe(false)
    })

    it('should update service worker when waiting worker exists', async () => {
      // 登録をセットアップ
      const waitingWorker = { ...mockServiceWorker, postMessage: vi.fn() }
      const updatedRegistration = { ...mockRegistration, waiting: waitingWorker }
      
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      mockRegistration.update.mockResolvedValue(updatedRegistration)
      
      await registerServiceWorker()
      const result = await updateServiceWorker()
      
      expect(mockRegistration.update).toHaveBeenCalled()
      expect(waitingWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
      expect(result).toBe(true)
    })

    it('should return false when no update is available', async () => {
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      mockRegistration.update.mockResolvedValue(mockRegistration)
      
      await registerServiceWorker()
      const result = await updateServiceWorker()
      
      expect(result).toBe(false)
    })
  })

  describe('getServiceWorkerState', () => {
    it('should return default state when no registration', () => {
      const state = getServiceWorkerState()
      
      expect(state).toEqual({
        isRegistered: false,
        isControlling: false,
        hasUpdate: false,
        error: null
      })
    })

    it('should return correct state with registration', async () => {
      const registration = { ...mockRegistration, waiting: mockServiceWorker }
      mockNavigator.serviceWorker.controller = mockServiceWorker
      
      const state = getServiceWorkerState(registration)
      
      expect(state.isRegistered).toBe(true)
      expect(state.isControlling).toBe(true)
      expect(state.hasUpdate).toBe(true)
    })
  })

  describe('getServiceWorkerUpdateInfo', () => {
    it('should return null when no waiting worker', async () => {
      const info = await getServiceWorkerUpdateInfo()
      expect(info).toBeNull()
    })

    it('should return update info when waiting worker exists', async () => {
      // 登録をセットアップして waiting worker を設定
      const waitingWorker = mockServiceWorker
      const activeWorker = mockServiceWorker
      const updatedRegistration = { 
        ...mockRegistration, 
        waiting: waitingWorker,
        active: activeWorker
      }
      
      mockNavigator.serviceWorker.register.mockResolvedValue(updatedRegistration)
      await registerServiceWorker()
      
      const info = await getServiceWorkerUpdateInfo()
      expect(info).toBeDefined()
      expect(info?.description).toBe('アプリの新しいバージョンが利用可能です')
    })
  })

  describe('utility functions', () => {
    it('should check service worker support', () => {
      expect(isServiceWorkerSupported()).toBe(true)
      
      vi.stubGlobal('navigator', {})
      expect(isServiceWorkerSupported()).toBe(false)
    })

    it('should check if service worker is controlling', () => {
      expect(isServiceWorkerControlling()).toBe(false)
      
      mockNavigator.serviceWorker.controller = mockServiceWorker
      expect(isServiceWorkerControlling()).toBe(true)
    })

    it('should get current registration', async () => {
      // 最初に登録をクリア
      await unregisterServiceWorker()
      expect(getCurrentRegistration()).toBeNull()
      
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      await registerServiceWorker()
      
      expect(getCurrentRegistration()).toBeDefined()
    })

    it('should clear service worker cache', async () => {
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      mockNavigator.serviceWorker.controller = mockServiceWorker
      
      await registerServiceWorker()
      const result = await clearServiceWorkerCache()
      
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'CLEAR_CACHE'
      })
      expect(result).toBe(true)
    })

    it('should get service worker stats', async () => {
      // storage APIをモック
      vi.stubGlobal('navigator', {
        ...mockNavigator,
        storage: {
          estimate: vi.fn().mockResolvedValue({ usage: 1024 })
        }
      })
      
      // cachesもグローバルにモック
      vi.stubGlobal('caches', {
        keys: vi.fn().mockResolvedValue(['cache1', 'cache2'])
      })
      
      const stats = await getServiceWorkerStats()
      
      expect(stats).toEqual({
        cacheSize: 1024,
        cacheCount: 2,
        registrationTime: null
      })
    })
  })

  describe('event handling', () => {
    it('should add and remove event listeners', () => {
      const listener = vi.fn()
      
      addEventListener(listener)
      removeEventListener(listener)
      
      // イベントリスナーが正常に管理されることを確認
      expect(() => {
        addEventListener(listener)
        removeEventListener(listener)
      }).not.toThrow()
    })

    it('should emit events to listeners', async () => {
      const listener = vi.fn()
      addEventListener(listener)
      
      // Service Worker登録でイベントが発火されることをテスト
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      await registerServiceWorker()
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sw-registered',
          data: { scope: '/' },
          timestamp: expect.any(Date)
        })
      )
      
      removeEventListener(listener)
    })

    it('should handle listener errors gracefully', async () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      
      addEventListener(errorListener)
      
      // エラーが投げられてもregistrationは成功することを確認
      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration)
      await expect(registerServiceWorker()).resolves.toBeDefined()
      
      expect(console.error).toHaveBeenCalledWith('[SW] Event listener error:', expect.any(Error))
      
      removeEventListener(errorListener)
    })
  })
})