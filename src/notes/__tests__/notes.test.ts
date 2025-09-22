/**
 * Note-Taking System Tests
 * Tests for the note-taking functionality
 */

import { 
  createNoteTypeService, 
  DEFAULT_NOTE_TYPES,
  DEFAULT_NOTE_TEMPLATES,
  NOTE_COLORS
} from '../index'

describe('Note-Taking System', () => {
  test('should create note type service', () => {
    const service = createNoteTypeService()
    expect(service).toBeDefined()
  })

  test('should have default note types', () => {
    expect(DEFAULT_NOTE_TYPES).toBeDefined()
    expect(DEFAULT_NOTE_TYPES.length).toBeGreaterThan(0)
    
    const summaryType = DEFAULT_NOTE_TYPES.find(t => t.id === 'summary')
    expect(summaryType).toBeDefined()
    expect(summaryType?.name).toBe('Summary')
    expect(summaryType?.icon).toBe('📝')
  })

  test('should have default note templates', () => {
    expect(DEFAULT_NOTE_TEMPLATES).toBeDefined()
    expect(DEFAULT_NOTE_TEMPLATES.length).toBeGreaterThan(0)
    
    const bookSummaryTemplate = DEFAULT_NOTE_TEMPLATES.find(t => t.id === 'book-summary')
    expect(bookSummaryTemplate).toBeDefined()
    expect(bookSummaryTemplate?.name).toBe('Book Summary')
  })

  test('should have note colors', () => {
    expect(NOTE_COLORS).toBeDefined()
    expect(NOTE_COLORS.length).toBeGreaterThan(0)
    expect(NOTE_COLORS).toContain('#2196f3')
  })
})

describe('Note Type Service', () => {
  let service: ReturnType<typeof createNoteTypeService>

  beforeEach(() => {
    service = createNoteTypeService()
  })

  test('should get default note types', async () => {
    const types = await service.getNoteTypes()
    expect(types.length).toBeGreaterThan(0)
    
    const defaultTypes = service.getDefaultNoteTypes()
    expect(defaultTypes.length).toBeGreaterThan(0)
  })

  test('should create custom note type', async () => {
    const customType = await service.createNoteType({
      name: 'Custom Note Type',
      color: '#ff0000',
      icon: '🔥',
      description: 'A custom note type',
      isDefault: false
    })

    expect(customType.id).toBeDefined()
    expect(customType.name).toBe('Custom Note Type')
    expect(customType.color).toBe('#ff0000')
    expect(customType.isDefault).toBe(false)
  })

  test('should not allow duplicate note type names', async () => {
    await service.createNoteType({
      name: 'Duplicate Type',
      color: '#ff0000',
      isDefault: false
    })

    await expect(service.createNoteType({
      name: 'Duplicate Type',
      color: '#00ff00',
      isDefault: false
    })).rejects.toThrow('already exists')
  })

  test('should update note type', async () => {
    const customType = await service.createNoteType({
      name: 'Update Test',
      color: '#ff0000',
      isDefault: false
    })

    const updatedType = await service.updateNoteType(customType.id, {
      name: 'Updated Name',
      color: '#00ff00'
    })

    expect(updatedType.name).toBe('Updated Name')
    expect(updatedType.color).toBe('#00ff00')
  })

  test('should not allow updating default types', async () => {
    const defaultTypes = service.getDefaultNoteTypes()
    const defaultType = defaultTypes[0]

    await expect(service.updateNoteType(defaultType.id, {
      name: 'Modified Default'
    })).rejects.toThrow('Cannot update default note types')
  })

  test('should delete custom note type', async () => {
    const customType = await service.createNoteType({
      name: 'Delete Test',
      color: '#ff0000',
      isDefault: false
    })

    await service.deleteNoteType(customType.id)
    
    const retrievedType = await service.getNoteType(customType.id)
    expect(retrievedType).toBeNull()
  })

  test('should not allow deleting default types', async () => {
    const defaultTypes = service.getDefaultNoteTypes()
    const defaultType = defaultTypes[0]

    await expect(service.deleteNoteType(defaultType.id))
      .rejects.toThrow('Cannot delete default note types')
  })

  test('should get available colors', () => {
    const colors = service.getAvailableColors()
    expect(colors).toEqual(NOTE_COLORS)
  })

  test('should get unused colors', () => {
    const unusedColors = service.getUnusedColors()
    expect(unusedColors.length).toBeGreaterThan(0)
  })

  test('should get note type templates', () => {
    const templates = service.getNoteTypeTemplates()
    expect(templates.length).toBeGreaterThan(0)
  })

  test('should get templates by type', async () => {
    const summaryTemplates = await service.getTemplatesByType('summary')
    expect(summaryTemplates.length).toBeGreaterThan(0)
  })

  test('should create template', async () => {
    const template = await service.createTemplate({
      name: 'Test Template',
      description: 'A test template',
      content: 'Test content with {{variable}}',
      type: 'summary',
      isDefault: false,
      variables: ['variable']
    })

    expect(template.id).toBeDefined()
    expect(template.name).toBe('Test Template')
    expect(template.content).toBe('Test content with {{variable}}')
  })

  test('should process template with variables', async () => {
    const template = await service.createTemplate({
      name: 'Variable Template',
      description: 'Template with variables',
      content: 'Hello {{name}}, today is {{date}}',
      type: 'summary',
      isDefault: false,
      variables: ['name', 'date']
    })

    const processed = await service.processTemplate(template.id, {
      name: 'John',
      date: 'Monday'
    })

    expect(processed).toBe('Hello John, today is Monday')
  })

  test('should suggest note types based on content', async () => {
    const suggestions = await service.getNoteTypeSuggestions('This is a summary of the key points')
    expect(suggestions.length).toBeGreaterThan(0)
    
    const summaryType = suggestions.find(s => s.id === 'summary')
    expect(summaryType).toBeDefined()
  })

  test('should get note type statistics', async () => {
    const stats = await service.getNoteTypeStats()
    expect(stats.totalTypes).toBeGreaterThan(0)
    expect(stats.defaultTypes).toBeGreaterThan(0)
    expect(stats.customTypes).toBe(0) // Initially no custom types
    expect(stats.totalTemplates).toBeGreaterThan(0)
  })

  test('should export note types', async () => {
    const exported = await service.exportNoteTypes()
    const parsed = JSON.parse(exported)
    expect(parsed.types).toBeDefined()
    expect(parsed.templates).toBeDefined()
  })

  test('should import note types', async () => {
    const exportData = await service.exportNoteTypes()
    const result = await service.importNoteTypes(exportData, 'merge')
    expect(result.types.length).toBeGreaterThan(0)
    expect(result.templates.length).toBeGreaterThan(0)
  })

  test('should reset to defaults', async () => {
    // Create a custom type
    await service.createNoteType({
      name: 'Custom Type',
      color: '#ff0000',
      isDefault: false
    })

    // Reset to defaults
    await service.resetToDefaults()

    // Check that custom type is gone
    const types = await service.getNoteTypes()
    const customType = types.find(t => t.name === 'Custom Type')
    expect(customType).toBeUndefined()
  })
})

describe('Note Service', () => {
  // Mock storage implementation
  const mockStorage = {
    saveNote: jest.fn().mockResolvedValue(undefined),
    loadNote: jest.fn().mockResolvedValue(null),
    loadNotesByBook: jest.fn().mockResolvedValue([]),
    loadNotesBySection: jest.fn().mockResolvedValue([]),
    loadNotesByHighlight: jest.fn().mockResolvedValue([]),
    deleteNote: jest.fn().mockResolvedValue(undefined),
    updateNote: jest.fn().mockResolvedValue(undefined),
    searchNotes: jest.fn().mockResolvedValue([]),
    saveAttachment: jest.fn().mockResolvedValue(undefined),
    loadAttachment: jest.fn().mockResolvedValue(null),
    deleteAttachment: jest.fn().mockResolvedValue(undefined)
  }

  test('should create note service with storage', () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)
    expect(service).toBeDefined()
  })

  test('should create note', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    const note = await service.createNote({
      bookId: 'test-book',
      sectionId: 'test-section',
      title: 'Test Note',
      content: 'This is a test note',
      type: 'summary'
    })

    expect(note.id).toBeDefined()
    expect(note.title).toBe('Test Note')
    expect(note.content).toBe('This is a test note')
    expect(note.type).toBe('summary')
  })

  test('should update note', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    // Create a note first
    const note = await service.createNote({
      bookId: 'test-book',
      sectionId: 'test-section',
      title: 'Test Note',
      content: 'This is a test note',
      type: 'summary'
    })

    // Update the note
    const updatedNote = await service.updateNote({
      id: note.id,
      title: 'Updated Note',
      content: 'This is an updated note'
    })

    expect(updatedNote.title).toBe('Updated Note')
    expect(updatedNote.content).toBe('This is an updated note')
  })

  test('should delete note', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    // Create a note first
    const note = await service.createNote({
      bookId: 'test-book',
      sectionId: 'test-section',
      title: 'Test Note',
      content: 'This is a test note',
      type: 'summary'
    })

    // Delete the note
    await service.deleteNote({ id: note.id })

    // Verify it's deleted
    const deletedNote = await service.getNote(note.id)
    expect(deletedNote).toBeNull()
  })

  test('should search notes', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    const results = await service.searchNotes({
      searchText: 'test'
    })

    expect(Array.isArray(results)).toBe(true)
  })

  test('should get note statistics', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    const stats = await service.getNoteStats()
    expect(stats.totalNotes).toBeDefined()
    expect(stats.notesByType).toBeDefined()
    expect(stats.notesByBook).toBeDefined()
    expect(stats.notesByTag).toBeDefined()
  })

  test('should export notes', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    const exported = await service.exportNotes({
      format: 'json',
      includeAttachments: false,
      includeContext: false,
      groupBy: 'none'
    })

    expect(typeof exported).toBe('string')
  })

  test('should import notes', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    const importData = JSON.stringify([{
      id: 'test-note',
      bookId: 'test-book',
      sectionId: 'test-section',
      title: 'Imported Note',
      content: 'This is an imported note',
      type: 'summary',
      tags: [],
      isPrivate: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }])

    const imported = await service.importNotes({
      format: 'json',
      data: importData,
      mergeStrategy: 'merge',
      importAttachments: false
    })

    expect(Array.isArray(imported)).toBe(true)
  })

  test('should link notes', async () => {
    const { createNoteService } = require('../note-service')
    const service = createNoteService(mockStorage)

    // Create two notes
    const note1 = await service.createNote({
      bookId: 'test-book',
      sectionId: 'test-section',
      title: 'Note 1',
      content: 'First note',
      type: 'summary'
    })

    const note2 = await service.createNote({
      bookId: 'test-book',
      sectionId: 'test-section',
      title: 'Note 2',
      content: 'Second note',
      type: 'summary'
    })

    // Link them
    await service.linkNotes(note1.id, note2.id)

    // Verify they're linked
    const updatedNote1 = await service.getNote(note1.id)
    const updatedNote2 = await service.getNote(note2.id)

    expect(updatedNote1?.linkedNotes).toContain(note2.id)
    expect(updatedNote2?.linkedNotes).toContain(note1.id)
  })
})

describe('Note-Taking Integration', () => {
  test('should meet performance requirements', () => {
    const startTime = performance.now()
    
    const service = createNoteTypeService()
    
    const endTime = performance.now()
    const creationTime = endTime - startTime
    
    // Should create service quickly
    expect(creationTime).toBeLessThan(100)
  })

  test('should handle memory efficiently', () => {
    const initialMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    
    const service = createNoteTypeService()
    
    const currentMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    const memoryIncrease = currentMemory - initialMemory
    
    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(1024 * 1024) // Less than 1MB
  })
})
