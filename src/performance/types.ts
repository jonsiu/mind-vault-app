/**
 * Performance Optimization Types
 * Core types for cross-platform performance optimization
 */

export interface PerformanceMetrics {
  id: string
  type: PerformanceType
  platform: Platform
  timestamp: Date
  duration: number
  memoryUsage: number
  cpuUsage?: number
  gpuUsage?: number
  batteryLevel?: number
  networkStatus: NetworkStatus
  context: PerformanceContext
}

export type PerformanceType = 
  | 'rendering'
  | 'parsing'
  | 'loading'
  | 'navigation'
  | 'search'
  | 'export'
  | 'sync'
  | 'ai_request'

export type Platform = 
  | 'web'
  | 'desktop'
  | 'mobile'
  | 'tablet'

export type NetworkStatus = 
  | 'online'
  | 'offline'
  | 'slow'
  | 'fast'

export interface PerformanceContext {
  bookId?: string
  sectionId?: string
  highlightId?: string
  noteId?: string
  userId?: string
  action?: string
  metadata?: Record<string, unknown>
}

export interface PerformanceConfig {
  enableMetrics: boolean
  enableHardwareAcceleration: boolean
  enableMemoryOptimization: boolean
  enableBatteryOptimization: boolean
  maxMemoryUsage: number
  maxCpuUsage: number
  maxBatteryDrain: number
  performanceThresholds: PerformanceThresholds
  optimizationStrategies: OptimizationStrategy[]
}

export interface PerformanceThresholds {
  rendering: {
    maxDuration: number
    maxMemoryUsage: number
  }
  parsing: {
    maxDuration: number
    maxMemoryUsage: number
  }
  loading: {
    maxDuration: number
    maxMemoryUsage: number
  }
  navigation: {
    maxDuration: number
  }
  search: {
    maxDuration: number
    maxMemoryUsage: number
  }
  export: {
    maxDuration: number
    maxMemoryUsage: number
  }
  sync: {
    maxDuration: number
    maxMemoryUsage: number
  }
  ai_request: {
    maxDuration: number
    maxMemoryUsage: number
  }
}

export interface OptimizationStrategy {
  id: string
  name: string
  type: OptimizationType
  platform: Platform[]
  conditions: OptimizationCondition[]
  actions: OptimizationAction[]
  priority: number
  enabled: boolean
}

export type OptimizationType = 
  | 'memory_management'
  | 'rendering_optimization'
  | 'lazy_loading'
  | 'caching'
  | 'compression'
  | 'battery_optimization'
  | 'network_optimization'
  | 'cpu_optimization'

export interface OptimizationCondition {
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  value: number
  duration?: number
}

export interface OptimizationAction {
  type: ActionType
  parameters: Record<string, unknown>
  delay?: number
}

export type ActionType = 
  | 'clear_cache'
  | 'reduce_quality'
  | 'pause_animations'
  | 'limit_concurrent_requests'
  | 'enable_lazy_loading'
  | 'compress_data'
  | 'reduce_frequency'
  | 'disable_features'

export interface HardwareAcceleration {
  enabled: boolean
  gpuAcceleration: boolean
  webglSupport: boolean
  webgpuSupport: boolean
  canvasAcceleration: boolean
  videoAcceleration: boolean
  audioAcceleration: boolean
}

export interface MemoryManager {
  totalMemory: number
  usedMemory: number
  availableMemory: number
  memoryPressure: MemoryPressure
  gcFrequency: number
  memoryLeaks: MemoryLeak[]
  optimizationSuggestions: string[]
}

export type MemoryPressure = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export interface MemoryLeak {
  id: string
  type: string
  size: number
  location: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface BatteryManager {
  level: number
  charging: boolean
  discharging: boolean
  timeRemaining?: number
  powerMode: PowerMode
  optimizationLevel: OptimizationLevel
}

export type PowerMode = 
  | 'performance'
  | 'balanced'
  | 'power_saver'

export type OptimizationLevel = 
  | 'none'
  | 'light'
  | 'moderate'
  | 'aggressive'

export interface NetworkManager {
  status: NetworkStatus
  connectionType: ConnectionType
  bandwidth: number
  latency: number
  dataUsage: DataUsage
  offlineQueue: OfflineAction[]
}

export type ConnectionType = 
  | 'wifi'
  | 'cellular'
  | 'ethernet'
  | 'bluetooth'
  | 'unknown'

export interface DataUsage {
  total: number
  today: number
  thisMonth: number
  byFeature: Record<string, number>
}

export interface OfflineAction {
  id: string
  type: string
  data: unknown
  timestamp: Date
  retryCount: number
  maxRetries: number
}

export interface TouchGesture {
  id: string
  type: TouchGestureType
  platform: Platform
  enabled: boolean
  sensitivity: number
  customActions: CustomAction[]
}

export type TouchGestureType = 
  | 'tap'
  | 'double_tap'
  | 'long_press'
  | 'swipe'
  | 'pinch'
  | 'rotate'
  | 'pan'
  | 'custom'

export interface CustomAction {
  gesture: string
  action: string
  parameters: Record<string, unknown>
}

export interface ResponsiveConfig {
  breakpoints: Breakpoint[]
  layouts: LayoutConfig[]
  components: ComponentConfig[]
}

export interface Breakpoint {
  name: string
  minWidth: number
  maxWidth?: number
  platform: Platform[]
}

export interface LayoutConfig {
  breakpoint: string
  columns: number
  spacing: number
  fontSize: number
  lineHeight: number
}

export interface ComponentConfig {
  name: string
  breakpoint: string
  properties: Record<string, unknown>
}

export interface WindowManager {
  windows: Window[]
  activeWindow: string | null
  windowHistory: WindowHistory[]
  multiWindowEnabled: boolean
  windowSync: boolean
}

export interface Window {
  id: string
  type: WindowType
  title: string
  content: WindowContent
  position: WindowPosition
  size: WindowSize
  state: WindowState
  createdAt: Date
  updatedAt: Date
}

export type WindowType = 
  | 'reading'
  | 'notes'
  | 'highlights'
  | 'search'
  | 'settings'
  | 'ai_chat'

export interface WindowContent {
  bookId?: string
  sectionId?: string
  highlightId?: string
  noteId?: string
  url?: string
  data?: Record<string, unknown>
}

export interface WindowPosition {
  x: number
  y: number
  zIndex: number
}

export interface WindowSize {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export type WindowState = 
  | 'normal'
  | 'minimized'
  | 'maximized'
  | 'fullscreen'
  | 'hidden'

export interface WindowHistory {
  windowId: string
  action: string
  timestamp: Date
  data?: Record<string, unknown>
}

export interface KeyboardShortcut {
  id: string
  key: string
  modifiers: string[]
  action: string
  platform: Platform[]
  enabled: boolean
  description: string
  category: string
}

export interface AccessibilityConfig {
  enabled: boolean
  screenReader: boolean
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  colorBlindSupport: boolean
}

// Default configurations
export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  rendering: {
    maxDuration: 16, // 60fps
    maxMemoryUsage: 100 * 1024 * 1024 // 100MB
  },
  parsing: {
    maxDuration: 2000, // 2 seconds
    maxMemoryUsage: 500 * 1024 * 1024 // 500MB
  },
  loading: {
    maxDuration: 3000, // 3 seconds
    maxMemoryUsage: 200 * 1024 * 1024 // 200MB
  },
  navigation: {
    maxDuration: 100 // 100ms
  },
  search: {
    maxDuration: 500, // 500ms
    maxMemoryUsage: 50 * 1024 * 1024 // 50MB
  },
  export: {
    maxDuration: 5000, // 5 seconds
    maxMemoryUsage: 100 * 1024 * 1024 // 100MB
  },
  sync: {
    maxDuration: 10000, // 10 seconds
    maxMemoryUsage: 50 * 1024 * 1024 // 50MB
  },
  ai_request: {
    maxDuration: 30000, // 30 seconds
    maxMemoryUsage: 100 * 1024 * 1024 // 100MB
  }
}

export const DEFAULT_OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    id: 'memory_cleanup',
    name: 'Memory Cleanup',
    type: 'memory_management',
    platform: ['web', 'desktop', 'mobile'],
    conditions: [
      { metric: 'memoryUsage', operator: 'gt', value: 200 * 1024 * 1024, duration: 5000 }
    ],
    actions: [
      { type: 'clear_cache', parameters: {}, delay: 1000 }
    ],
    priority: 1,
    enabled: true
  },
  {
    id: 'lazy_loading',
    name: 'Lazy Loading',
    type: 'lazy_loading',
    platform: ['web', 'mobile'],
    conditions: [
      { metric: 'networkStatus', operator: 'eq', value: 2 } // slow
    ],
    actions: [
      { type: 'enable_lazy_loading', parameters: { threshold: 0.5 } }
    ],
    priority: 2,
    enabled: true
  },
  {
    id: 'battery_saver',
    name: 'Battery Saver',
    type: 'battery_optimization',
    platform: ['mobile'],
    conditions: [
      { metric: 'batteryLevel', operator: 'lt', value: 20 }
    ],
    actions: [
      { type: 'reduce_frequency', parameters: { factor: 0.5 } },
      { type: 'disable_features', parameters: { features: ['animations', 'background_sync'] } }
    ],
    priority: 3,
    enabled: true
  }
]

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'next_page',
    key: 'ArrowRight',
    modifiers: [],
    action: 'navigate_next',
    platform: ['web', 'desktop'],
    enabled: true,
    description: 'Go to next page',
    category: 'navigation'
  },
  {
    id: 'prev_page',
    key: 'ArrowLeft',
    modifiers: [],
    action: 'navigate_previous',
    platform: ['web', 'desktop'],
    enabled: true,
    description: 'Go to previous page',
    category: 'navigation'
  },
  {
    id: 'search',
    key: 'f',
    modifiers: ['ctrl', 'cmd'],
    action: 'open_search',
    platform: ['web', 'desktop'],
    enabled: true,
    description: 'Open search',
    category: 'search'
  },
  {
    id: 'new_note',
    key: 'n',
    modifiers: ['ctrl', 'cmd'],
    action: 'create_note',
    platform: ['web', 'desktop'],
    enabled: true,
    description: 'Create new note',
    category: 'notes'
  },
  {
    id: 'toggle_highlight',
    key: 'h',
    modifiers: ['ctrl', 'cmd'],
    action: 'toggle_highlight',
    platform: ['web', 'desktop'],
    enabled: true,
    description: 'Toggle highlight mode',
    category: 'highlighting'
  }
]

export const DEFAULT_TOUCH_GESTURES: TouchGesture[] = [
  {
    id: 'swipe_next',
    type: 'swipe',
    platform: 'mobile',
    enabled: true,
    sensitivity: 0.5,
    customActions: [
      {
        gesture: 'swipe_left',
        action: 'navigate_next',
        parameters: {}
      }
    ]
  },
  {
    id: 'swipe_prev',
    type: 'swipe',
    platform: 'mobile',
    enabled: true,
    sensitivity: 0.5,
    customActions: [
      {
        gesture: 'swipe_right',
        action: 'navigate_previous',
        parameters: {}
      }
    ]
  },
  {
    id: 'long_press_highlight',
    type: 'long_press',
    platform: 'mobile',
    enabled: true,
    sensitivity: 0.7,
    customActions: [
      {
        gesture: 'long_press',
        action: 'start_highlight',
        parameters: { duration: 500 }
      }
    ]
  }
]
