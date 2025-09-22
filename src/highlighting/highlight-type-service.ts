/**
 * Highlight Type Service
 * Manages highlight types and their configurations
 */

import { 
  HighlightType, 
  HighlightTypeService as IHighlightTypeService,
  DEFAULT_HIGHLIGHT_TYPES,
  HIGHLIGHT_COLORS
} from './types'

export class HighlightTypeService implements IHighlightTypeService {
  private highlightTypes: Map<string, HighlightType> = new Map()
  private defaultTypes: HighlightType[] = DEFAULT_HIGHLIGHT_TYPES

  constructor() {
    this.initializeDefaultTypes()
  }

  /**
   * Get all highlight types
   */
  async getHighlightTypes(): Promise<HighlightType[]> {
    return Array.from(this.highlightTypes.values())
  }

  /**
   * Create a new highlight type
   */
  async createHighlightType(type: Omit<HighlightType, 'id' | 'createdAt'>): Promise<HighlightType> {
    const highlightType: HighlightType = {
      ...type,
      id: this.generateId(),
      createdAt: new Date()
    }

    // Validate highlight type
    this.validateHighlightType(highlightType)

    // Check for duplicate names
    const existingType = Array.from(this.highlightTypes.values())
      .find(t => t.name.toLowerCase() === highlightType.name.toLowerCase())
    
    if (existingType) {
      throw new Error(`Highlight type with name "${highlightType.name}" already exists`)
    }

    this.highlightTypes.set(highlightType.id, highlightType)
    return highlightType
  }

  /**
   * Update an existing highlight type
   */
  async updateHighlightType(id: string, updates: Partial<HighlightType>): Promise<HighlightType> {
    const existingType = this.highlightTypes.get(id)
    if (!existingType) {
      throw new Error(`Highlight type not found: ${id}`)
    }

    // Don't allow updating default types
    if (existingType.isDefault) {
      throw new Error('Cannot update default highlight types')
    }

    const updatedType: HighlightType = {
      ...existingType,
      ...updates,
      id: existingType.id, // Preserve ID
      createdAt: existingType.createdAt, // Preserve creation date
      updatedAt: new Date()
    }

    // Validate updated type
    this.validateHighlightType(updatedType)

    // Check for duplicate names (excluding current type)
    const duplicateType = Array.from(this.highlightTypes.values())
      .find(t => t.id !== id && t.name.toLowerCase() === updatedType.name.toLowerCase())
    
    if (duplicateType) {
      throw new Error(`Highlight type with name "${updatedType.name}" already exists`)
    }

    this.highlightTypes.set(id, updatedType)
    return updatedType
  }

  /**
   * Delete a highlight type
   */
  async deleteHighlightType(id: string): Promise<void> {
    const highlightType = this.highlightTypes.get(id)
    if (!highlightType) {
      throw new Error(`Highlight type not found: ${id}`)
    }

    // Don't allow deleting default types
    if (highlightType.isDefault) {
      throw new Error('Cannot delete default highlight types')
    }

    this.highlightTypes.delete(id)
  }

  /**
   * Get default highlight types
   */
  getDefaultHighlightTypes(): HighlightType[] {
    return [...this.defaultTypes]
  }

  /**
   * Get highlight type by ID
   */
  async getHighlightType(id: string): Promise<HighlightType | null> {
    return this.highlightTypes.get(id) || null
  }

  /**
   * Get highlight type by name
   */
  async getHighlightTypeByName(name: string): Promise<HighlightType | null> {
    const types = Array.from(this.highlightTypes.values())
    return types.find(t => t.name.toLowerCase() === name.toLowerCase()) || null
  }

  /**
   * Get available colors
   */
  getAvailableColors(): string[] {
    return [...HIGHLIGHT_COLORS]
  }

  /**
   * Get unused colors
   */
  getUnusedColors(): string[] {
    const usedColors = new Set(Array.from(this.highlightTypes.values()).map(t => t.color))
    return HIGHLIGHT_COLORS.filter(color => !usedColors.has(color))
  }

  /**
   * Validate highlight type data
   */
  private validateHighlightType(type: HighlightType): void {
    if (!type.id) throw new Error('Highlight type ID is required')
    if (!type.name || type.name.trim().length === 0) {
      throw new Error('Highlight type name is required')
    }
    if (type.name.length > 50) {
      throw new Error('Highlight type name must be 50 characters or less')
    }
    if (!type.color) throw new Error('Highlight type color is required')
    if (!HIGHLIGHT_COLORS.includes(type.color as any)) {
      throw new Error(`Invalid highlight color: ${type.color}`)
    }
    if (type.description && type.description.length > 200) {
      throw new Error('Highlight type description must be 200 characters or less')
    }
  }

  /**
   * Generate unique ID for highlight type
   */
  private generateId(): string {
    let id: string
    do {
      id = Math.random().toString(36).substr(2, 9)
    } while (this.highlightTypes.has(id))
    return id
  }

  /**
   * Initialize default highlight types
   */
  private initializeDefaultTypes(): void {
    this.defaultTypes.forEach(type => {
      this.highlightTypes.set(type.id, { ...type })
    })
  }

  /**
   * Reset to default types (removes all custom types)
   */
  async resetToDefaults(): Promise<void> {
    // Remove all non-default types
    const customTypes = Array.from(this.highlightTypes.values())
      .filter(t => !t.isDefault)
    
    customTypes.forEach(type => {
      this.highlightTypes.delete(type.id)
    })

    // Re-initialize default types
    this.initializeDefaultTypes()
  }

  /**
   * Get highlight type statistics
   */
  async getHighlightTypeStats(): Promise<{
    totalTypes: number
    defaultTypes: number
    customTypes: number
    mostUsedColors: Array<{ color: string; count: number }>
  }> {
    const types = Array.from(this.highlightTypes.values())
    const defaultTypes = types.filter(t => t.isDefault)
    const customTypes = types.filter(t => !t.isDefault)

    // Count color usage
    const colorCounts: Record<string, number> = {}
    types.forEach(type => {
      colorCounts[type.color] = (colorCounts[type.color] || 0) + 1
    })

    const mostUsedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color, count]) => ({ color, count }))

    return {
      totalTypes: types.length,
      defaultTypes: defaultTypes.length,
      customTypes: customTypes.length,
      mostUsedColors
    }
  }

  /**
   * Export highlight types
   */
  async exportHighlightTypes(): Promise<string> {
    const types = Array.from(this.highlightTypes.values())
    return JSON.stringify(types, null, 2)
  }

  /**
   * Import highlight types
   */
  async importHighlightTypes(data: string, mergeStrategy: 'replace' | 'merge' = 'merge'): Promise<HighlightType[]> {
    try {
      const importedTypes: HighlightType[] = JSON.parse(data)
      const processedTypes: HighlightType[] = []

      for (const type of importedTypes) {
        try {
          // Validate imported type
          this.validateHighlightType(type)

          if (mergeStrategy === 'replace') {
            // Replace existing type
            this.highlightTypes.set(type.id, type)
            processedTypes.push(type)
          } else {
            // Merge strategy - check for conflicts
            const existingType = this.highlightTypes.get(type.id)
            if (existingType) {
              if (existingType.isDefault) {
                // Skip default types
                continue
              }
              // Update existing type
              const updatedType = { ...existingType, ...type, id: existingType.id }
              this.highlightTypes.set(existingType.id, updatedType)
              processedTypes.push(updatedType)
            } else {
              // Add new type
              this.highlightTypes.set(type.id, type)
              processedTypes.push(type)
            }
          }
        } catch (error) {
          console.warn(`Failed to import highlight type ${type.name}:`, error)
        }
      }

      return processedTypes
    } catch (error) {
      throw new Error(`Failed to import highlight types: ${error}`)
    }
  }

  /**
   * Get highlight type suggestions based on text content
   */
  async getHighlightTypeSuggestions(text: string): Promise<HighlightType[]> {
    const suggestions: HighlightType[] = []
    const lowerText = text.toLowerCase()

    // Analyze text content for suggestions
    if (lowerText.includes('important') || lowerText.includes('key') || lowerText.includes('critical')) {
      const importantType = this.highlightTypes.get('important')
      if (importantType) suggestions.push(importantType)
    }

    if (lowerText.includes('?') || lowerText.includes('question') || lowerText.includes('why') || lowerText.includes('how')) {
      const questionType = this.highlightTypes.get('question')
      if (questionType) suggestions.push(questionType)
    }

    if (lowerText.includes('insight') || lowerText.includes('realize') || lowerText.includes('understand')) {
      const insightType = this.highlightTypes.get('insight')
      if (insightType) suggestions.push(insightType)
    }

    if (lowerText.includes('confus') || lowerText.includes('unclear') || lowerText.includes('don\'t understand')) {
      const confusionType = this.highlightTypes.get('confusion')
      if (confusionType) suggestions.push(confusionType)
    }

    if (lowerText.includes('action') || lowerText.includes('todo') || lowerText.includes('task') || lowerText.includes('do')) {
      const actionType = this.highlightTypes.get('action')
      if (actionType) suggestions.push(actionType)
    }

    return suggestions
  }
}

/**
 * Create highlight type service instance
 */
export function createHighlightTypeService(): HighlightTypeService {
  return new HighlightTypeService()
}
