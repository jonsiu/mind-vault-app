/**
 * Unified Parser Interface
 * Provides a consistent interface for all ebook formats
 */

import { Book, Section, TOCItem, Destination, Metadata, Rendition } from './types'
import { EPUBBook } from './epub'
import { MOBIBook } from './mobi'
import { PDFBook } from './pdf'

// Unified book interface that works with all formats
export interface UnifiedBook extends Book {
  format: 'epub' | 'mobi' | 'pdf'
  originalBook: EPUBBook | MOBIBook | PDFBook
  totalPages?: number
  totalSections: number
  fileSize: number
  lastModified?: Date
}

// Unified section interface
export interface UnifiedSection extends Section {
  format: 'epub' | 'mobi' | 'pdf'
  pageNumber?: number
  recordNumber?: number
  chapterTitle?: string
  wordCount?: number
  readingTime?: number // in minutes
}

// Unified metadata interface
export interface UnifiedMetadata extends Metadata {
  format: 'epub' | 'mobi' | 'pdf'
  fileSize: number
  totalPages?: number
  totalSections: number
  language?: string
  isbn?: string
  publisher?: string
  publicationDate?: string
  coverImage?: string
  description?: string
  tags?: string[]
  readingProgress?: {
    currentSection: number
    totalSections: number
    percentage: number
    lastRead?: Date
  }
}

// Parser options
export interface ParserOptions {
  extractImages?: boolean
  extractMetadata?: boolean
  generateTOC?: boolean
  enableSearch?: boolean
  maxMemoryUsage?: number // in MB
  timeout?: number // in milliseconds
}

// Parser result
export interface ParserResult {
  success: boolean
  book?: UnifiedBook
  error?: string
  warnings?: string[]
  performance?: {
    parseTime: number // in milliseconds
    memoryUsage: number // in MB
    fileSize: number // in bytes
  }
}

// Error types
export enum ParserErrorType {
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  INVALID_METADATA = 'INVALID_METADATA',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ParserError extends Error {
  constructor(
    public type: ParserErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ParserError'
  }
}

export class UnifiedParser {
  private options: ParserOptions
  private performanceStart: number = 0
  private memoryStart: number = 0

  constructor(options: ParserOptions = {}) {
    this.options = {
      extractImages: true,
      extractMetadata: true,
      generateTOC: true,
      enableSearch: true,
      maxMemoryUsage: 500, // 500MB default
      timeout: 30000, // 30 seconds default
      ...options
    }
  }

  /**
   * Parse any supported ebook format
   */
  async parseEbook(file: File | Blob, format?: 'epub' | 'mobi' | 'pdf'): Promise<ParserResult> {
    this.performanceStart = performance.now()
    this.memoryStart = this.getMemoryUsage()

    try {
      // Validate file
      this.validateFile(file)

      // Detect format if not provided
      const detectedFormat = format || this.detectFormat(file)

      // Parse based on format
      const originalBook = await this.parseByFormat(file, detectedFormat)

      // Convert to unified format
      const unifiedBook = await this.convertToUnified(originalBook, detectedFormat, file)

      // Validate result
      this.validateResult(unifiedBook)

      return {
        success: true,
        book: unifiedBook,
        performance: this.getPerformanceMetrics(file)
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        performance: this.getPerformanceMetrics(file)
      }
    }
  }

  /**
   * Parse EPUB file
   */
  async parseEPUB(file: File | Blob): Promise<ParserResult> {
    return this.parseEbook(file, 'epub')
  }

  /**
   * Parse MOBI file
   */
  async parseMOBI(file: File | Blob): Promise<ParserResult> {
    return this.parseEbook(file, 'mobi')
  }

  /**
   * Parse PDF file
   */
  async parsePDF(file: File | Blob): Promise<ParserResult> {
    return this.parseEbook(file, 'pdf')
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return ['epub', 'mobi', 'pdf']
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(format: string): boolean {
    return this.getSupportedFormats().includes(format.toLowerCase())
  }

  /**
   * Detect file format from file extension
   */
  private detectFormat(file: File | Blob): 'epub' | 'mobi' | 'pdf' {
    if (file instanceof File) {
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.epub')) return 'epub'
      if (fileName.endsWith('.mobi') || fileName.endsWith('.azw')) return 'mobi'
      if (fileName.endsWith('.pdf')) return 'pdf'
    }
    throw new ParserError(ParserErrorType.UNSUPPORTED_FORMAT, 'Unable to detect file format')
  }

  /**
   * Parse file by format
   */
  private async parseByFormat(file: File | Blob, format: 'epub' | 'mobi' | 'pdf'): Promise<EPUBBook | MOBIBook | PDFBook> {
    switch (format) {
      case 'epub':
        const { createEPUBLoader, createEPUBParser } = await import('./loader')
        const { createEPUBParser: createEPUBParserFn } = await import('./epub')
        const epubLoader = await createEPUBLoader(file)
        return await createEPUBParserFn(epubLoader)

      case 'mobi':
        const { createMOBILoader } = await import('./mobi-loader')
        const { createMOBIParser } = await import('./mobi')
        const mobiLoader = await createMOBILoader(file)
        return await createMOBIParser(mobiLoader)

      case 'pdf':
        const { createPDFLoader } = await import('./pdf-loader')
        const { createPDFParser } = await import('./pdf')
        const pdfLoader = await createPDFLoader(file)
        return await createPDFParser(pdfLoader)

      default:
        throw new ParserError(ParserErrorType.UNSUPPORTED_FORMAT, `Unsupported format: ${format}`)
    }
  }

  /**
   * Convert original book to unified format
   */
  private async convertToUnified(
    originalBook: EPUBBook | MOBIBook | PDFBook,
    format: 'epub' | 'mobi' | 'pdf',
    file: File | Blob
  ): Promise<UnifiedBook> {
    const fileSize = file.size
    const totalSections = originalBook.sections.length

    // Convert sections
    const unifiedSections: UnifiedSection[] = originalBook.sections.map((section, index) => ({
      ...section,
      format,
      pageNumber: this.getPageNumber(section, format),
      recordNumber: this.getRecordNumber(section, format),
      chapterTitle: this.getChapterTitle(section, index),
      wordCount: this.estimateWordCount(section),
      readingTime: this.estimateReadingTime(section)
    }))

    // Convert metadata
    const unifiedMetadata: UnifiedMetadata = {
      ...originalBook.metadata,
      format,
      fileSize,
      totalPages: this.getTotalPages(originalBook, format),
      totalSections,
      language: this.extractLanguage(originalBook.metadata),
      isbn: this.extractISBN(originalBook.metadata),
      publisher: this.extractPublisher(originalBook.metadata),
      publicationDate: this.extractPublicationDate(originalBook.metadata),
      coverImage: this.extractCoverImage(originalBook.metadata),
      description: this.extractDescription(originalBook.metadata),
      tags: this.extractTags(originalBook.metadata)
    }

    return {
      ...originalBook,
      format,
      originalBook,
      totalPages: this.getTotalPages(originalBook, format),
      totalSections,
      fileSize,
      sections: unifiedSections,
      metadata: unifiedMetadata,
      lastModified: new Date()
    }
  }

  /**
   * Validate file before parsing
   */
  private validateFile(file: File | Blob): void {
    if (!file) {
      throw new ParserError(ParserErrorType.UNKNOWN_ERROR, 'No file provided')
    }

    if (file.size === 0) {
      throw new ParserError(ParserErrorType.CORRUPTED_FILE, 'File is empty')
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new ParserError(ParserErrorType.MEMORY_LIMIT_EXCEEDED, 'File too large (>100MB)')
    }
  }

  /**
   * Validate parsing result
   */
  private validateResult(book: UnifiedBook): void {
    if (!book.sections || book.sections.length === 0) {
      throw new ParserError(ParserErrorType.INVALID_METADATA, 'No content sections found')
    }

    if (!book.metadata || !book.metadata.title) {
      console.warn('Book missing title metadata')
    }
  }

  /**
   * Handle parsing errors
   */
  private handleError(error: unknown): string {
    if (error instanceof ParserError) {
      return error.message
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'Unknown parsing error occurred'
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(file: File | Blob) {
    const parseTime = performance.now() - this.performanceStart
    const memoryUsage = this.getMemoryUsage() - this.memoryStart

    return {
      parseTime,
      memoryUsage,
      fileSize: file.size
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory
    return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0 // Convert to MB
  }

  // Helper methods for data extraction
  private getPageNumber(section: Section, format: string): number | undefined {
    if (format === 'pdf' && 'pageNumber' in section) {
      return (section as any).pageNumber
    }
    return undefined
  }

  private getRecordNumber(section: Section, format: string): number | undefined {
    if (format === 'mobi' && 'recordNumber' in section) {
      return (section as any).recordNumber
    }
    return undefined
  }

  private getChapterTitle(section: Section, index: number): string {
    return `Chapter ${index + 1}`
  }

  private estimateWordCount(section: Section): number {
    // Simple word count estimation
    return section.size ? Math.floor(section.size / 5) : 0
  }

  private estimateReadingTime(section: Section): number {
    // Estimate reading time (average 200 words per minute)
    const wordCount = this.estimateWordCount(section)
    return Math.ceil(wordCount / 200)
  }

  private getTotalPages(book: EPUBBook | MOBIBook | PDFBook, format: string): number | undefined {
    if (format === 'pdf' && 'totalPages' in book) {
      return (book as any).totalPages
    }
    return undefined
  }

  private extractLanguage(metadata: Metadata): string | undefined {
    if (typeof metadata.language === 'string') {
      return metadata.language
    }
    if (Array.isArray(metadata.language) && metadata.language.length > 0) {
      return metadata.language[0]
    }
    return undefined
  }

  private extractISBN(metadata: Metadata): string | undefined {
    if (typeof metadata.identifier === 'string') {
      return metadata.identifier
    }
    if (metadata.identifier && typeof metadata.identifier === 'object' && 'value' in metadata.identifier) {
      return metadata.identifier.value
    }
    return undefined
  }

  private extractPublisher(metadata: Metadata): string | undefined {
    if (typeof metadata.publisher === 'string') {
      return metadata.publisher
    }
    return undefined
  }

  private extractPublicationDate(metadata: Metadata): string | undefined {
    if (typeof metadata.date === 'string') {
      return metadata.date
    }
    if (metadata.date && typeof metadata.date === 'object' && 'value' in metadata.date) {
      return metadata.date.value
    }
    return undefined
  }

  private extractCoverImage(metadata: Metadata): string | undefined {
    // This would need to be implemented based on format-specific cover extraction
    return undefined
  }

  private extractDescription(metadata: Metadata): string | undefined {
    if (typeof metadata.description === 'string') {
      return metadata.description
    }
    return undefined
  }

  private extractTags(metadata: Metadata): string[] {
    if (Array.isArray(metadata.subject)) {
      return metadata.subject
    }
    if (typeof metadata.subject === 'string') {
      return [metadata.subject]
    }
    return []
  }
}

/**
 * Create unified parser instance
 */
export function createUnifiedParser(options?: ParserOptions): UnifiedParser {
  return new UnifiedParser(options)
}

/**
 * Quick parse function for common use cases
 */
export async function quickParse(file: File | Blob, options?: ParserOptions): Promise<UnifiedBook> {
  const parser = createUnifiedParser(options)
  const result = await parser.parseEbook(file)
  
  if (!result.success || !result.book) {
    throw new Error(result.error || 'Failed to parse ebook')
  }
  
  return result.book
}
