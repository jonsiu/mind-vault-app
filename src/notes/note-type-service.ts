/**
 * Note Type Service
 * Manages note types and their configurations
 */

import { 
  NoteType, 
  NoteTypeService as INoteTypeService,
  NoteTemplate,
  DEFAULT_NOTE_TYPES,
  DEFAULT_NOTE_TEMPLATES,
  NOTE_COLORS
} from './types'

export class NoteTypeService implements INoteTypeService {
  private noteTypes: Map<string, NoteType> = new Map()
  private noteTemplates: Map<string, NoteTemplate> = new Map()
  private defaultTypes: NoteType[] = DEFAULT_NOTE_TYPES
  private defaultTemplates: NoteTemplate[] = DEFAULT_NOTE_TEMPLATES

  constructor() {
    this.initializeDefaultTypes()
    this.initializeDefaultTemplates()
  }

  /**
   * Get all note types
   */
  async getNoteTypes(): Promise<NoteType[]> {
    return Array.from(this.noteTypes.values())
  }

  /**
   * Create a new note type
   */
  async createNoteType(type: Omit<NoteType, 'id' | 'createdAt'>): Promise<NoteType> {
    const noteType: NoteType = {
      ...type,
      id: this.generateId(),
      createdAt: new Date()
    }

    // Validate note type
    this.validateNoteType(noteType)

    // Check for duplicate names
    const existingType = Array.from(this.noteTypes.values())
      .find(t => t.name.toLowerCase() === noteType.name.toLowerCase())
    
    if (existingType) {
      throw new Error(`Note type with name "${noteType.name}" already exists`)
    }

    this.noteTypes.set(noteType.id, noteType)
    return noteType
  }

  /**
   * Update an existing note type
   */
  async updateNoteType(id: string, updates: Partial<NoteType>): Promise<NoteType> {
    const existingType = this.noteTypes.get(id)
    if (!existingType) {
      throw new Error(`Note type not found: ${id}`)
    }

    // Don't allow updating default types
    if (existingType.isDefault) {
      throw new Error('Cannot update default note types')
    }

    const updatedType: NoteType = {
      ...existingType,
      ...updates,
      id: existingType.id, // Preserve ID
      createdAt: existingType.createdAt, // Preserve creation date
      updatedAt: new Date()
    }

    // Validate updated type
    this.validateNoteType(updatedType)

    // Check for duplicate names (excluding current type)
    const duplicateType = Array.from(this.noteTypes.values())
      .find(t => t.id !== id && t.name.toLowerCase() === updatedType.name.toLowerCase())
    
    if (duplicateType) {
      throw new Error(`Note type with name "${updatedType.name}" already exists`)
    }

    this.noteTypes.set(id, updatedType)
    return updatedType
  }

  /**
   * Delete a note type
   */
  async deleteNoteType(id: string): Promise<void> {
    const noteType = this.noteTypes.get(id)
    if (!noteType) {
      throw new Error(`Note type not found: ${id}`)
    }

    // Don't allow deleting default types
    if (noteType.isDefault) {
      throw new Error('Cannot delete default note types')
    }

    this.noteTypes.delete(id)
  }

  /**
   * Get default note types
   */
  getDefaultNoteTypes(): NoteType[] {
    return [...this.defaultTypes]
  }

  /**
   * Get note type templates
   */
  getNoteTypeTemplates(): NoteTemplate[] {
    return Array.from(this.noteTemplates.values())
  }

  /**
   * Get note type by ID
   */
  async getNoteType(id: string): Promise<NoteType | null> {
    return this.noteTypes.get(id) || null
  }

  /**
   * Get note type by name
   */
  async getNoteTypeByName(name: string): Promise<NoteType | null> {
    const types = Array.from(this.noteTypes.values())
    return types.find(t => t.name.toLowerCase() === name.toLowerCase()) || null
  }

  /**
   * Get available colors
   */
  getAvailableColors(): string[] {
    return [...NOTE_COLORS]
  }

  /**
   * Get unused colors
   */
  getUnusedColors(): string[] {
    const usedColors = new Set(Array.from(this.noteTypes.values()).map(t => t.color).filter(Boolean))
    return NOTE_COLORS.filter(color => !usedColors.has(color))
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<NoteTemplate | null> {
    return this.noteTemplates.get(id) || null
  }

  /**
   * Get templates by type
   */
  async getTemplatesByType(type: string): Promise<NoteTemplate[]> {
    const templates = Array.from(this.noteTemplates.values())
    return templates.filter(t => t.type === type)
  }

  /**
   * Create a new template
   */
  async createTemplate(template: Omit<NoteTemplate, 'id' | 'createdAt'>): Promise<NoteTemplate> {
    const noteTemplate: NoteTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date()
    }

    // Validate template
    this.validateTemplate(noteTemplate)

    // Check for duplicate names
    const existingTemplate = Array.from(this.noteTemplates.values())
      .find(t => t.name.toLowerCase() === noteTemplate.name.toLowerCase())
    
    if (existingTemplate) {
      throw new Error(`Template with name "${noteTemplate.name}" already exists`)
    }

    this.noteTemplates.set(noteTemplate.id, noteTemplate)
    return noteTemplate
  }

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, updates: Partial<NoteTemplate>): Promise<NoteTemplate> {
    const existingTemplate = this.noteTemplates.get(id)
    if (!existingTemplate) {
      throw new Error(`Template not found: ${id}`)
    }

    // Don't allow updating default templates
    if (existingTemplate.isDefault) {
      throw new Error('Cannot update default templates')
    }

    const updatedTemplate: NoteTemplate = {
      ...existingTemplate,
      ...updates,
      id: existingTemplate.id, // Preserve ID
      createdAt: existingTemplate.createdAt, // Preserve creation date
      updatedAt: new Date()
    }

    // Validate updated template
    this.validateTemplate(updatedTemplate)

    this.noteTemplates.set(id, updatedTemplate)
    return updatedTemplate
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    const template = this.noteTemplates.get(id)
    if (!template) {
      throw new Error(`Template not found: ${id}`)
    }

    // Don't allow deleting default templates
    if (template.isDefault) {
      throw new Error('Cannot delete default templates')
    }

    this.noteTemplates.delete(id)
  }

  /**
   * Process template with variables
   */
  async processTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.noteTemplates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    let processedContent = template.content

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value))
    })

    // Process conditional blocks
    processedContent = this.processConditionalBlocks(processedContent, variables)

    // Process loops
    processedContent = this.processLoops(processedContent, variables)

    return processedContent
  }

  /**
   * Get note type suggestions based on content
   */
  async getNoteTypeSuggestions(content: string, title?: string): Promise<NoteType[]> {
    const suggestions: NoteType[] = []
    const searchText = `${title || ''} ${content}`.toLowerCase()

    // Analyze content for suggestions
    if (searchText.includes('summary') || searchText.includes('overview') || searchText.includes('key points')) {
      const summaryType = this.noteTypes.get('summary')
      if (summaryType) suggestions.push(summaryType)
    }

    if (searchText.includes('reflect') || searchText.includes('think') || searchText.includes('opinion')) {
      const reflectionType = this.noteTypes.get('reflection')
      if (reflectionType) suggestions.push(reflectionType)
    }

    if (searchText.includes('?') || searchText.includes('question') || searchText.includes('why') || searchText.includes('how')) {
      const questionType = this.noteTypes.get('question')
      if (questionType) suggestions.push(questionType)
    }

    if (searchText.includes('connect') || searchText.includes('relate') || searchText.includes('similar')) {
      const connectionType = this.noteTypes.get('connection')
      if (connectionType) suggestions.push(connectionType)
    }

    if (searchText.includes('action') || searchText.includes('todo') || searchText.includes('task') || searchText.includes('do')) {
      const actionType = this.noteTypes.get('action')
      if (actionType) suggestions.push(actionType)
    }

    return suggestions
  }

  /**
   * Get note type statistics
   */
  async getNoteTypeStats(): Promise<{
    totalTypes: number
    defaultTypes: number
    customTypes: number
    totalTemplates: number
    defaultTemplates: number
    customTemplates: number
    mostUsedColors: Array<{ color: string; count: number }>
  }> {
    const types = Array.from(this.noteTypes.values())
    const templates = Array.from(this.noteTemplates.values())
    const defaultTypes = types.filter(t => t.isDefault)
    const customTypes = types.filter(t => !t.isDefault)
    const defaultTemplates = templates.filter(t => t.isDefault)
    const customTemplates = templates.filter(t => !t.isDefault)

    // Count color usage
    const colorCounts: Record<string, number> = {}
    types.forEach(type => {
      if (type.color) {
        colorCounts[type.color] = (colorCounts[type.color] || 0) + 1
      }
    })

    const mostUsedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color, count]) => ({ color, count }))

    return {
      totalTypes: types.length,
      defaultTypes: defaultTypes.length,
      customTypes: customTypes.length,
      totalTemplates: templates.length,
      defaultTemplates: defaultTemplates.length,
      customTemplates: customTemplates.length,
      mostUsedColors
    }
  }

  /**
   * Export note types and templates
   */
  async exportNoteTypes(): Promise<string> {
    const types = Array.from(this.noteTypes.values())
    const templates = Array.from(this.noteTemplates.values())
    
    return JSON.stringify({
      types,
      templates
    }, null, 2)
  }

  /**
   * Import note types and templates
   */
  async importNoteTypes(data: string, mergeStrategy: 'replace' | 'merge' = 'merge'): Promise<{
    types: NoteType[]
    templates: NoteTemplate[]
  }> {
    try {
      const imported = JSON.parse(data)
      const processedTypes: NoteType[] = []
      const processedTemplates: NoteTemplate[] = []

      // Process types
      if (imported.types) {
        for (const type of imported.types) {
          try {
            this.validateNoteType(type)

            if (mergeStrategy === 'replace') {
              this.noteTypes.set(type.id, type)
              processedTypes.push(type)
            } else {
              const existingType = this.noteTypes.get(type.id)
              if (existingType) {
                if (existingType.isDefault) {
                  continue // Skip default types
                }
                const updatedType = { ...existingType, ...type, id: existingType.id }
                this.noteTypes.set(existingType.id, updatedType)
                processedTypes.push(updatedType)
              } else {
                this.noteTypes.set(type.id, type)
                processedTypes.push(type)
              }
            }
          } catch (error) {
            console.warn(`Failed to import note type ${type.name}:`, error)
          }
        }
      }

      // Process templates
      if (imported.templates) {
        for (const template of imported.templates) {
          try {
            this.validateTemplate(template)

            if (mergeStrategy === 'replace') {
              this.noteTemplates.set(template.id, template)
              processedTemplates.push(template)
            } else {
              const existingTemplate = this.noteTemplates.get(template.id)
              if (existingTemplate) {
                if (existingTemplate.isDefault) {
                  continue // Skip default templates
                }
                const updatedTemplate = { ...existingTemplate, ...template, id: existingTemplate.id }
                this.noteTemplates.set(existingTemplate.id, updatedTemplate)
                processedTemplates.push(updatedTemplate)
              } else {
                this.noteTemplates.set(template.id, template)
                processedTemplates.push(template)
              }
            }
          } catch (error) {
            console.warn(`Failed to import template ${template.name}:`, error)
          }
        }
      }

      return { types: processedTypes, templates: processedTemplates }
    } catch (error) {
      throw new Error(`Failed to import note types: ${error}`)
    }
  }

  /**
   * Reset to default types and templates
   */
  async resetToDefaults(): Promise<void> {
    // Remove all non-default types
    const customTypes = Array.from(this.noteTypes.values())
      .filter(t => !t.isDefault)
    
    customTypes.forEach(type => {
      this.noteTypes.delete(type.id)
    })

    // Remove all non-default templates
    const customTemplates = Array.from(this.noteTemplates.values())
      .filter(t => !t.isDefault)
    
    customTemplates.forEach(template => {
      this.noteTemplates.delete(template.id)
    })

    // Re-initialize defaults
    this.initializeDefaultTypes()
    this.initializeDefaultTemplates()
  }

  /**
   * Validate note type data
   */
  private validateNoteType(type: NoteType): void {
    if (!type.id) throw new Error('Note type ID is required')
    if (!type.name || type.name.trim().length === 0) {
      throw new Error('Note type name is required')
    }
    if (type.name.length > 50) {
      throw new Error('Note type name must be 50 characters or less')
    }
    if (type.color && !NOTE_COLORS.includes(type.color as any)) {
      throw new Error(`Invalid note color: ${type.color}`)
    }
    if (type.description && type.description.length > 200) {
      throw new Error('Note type description must be 200 characters or less')
    }
  }

  /**
   * Validate template data
   */
  private validateTemplate(template: NoteTemplate): void {
    if (!template.id) throw new Error('Template ID is required')
    if (!template.name || template.name.trim().length === 0) {
      throw new Error('Template name is required')
    }
    if (template.name.length > 100) {
      throw new Error('Template name must be 100 characters or less')
    }
    if (!template.content || template.content.trim().length === 0) {
      throw new Error('Template content is required')
    }
    if (!template.type) throw new Error('Template type is required')
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    let id: string
    do {
      id = Math.random().toString(36).substr(2, 9)
    } while (this.noteTypes.has(id) || this.noteTemplates.has(id))
    return id
  }

  /**
   * Initialize default note types
   */
  private initializeDefaultTypes(): void {
    this.defaultTypes.forEach(type => {
      this.noteTypes.set(type.id, { ...type })
    })
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    this.defaultTemplates.forEach(template => {
      this.noteTemplates.set(template.id, { ...template })
    })
  }

  /**
   * Process conditional blocks in template
   */
  private processConditionalBlocks(content: string, variables: Record<string, any>): string {
    // Simple conditional processing: {{#if variable}}...{{/if}}
    return content.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, block) => {
      return variables[variable] ? block : ''
    })
  }

  /**
   * Process loops in template
   */
  private processLoops(content: string, variables: Record<string, any>): string {
    // Simple loop processing: {{#each array}}...{{/each}}
    return content.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, block) => {
      const array = variables[arrayName]
      if (!Array.isArray(array)) return ''

      return array.map(item => {
        let processedBlock = block
        Object.entries(item).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`
          processedBlock = processedBlock.replace(new RegExp(placeholder, 'g'), String(value))
        })
        return processedBlock
      }).join('')
    })
  }
}

/**
 * Create note type service instance
 */
export function createNoteTypeService(): NoteTypeService {
  return new NoteTypeService()
}
