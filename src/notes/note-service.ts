/**
 * Note Service
 * Manages note creation, storage, and retrieval
 */

import { 
  Note, 
  NoteService as INoteService,
  CreateNoteRequest,
  UpdateNoteRequest,
  DeleteNoteRequest,
  NoteFilter,
  NoteSearchResult,
  NoteStats,
  NoteExport,
  NoteImport,
  NoteAttachment
} from './types'
import { v4 as uuidv4 } from 'uuid'

// Note storage interface
export interface NoteStorage {
  saveNote(note: Note): Promise<void>
  loadNote(id: string): Promise<Note | null>
  loadNotesByBook(bookId: string): Promise<Note[]>
  loadNotesBySection(sectionId: string): Promise<Note[]>
  loadNotesByHighlight(highlightId: string): Promise<Note[]>
  deleteNote(id: string): Promise<void>
  updateNote(note: Note): Promise<void>
  searchNotes(query: string): Promise<Note[]>
  saveAttachment(attachment: NoteAttachment): Promise<void>
  loadAttachment(id: string): Promise<NoteAttachment | null>
  deleteAttachment(id: string): Promise<void>
}

export class NoteService implements INoteService {
  private storage: NoteStorage
  private notes: Map<string, Note> = new Map()
  private attachments: Map<string, NoteAttachment> = new Map()

  constructor(storage: NoteStorage) {
    this.storage = storage
    this.loadNotes()
  }

  /**
   * Create a new note
   */
  async createNote(request: CreateNoteRequest): Promise<Note> {
    const note: Note = {
      id: uuidv4(),
      bookId: request.bookId,
      sectionId: request.sectionId,
      highlightId: request.highlightId,
      title: request.title,
      content: request.content,
      type: request.type,
      tags: request.tags || [],
      isPrivate: request.isPrivate || false,
      isPinned: request.isPinned || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      position: request.position,
      attachments: [],
      linkedNotes: []
    }

    // Process attachments if provided
    if (request.attachments) {
      note.attachments = await this.processAttachments(request.attachments)
    }

    // Validate note
    this.validateNote(note)

    // Save to storage
    await this.storage.saveNote(note)
    this.notes.set(note.id, note)

    return note
  }

  /**
   * Update an existing note
   */
  async updateNote(request: UpdateNoteRequest): Promise<Note> {
    const note = this.notes.get(request.id)
    if (!note) {
      throw new Error(`Note not found: ${request.id}`)
    }

    // Update fields
    if (request.title !== undefined) note.title = request.title
    if (request.content !== undefined) note.content = request.content
    if (request.type !== undefined) note.type = request.type
    if (request.tags !== undefined) note.tags = request.tags
    if (request.isPrivate !== undefined) note.isPrivate = request.isPrivate
    if (request.isPinned !== undefined) note.isPinned = request.isPinned
    if (request.position !== undefined) note.position = request.position

    note.updatedAt = new Date()

    // Validate updated note
    this.validateNote(note)

    // Save to storage
    await this.storage.updateNote(note)
    this.notes.set(note.id, note)

    return note
  }

  /**
   * Delete a note
   */
  async deleteNote(request: DeleteNoteRequest): Promise<void> {
    const note = this.notes.get(request.id)
    if (!note) {
      throw new Error(`Note not found: ${request.id}`)
    }

    // Delete attachments
    if (note.attachments) {
      for (const attachment of note.attachments) {
        await this.storage.deleteAttachment(attachment.id)
        this.attachments.delete(attachment.id)
      }
    }

    // Remove from storage
    await this.storage.deleteNote(request.id)
    this.notes.delete(request.id)
  }

  /**
   * Get a note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    return this.notes.get(id) || null
  }

  /**
   * Get notes by book ID
   */
  async getNotesByBook(bookId: string): Promise<Note[]> {
    const notes = Array.from(this.notes.values())
    return notes.filter(n => n.bookId === bookId)
  }

  /**
   * Get notes by section ID
   */
  async getNotesBySection(sectionId: string): Promise<Note[]> {
    const notes = Array.from(this.notes.values())
    return notes.filter(n => n.sectionId === sectionId)
  }

  /**
   * Get notes by highlight ID
   */
  async getNotesByHighlight(highlightId: string): Promise<Note[]> {
    const notes = Array.from(this.notes.values())
    return notes.filter(n => n.highlightId === highlightId)
  }

  /**
   * Search notes with filter
   */
  async searchNotes(filter: NoteFilter): Promise<NoteSearchResult[]> {
    let notes = Array.from(this.notes.values())

    // Apply filters
    if (filter.types && filter.types.length > 0) {
      notes = notes.filter(n => filter.types!.includes(n.type))
    }

    if (filter.tags && filter.tags.length > 0) {
      notes = notes.filter(n => 
        filter.tags!.some(tag => n.tags.includes(tag))
      )
    }

    if (filter.dateRange) {
      notes = notes.filter(n => 
        n.createdAt >= filter.dateRange!.start && 
        n.createdAt <= filter.dateRange!.end
      )
    }

    if (filter.bookIds && filter.bookIds.length > 0) {
      notes = notes.filter(n => filter.bookIds!.includes(n.bookId))
    }

    if (filter.sectionIds && filter.sectionIds.length > 0) {
      notes = notes.filter(n => filter.sectionIds!.includes(n.sectionId))
    }

    if (filter.highlightIds && filter.highlightIds.length > 0) {
      notes = notes.filter(n => n.highlightId && filter.highlightIds!.includes(n.highlightId))
    }

    if (filter.isPrivate !== undefined) {
      notes = notes.filter(n => n.isPrivate === filter.isPrivate)
    }

    if (filter.isPinned !== undefined) {
      notes = notes.filter(n => n.isPinned === filter.isPinned)
    }

    if (filter.hasAttachments !== undefined) {
      notes = notes.filter(n => 
        filter.hasAttachments ? (n.attachments && n.attachments.length > 0) : (!n.attachments || n.attachments.length === 0)
      )
    }

    if (filter.hasLinkedNotes !== undefined) {
      notes = notes.filter(n => 
        filter.hasLinkedNotes ? (n.linkedNotes && n.linkedNotes.length > 0) : (!n.linkedNotes || n.linkedNotes.length === 0)
      )
    }

    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase()
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(searchText) ||
        n.content.toLowerCase().includes(searchText) ||
        n.tags.some(tag => tag.toLowerCase().includes(searchText))
      )
    }

    // Convert to search results with relevance scoring
    const results: NoteSearchResult[] = notes.map(note => ({
      note,
      relevanceScore: this.calculateRelevanceScore(note, filter),
      matchedFields: this.getMatchedFields(note, filter),
      context: this.getNoteContext(note)
    }))

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return results
  }

  /**
   * Get note statistics
   */
  async getNoteStats(): Promise<NoteStats> {
    const notes = Array.from(this.notes.values())

    const stats: NoteStats = {
      totalNotes: notes.length,
      notesByType: {},
      notesByBook: {},
      notesByTag: {},
      recentNotes: notes
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
      mostUsedTypes: this.getMostUsedTypes(notes),
      mostUsedTags: this.getMostUsedTags(notes),
      averageNoteLength: this.calculateAverageNoteLength(notes),
      totalAttachments: this.countTotalAttachments(notes)
    }

    // Calculate distributions
    notes.forEach(note => {
      stats.notesByType[note.type] = (stats.notesByType[note.type] || 0) + 1
      stats.notesByBook[note.bookId] = (stats.notesByBook[note.bookId] || 0) + 1
      
      note.tags.forEach(tag => {
        stats.notesByTag[tag] = (stats.notesByTag[tag] || 0) + 1
      })
    })

    return stats
  }

  /**
   * Export notes
   */
  async exportNotes(options: NoteExport): Promise<string> {
    let notes = Array.from(this.notes.values())

    // Apply date range filter if specified
    if (options.dateRange) {
      notes = notes.filter(n => 
        n.createdAt >= options.dateRange!.start && 
        n.createdAt <= options.dateRange!.end
      )
    }

    // Group notes
    const groupedNotes = this.groupNotes(notes, options.groupBy)

    switch (options.format) {
      case 'json':
        return JSON.stringify(groupedNotes, null, 2)
      
      case 'csv':
        return this.exportToCSV(notes, options)
      
      case 'markdown':
        return this.exportToMarkdown(notes, options)
      
      case 'html':
        return this.exportToHTML(notes, options)
      
      case 'pdf':
        return this.exportToPDF(notes, options)
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  /**
   * Import notes
   */
  async importNotes(options: NoteImport): Promise<Note[]> {
    let notes: Note[] = []

    try {
      switch (options.format) {
        case 'json':
          notes = JSON.parse(options.data)
          break
        
        case 'csv':
          notes = this.importFromCSV(options.data)
          break
        
        case 'markdown':
          notes = this.importFromMarkdown(options.data)
          break
        
        default:
          throw new Error(`Unsupported import format: ${options.format}`)
      }

      // Validate and process notes
      const processedNotes: Note[] = []
      
      for (const note of notes) {
        try {
          // Generate new ID
          note.id = uuidv4()
          note.createdAt = new Date()
          note.updatedAt = new Date()

          // Validate note
          this.validateNote(note)

          // Check for existing notes based on merge strategy
          if (options.mergeStrategy === 'skip') {
            const existing = this.notes.get(note.id)
            if (existing) continue
          }

          // Process attachments if importing them
          if (options.importAttachments && note.attachments) {
            note.attachments = await this.processAttachments(note.attachments)
          }

          // Save note
          await this.storage.saveNote(note)
          this.notes.set(note.id, note)
          processedNotes.push(note)
        } catch (error) {
          console.warn(`Failed to import note:`, error)
        }
      }

      return processedNotes
    } catch (error) {
      throw new Error(`Failed to import notes: ${error}`)
    }
  }

  /**
   * Link two notes
   */
  async linkNotes(noteId1: string, noteId2: string): Promise<void> {
    const note1 = this.notes.get(noteId1)
    const note2 = this.notes.get(noteId2)

    if (!note1 || !note2) {
      throw new Error('One or both notes not found')
    }

    // Add bidirectional links
    if (!note1.linkedNotes) note1.linkedNotes = []
    if (!note2.linkedNotes) note2.linkedNotes = []

    if (!note1.linkedNotes.includes(noteId2)) {
      note1.linkedNotes.push(noteId2)
    }
    if (!note2.linkedNotes.includes(noteId1)) {
      note2.linkedNotes.push(noteId1)
    }

    // Update both notes
    note1.updatedAt = new Date()
    note2.updatedAt = new Date()

    await this.storage.updateNote(note1)
    await this.storage.updateNote(note2)
    this.notes.set(noteId1, note1)
    this.notes.set(noteId2, note2)
  }

  /**
   * Unlink two notes
   */
  async unlinkNotes(noteId1: string, noteId2: string): Promise<void> {
    const note1 = this.notes.get(noteId1)
    const note2 = this.notes.get(noteId2)

    if (!note1 || !note2) {
      throw new Error('One or both notes not found')
    }

    // Remove bidirectional links
    if (note1.linkedNotes) {
      note1.linkedNotes = note1.linkedNotes.filter(id => id !== noteId2)
    }
    if (note2.linkedNotes) {
      note2.linkedNotes = note2.linkedNotes.filter(id => id !== noteId1)
    }

    // Update both notes
    note1.updatedAt = new Date()
    note2.updatedAt = new Date()

    await this.storage.updateNote(note1)
    await this.storage.updateNote(note2)
    this.notes.set(noteId1, note1)
    this.notes.set(noteId2, note2)
  }

  /**
   * Process attachments
   */
  private async processAttachments(attachments: Omit<NoteAttachment, 'id' | 'createdAt'>[]): Promise<NoteAttachment[]> {
    const processedAttachments: NoteAttachment[] = []

    for (const attachment of attachments) {
      const processedAttachment: NoteAttachment = {
        ...attachment,
        id: uuidv4(),
        createdAt: new Date()
      }

      await this.storage.saveAttachment(processedAttachment)
      this.attachments.set(processedAttachment.id, processedAttachment)
      processedAttachments.push(processedAttachment)
    }

    return processedAttachments
  }

  /**
   * Load notes from storage
   */
  private async loadNotes(): Promise<void> {
    try {
      // This would load from the storage implementation
      // For now, we'll start with an empty map
      this.notes.clear()
    } catch (error) {
      console.warn('Failed to load notes:', error)
    }
  }

  /**
   * Validate note data
   */
  private validateNote(note: Note): void {
    if (!note.id) throw new Error('Note ID is required')
    if (!note.bookId) throw new Error('Book ID is required')
    if (!note.sectionId) throw new Error('Section ID is required')
    if (!note.title || note.title.trim().length === 0) {
      throw new Error('Note title is required')
    }
    if (!note.content || note.content.trim().length === 0) {
      throw new Error('Note content is required')
    }
    if (!note.type) throw new Error('Note type is required')
  }

  /**
   * Calculate relevance score for search
   */
  private calculateRelevanceScore(note: Note, filter: NoteFilter): number {
    let score = 0

    // Text match score
    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase()
      const title = note.title.toLowerCase()
      const content = note.content.toLowerCase()
      
      if (title.includes(searchText)) score += 20
      if (content.includes(searchText)) score += 10
      if (note.tags.some(tag => tag.toLowerCase().includes(searchText))) score += 5
    }

    // Recency score
    const daysSinceCreation = (Date.now() - note.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 10 - daysSinceCreation)

    // Pinned notes get bonus
    if (note.isPinned) score += 5

    return score
  }

  /**
   * Get matched fields for search result
   */
  private getMatchedFields(note: Note, filter: NoteFilter): string[] {
    const matchedFields: string[] = []

    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase()
      if (note.title.toLowerCase().includes(searchText)) matchedFields.push('title')
      if (note.content.toLowerCase().includes(searchText)) matchedFields.push('content')
      if (note.tags.some(tag => tag.toLowerCase().includes(searchText))) matchedFields.push('tags')
    }

    return matchedFields
  }

  /**
   * Get note context
   */
  private getNoteContext(note: Note) {
    // This would be implemented to provide context information
    return {
      bookTitle: 'Unknown Book',
      sectionTitle: 'Unknown Section',
      highlightText: note.highlightId ? 'Unknown Highlight' : undefined
    }
  }

  /**
   * Get most used note types
   */
  private getMostUsedTypes(notes: Note[]) {
    const typeCounts: Record<string, number> = {}
    
    notes.forEach(note => {
      typeCounts[note.type] = (typeCounts[note.type] || 0) + 1
    })

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  }

  /**
   * Get most used tags
   */
  private getMostUsedTags(notes: Note[]) {
    const tagCounts: Record<string, number> = {}
    
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))
  }

  /**
   * Calculate average note length
   */
  private calculateAverageNoteLength(notes: Note[]): number {
    if (notes.length === 0) return 0
    const totalLength = notes.reduce((sum, note) => sum + note.content.length, 0)
    return Math.round(totalLength / notes.length)
  }

  /**
   * Count total attachments
   */
  private countTotalAttachments(notes: Note[]): number {
    return notes.reduce((count, note) => count + (note.attachments?.length || 0), 0)
  }

  /**
   * Group notes by criteria
   */
  private groupNotes(notes: Note[], groupBy: string) {
    switch (groupBy) {
      case 'book':
        return this.groupByBook(notes)
      case 'type':
        return this.groupByType(notes)
      case 'date':
        return this.groupByDate(notes)
      case 'tag':
        return this.groupByTag(notes)
      default:
        return notes
    }
  }

  /**
   * Group notes by book
   */
  private groupByBook(notes: Note[]) {
    const groups: Record<string, Note[]> = {}
    notes.forEach(note => {
      if (!groups[note.bookId]) {
        groups[note.bookId] = []
      }
      groups[note.bookId].push(note)
    })
    return groups
  }

  /**
   * Group notes by type
   */
  private groupByType(notes: Note[]) {
    const groups: Record<string, Note[]> = {}
    notes.forEach(note => {
      if (!groups[note.type]) {
        groups[note.type] = []
      }
      groups[note.type].push(note)
    })
    return groups
  }

  /**
   * Group notes by date
   */
  private groupByDate(notes: Note[]) {
    const groups: Record<string, Note[]> = {}
    notes.forEach(note => {
      const date = note.createdAt.toISOString().split('T')[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(note)
    })
    return groups
  }

  /**
   * Group notes by tag
   */
  private groupByTag(notes: Note[]) {
    const groups: Record<string, Note[]> = {}
    notes.forEach(note => {
      note.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = []
        }
        groups[tag].push(note)
      })
    })
    return groups
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(notes: Note[], options: NoteExport): string {
    const headers = ['ID', 'Book ID', 'Section ID', 'Title', 'Content', 'Type', 'Tags', 'Created At', 'Updated At']
    const rows = notes.map(n => [
      n.id,
      n.bookId,
      n.sectionId,
      `"${n.title.replace(/"/g, '""')}"`,
      `"${n.content.replace(/"/g, '""')}"`,
      n.type,
      n.tags.join(';'),
      n.createdAt.toISOString(),
      n.updatedAt.toISOString()
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  /**
   * Export to Markdown format
   */
  private exportToMarkdown(notes: Note[], options: NoteExport): string {
    let markdown = '# Notes Export\n\n'
    
    notes.forEach(note => {
      markdown += `## ${note.title}\n\n`
      markdown += `**Type:** ${note.type}\n`
      markdown += `**Created:** ${note.createdAt.toLocaleDateString()}\n`
      if (note.tags.length > 0) {
        markdown += `**Tags:** ${note.tags.join(', ')}\n`
      }
      markdown += `\n${note.content}\n\n`
      markdown += '---\n\n'
    })

    return markdown
  }

  /**
   * Export to HTML format
   */
  private exportToHTML(notes: Note[], options: NoteExport): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Notes Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .note { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .note-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .note-meta { color: #666; font-size: 12px; margin-bottom: 10px; }
          .note-content { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>Notes Export</h1>
    `

    notes.forEach(note => {
      html += `
        <div class="note">
          <div class="note-title">${note.title}</div>
          <div class="note-meta">
            Type: ${note.type} | Created: ${note.createdAt.toLocaleDateString()}
            ${note.tags.length > 0 ? ` | Tags: ${note.tags.join(', ')}` : ''}
          </div>
          <div class="note-content">${note.content}</div>
        </div>
      `
    })

    html += '</body></html>'
    return html
  }

  /**
   * Export to PDF format (placeholder)
   */
  private exportToPDF(notes: Note[], options: NoteExport): string {
    // This would need a PDF generation library
    throw new Error('PDF export not yet implemented')
  }

  /**
   * Import from CSV format
   */
  private importFromCSV(data: string): Note[] {
    const lines = data.split('\n')
    const headers = lines[0].split(',')
    const notes: Note[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length < headers.length) continue

      const note: Partial<Note> = {}
      headers.forEach((header, index) => {
        const value = values[index]?.replace(/^"|"$/g, '').replace(/""/g, '"') || ''
        
        switch (header.trim()) {
          case 'ID':
            note.id = value
            break
          case 'Book ID':
            note.bookId = value
            break
          case 'Section ID':
            note.sectionId = value
            break
          case 'Title':
            note.title = value
            break
          case 'Content':
            note.content = value
            break
          case 'Type':
            note.type = value
            break
          case 'Tags':
            note.tags = value ? value.split(';') : []
            break
          case 'Created At':
            note.createdAt = new Date(value)
            break
          case 'Updated At':
            note.updatedAt = new Date(value)
            break
        }
      })

      if (note.id && note.bookId && note.sectionId && note.title && note.content && note.type) {
        notes.push(note as Note)
      }
    }

    return notes
  }

  /**
   * Import from Markdown format
   */
  private importFromMarkdown(data: string): Note[] {
    // This would parse markdown and extract notes
    // For now, return empty array
    return []
  }
}

/**
 * Create note service instance
 */
export function createNoteService(storage: NoteStorage): NoteService {
  return new NoteService(storage)
}
