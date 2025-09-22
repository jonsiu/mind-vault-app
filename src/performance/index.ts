/**
 * Performance Optimization Exports
 * Main entry point for cross-platform performance optimization
 */

export * from './types'
export * from './performance-monitor'
export * from './file-system'
export * from './mobile-optimization'

// Re-export main functions for convenience
export { createPerformanceMonitor } from './performance-monitor'
export { createFileSystemManager } from './file-system'
export { 
  createTouchGestureManager,
  createResponsiveManager,
  createOfflineManager,
  createBatteryOptimizer
} from './mobile-optimization'

// Re-export constants
export { 
  DEFAULT_PERFORMANCE_THRESHOLDS,
  DEFAULT_OPTIMIZATION_STRATEGIES,
  DEFAULT_KEYBOARD_SHORTCUTS,
  DEFAULT_TOUCH_GESTURES
} from './types'
