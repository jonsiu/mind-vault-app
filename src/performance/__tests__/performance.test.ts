/**
 * Performance Optimization Tests
 * Tests for cross-platform performance optimization features
 */

import { 
  createPerformanceMonitor,
  createFileSystemManager,
  createTouchGestureManager,
  createResponsiveManager,
  createOfflineManager,
  createBatteryOptimizer,
  DEFAULT_PERFORMANCE_THRESHOLDS,
  DEFAULT_OPTIMIZATION_STRATEGIES,
  DEFAULT_KEYBOARD_SHORTCUTS,
  DEFAULT_TOUCH_GESTURES
} from '../index'

describe('Performance Optimization System', () => {
  test('should have default configurations', () => {
    expect(DEFAULT_PERFORMANCE_THRESHOLDS).toBeDefined()
    expect(DEFAULT_OPTIMIZATION_STRATEGIES).toBeDefined()
    expect(DEFAULT_KEYBOARD_SHORTCUTS).toBeDefined()
    expect(DEFAULT_TOUCH_GESTURES).toBeDefined()
    
    expect(DEFAULT_PERFORMANCE_THRESHOLDS.rendering.maxDuration).toBe(16)
    expect(DEFAULT_PERFORMANCE_THRESHOLDS.parsing.maxDuration).toBe(2000)
    expect(DEFAULT_OPTIMIZATION_STRATEGIES.length).toBeGreaterThan(0)
    expect(DEFAULT_KEYBOARD_SHORTCUTS.length).toBeGreaterThan(0)
    expect(DEFAULT_TOUCH_GESTURES.length).toBeGreaterThan(0)
  })
})

describe('Performance Monitor', () => {
  let monitor: ReturnType<typeof createPerformanceMonitor>

  beforeEach(() => {
    monitor = createPerformanceMonitor()
  })

  test('should create performance monitor', () => {
    expect(monitor).toBeDefined()
  })

  test('should start and stop monitoring', () => {
    monitor.startMonitoring()
    expect(monitor).toBeDefined()
    
    monitor.stopMonitoring()
    expect(monitor).toBeDefined()
  })

  test('should record performance metrics', () => {
    const metricId = monitor.recordMetric('rendering', 15, { action: 'test' })
    expect(metricId).toBeDefined()
    
    const metrics = monitor.getMetrics('rendering')
    expect(metrics.length).toBeGreaterThan(0)
    expect(metrics[0].type).toBe('rendering')
    expect(metrics[0].duration).toBe(15)
  })

  test('should get performance statistics', () => {
    monitor.recordMetric('rendering', 10)
    monitor.recordMetric('rendering', 20)
    monitor.recordMetric('rendering', 30)
    
    const stats = monitor.getPerformanceStats('rendering')
    expect(stats.totalMetrics).toBe(3)
    expect(stats.averageDuration).toBe(20)
    expect(stats.maxDuration).toBe(30)
    expect(stats.minDuration).toBe(10)
  })

  test('should get hardware acceleration status', () => {
    const hardware = monitor.getHardwareAcceleration()
    expect(hardware).toBeDefined()
    expect(typeof hardware.enabled).toBe('boolean')
  })

  test('should get memory manager status', () => {
    const memory = monitor.getMemoryManager()
    expect(memory).toBeDefined()
    expect(typeof memory.totalMemory).toBe('number')
    expect(typeof memory.usedMemory).toBe('number')
  })

  test('should get battery manager status', () => {
    const battery = monitor.getBatteryManager()
    expect(battery).toBeDefined()
    expect(typeof battery.level).toBe('number')
  })

  test('should get network manager status', () => {
    const network = monitor.getNetworkManager()
    expect(network).toBeDefined()
    expect(network.status).toBeDefined()
  })

  test('should get and update configuration', () => {
    const config = monitor.getConfig()
    expect(config).toBeDefined()
    expect(config.enableMetrics).toBe(true)
    
    monitor.updateConfig({ enableMetrics: false })
    const updatedConfig = monitor.getConfig()
    expect(updatedConfig.enableMetrics).toBe(false)
  })

  test('should add and remove optimization strategies', () => {
    const strategy = {
      id: 'test-strategy',
      name: 'Test Strategy',
      type: 'memory_management' as const,
      platform: ['web' as const],
      conditions: [{ metric: 'memoryUsage', operator: 'gt' as const, value: 100 }],
      actions: [{ type: 'clear_cache' as const, parameters: {} }],
      priority: 1,
      enabled: true
    }
    
    monitor.addOptimizationStrategy(strategy)
    const strategies = monitor.getOptimizationStrategies()
    expect(strategies.some(s => s.id === 'test-strategy')).toBe(true)
    
    monitor.removeOptimizationStrategy('test-strategy')
    const updatedStrategies = monitor.getOptimizationStrategies()
    expect(updatedStrategies.some(s => s.id === 'test-strategy')).toBe(false)
  })

  test('should clear old metrics', () => {
    monitor.recordMetric('rendering', 10)
    monitor.recordMetric('rendering', 20)
    
    const beforeClear = monitor.getMetrics()
    expect(beforeClear.length).toBeGreaterThan(0)
    
    monitor.clearOldMetrics(0) // Clear all metrics
    const afterClear = monitor.getMetrics()
    expect(afterClear.length).toBe(0)
  })
})

describe('File System Manager', () => {
  let fileSystem: ReturnType<typeof createFileSystemManager>

  beforeEach(() => {
    fileSystem = createFileSystemManager()
  })

  test('should create file system manager', () => {
    expect(fileSystem).toBeDefined()
  })

  test('should read file', async () => {
    const data = await fileSystem.readFile('/test/file.txt')
    expect(data).toBeInstanceOf(Buffer)
  })

  test('should write file', async () => {
    const data = Buffer.from('test content')
    await expect(fileSystem.writeFile('/test/file.txt', data)).resolves.not.toThrow()
  })

  test('should delete file', async () => {
    await expect(fileSystem.deleteFile('/test/file.txt')).resolves.not.toThrow()
  })

  test('should copy file', async () => {
    await expect(fileSystem.copyFile('/source.txt', '/destination.txt')).resolves.not.toThrow()
  })

  test('should move file', async () => {
    await expect(fileSystem.moveFile('/source.txt', '/destination.txt')).resolves.not.toThrow()
  })

  test('should read directory', async () => {
    const entries = await fileSystem.readDirectory('/test')
    expect(Array.isArray(entries)).toBe(true)
  })

  test('should create directory', async () => {
    await expect(fileSystem.createDirectory('/test/newdir')).resolves.not.toThrow()
  })

  test('should delete directory', async () => {
    await expect(fileSystem.deleteDirectory('/test/dir')).resolves.not.toThrow()
  })

  test('should get file info', async () => {
    const info = await fileSystem.getFileInfo('/test/file.txt')
    expect(info).toBeDefined()
    expect(info.path).toBe('/test/file.txt')
    expect(info.type).toBe('file')
  })

  test('should check if file exists', async () => {
    const exists = await fileSystem.exists('/test/file.txt')
    expect(typeof exists).toBe('boolean')
  })

  test('should watch and unwatch file', async () => {
    const callback = (event: any) => console.log('File changed:', event)
    
    await expect(fileSystem.watchFile('/test/file.txt', callback)).resolves.not.toThrow()
    await expect(fileSystem.unwatchFile('/test/file.txt')).resolves.not.toThrow()
  })

  test('should import ebook', async () => {
    const result = await fileSystem.importEbook('/test/book.epub')
    expect(result).toBeDefined()
    expect(typeof result.success).toBe('boolean')
  })

  test('should export data', async () => {
    const data = { test: 'data' }
    await expect(fileSystem.exportData(data, '/test/export.json', 'json')).resolves.not.toThrow()
  })

  test('should create and manage windows', () => {
    const window = fileSystem.createWindow(
      'reading',
      'Test Window',
      { bookId: 'test-book' }
    )
    
    expect(window).toBeDefined()
    expect(window.id).toBeDefined()
    expect(window.type).toBe('reading')
    expect(window.title).toBe('Test Window')
    
    const windows = fileSystem.getWindows()
    expect(windows.length).toBeGreaterThan(0)
    
    const activeWindow = fileSystem.getActiveWindow()
    expect(activeWindow).toBeDefined()
    
    fileSystem.closeWindow(window.id)
    const updatedWindows = fileSystem.getWindows()
    expect(updatedWindows.length).toBe(0)
  })
})

describe('Touch Gesture Manager', () => {
  let gestureManager: ReturnType<typeof createTouchGestureManager>

  beforeEach(() => {
    gestureManager = createTouchGestureManager()
  })

  test('should create touch gesture manager', () => {
    expect(gestureManager).toBeDefined()
  })

  test('should register and unregister gestures', () => {
    const gesture = {
      id: 'test-gesture',
      type: 'tap' as const,
      platform: 'mobile' as const,
      enabled: true,
      sensitivity: 0.5,
      customActions: []
    }
    
    gestureManager.registerGesture(gesture)
    const gestures = gestureManager.getGestures()
    expect(gestures.some(g => g.id === 'test-gesture')).toBe(true)
    
    gestureManager.unregisterGesture('test-gesture')
    const updatedGestures = gestureManager.getGestures()
    expect(updatedGestures.some(g => g.id === 'test-gesture')).toBe(false)
  })

  test('should update gesture', () => {
    const gesture = {
      id: 'test-gesture',
      type: 'tap' as const,
      platform: 'mobile' as const,
      enabled: true,
      sensitivity: 0.5,
      customActions: []
    }
    
    gestureManager.registerGesture(gesture)
    gestureManager.updateGesture('test-gesture', { sensitivity: 0.8 })
    
    const gestures = gestureManager.getGestures()
    const updatedGesture = gestures.find(g => g.id === 'test-gesture')
    expect(updatedGesture?.sensitivity).toBe(0.8)
  })

  test('should create custom gesture', () => {
    const customGesture = gestureManager.createCustomGesture(
      'custom-swipe',
      { type: 'sequence', gestures: ['swipe-left', 'swipe-right'] },
      'custom-action',
      { parameter: 'value' }
    )
    
    expect(customGesture).toBeDefined()
    expect(customGesture.type).toBe('custom')
    expect(customGesture.customActions.length).toBe(1)
  })

  test('should start and stop gesture recognition', () => {
    const element = document.createElement('div')
    
    expect(() => gestureManager.startGestureRecognition(element)).not.toThrow()
    expect(() => gestureManager.stopGestureRecognition(element)).not.toThrow()
  })
})

describe('Responsive Manager', () => {
  let responsiveManager: ReturnType<typeof createResponsiveManager>

  beforeEach(() => {
    responsiveManager = createResponsiveManager()
  })

  test('should create responsive manager', () => {
    expect(responsiveManager).toBeDefined()
  })

  test('should manage breakpoints', () => {
    const breakpoint = {
      name: 'custom',
      minWidth: 1200,
      platform: ['desktop' as const]
    }
    
    responsiveManager.addBreakpoint(breakpoint)
    const breakpoints = responsiveManager.getBreakpoints()
    expect(breakpoints.some(bp => bp.name === 'custom')).toBe(true)
    
    responsiveManager.removeBreakpoint('custom')
    const updatedBreakpoints = responsiveManager.getBreakpoints()
    expect(updatedBreakpoints.some(bp => bp.name === 'custom')).toBe(false)
  })

  test('should get current breakpoint', () => {
    const currentBreakpoint = responsiveManager.getCurrentBreakpoint()
    expect(currentBreakpoint).toBeDefined()
  })

  test('should manage layouts', () => {
    const layout = {
      breakpoint: 'custom',
      columns: 4,
      spacing: 40,
      fontSize: 22,
      lineHeight: 1.8
    }
    
    responsiveManager.setLayout('custom', layout)
    const retrievedLayout = responsiveManager.getLayout('custom')
    expect(retrievedLayout).toBeDefined()
    expect(retrievedLayout?.columns).toBe(4)
  })

  test('should manage component configurations', () => {
    const config = {
      name: 'test-component',
      breakpoint: 'mobile',
      properties: { fontSize: 16, margin: 8 }
    }
    
    responsiveManager.setComponentConfig('test-component', 'mobile', config)
    const retrievedConfig = responsiveManager.getComponentConfig('test-component', 'mobile')
    expect(retrievedConfig).toBeDefined()
    expect(retrievedConfig?.properties.fontSize).toBe(16)
  })

  test('should detect device type', () => {
    expect(typeof responsiveManager.isMobile()).toBe('boolean')
    expect(typeof responsiveManager.isTablet()).toBe('boolean')
    expect(typeof responsiveManager.isDesktop()).toBe('boolean')
  })

  test('should get screen size and orientation', () => {
    const screenSize = responsiveManager.getScreenSize()
    expect(screenSize).toBeDefined()
    expect(typeof screenSize.width).toBe('number')
    expect(typeof screenSize.height).toBe('number')
    
    const orientation = responsiveManager.getOrientation()
    expect(['portrait', 'landscape']).toContain(orientation)
  })
})

describe('Offline Manager', () => {
  let offlineManager: ReturnType<typeof createOfflineManager>

  beforeEach(() => {
    offlineManager = createOfflineManager()
  })

  test('should create offline manager', () => {
    expect(offlineManager).toBeDefined()
  })

  test('should store and retrieve data', async () => {
    const testData = { key: 'value', number: 42 }
    
    await offlineManager.storeData('test-key', testData)
    const retrievedData = await offlineManager.getData('test-key')
    expect(retrievedData).toEqual(testData)
  })

  test('should remove data', async () => {
    await offlineManager.storeData('test-key', 'test-value')
    await offlineManager.removeData('test-key')
    const retrievedData = await offlineManager.getData('test-key')
    expect(retrievedData).toBeNull()
  })

  test('should clear all data', async () => {
    await offlineManager.storeData('key1', 'value1')
    await offlineManager.storeData('key2', 'value2')
    await offlineManager.clearAllData()
    
    const data1 = await offlineManager.getData('key1')
    const data2 = await offlineManager.getData('key2')
    expect(data1).toBeNull()
    expect(data2).toBeNull()
  })

  test('should manage sync', () => {
    expect(offlineManager.isSyncEnabled()).toBe(true)
    
    offlineManager.disableSync()
    expect(offlineManager.isSyncEnabled()).toBe(false)
    
    offlineManager.enableSync()
    expect(offlineManager.isSyncEnabled()).toBe(true)
  })

  test('should sync data', async () => {
    const result = await offlineManager.syncData()
    expect(result).toBeDefined()
    expect(typeof result.success).toBe('boolean')
    expect(typeof result.syncedItems).toBe('number')
    expect(typeof result.failedItems).toBe('number')
    expect(Array.isArray(result.errors)).toBe(true)
  })

  test('should manage action queue', () => {
    const action = {
      id: 'test-action',
      type: 'test',
      data: { test: 'data' },
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      priority: 1
    }
    
    expect(offlineManager.getQueueSize()).toBe(0)
    
    offlineManager.addToQueue(action)
    expect(offlineManager.getQueueSize()).toBe(1)
    
    offlineManager.clearQueue()
    expect(offlineManager.getQueueSize()).toBe(0)
  })
})

describe('Battery Optimizer', () => {
  let batteryOptimizer: ReturnType<typeof createBatteryOptimizer>

  beforeEach(() => {
    batteryOptimizer = createBatteryOptimizer()
  })

  test('should create battery optimizer', () => {
    expect(batteryOptimizer).toBeDefined()
  })

  test('should get battery level', async () => {
    const level = await batteryOptimizer.getBatteryLevel()
    expect(typeof level).toBe('number')
    expect(level).toBeGreaterThanOrEqual(0)
    expect(level).toBeLessThanOrEqual(100)
  })

  test('should check charging status', async () => {
    const isCharging = await batteryOptimizer.isCharging()
    expect(typeof isCharging).toBe('boolean')
  })

  test('should get battery time remaining', async () => {
    const timeRemaining = await batteryOptimizer.getBatteryTimeRemaining()
    expect(timeRemaining === null || typeof timeRemaining === 'number').toBe(true)
  })

  test('should manage power mode', () => {
    expect(batteryOptimizer.getPowerMode()).toBe('balanced')
    
    batteryOptimizer.setPowerMode('performance')
    expect(batteryOptimizer.getPowerMode()).toBe('performance')
    
    batteryOptimizer.setPowerMode('power_saver')
    expect(batteryOptimizer.getPowerMode()).toBe('power_saver')
  })

  test('should manage battery saver', () => {
    expect(batteryOptimizer.isBatterySaverEnabled()).toBe(false)
    
    batteryOptimizer.enableBatterySaver()
    expect(batteryOptimizer.isBatterySaverEnabled()).toBe(true)
    
    batteryOptimizer.disableBatterySaver()
    expect(batteryOptimizer.isBatterySaverEnabled()).toBe(false)
  })

  test('should optimize and restore performance', () => {
    expect(() => batteryOptimizer.optimizeForBattery()).not.toThrow()
    expect(() => batteryOptimizer.restorePerformance()).not.toThrow()
  })
})

describe('Performance Optimization Performance', () => {
  test('should meet performance requirements', () => {
    const startTime = performance.now()
    
    const monitor = createPerformanceMonitor()
    const fileSystem = createFileSystemManager()
    const gestureManager = createTouchGestureManager()
    const responsiveManager = createResponsiveManager()
    const offlineManager = createOfflineManager()
    const batteryOptimizer = createBatteryOptimizer()
    
    const endTime = performance.now()
    const creationTime = endTime - startTime
    
    // Should create all managers quickly
    expect(creationTime).toBeLessThan(100)
  })

  test('should handle memory efficiently', () => {
    const initialMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    
    const monitor = createPerformanceMonitor()
    const fileSystem = createFileSystemManager()
    const gestureManager = createTouchGestureManager()
    const responsiveManager = createResponsiveManager()
    const offlineManager = createOfflineManager()
    const batteryOptimizer = createBatteryOptimizer()
    
    const currentMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    const memoryIncrease = currentMemory - initialMemory
    
    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(1024 * 1024) // Less than 1MB
  })
})
