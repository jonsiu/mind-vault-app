/**
 * Highlighting System Tests
 * Tests for the highlighting and annotation functionality
 */

import { 
  createHighlightTypeService, 
  createHighlightRenderer,
  DEFAULT_HIGHLIGHT_TYPES,
  HIGHLIGHT_COLORS
} from '../index'

describe('Highlighting System', () => {
  test('should create highlight type service', () => {
    const service = createHighlightTypeService()
    expect(service).toBeDefined()
  })

  test('should create highlight renderer', () => {
    const renderer = createHighlightRenderer()
    expect(renderer).toBeDefined()
  })

  test('should have default highlight types', () => {
    expect(DEFAULT_HIGHLIGHT_TYPES).toBeDefined()
    expect(DEFAULT_HIGHLIGHT_TYPES.length).toBeGreaterThan(0)
    
    const importantType = DEFAULT_HIGHLIGHT_TYPES.find(t => t.id === 'important')
    expect(importantType).toBeDefined()
    expect(importantType?.name).toBe('Important')
    expect(importantType?.color).toBe('#ffeb3b')
  })

  test('should have highlight colors', () => {
    expect(HIGHLIGHT_COLORS).toBeDefined()
    expect(HIGHLIGHT_COLORS.length).toBeGreaterThan(0)
    expect(HIGHLIGHT_COLORS).toContain('#ffeb3b')
  })
})

describe('Highlight Type Service', () => {
  let service: ReturnType<typeof createHighlightTypeService>

  beforeEach(() => {
    service = createHighlightTypeService()
  })

  test('should get default highlight types', async () => {
    const types = await service.getHighlightTypes()
    expect(types.length).toBeGreaterThan(0)
    
    const defaultTypes = service.getDefaultHighlightTypes()
    expect(defaultTypes.length).toBeGreaterThan(0)
  })

  test('should create custom highlight type', async () => {
    const customType = await service.createHighlightType({
      name: 'Custom Type',
      color: '#ff0000',
      icon: '🔥',
      description: 'A custom highlight type',
      isDefault: false
    })

    expect(customType.id).toBeDefined()
    expect(customType.name).toBe('Custom Type')
    expect(customType.color).toBe('#ff0000')
    expect(customType.isDefault).toBe(false)
  })

  test('should not allow duplicate highlight type names', async () => {
    await service.createHighlightType({
      name: 'Duplicate Type',
      color: '#ff0000',
      isDefault: false
    })

    await expect(service.createHighlightType({
      name: 'Duplicate Type',
      color: '#00ff00',
      isDefault: false
    })).rejects.toThrow('already exists')
  })

  test('should update highlight type', async () => {
    const customType = await service.createHighlightType({
      name: 'Update Test',
      color: '#ff0000',
      isDefault: false
    })

    const updatedType = await service.updateHighlightType(customType.id, {
      name: 'Updated Name',
      color: '#00ff00'
    })

    expect(updatedType.name).toBe('Updated Name')
    expect(updatedType.color).toBe('#00ff00')
  })

  test('should not allow updating default types', async () => {
    const defaultTypes = service.getDefaultHighlightTypes()
    const defaultType = defaultTypes[0]

    await expect(service.updateHighlightType(defaultType.id, {
      name: 'Modified Default'
    })).rejects.toThrow('Cannot update default highlight types')
  })

  test('should delete custom highlight type', async () => {
    const customType = await service.createHighlightType({
      name: 'Delete Test',
      color: '#ff0000',
      isDefault: false
    })

    await service.deleteHighlightType(customType.id)
    
    const retrievedType = await service.getHighlightType(customType.id)
    expect(retrievedType).toBeNull()
  })

  test('should not allow deleting default types', async () => {
    const defaultTypes = service.getDefaultHighlightTypes()
    const defaultType = defaultTypes[0]

    await expect(service.deleteHighlightType(defaultType.id))
      .rejects.toThrow('Cannot delete default highlight types')
  })

  test('should get available colors', () => {
    const colors = service.getAvailableColors()
    expect(colors).toEqual(HIGHLIGHT_COLORS)
  })

  test('should get unused colors', () => {
    const unusedColors = service.getUnusedColors()
    expect(unusedColors.length).toBeGreaterThan(0)
  })

  test('should get highlight type statistics', async () => {
    const stats = await service.getHighlightTypeStats()
    expect(stats.totalTypes).toBeGreaterThan(0)
    expect(stats.defaultTypes).toBeGreaterThan(0)
    expect(stats.customTypes).toBe(0) // Initially no custom types
  })

  test('should suggest highlight types based on text', async () => {
    const suggestions = await service.getHighlightTypeSuggestions('This is important information')
    expect(suggestions.length).toBeGreaterThan(0)
    
    const importantType = suggestions.find(s => s.id === 'important')
    expect(importantType).toBeDefined()
  })
})

describe('Highlight Renderer', () => {
  let renderer: ReturnType<typeof createHighlightRenderer>

  beforeEach(() => {
    renderer = createHighlightRenderer()
  })

  test('should render highlight', () => {
    const mockElement = document.createElement('div')
    mockElement.innerHTML = 'This is test text for highlighting'
    
    const highlight = {
      id: 'test-highlight',
      bookId: 'test-book',
      sectionId: 'test-section',
      cfi: 'test-cfi',
      text: 'test text',
      type: 'important' as any, // Type assertion for test
      color: '#ffeb3b',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // This would normally render the highlight
    // For testing, we just verify the method exists and doesn't throw
    expect(() => renderer.renderHighlight(highlight, mockElement)).not.toThrow()
  })

  test('should remove highlight', () => {
    const mockElement = document.createElement('div')
    
    // This would normally remove the highlight
    // For testing, we just verify the method exists and doesn't throw
    expect(() => renderer.removeHighlight('test-highlight', mockElement)).not.toThrow()
  })

  test('should clear all highlights', () => {
    const mockElement = document.createElement('div')
    
    // This would normally clear all highlights
    // For testing, we just verify the method exists and doesn't throw
    expect(() => renderer.clearHighlights(mockElement)).not.toThrow()
  })
})

describe('Highlighting Integration', () => {
  test('should meet performance requirements', () => {
    const startTime = performance.now()
    
    const service = createHighlightTypeService()
    const renderer = createHighlightRenderer()
    
    const endTime = performance.now()
    const creationTime = endTime - startTime
    
    // Should create services quickly
    expect(creationTime).toBeLessThan(100)
    
    // Cleanup
    renderer.destroy()
  })

  test('should handle memory efficiently', () => {
    const initialMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    
    const service = createHighlightTypeService()
    const renderer = createHighlightRenderer()
    
    const currentMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    const memoryIncrease = currentMemory - initialMemory
    
    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(1024 * 1024) // Less than 1MB
    
    // Cleanup
    renderer.destroy()
  })
})
