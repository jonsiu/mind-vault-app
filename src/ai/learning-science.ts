/**
 * Learning Science Integration
 * Implements mental models, spaced repetition, and active recall
 */

import { 
  LearningAnalysisRequest, 
  LearningAnalysisResponse,
  SpacedRepetitionItem,
  SpacedRepetitionSession,
  ActiveRecallSession,
  ActiveRecallQuestion,
  LearningProgress,
  LearningGoal,
  LearningAchievement,
  LEARNING_ANALYSIS_TYPES
} from './types'
import { AIServiceManager } from './ai-service'
import { v4 as uuidv4 } from 'uuid'

export class LearningScienceService {
  private aiServiceManager: AIServiceManager
  private spacedRepetitionItems: Map<string, SpacedRepetitionItem> = new Map()
  private activeRecallSessions: Map<string, ActiveRecallSession> = new Map()
  private learningProgress: Map<string, LearningProgress> = new Map()

  constructor(aiServiceManager: AIServiceManager) {
    this.aiServiceManager = aiServiceManager
  }

  /**
   * Perform learning analysis using mental models
   */
  async performLearningAnalysis(request: LearningAnalysisRequest): Promise<LearningAnalysisResponse> {
    const prompt = this.buildAnalysisPrompt(request)
    
    const response = await this.aiServiceManager.makeRequest(
      request.type,
      prompt,
      {
        serviceId: undefined,
        context: request.context,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
        userId: 'current-user' // This should come from the request
      }
    )

    return this.parseAnalysisResponse(response.content, request.type)
  }

  /**
   * Add item to spaced repetition system
   */
  async addSpacedRepetitionItem(
    userId: string,
    content: string,
    type: 'highlight' | 'note' | 'exercise' | 'concept',
    sourceId: string,
    bookId?: string,
    sectionId?: string
  ): Promise<SpacedRepetitionItem> {
    const item: SpacedRepetitionItem = {
      id: uuidv4(),
      userId,
      content,
      type,
      sourceId,
      bookId,
      sectionId,
      difficulty: 2.5, // Default difficulty
      interval: 1, // Start with 1 day
      repetitions: 0,
      easeFactor: 2.5, // Default ease factor
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.spacedRepetitionItems.set(item.id, item)
    return item
  }

  /**
   * Review spaced repetition item
   */
  async reviewSpacedRepetitionItem(
    itemId: string,
    quality: number // 0-5 scale
  ): Promise<SpacedRepetitionItem> {
    const item = this.spacedRepetitionItems.get(itemId)
    if (!item) {
      throw new Error(`Spaced repetition item not found: ${itemId}`)
    }

    // Update item based on quality
    item.repetitions += 1
    item.lastReviewed = new Date()
    item.updatedAt = new Date()

    // Calculate new interval using SM-2 algorithm
    if (quality >= 3) {
      if (item.repetitions === 1) {
        item.interval = 1
      } else if (item.repetitions === 2) {
        item.interval = 6
      } else {
        item.interval = Math.round(item.interval * item.easeFactor)
      }
    } else {
      item.repetitions = 0
      item.interval = 1
    }

    // Update ease factor
    item.easeFactor = item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (item.easeFactor < 1.3) {
      item.easeFactor = 1.3
    }

    // Calculate next review date
    item.nextReview = new Date(Date.now() + item.interval * 24 * 60 * 60 * 1000)

    this.spacedRepetitionItems.set(itemId, item)
    return item
  }

  /**
   * Get items due for review
   */
  async getItemsDueForReview(userId: string): Promise<SpacedRepetitionItem[]> {
    const now = new Date()
    return Array.from(this.spacedRepetitionItems.values())
      .filter(item => 
        item.userId === userId && 
        item.nextReview <= now
      )
      .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
  }

  /**
   * Start spaced repetition session
   */
  async startSpacedRepetitionSession(userId: string): Promise<SpacedRepetitionSession> {
    const items = await this.getItemsDueForReview(userId)
    
    const session: SpacedRepetitionSession = {
      id: uuidv4(),
      userId,
      items: items.slice(0, 20), // Limit to 20 items per session
      startTime: new Date(),
      totalItems: items.length,
      completedItems: 0,
      correctAnswers: 0,
      averageResponseTime: 0,
      sessionScore: 0
    }

    this.activeRecallSessions.set(session.id, session as any) // Type assertion for now
    return session
  }

  /**
   * Create active recall session
   */
  async createActiveRecallSession(
    userId: string,
    bookId?: string,
    sectionId?: string
  ): Promise<ActiveRecallSession> {
    const questions = await this.generateActiveRecallQuestions(userId, bookId, sectionId)
    
    const session: ActiveRecallSession = {
      id: uuidv4(),
      userId,
      bookId,
      sectionId,
      questions,
      startTime: new Date(),
      totalQuestions: questions.length,
      answeredQuestions: 0,
      correctAnswers: 0,
      sessionScore: 0,
      averageResponseTime: 0
    }

    this.activeRecallSessions.set(session.id, session as any) // Type assertion for now
    return session
  }

  /**
   * Answer active recall question
   */
  async answerActiveRecallQuestion(
    sessionId: string,
    questionId: string,
    userAnswer: string,
    responseTime: number
  ): Promise<{ isCorrect: boolean; score: number }> {
    const session = this.activeRecallSessions.get(sessionId)
    if (!session) {
      throw new Error(`Active recall session not found: ${sessionId}`)
    }

    const question = session.questions.find(q => q.id === questionId)
    if (!question) {
      throw new Error(`Question not found: ${questionId}`)
    }

    // Evaluate answer (this would be more sophisticated in a real implementation)
    const isCorrect = this.evaluateAnswer(question.answer, userAnswer)
    const score = isCorrect ? 1 : 0

    // Update question
    question.userAnswer = userAnswer
    question.isCorrect = isCorrect
    question.responseTime = responseTime

    // Update session
    session.answeredQuestions += 1
    if (isCorrect) {
      session.correctAnswers += 1
    }
    session.sessionScore = (session.correctAnswers / session.answeredQuestions) * 100
    session.averageResponseTime = (session.averageResponseTime + responseTime) / 2

    this.activeRecallSessions.set(sessionId, session as any)
    return { isCorrect, score }
  }

  /**
   * Get learning progress
   */
  async getLearningProgress(userId: string): Promise<LearningProgress> {
    let progress = this.learningProgress.get(userId)
    
    if (!progress) {
      progress = {
        userId,
        totalStudyTime: 0,
        totalSessions: 0,
        averageSessionScore: 0,
        conceptsLearned: 0,
        exercisesCompleted: 0,
        reflectionsWritten: 0,
        spacedRepetitionItems: 0,
        activeRecallSessions: 0,
        lastActivity: new Date(),
        streak: 0,
        goals: [],
        achievements: []
      }
      this.learningProgress.set(userId, progress)
    }

    return progress
  }

  /**
   * Update learning progress
   */
  async updateLearningProgress(
    userId: string,
    updates: Partial<LearningProgress>
  ): Promise<LearningProgress> {
    const progress = await this.getLearningProgress(userId)
    
    Object.assign(progress, updates)
    progress.lastActivity = new Date()
    
    this.learningProgress.set(userId, progress)
    return progress
  }

  /**
   * Create learning goal
   */
  async createLearningGoal(
    userId: string,
    title: string,
    description: string,
    type: 'time' | 'sessions' | 'concepts' | 'exercises' | 'reflections',
    target: number,
    deadline?: Date
  ): Promise<LearningGoal> {
    const goal: LearningGoal = {
      id: uuidv4(),
      title,
      description,
      type,
      target,
      current: 0,
      deadline,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const progress = await this.getLearningProgress(userId)
    progress.goals.push(goal)
    this.learningProgress.set(userId, progress)

    return goal
  }

  /**
   * Update learning goal progress
   */
  async updateGoalProgress(goalId: string, increment: number = 1): Promise<LearningGoal> {
    for (const [userId, progress] of this.learningProgress.entries()) {
      const goal = progress.goals.find(g => g.id === goalId)
      if (goal) {
        goal.current += increment
        goal.updatedAt = new Date()
        
        if (goal.current >= goal.target) {
          goal.isCompleted = true
        }
        
        this.learningProgress.set(userId, progress)
        return goal
      }
    }
    
    throw new Error(`Learning goal not found: ${goalId}`)
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(request: LearningAnalysisRequest): string {
    const basePrompt = `Analyze the following content using ${request.type} methodology. Provide a comprehensive analysis that breaks down the content into its fundamental components and relationships.

Content to analyze:
${request.context || request.content}

Analysis depth: ${request.depth}

Please provide:`

    switch (request.type) {
      case LEARNING_ANALYSIS_TYPES.FIRST_PRINCIPLES:
        return basePrompt + `
1. Fundamental principles and assumptions
2. Core concepts and their relationships
3. Logical reasoning chains
4. Potential gaps or weaknesses in reasoning
5. Alternative approaches or perspectives

Focus on breaking down complex ideas into their most basic, undeniable truths.`
      
      case LEARNING_ANALYSIS_TYPES.INVERSION:
        return basePrompt + `
1. What could go wrong with this approach?
2. What are the potential failure modes?
3. What assumptions might be incorrect?
4. What are the worst-case scenarios?
5. How can we prevent or mitigate these risks?

Focus on thinking about what not to do and potential problems.`
      
      case LEARNING_ANALYSIS_TYPES.SYSTEMS_THINKING:
        return basePrompt + `
1. System components and their interactions
2. Feedback loops and causal relationships
3. Emergent properties and behaviors
4. System boundaries and context
5. Leverage points for change

Focus on understanding the whole system and how parts interact.`
      
      default:
        return basePrompt + `
1. Key concepts and ideas
2. Main arguments and evidence
3. Implications and applications
4. Questions for further exploration
5. Connections to other knowledge areas`
    }
  }

  /**
   * Parse analysis response
   */
  private parseAnalysisResponse(content: string, type: string): LearningAnalysisResponse {
    // This would parse the AI response more intelligently
    // For now, return a structured response
    return {
      analysis: content,
      keyConcepts: this.extractKeyConcepts(content),
      assumptions: this.extractAssumptions(content),
      implications: this.extractImplications(content),
      questions: this.extractQuestions(content),
      connections: this.extractConnections(content)
    }
  }

  /**
   * Generate active recall questions
   */
  private async generateActiveRecallQuestions(
    userId: string,
    bookId?: string,
    sectionId?: string
  ): Promise<ActiveRecallQuestion[]> {
    // This would generate questions based on the user's content
    // For now, return some sample questions
    return [
      {
        id: uuidv4(),
        question: 'What are the main principles discussed in this section?',
        answer: 'The main principles include...',
        hints: ['Think about the fundamental concepts', 'Consider the core ideas'],
        difficulty: 2,
        category: 'recall',
        sourceId: 'sample-source',
        hintsUsed: 0
      },
      {
        id: uuidv4(),
        question: 'How do these concepts relate to each other?',
        answer: 'These concepts relate by...',
        hints: ['Consider the relationships', 'Think about cause and effect'],
        difficulty: 3,
        category: 'analysis',
        sourceId: 'sample-source',
        hintsUsed: 0
      }
    ]
  }

  /**
   * Evaluate answer correctness
   */
  private evaluateAnswer(correctAnswer: string, userAnswer: string): boolean {
    // Simple evaluation - in a real implementation, this would be more sophisticated
    const similarity = this.calculateSimilarity(correctAnswer.toLowerCase(), userAnswer.toLowerCase())
    return similarity > 0.7
  }

  /**
   * Calculate text similarity
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation
    const words1 = text1.split(' ')
    const words2 = text2.split(' ')
    const commonWords = words1.filter(word => words2.includes(word))
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  /**
   * Extract key concepts from text
   */
  private extractKeyConcepts(text: string): string[] {
    // Simple extraction - in a real implementation, this would use NLP
    const concepts = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
    return [...new Set(concepts)].slice(0, 10)
  }

  /**
   * Extract assumptions from text
   */
  private extractAssumptions(text: string): string[] {
    // Simple extraction based on keywords
    const assumptionKeywords = ['assume', 'assumption', 'presume', 'suppose', 'believe']
    const sentences = text.split(/[.!?]+/)
    return sentences
      .filter(sentence => assumptionKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
      .slice(0, 5)
  }

  /**
   * Extract implications from text
   */
  private extractImplications(text: string): string[] {
    // Simple extraction based on keywords
    const implicationKeywords = ['imply', 'implication', 'suggest', 'indicate', 'consequence']
    const sentences = text.split(/[.!?]+/)
    return sentences
      .filter(sentence => implicationKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
      .slice(0, 5)
  }

  /**
   * Extract questions from text
   */
  private extractQuestions(text: string): string[] {
    // Extract sentences ending with question marks
    const questions = text.split(/[.!]+/).filter(sentence => sentence.trim().endsWith('?'))
    return questions.slice(0, 5)
  }

  /**
   * Extract connections from text
   */
  private extractConnections(text: string): string[] {
    // Simple extraction based on keywords
    const connectionKeywords = ['connect', 'relate', 'link', 'associate', 'correlate']
    const sentences = text.split(/[.!?]+/)
    return sentences
      .filter(sentence => connectionKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
      .slice(0, 5)
  }
}

/**
 * Create learning science service instance
 */
export function createLearningScienceService(aiServiceManager: AIServiceManager): LearningScienceService {
  return new LearningScienceService(aiServiceManager)
}
