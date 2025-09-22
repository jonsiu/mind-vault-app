/**
 * Performance Monitor
 * Monitors and optimizes performance across all platforms
 */

import { 
  PerformanceMetrics,
  PerformanceConfig,
  PerformanceThresholds,
  OptimizationStrategy,
  HardwareAcceleration,
  MemoryManager,
  BatteryManager,
  NetworkManager,
  PerformanceType,
  Platform,
  NetworkStatus,
  MemoryPressure,
  PowerMode,
  OptimizationLevel,
  DEFAULT_PERFORMANCE_THRESHOLDS,
  DEFAULT_OPTIMIZATION_STRATEGIES
} from './types'
import { v4 as uuidv4 } from 'uuid'

export class PerformanceMonitor {
  private config: PerformanceConfig
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private optimizationStrategies: Map<string, OptimizationStrategy> = new Map()
  private hardwareAcceleration: HardwareAcceleration
  private memoryManager: MemoryManager
  private batteryManager: BatteryManager
  private networkManager: NetworkManager
  private platform: Platform
  private isMonitoring: boolean = false
  private monitoringInterval: NodeJS.Timeout | null = null

  constructor(config?: Partial<PerformanceConfig>) {
    this.platform = this.detectPlatform()
    this.config = {
      enableMetrics: true,
      enableHardwareAcceleration: true,
      enableMemoryOptimization: true,
      enableBatteryOptimization: true,
      maxMemoryUsage: 500 * 1024 * 1024, // 500MB
      maxCpuUsage: 80, // 80%
      maxBatteryDrain: 5, // 5% per hour
      performanceThresholds: DEFAULT_PERFORMANCE_THRESHOLDS,
      optimizationStrategies: DEFAULT_OPTIMIZATION_STRATEGIES,
      ...config
    }

    this.initializeServices()
    this.setupOptimizationStrategies()
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics()
      this.checkPerformanceThresholds()
      this.applyOptimizations()
    }, 1000) // Monitor every second

    console.log('Performance monitoring started')
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('Performance monitoring stopped')
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    type: PerformanceType,
    duration: number,
    context?: Record<string, unknown>
  ): string {
    const metric: PerformanceMetrics = {
      id: uuidv4(),
      type,
      platform: this.platform,
      timestamp: new Date(),
      duration,
      memoryUsage: this.getCurrentMemoryUsage(),
      cpuUsage: this.getCurrentCpuUsage(),
      gpuUsage: this.getCurrentGpuUsage(),
      batteryLevel: this.batteryManager.level,
      networkStatus: this.networkManager.status,
      context: {
        ...context,
        action: context?.action || type
      }
    }

    this.metrics.set(metric.id, metric)
    this.checkPerformanceThresholds()

    return metric.id
  }

  /**
   * Get performance metrics
   */
  getMetrics(
    type?: PerformanceType,
    limit: number = 100
  ): PerformanceMetrics[] {
    let metrics = Array.from(this.metrics.values())

    if (type) {
      metrics = metrics.filter(m => m.type === type)
    }

    return metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(type?: PerformanceType): {
    averageDuration: number
    maxDuration: number
    minDuration: number
    totalMetrics: number
    memoryUsage: number
    cpuUsage: number
  } {
    const metrics = this.getMetrics(type)
    
    if (metrics.length === 0) {
      return {
        averageDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        totalMetrics: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    }

    const durations = metrics.map(m => m.duration)
    const memoryUsages = metrics.map(m => m.memoryUsage)
    const cpuUsages = metrics.map(m => m.cpuUsage || 0)

    return {
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      totalMetrics: metrics.length,
      memoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
      cpuUsage: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length
    }
  }

  /**
   * Get hardware acceleration status
   */
  getHardwareAcceleration(): HardwareAcceleration {
    return { ...this.hardwareAcceleration }
  }

  /**
   * Enable/disable hardware acceleration
   */
  setHardwareAcceleration(enabled: boolean): void {
    this.hardwareAcceleration.enabled = enabled
    this.config.enableHardwareAcceleration = enabled
    
    if (enabled) {
      this.enableHardwareAcceleration()
    } else {
      this.disableHardwareAcceleration()
    }
  }

  /**
   * Get memory manager status
   */
  getMemoryManager(): MemoryManager {
    return { ...this.memoryManager }
  }

  /**
   * Get battery manager status
   */
  getBatteryManager(): BatteryManager {
    return { ...this.batteryManager }
  }

  /**
   * Get network manager status
   */
  getNetworkManager(): NetworkManager {
    return { ...this.networkManager }
  }

  /**
   * Get configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Add optimization strategy
   */
  addOptimizationStrategy(strategy: OptimizationStrategy): void {
    this.optimizationStrategies.set(strategy.id, strategy)
  }

  /**
   * Remove optimization strategy
   */
  removeOptimizationStrategy(strategyId: string): void {
    this.optimizationStrategies.delete(strategyId)
  }

  /**
   * Get optimization strategies
   */
  getOptimizationStrategies(): OptimizationStrategy[] {
    return Array.from(this.optimizationStrategies.values())
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    
    for (const [id, metric] of this.metrics.entries()) {
      if (metric.timestamp < cutoffTime) {
        this.metrics.delete(id)
      }
    }
  }

  /**
   * Detect platform
   */
  private detectPlatform(): Platform {
    if (typeof window === 'undefined') return 'desktop'
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return /ipad/i.test(userAgent) ? 'tablet' : 'mobile'
    }
    
    return 'web'
  }

  /**
   * Initialize services
   */
  private initializeServices(): void {
    this.hardwareAcceleration = {
      enabled: this.config.enableHardwareAcceleration,
      gpuAcceleration: this.checkGpuAcceleration(),
      webglSupport: this.checkWebglSupport(),
      webgpuSupport: this.checkWebgpuSupport(),
      canvasAcceleration: this.checkCanvasAcceleration(),
      videoAcceleration: this.checkVideoAcceleration(),
      audioAcceleration: this.checkAudioAcceleration()
    }

    this.memoryManager = {
      totalMemory: this.getTotalMemory(),
      usedMemory: this.getCurrentMemoryUsage(),
      availableMemory: this.getAvailableMemory(),
      memoryPressure: this.getMemoryPressure(),
      gcFrequency: 0,
      memoryLeaks: [],
      optimizationSuggestions: []
    }

    this.batteryManager = {
      level: this.getBatteryLevel(),
      charging: this.isCharging(),
      discharging: !this.isCharging(),
      timeRemaining: this.getBatteryTimeRemaining(),
      powerMode: this.getPowerMode(),
      optimizationLevel: this.getOptimizationLevel()
    }

    this.networkManager = {
      status: this.getNetworkStatus(),
      connectionType: this.getConnectionType(),
      bandwidth: this.getBandwidth(),
      latency: this.getLatency(),
      dataUsage: this.getDataUsage(),
      offlineQueue: []
    }
  }

  /**
   * Setup optimization strategies
   */
  private setupOptimizationStrategies(): void {
    this.config.optimizationStrategies.forEach(strategy => {
      this.optimizationStrategies.set(strategy.id, strategy)
    })
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    // Update memory manager
    this.memoryManager.usedMemory = this.getCurrentMemoryUsage()
    this.memoryManager.availableMemory = this.getAvailableMemory()
    this.memoryManager.memoryPressure = this.getMemoryPressure()

    // Update battery manager
    this.batteryManager.level = this.getBatteryLevel()
    this.batteryManager.charging = this.isCharging()
    this.batteryManager.discharging = !this.isCharging()
    this.batteryManager.timeRemaining = this.getBatteryTimeRemaining()

    // Update network manager
    this.networkManager.status = this.getNetworkStatus()
    this.networkManager.bandwidth = this.getBandwidth()
    this.networkManager.latency = this.getLatency()
  }

  /**
   * Check performance thresholds
   */
  private checkPerformanceThresholds(): void {
    const recentMetrics = this.getMetrics(undefined, 10)
    
    for (const metric of recentMetrics) {
      const threshold = this.config.performanceThresholds[metric.type]
      if (!threshold) continue

      if (metric.duration > threshold.maxDuration) {
        console.warn(`Performance threshold exceeded for ${metric.type}: ${metric.duration}ms > ${threshold.maxDuration}ms`)
      }

      if (metric.memoryUsage > threshold.maxMemoryUsage) {
        console.warn(`Memory threshold exceeded for ${metric.type}: ${metric.memoryUsage} bytes > ${threshold.maxMemoryUsage} bytes`)
      }
    }
  }

  /**
   * Apply optimizations
   */
  private applyOptimizations(): void {
    const strategies = Array.from(this.optimizationStrategies.values())
      .filter(s => s.enabled && s.platform.includes(this.platform))
      .sort((a, b) => a.priority - b.priority)

    for (const strategy of strategies) {
      if (this.shouldApplyStrategy(strategy)) {
        this.executeStrategy(strategy)
      }
    }
  }

  /**
   * Check if strategy should be applied
   */
  private shouldApplyStrategy(strategy: OptimizationStrategy): boolean {
    return strategy.conditions.every(condition => {
      const value = this.getMetricValue(condition.metric)
      return this.evaluateCondition(value, condition.operator, condition.value)
    })
  }

  /**
   * Execute optimization strategy
   */
  private executeStrategy(strategy: OptimizationStrategy): void {
    console.log(`Applying optimization strategy: ${strategy.name}`)
    
    for (const action of strategy.actions) {
      setTimeout(() => {
        this.executeAction(action)
      }, action.delay || 0)
    }
  }

  /**
   * Execute optimization action
   */
  private executeAction(action: any): void {
    switch (action.type) {
      case 'clear_cache':
        this.clearCache()
        break
      case 'reduce_quality':
        this.reduceQuality(action.parameters)
        break
      case 'pause_animations':
        this.pauseAnimations()
        break
      case 'limit_concurrent_requests':
        this.limitConcurrentRequests(action.parameters)
        break
      case 'enable_lazy_loading':
        this.enableLazyLoading(action.parameters)
        break
      case 'compress_data':
        this.compressData(action.parameters)
        break
      case 'reduce_frequency':
        this.reduceFrequency(action.parameters)
        break
      case 'disable_features':
        this.disableFeatures(action.parameters)
        break
    }
  }

  /**
   * Get metric value
   */
  private getMetricValue(metric: string): number {
    switch (metric) {
      case 'memoryUsage':
        return this.memoryManager.usedMemory
      case 'cpuUsage':
        return this.getCurrentCpuUsage()
      case 'batteryLevel':
        return this.batteryManager.level
      case 'networkStatus':
        return this.getNetworkStatusValue()
      default:
        return 0
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold
      case 'lt': return value < threshold
      case 'eq': return value === threshold
      case 'gte': return value >= threshold
      case 'lte': return value <= threshold
      default: return false
    }
  }

  // Hardware acceleration methods
  private checkGpuAcceleration(): boolean {
    if (typeof window === 'undefined') return false
    return !!(window as any).chrome && !!(window as any).chrome.runtime
  }

  private checkWebglSupport(): boolean {
    if (typeof window === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  }

  private checkWebgpuSupport(): boolean {
    if (typeof window === 'undefined') return false
    return 'gpu' in navigator
  }

  private checkCanvasAcceleration(): boolean {
    if (typeof window === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      return !!(ctx as any).getContextAttributes?.()?.willReadFrequently === false
    } catch {
      return false
    }
  }

  private checkVideoAcceleration(): boolean {
    if (typeof window === 'undefined') return false
    return 'requestVideoFrameCallback' in HTMLVideoElement.prototype
  }

  private checkAudioAcceleration(): boolean {
    if (typeof window === 'undefined') return false
    return 'AudioContext' in window || 'webkitAudioContext' in window
  }

  private enableHardwareAcceleration(): void {
    // Enable hardware acceleration
    console.log('Hardware acceleration enabled')
  }

  private disableHardwareAcceleration(): void {
    // Disable hardware acceleration
    console.log('Hardware acceleration disabled')
  }

  // Memory management methods
  private getTotalMemory(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.jsHeapSizeLimit
    }
    return 1024 * 1024 * 1024 // 1GB default
  }

  private getCurrentMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  private getAvailableMemory(): number {
    return this.getTotalMemory() - this.getCurrentMemoryUsage()
  }

  private getMemoryPressure(): MemoryPressure {
    const usage = this.getCurrentMemoryUsage()
    const total = this.getTotalMemory()
    const percentage = (usage / total) * 100

    if (percentage > 90) return 'critical'
    if (percentage > 75) return 'high'
    if (percentage > 50) return 'medium'
    return 'low'
  }

  // Battery management methods
  private getBatteryLevel(): number {
    if ('getBattery' in navigator) {
      return (navigator as any).getBattery().then((battery: any) => battery.level * 100)
    }
    return 100 // Default to full battery
  }

  private isCharging(): boolean {
    if ('getBattery' in navigator) {
      return (navigator as any).getBattery().then((battery: any) => battery.charging)
    }
    return true // Default to charging
  }

  private getBatteryTimeRemaining(): number | undefined {
    // This would require battery API access
    return undefined
  }

  private getPowerMode(): PowerMode {
    // This would require platform-specific APIs
    return 'balanced'
  }

  private getOptimizationLevel(): OptimizationLevel {
    const batteryLevel = this.getBatteryLevel()
    if (batteryLevel < 20) return 'aggressive'
    if (batteryLevel < 50) return 'moderate'
    if (batteryLevel < 80) return 'light'
    return 'none'
  }

  // Network management methods
  private getNetworkStatus(): NetworkStatus {
    if (typeof navigator !== 'undefined') {
      if (!navigator.onLine) return 'offline'
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          return 'slow'
        }
        if (connection.effectiveType === '4g') {
          return 'fast'
        }
      }
    }
    return 'online'
  }

  private getConnectionType(): string {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      return (navigator as any).connection.type || 'unknown'
    }
    return 'unknown'
  }

  private getBandwidth(): number {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      return (navigator as any).connection.downlink || 0
    }
    return 0
  }

  private getLatency(): number {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      return (navigator as any).connection.rtt || 0
    }
    return 0
  }

  private getDataUsage(): any {
    return {
      total: 0,
      today: 0,
      thisMonth: 0,
      byFeature: {}
    }
  }

  private getNetworkStatusValue(): number {
    const status = this.getNetworkStatus()
    switch (status) {
      case 'offline': return 0
      case 'slow': return 1
      case 'online': return 2
      case 'fast': return 3
      default: return 2
    }
  }

  // CPU monitoring methods
  private getCurrentCpuUsage(): number {
    // This would require platform-specific APIs
    return 0
  }

  private getCurrentGpuUsage(): number {
    // This would require platform-specific APIs
    return 0
  }

  // Optimization action implementations
  private clearCache(): void {
    console.log('Clearing cache...')
    // Implementation would clear various caches
  }

  private reduceQuality(parameters: any): void {
    console.log('Reducing quality...', parameters)
    // Implementation would reduce image/video quality
  }

  private pauseAnimations(): void {
    console.log('Pausing animations...')
    // Implementation would pause CSS animations
  }

  private limitConcurrentRequests(parameters: any): void {
    console.log('Limiting concurrent requests...', parameters)
    // Implementation would limit network requests
  }

  private enableLazyLoading(parameters: any): void {
    console.log('Enabling lazy loading...', parameters)
    // Implementation would enable lazy loading
  }

  private compressData(parameters: any): void {
    console.log('Compressing data...', parameters)
    // Implementation would compress data
  }

  private reduceFrequency(parameters: any): void {
    console.log('Reducing frequency...', parameters)
    // Implementation would reduce update frequency
  }

  private disableFeatures(parameters: any): void {
    console.log('Disabling features...', parameters)
    // Implementation would disable non-essential features
  }
}

/**
 * Create performance monitor instance
 */
export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config)
}
