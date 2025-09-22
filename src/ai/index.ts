/**
 * AI Integration Exports
 * Main entry point for AI integration and learning features
 */

export * from './types'
export * from './ai-service'
export * from './question-answering'
export * from './learning-science'
export * from './physical-learning'

// Re-export main functions for convenience
export { createAIServiceManager } from './ai-service'
export { createQuestionAnsweringService } from './question-answering'
export { createLearningScienceService } from './learning-science'
export { createPhysicalLearningService } from './physical-learning'

// Re-export constants
export { 
  DEFAULT_AI_SERVICES, 
  LEARNING_ANALYSIS_TYPES, 
  EXERCISE_TYPES, 
  EXERCISE_FORMATS, 
  REFLECTION_TYPES 
} from './types'
