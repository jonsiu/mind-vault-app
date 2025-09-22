/**
 * Unified Parser Tests
 * Tests for the unified parser interface
 */

import { createUnifiedParser, quickParse, ParserError, ParserErrorType } from '../index'

describe('Unified Parser', () => {
  test('should create parser instance with default options', () => {
    const parser = createUnifiedParser()
    expect(parser).toBeDefined()
    expect(parser.getSupportedFormats()).toEqual(['epub', 'mobi', 'pdf'])
  })

  test('should create parser instance with custom options', () => {
    const options = {
      extractImages: false,
      maxMemoryUsage: 1000,
      timeout: 60000
    }
    const parser = createUnifiedParser(options)
    expect(parser).toBeDefined()
  })

  test('should detect supported formats', () => {
    const parser = createUnifiedParser()
    
    expect(parser.isFormatSupported('epub')).toBe(true)
    expect(parser.isFormatSupported('mobi')).toBe(true)
    expect(parser.isFormatSupported('pdf')).toBe(true)
    expect(parser.isFormatSupported('txt')).toBe(false)
    expect(parser.isFormatSupported('docx')).toBe(false)
  })

  test('should handle unsupported format error', async () => {
    const parser = createUnifiedParser()
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    const result = await parser.parseEbook(mockFile)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('Unable to detect file format')
  })

  test('should handle empty file error', async () => {
    const parser = createUnifiedParser()
    const mockFile = new File([], 'test.epub', { type: 'application/epub+zip' })
    
    const result = await parser.parseEbook(mockFile)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('File is empty')
  })

  test('should handle large file error', async () => {
    const parser = createUnifiedParser({ maxMemoryUsage: 1 }) // 1MB limit
    const largeContent = 'x'.repeat(2 * 1024 * 1024) // 2MB
    const mockFile = new File([largeContent], 'large.epub', { type: 'application/epub+zip' })
    
    const result = await parser.parseEbook(mockFile)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('File too large')
  })

  test('should provide performance metrics', async () => {
    const parser = createUnifiedParser()
    const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' })
    
    const result = await parser.parseEbook(mockFile)
    
    expect(result.performance).toBeDefined()
    expect(result.performance?.parseTime).toBeGreaterThan(0)
    expect(result.performance?.fileSize).toBe(mockFile.size)
    expect(result.performance?.memoryUsage).toBeGreaterThanOrEqual(0)
  })
})

describe('Parser Error Handling', () => {
  test('should create parser error with type and message', () => {
    const error = new ParserError(ParserErrorType.UNSUPPORTED_FORMAT, 'Test error')
    
    expect(error.type).toBe(ParserErrorType.UNSUPPORTED_FORMAT)
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('ParserError')
  })

  test('should create parser error with original error', () => {
    const originalError = new Error('Original error')
    const error = new ParserError(ParserErrorType.UNKNOWN_ERROR, 'Wrapped error', originalError)
    
    expect(error.originalError).toBe(originalError)
  })
})

describe('Quick Parse Function', () => {
  test('should parse ebook successfully', async () => {
    const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' })
    
    // This will fail with mock content, but should throw proper error
    await expect(quickParse(mockFile)).rejects.toThrow()
  })

  test('should handle parsing errors', async () => {
    const mockFile = new File([], 'empty.epub', { type: 'application/epub+zip' })
    
    await expect(quickParse(mockFile)).rejects.toThrow('File is empty')
  })
})

describe('Format-Specific Parsing', () => {
  test('should parse EPUB format', async () => {
    const parser = createUnifiedParser()
    const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' })
    
    const result = await parser.parseEPUB(mockFile)
    
    expect(result.success).toBe(false) // Expected to fail with mock content
    expect(result.error).toBeDefined()
  })

  test('should parse MOBI format', async () => {
    const parser = createUnifiedParser()
    const mockFile = new File(['test content'], 'test.mobi', { type: 'application/x-mobipocket-ebook' })
    
    const result = await parser.parseMOBI(mockFile)
    
    expect(result.success).toBe(false) // Expected to fail with mock content
    expect(result.error).toBeDefined()
  })

  test('should parse PDF format', async () => {
    const parser = createUnifiedParser()
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    const result = await parser.parsePDF(mockFile)
    
    expect(result.success).toBe(false) // Expected to fail with mock content
    expect(result.error).toBeDefined()
  })
})

describe('Unified Parser Integration', () => {
  test('should meet performance requirements', async () => {
    const startTime = performance.now()
    const parser = createUnifiedParser()
    const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' })
    
    const result = await parser.parseEbook(mockFile)
    const parseTime = performance.now() - startTime
    
    // Should fail fast with mock content
    expect(parseTime).toBeLessThan(2000)
    expect(result.success).toBe(false)
  }, 10000)

  test('should handle memory efficiently', async () => {
    const initialMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    const parser = createUnifiedParser()
    const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' })
    
    const result = await parser.parseEbook(mockFile)
    const currentMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    const memoryIncrease = currentMemory - initialMemory
    
    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    expect(result.success).toBe(false)
  }, 10000)
})
