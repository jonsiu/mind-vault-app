/**
 * Highlighting System Exports
 * Main entry point for highlighting and annotation functionality
 */

export * from './types'
export * from './text-selection'
export * from './highlight-renderer'
export * from './highlight-service'
export * from './highlight-type-service'

// Re-export main functions for convenience
export { createTextSelectionManager } from './text-selection'
export { createHighlightRenderer } from './highlight-renderer'
export { createHighlightService } from './highlight-service'
export { createHighlightTypeService } from './highlight-type-service'

// Re-export default types and colors
export { DEFAULT_HIGHLIGHT_TYPES, HIGHLIGHT_COLORS } from './types'
