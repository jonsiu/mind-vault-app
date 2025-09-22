/**
 * AI Service Manager
 * Manages AI service integration, requests, and responses
 */

import { 
  AIService, 
  AIRequest, 
  AIResponse, 
  AIRequestType,
  AIUsage,
  AICostEstimate,
  AIError,
  AIServiceConfig,
  DEFAULT_AI_SERVICES
} from './types'
import { v4 as uuidv4 } from 'uuid'

export class AIServiceManager {
  private services: Map<string, AIService> = new Map()
  private requests: Map<string, AIRequest> = new Map()
  private responses: Map<string, AIResponse> = new Map()
  private usage: Map<string, AIUsage> = new Map()
  private config: AIServiceConfig
  private activeRequests: Set<string> = new Set()

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = {
      defaultService: '',
      fallbackServices: [],
      maxConcurrentRequests: 5,
      requestTimeout: 30000,
      retryAttempts: 3,
      costLimit: {
        daily: 10.0,
        monthly: 100.0
      },
      usageAlerts: {
        enabled: true,
        thresholds: [0.5, 0.8, 1.0]
      },
      ...config
    }
    this.initializeDefaultServices()
  }

  /**
   * Add or update an AI service
   */
  async addService(service: Omit<AIService, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIService> {
    const aiService: AIService = {
      ...service,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Validate service
    this.validateService(aiService)

    this.services.set(aiService.id, aiService)

    // Set as default if it's the first service
    if (!this.config.defaultService) {
      this.config.defaultService = aiService.id
    }

    return aiService
  }

  /**
   * Update an existing AI service
   */
  async updateService(id: string, updates: Partial<AIService>): Promise<AIService> {
    const service = this.services.get(id)
    if (!service) {
      throw new Error(`AI service not found: ${id}`)
    }

    const updatedService: AIService = {
      ...service,
      ...updates,
      id: service.id,
      createdAt: service.createdAt,
      updatedAt: new Date()
    }

    this.validateService(updatedService)
    this.services.set(id, updatedService)

    return updatedService
  }

  /**
   * Remove an AI service
   */
  async removeService(id: string): Promise<void> {
    const service = this.services.get(id)
    if (!service) {
      throw new Error(`AI service not found: ${id}`)
    }

    // Don't allow removing the default service if it's the only one
    if (this.config.defaultService === id && this.services.size === 1) {
      throw new Error('Cannot remove the only AI service')
    }

    this.services.delete(id)

    // Update default service if needed
    if (this.config.defaultService === id) {
      const remainingServices = Array.from(this.services.values())
      this.config.defaultService = remainingServices[0]?.id || ''
    }
  }

  /**
   * Get all AI services
   */
  async getServices(): Promise<AIService[]> {
    return Array.from(this.services.values())
  }

  /**
   * Get a specific AI service
   */
  async getService(id: string): Promise<AIService | null> {
    return this.services.get(id) || null
  }

  /**
   * Get enabled AI services
   */
  async getEnabledServices(): Promise<AIService[]> {
    return Array.from(this.services.values()).filter(service => service.isEnabled)
  }

  /**
   * Make an AI request
   */
  async makeRequest(
    type: AIRequestType,
    prompt: string,
    options: {
      serviceId?: string
      context?: string
      maxTokens?: number
      temperature?: number
      userId: string
      bookId?: string
      sectionId?: string
      highlightId?: string
      noteId?: string
    }
  ): Promise<AIResponse> {
    // Check if we're at the concurrent request limit
    if (this.activeRequests.size >= this.config.maxConcurrentRequests) {
      throw new Error('Maximum concurrent requests reached')
    }

    // Get the service to use
    const service = await this.getServiceForRequest(options.serviceId)
    if (!service) {
      throw new Error('No available AI service')
    }

    // Check cost limits
    await this.checkCostLimits(options.userId, service)

    // Create request
    const request: AIRequest = {
      id: uuidv4(),
      serviceId: service.id,
      type,
      prompt,
      context: options.context,
      maxTokens: options.maxTokens || service.maxTokens,
      temperature: options.temperature || service.temperature,
      userId: options.userId,
      bookId: options.bookId,
      sectionId: options.sectionId,
      highlightId: options.highlightId,
      noteId: options.noteId,
      createdAt: new Date()
    }

    this.requests.set(request.id, request)
    this.activeRequests.add(request.id)

    try {
      // Make the actual API call
      const response = await this.callAIService(service, request)
      
      // Store response
      this.responses.set(response.id, response)
      
      // Update usage
      await this.updateUsage(options.userId, service.id, response)
      
      return response
    } catch (error) {
      // Handle error
      const aiError: AIError = {
        code: 'REQUEST_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        serviceId: service.id,
        requestId: request.id,
        timestamp: new Date(),
        retryable: this.isRetryableError(error)
      }
      
      throw aiError
    } finally {
      this.activeRequests.delete(request.id)
    }
  }

  /**
   * Estimate cost for a request
   */
  async estimateCost(
    prompt: string,
    serviceId?: string,
    maxTokens?: number
  ): Promise<AICostEstimate> {
    const service = await this.getServiceForRequest(serviceId)
    if (!service) {
      throw new Error('No available AI service')
    }

    // Rough estimation based on prompt length
    const estimatedPromptTokens = Math.ceil(prompt.length / 4)
    const estimatedCompletionTokens = maxTokens || service.maxTokens
    const estimatedTotalTokens = estimatedPromptTokens + estimatedCompletionTokens

    const estimatedCost = estimatedTotalTokens * service.costPerToken

    return {
      estimatedTokens: estimatedTotalTokens,
      estimatedCost,
      currency: 'USD',
      confidence: 'medium'
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getUserUsage(userId: string): Promise<AIUsage[]> {
    const userUsage: AIUsage[] = []
    
    for (const [serviceId, usage] of this.usage.entries()) {
      if (usage.userId === userId) {
        userUsage.push(usage)
      }
    }
    
    return userUsage
  }

  /**
   * Get service usage statistics
   */
  async getServiceUsage(serviceId: string): Promise<AIUsage[]> {
    const serviceUsage: AIUsage[] = []
    
    for (const [_, usage] of this.usage.entries()) {
      if (usage.serviceId === serviceId) {
        serviceUsage.push(usage)
      }
    }
    
    return serviceUsage
  }

  /**
   * Get request history
   */
  async getRequestHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AIRequest[]> {
    const userRequests = Array.from(this.requests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit)
    
    return userRequests
  }

  /**
   * Get response for a request
   */
  async getResponse(requestId: string): Promise<AIResponse | null> {
    return this.responses.get(requestId) || null
  }

  /**
   * Get configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Initialize default services
   */
  private initializeDefaultServices(): void {
    DEFAULT_AI_SERVICES.forEach(serviceData => {
      const service: AIService = {
        ...serviceData,
        id: uuidv4(),
        apiKey: '', // Will need to be set by user
        createdAt: new Date(),
        updatedAt: new Date()
      } as AIService
      
      this.services.set(service.id, service)
    })
  }

  /**
   * Validate AI service
   */
  private validateService(service: AIService): void {
    if (!service.name || service.name.trim().length === 0) {
      throw new Error('Service name is required')
    }
    if (!service.provider) {
      throw new Error('Service provider is required')
    }
    if (!service.model || service.model.trim().length === 0) {
      throw new Error('Service model is required')
    }
    if (!service.apiKey || service.apiKey.trim().length === 0) {
      throw new Error('API key is required')
    }
    if (service.maxTokens <= 0) {
      throw new Error('Max tokens must be greater than 0')
    }
    if (service.temperature < 0 || service.temperature > 2) {
      throw new Error('Temperature must be between 0 and 2')
    }
    if (service.costPerToken < 0) {
      throw new Error('Cost per token must be non-negative')
    }
  }

  /**
   * Get service for request
   */
  private async getServiceForRequest(serviceId?: string): Promise<AIService | null> {
    if (serviceId) {
      const service = this.services.get(serviceId)
      if (service && service.isEnabled) {
        return service
      }
    }

    // Try default service
    if (this.config.defaultService) {
      const defaultService = this.services.get(this.config.defaultService)
      if (defaultService && defaultService.isEnabled) {
        return defaultService
      }
    }

    // Try fallback services
    for (const fallbackId of this.config.fallbackServices) {
      const fallbackService = this.services.get(fallbackId)
      if (fallbackService && fallbackService.isEnabled) {
        return fallbackService
      }
    }

    // Try any enabled service
    const enabledServices = Array.from(this.services.values()).filter(s => s.isEnabled)
    return enabledServices[0] || null
  }

  /**
   * Check cost limits
   */
  private async checkCostLimits(userId: string, service: AIService): Promise<void> {
    const usage = this.usage.get(`${userId}:${service.id}`)
    if (!usage) return

    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().substring(0, 7)

    const dailyCost = usage.dailyUsage[today]?.cost || 0
    const monthlyCost = usage.monthlyUsage[thisMonth]?.cost || 0

    if (dailyCost >= this.config.costLimit.daily) {
      throw new Error('Daily cost limit reached')
    }
    if (monthlyCost >= this.config.costLimit.monthly) {
      throw new Error('Monthly cost limit reached')
    }
  }

  /**
   * Call AI service
   */
  private async callAIService(service: AIService, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      let response: any

      switch (service.provider) {
        case 'openai':
          response = await this.callOpenAI(service, request)
          break
        case 'anthropic':
          response = await this.callAnthropic(service, request)
          break
        default:
          throw new Error(`Unsupported provider: ${service.provider}`)
      }

      const processingTime = Date.now() - startTime

      const aiResponse: AIResponse = {
        id: uuidv4(),
        requestId: request.id,
        content: response.content,
        usage: response.usage,
        cost: response.usage.totalTokens * service.costPerToken,
        processingTime,
        createdAt: new Date()
      }

      return aiResponse
    } catch (error) {
      throw new Error(`AI service call failed: ${error}`)
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(service: AIService, request: AIRequest): Promise<any> {
    // This would make the actual OpenAI API call
    // For now, return a mock response
    return {
      content: 'This is a mock OpenAI response',
      usage: {
        promptTokens: Math.ceil(request.prompt.length / 4),
        completionTokens: 100,
        totalTokens: Math.ceil(request.prompt.length / 4) + 100
      }
    }
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(service: AIService, request: AIRequest): Promise<any> {
    // This would make the actual Anthropic API call
    // For now, return a mock response
    return {
      content: 'This is a mock Anthropic response',
      usage: {
        promptTokens: Math.ceil(request.prompt.length / 4),
        completionTokens: 100,
        totalTokens: Math.ceil(request.prompt.length / 4) + 100
      }
    }
  }

  /**
   * Update usage statistics
   */
  private async updateUsage(userId: string, serviceId: string, response: AIResponse): Promise<void> {
    const key = `${userId}:${serviceId}`
    let usage = this.usage.get(key)

    if (!usage) {
      usage = {
        userId,
        serviceId,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        lastUsed: new Date(),
        dailyUsage: {},
        monthlyUsage: {}
      }
    }

    // Update totals
    usage.totalRequests += 1
    usage.totalTokens += response.usage.totalTokens
    usage.totalCost += response.cost
    usage.lastUsed = new Date()

    // Update daily usage
    const today = new Date().toISOString().split('T')[0]
    if (!usage.dailyUsage[today]) {
      usage.dailyUsage[today] = { requests: 0, tokens: 0, cost: 0 }
    }
    usage.dailyUsage[today].requests += 1
    usage.dailyUsage[today].tokens += response.usage.totalTokens
    usage.dailyUsage[today].cost += response.cost

    // Update monthly usage
    const thisMonth = new Date().toISOString().substring(0, 7)
    if (!usage.monthlyUsage[thisMonth]) {
      usage.monthlyUsage[thisMonth] = { requests: 0, tokens: 0, cost: 0 }
    }
    usage.monthlyUsage[thisMonth].requests += 1
    usage.monthlyUsage[thisMonth].tokens += response.usage.totalTokens
    usage.monthlyUsage[thisMonth].cost += response.cost

    this.usage.set(key, usage)
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return message.includes('timeout') || 
             message.includes('network') || 
             message.includes('rate limit') ||
             message.includes('server error')
    }
    return false
  }
}

/**
 * Create AI service manager instance
 */
export function createAIServiceManager(config?: Partial<AIServiceConfig>): AIServiceManager {
  return new AIServiceManager(config)
}
