/**
 * AI Integration Types
 * Core types for AI service integration and learning features
 */

export interface AIService {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'custom'
  model: string
  apiKey: string
  baseUrl?: string
  maxTokens: number
  temperature: number
  isEnabled: boolean
  costPerToken: number
  createdAt: Date
  updatedAt: Date
}

export interface AIRequest {
  id: string
  serviceId: string
  type: AIRequestType
  prompt: string
  context?: string
  maxTokens?: number
  temperature?: number
  userId: string
  bookId?: string
  sectionId?: string
  highlightId?: string
  noteId?: string
  createdAt: Date
}

export interface AIResponse {
  id: string
  requestId: string
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost: number
  processingTime: number
  createdAt: Date
}

export type AIRequestType = 
  | 'question_answering'
  | 'web_research'
  | 'first_principles'
  | 'inversion'
  | 'systems_thinking'
  | 'exercise_generation'
  | 'reflection_prompt'
  | 'content_analysis'
  | 'summarization'
  | 'translation'

export interface AIUsage {
  userId: string
  serviceId: string
  totalRequests: number
  totalTokens: number
  totalCost: number
  lastUsed: Date
  dailyUsage: Record<string, {
    requests: number
    tokens: number
    cost: number
  }>
  monthlyUsage: Record<string, {
    requests: number
    tokens: number
    cost: number
  }>
}

export interface AICostEstimate {
  estimatedTokens: number
  estimatedCost: number
  currency: string
  confidence: 'low' | 'medium' | 'high'
}

export interface AIQuestionRequest {
  question: string
  context: string
  bookId?: string
  sectionId?: string
  highlightId?: string
  noteId?: string
  includeWebResearch?: boolean
  maxTokens?: number
  temperature?: number
}

export interface AIQuestionResponse {
  answer: string
  sources: AISource[]
  confidence: number
  followUpQuestions: string[]
  relatedTopics: string[]
  webResearch?: WebResearchResult[]
}

export interface AISource {
  type: 'book' | 'note' | 'highlight' | 'web'
  id: string
  title: string
  content: string
  relevanceScore: number
  url?: string
}

export interface WebResearchResult {
  title: string
  url: string
  snippet: string
  relevanceScore: number
  publishedDate?: Date
  author?: string
}

export interface LearningAnalysisRequest {
  content: string
  type: 'first_principles' | 'inversion' | 'systems_thinking'
  context?: string
  depth: 'basic' | 'intermediate' | 'advanced'
  maxTokens?: number
  temperature?: number
}

export interface LearningAnalysisResponse {
  analysis: string
  keyConcepts: string[]
  assumptions: string[]
  implications: string[]
  questions: string[]
  connections: string[]
  visualizations?: string[]
}

export interface ExerciseGenerationRequest {
  content: string
  type: 'recall' | 'application' | 'analysis' | 'synthesis' | 'evaluation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  format: 'multiple_choice' | 'short_answer' | 'essay' | 'practical'
  count: number
  context?: string
  maxTokens?: number
  temperature?: number
}

export interface ExerciseGenerationResponse {
  exercises: GeneratedExercise[]
  instructions: string
  estimatedTime: number
  prerequisites: string[]
}

export interface GeneratedExercise {
  id: string
  type: string
  question: string
  options?: string[]
  correctAnswer?: string
  explanation: string
  difficulty: string
  estimatedTime: number
  tags: string[]
}

export interface ReflectionPromptRequest {
  content: string
  type: 'daily' | 'weekly' | 'monthly' | 'topic' | 'book'
  context?: string
  previousReflections?: string[]
  maxTokens?: number
  temperature?: number
}

export interface ReflectionPromptResponse {
  prompts: ReflectionPrompt[]
  theme: string
  objectives: string[]
  estimatedTime: number
}

export interface ReflectionPrompt {
  id: string
  question: string
  type: 'open_ended' | 'structured' | 'creative'
  category: 'understanding' | 'application' | 'connection' | 'critique'
  estimatedTime: number
  followUpQuestions: string[]
}

export interface SpacedRepetitionItem {
  id: string
  userId: string
  content: string
  type: 'highlight' | 'note' | 'exercise' | 'concept'
  sourceId: string
  bookId?: string
  sectionId?: string
  difficulty: number
  interval: number
  repetitions: number
  easeFactor: number
  nextReview: Date
  lastReviewed?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SpacedRepetitionSession {
  id: string
  userId: string
  items: SpacedRepetitionItem[]
  startTime: Date
  endTime?: Date
  totalItems: number
  completedItems: number
  correctAnswers: number
  averageResponseTime: number
  sessionScore: number
}

export interface ActiveRecallSession {
  id: string
  userId: string
  bookId?: string
  sectionId?: string
  questions: ActiveRecallQuestion[]
  startTime: Date
  endTime?: Date
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  sessionScore: number
  averageResponseTime: number
}

export interface ActiveRecallQuestion {
  id: string
  question: string
  answer: string
  hints: string[]
  difficulty: number
  category: string
  sourceId: string
  userAnswer?: string
  isCorrect?: boolean
  responseTime?: number
  hintsUsed: number
}

export interface LearningProgress {
  userId: string
  bookId?: string
  totalStudyTime: number
  totalSessions: number
  averageSessionScore: number
  conceptsLearned: number
  exercisesCompleted: number
  reflectionsWritten: number
  spacedRepetitionItems: number
  activeRecallSessions: number
  lastActivity: Date
  streak: number
  goals: LearningGoal[]
  achievements: LearningAchievement[]
}

export interface LearningGoal {
  id: string
  title: string
  description: string
  type: 'time' | 'sessions' | 'concepts' | 'exercises' | 'reflections'
  target: number
  current: number
  deadline?: Date
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LearningAchievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'study' | 'consistency' | 'mastery' | 'exploration'
  unlockedAt: Date
  progress: number
  isUnlocked: boolean
}

export interface AIServiceConfig {
  defaultService: string
  fallbackServices: string[]
  maxConcurrentRequests: number
  requestTimeout: number
  retryAttempts: number
  costLimit: {
    daily: number
    monthly: number
  }
  usageAlerts: {
    enabled: boolean
    thresholds: number[]
  }
}

export interface AIError {
  code: string
  message: string
  serviceId: string
  requestId?: string
  timestamp: Date
  retryable: boolean
}

// Default AI services
export const DEFAULT_AI_SERVICES: Partial<AIService>[] = [
  {
    name: 'OpenAI GPT-4',
    provider: 'openai',
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7,
    isEnabled: false,
    costPerToken: 0.00003
  },
  {
    name: 'OpenAI GPT-3.5 Turbo',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    maxTokens: 4000,
    temperature: 0.7,
    isEnabled: false,
    costPerToken: 0.000002
  },
  {
    name: 'Anthropic Claude',
    provider: 'anthropic',
    model: 'claude-3-sonnet',
    maxTokens: 4000,
    temperature: 0.7,
    isEnabled: false,
    costPerToken: 0.000015
  }
]

// Learning analysis types
export const LEARNING_ANALYSIS_TYPES = {
  FIRST_PRINCIPLES: 'first_principles',
  INVERSION: 'inversion',
  SYSTEMS_THINKING: 'systems_thinking'
} as const

// Exercise types
export const EXERCISE_TYPES = {
  RECALL: 'recall',
  APPLICATION: 'application',
  ANALYSIS: 'analysis',
  SYNTHESIS: 'synthesis',
  EVALUATION: 'evaluation'
} as const

// Exercise formats
export const EXERCISE_FORMATS = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  PRACTICAL: 'practical'
} as const

// Reflection prompt types
export const REFLECTION_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  TOPIC: 'topic',
  BOOK: 'book'
} as const
