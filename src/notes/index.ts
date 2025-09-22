/**
 * Note-Taking System Exports
 * Main entry point for note-taking functionality
 */

export * from './types'
export * from './note-service'
export * from './note-type-service'
export * from './note-editor'

// Re-export main functions for convenience
export { createNoteService } from './note-service'
export { createNoteTypeService } from './note-type-service'

// Re-export default types and templates
export { DEFAULT_NOTE_TYPES, DEFAULT_NOTE_TEMPLATES, NOTE_COLORS } from './types'
