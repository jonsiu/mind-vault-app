/**
 * Highlight Service
 * Manages highlight creation, storage, and retrieval
 */

import { 
  Highlight, 
  HighlightService as IHighlightService,
  CreateHighlightRequest,
  UpdateHighlightRequest,
  DeleteHighlightRequest,
  HighlightFilter,
  HighlightSearchResult,
  HighlightStats,
  HighlightExport,
  HighlightImport
} from './types'
import { HighlightStorage } from './types'
import { v4 as uuidv4 } from 'uuid'

export class HighlightService implements IHighlightService {
  private storage: HighlightStorage
  private highlights: Map<string, Highlight> = new Map()

  constructor(storage: HighlightStorage) {
    this.storage = storage
    this.loadHighlights()
  }

  /**
   * Create a new highlight
   */
  async createHighlight(request: CreateHighlightRequest): Promise<Highlight> {
    const highlight: Highlight = {
      id: uuidv4(),
      bookId: request.bookId,
      sectionId: request.sectionId,
      cfi: request.cfi,
      text: request.text,
      type: request.type,
      color: request.color || this.getDefaultColorForType(request.type),
      note: request.note,
      tags: request.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Validate highlight
    this.validateHighlight(highlight)

    // Save to storage
    await this.storage.saveHighlight(highlight)
    this.highlights.set(highlight.id, highlight)

    return highlight
  }

  /**
   * Update an existing highlight
   */
  async updateHighlight(request: UpdateHighlightRequest): Promise<Highlight> {
    const highlight = this.highlights.get(request.id)
    if (!highlight) {
      throw new Error(`Highlight not found: ${request.id}`)
    }

    // Update fields
    if (request.type !== undefined) highlight.type = request.type
    if (request.color !== undefined) highlight.color = request.color
    if (request.note !== undefined) highlight.note = request.note
    if (request.tags !== undefined) highlight.tags = request.tags

    highlight.updatedAt = new Date()

    // Validate updated highlight
    this.validateHighlight(highlight)

    // Save to storage
    await this.storage.updateHighlight(highlight)
    this.highlights.set(highlight.id, highlight)

    return highlight
  }

  /**
   * Delete a highlight
   */
  async deleteHighlight(request: DeleteHighlightRequest): Promise<void> {
    const highlight = this.highlights.get(request.id)
    if (!highlight) {
      throw new Error(`Highlight not found: ${request.id}`)
    }

    // Remove from storage
    await this.storage.deleteHighlight(request.id)
    this.highlights.delete(request.id)
  }

  /**
   * Get a highlight by ID
   */
  async getHighlight(id: string): Promise<Highlight | null> {
    return this.highlights.get(id) || null
  }

  /**
   * Get highlights by book ID
   */
  async getHighlightsByBook(bookId: string): Promise<Highlight[]> {
    const highlights = Array.from(this.highlights.values())
    return highlights.filter(h => h.bookId === bookId)
  }

  /**
   * Get highlights by section ID
   */
  async getHighlightsBySection(sectionId: string): Promise<Highlight[]> {
    const highlights = Array.from(this.highlights.values())
    return highlights.filter(h => h.sectionId === sectionId)
  }

  /**
   * Search highlights with filter
   */
  async searchHighlights(filter: HighlightFilter): Promise<HighlightSearchResult[]> {
    let highlights = Array.from(this.highlights.values())

    // Apply filters
    if (filter.types && filter.types.length > 0) {
      highlights = highlights.filter(h => filter.types!.includes(h.type))
    }

    if (filter.colors && filter.colors.length > 0) {
      highlights = highlights.filter(h => filter.colors!.includes(h.color))
    }

    if (filter.tags && filter.tags.length > 0) {
      highlights = highlights.filter(h => 
        filter.tags!.some(tag => h.tags.includes(tag))
      )
    }

    if (filter.dateRange) {
      highlights = highlights.filter(h => 
        h.createdAt >= filter.dateRange!.start && 
        h.createdAt <= filter.dateRange!.end
      )
    }

    if (filter.bookIds && filter.bookIds.length > 0) {
      highlights = highlights.filter(h => filter.bookIds!.includes(h.bookId))
    }

    if (filter.hasNotes !== undefined) {
      highlights = highlights.filter(h => 
        filter.hasNotes ? !!h.note : !h.note
      )
    }

    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase()
      highlights = highlights.filter(h => 
        h.text.toLowerCase().includes(searchText) ||
        (h.note && h.note.toLowerCase().includes(searchText)) ||
        h.tags.some(tag => tag.toLowerCase().includes(searchText))
      )
    }

    // Convert to search results with relevance scoring
    const results: HighlightSearchResult[] = highlights.map(highlight => ({
      highlight,
      context: this.getHighlightContext(highlight),
      relevanceScore: this.calculateRelevanceScore(highlight, filter)
    }))

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return results
  }

  /**
   * Get highlight statistics
   */
  async getHighlightStats(): Promise<HighlightStats> {
    const highlights = Array.from(this.highlights.values())

    const stats: HighlightStats = {
      totalHighlights: highlights.length,
      highlightsByType: {},
      highlightsByColor: {},
      highlightsByBook: {},
      recentHighlights: highlights
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
      mostUsedTypes: this.getMostUsedTypes(highlights)
    }

    // Calculate type distribution
    highlights.forEach(highlight => {
      stats.highlightsByType[highlight.type] = (stats.highlightsByType[highlight.type] || 0) + 1
      stats.highlightsByColor[highlight.color] = (stats.highlightsByColor[highlight.color] || 0) + 1
      stats.highlightsByBook[highlight.bookId] = (stats.highlightsByBook[highlight.bookId] || 0) + 1
    })

    return stats
  }

  /**
   * Export highlights
   */
  async exportHighlights(options: HighlightExport): Promise<string> {
    let highlights = Array.from(this.highlights.values())

    // Apply date range filter if specified
    if (options.dateRange) {
      highlights = highlights.filter(h => 
        h.createdAt >= options.dateRange!.start && 
        h.createdAt <= options.dateRange!.end
      )
    }

    // Group highlights
    const groupedHighlights = this.groupHighlights(highlights, options.groupBy)

    switch (options.format) {
      case 'json':
        return JSON.stringify(groupedHighlights, null, 2)
      
      case 'csv':
        return this.exportToCSV(highlights, options)
      
      case 'markdown':
        return this.exportToMarkdown(highlights, options)
      
      case 'html':
        return this.exportToHTML(highlights, options)
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  /**
   * Import highlights
   */
  async importHighlights(options: HighlightImport): Promise<Highlight[]> {
    let highlights: Highlight[] = []

    try {
      switch (options.format) {
        case 'json':
          highlights = JSON.parse(options.data)
          break
        
        case 'csv':
          highlights = this.importFromCSV(options.data)
          break
        
        default:
          throw new Error(`Unsupported import format: ${options.format}`)
      }

      // Validate and process highlights
      const processedHighlights: Highlight[] = []
      
      for (const highlight of highlights) {
        try {
          // Generate new ID
          highlight.id = uuidv4()
          highlight.createdAt = new Date()
          highlight.updatedAt = new Date()

          // Validate highlight
          this.validateHighlight(highlight)

          // Check for existing highlights based on merge strategy
          if (options.mergeStrategy === 'skip') {
            const existing = this.highlights.get(highlight.id)
            if (existing) continue
          }

          // Save highlight
          await this.storage.saveHighlight(highlight)
          this.highlights.set(highlight.id, highlight)
          processedHighlights.push(highlight)
        } catch (error) {
          console.warn(`Failed to import highlight:`, error)
        }
      }

      return processedHighlights
    } catch (error) {
      throw new Error(`Failed to import highlights: ${error}`)
    }
  }

  /**
   * Load highlights from storage
   */
  private async loadHighlights(): Promise<void> {
    try {
      // This would load from the storage implementation
      // For now, we'll start with an empty map
      this.highlights.clear()
    } catch (error) {
      console.warn('Failed to load highlights:', error)
    }
  }

  /**
   * Validate highlight data
   */
  private validateHighlight(highlight: Highlight): void {
    if (!highlight.id) throw new Error('Highlight ID is required')
    if (!highlight.bookId) throw new Error('Book ID is required')
    if (!highlight.sectionId) throw new Error('Section ID is required')
    if (!highlight.cfi) throw new Error('CFI is required')
    if (!highlight.text || highlight.text.trim().length === 0) {
      throw new Error('Highlight text is required')
    }
    if (!highlight.type) throw new Error('Highlight type is required')
    if (!highlight.color) throw new Error('Highlight color is required')
  }

  /**
   * Get default color for highlight type
   */
  private getDefaultColorForType(type: string): string {
    const defaultColors: Record<string, string> = {
      'important': '#ffeb3b',
      'question': '#2196f3',
      'insight': '#4caf50',
      'confusion': '#ff9800',
      'action': '#e91e63'
    }
    return defaultColors[type] || '#ffeb3b'
  }

  /**
   * Get highlight context
   */
  private getHighlightContext(highlight: Highlight) {
    // This would be implemented to provide context information
    return {
      bookId: highlight.bookId,
      sectionId: highlight.sectionId,
      sectionTitle: 'Unknown Section',
      chapterTitle: 'Unknown Chapter',
      pageNumber: undefined,
      surroundingText: highlight.text
    }
  }

  /**
   * Calculate relevance score for search
   */
  private calculateRelevanceScore(highlight: Highlight, filter: HighlightFilter): number {
    let score = 0

    // Text match score
    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase()
      const text = highlight.text.toLowerCase()
      const note = highlight.note?.toLowerCase() || ''
      
      if (text.includes(searchText)) score += 10
      if (note.includes(searchText)) score += 5
      if (highlight.tags.some(tag => tag.toLowerCase().includes(searchText))) score += 3
    }

    // Recency score
    const daysSinceCreation = (Date.now() - highlight.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 10 - daysSinceCreation)

    return score
  }

  /**
   * Get most used highlight types
   */
  private getMostUsedTypes(highlights: Highlight[]) {
    const typeCounts: Record<string, number> = {}
    
    highlights.forEach(highlight => {
      typeCounts[highlight.type] = (typeCounts[highlight.type] || 0) + 1
    })

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  }

  /**
   * Group highlights by criteria
   */
  private groupHighlights(highlights: Highlight[], groupBy: string) {
    switch (groupBy) {
      case 'book':
        return this.groupByBook(highlights)
      case 'type':
        return this.groupByType(highlights)
      case 'date':
        return this.groupByDate(highlights)
      default:
        return highlights
    }
  }

  /**
   * Group highlights by book
   */
  private groupByBook(highlights: Highlight[]) {
    const groups: Record<string, Highlight[]> = {}
    highlights.forEach(highlight => {
      if (!groups[highlight.bookId]) {
        groups[highlight.bookId] = []
      }
      groups[highlight.bookId].push(highlight)
    })
    return groups
  }

  /**
   * Group highlights by type
   */
  private groupByType(highlights: Highlight[]) {
    const groups: Record<string, Highlight[]> = {}
    highlights.forEach(highlight => {
      if (!groups[highlight.type]) {
        groups[highlight.type] = []
      }
      groups[highlight.type].push(highlight)
    })
    return groups
  }

  /**
   * Group highlights by date
   */
  private groupByDate(highlights: Highlight[]) {
    const groups: Record<string, Highlight[]> = {}
    highlights.forEach(highlight => {
      const date = highlight.createdAt.toISOString().split('T')[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(highlight)
    })
    return groups
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(highlights: Highlight[], options: HighlightExport): string {
    const headers = ['ID', 'Book ID', 'Section ID', 'Text', 'Type', 'Color', 'Note', 'Tags', 'Created At']
    const rows = highlights.map(h => [
      h.id,
      h.bookId,
      h.sectionId,
      `"${h.text.replace(/"/g, '""')}"`,
      h.type,
      h.color,
      h.note ? `"${h.note.replace(/"/g, '""')}"` : '',
      h.tags.join(';'),
      h.createdAt.toISOString()
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  /**
   * Export to Markdown format
   */
  private exportToMarkdown(highlights: Highlight[], options: HighlightExport): string {
    let markdown = '# Highlights Export\n\n'
    
    highlights.forEach(highlight => {
      markdown += `## ${highlight.type} - ${highlight.createdAt.toLocaleDateString()}\n\n`
      markdown += `**Text:** ${highlight.text}\n\n`
      if (highlight.note) {
        markdown += `**Note:** ${highlight.note}\n\n`
      }
      if (highlight.tags.length > 0) {
        markdown += `**Tags:** ${highlight.tags.join(', ')}\n\n`
      }
      markdown += '---\n\n'
    })

    return markdown
  }

  /**
   * Export to HTML format
   */
  private exportToHTML(highlights: Highlight[], options: HighlightExport): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Highlights Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .highlight { background-color: #ffeb3b; padding: 2px 4px; margin: 2px 0; }
          .note { background-color: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #2196f3; }
        </style>
      </head>
      <body>
        <h1>Highlights Export</h1>
    `

    highlights.forEach(highlight => {
      html += `
        <div class="highlight-item">
          <h3>${highlight.type} - ${highlight.createdAt.toLocaleDateString()}</h3>
          <div class="highlight">${highlight.text}</div>
          ${highlight.note ? `<div class="note"><strong>Note:</strong> ${highlight.note}</div>` : ''}
          ${highlight.tags.length > 0 ? `<p><strong>Tags:</strong> ${highlight.tags.join(', ')}</p>` : ''}
        </div>
      `
    })

    html += '</body></html>'
    return html
  }

  /**
   * Import from CSV format
   */
  private importFromCSV(data: string): Highlight[] {
    const lines = data.split('\n')
    const headers = lines[0].split(',')
    const highlights: Highlight[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length < headers.length) continue

      const highlight: Partial<Highlight> = {}
      headers.forEach((header, index) => {
        const value = values[index]?.replace(/^"|"$/g, '').replace(/""/g, '"') || ''
        
        switch (header.trim()) {
          case 'ID':
            highlight.id = value
            break
          case 'Book ID':
            highlight.bookId = value
            break
          case 'Section ID':
            highlight.sectionId = value
            break
          case 'Text':
            highlight.text = value
            break
          case 'Type':
            highlight.type = value
            break
          case 'Color':
            highlight.color = value
            break
          case 'Note':
            highlight.note = value || undefined
            break
          case 'Tags':
            highlight.tags = value ? value.split(';') : []
            break
          case 'Created At':
            highlight.createdAt = new Date(value)
            break
        }
      })

      if (highlight.id && highlight.bookId && highlight.sectionId && highlight.text && highlight.type) {
        highlights.push(highlight as Highlight)
      }
    }

    return highlights
  }
}

/**
 * Create highlight service instance
 */
export function createHighlightService(storage: HighlightStorage): HighlightService {
  return new HighlightService(storage)
}
