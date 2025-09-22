/**
 * Unified Metadata Extractor
 * Provides consistent metadata extraction across all ebook formats
 */

import { UnifiedBook, UnifiedMetadata } from './unified-parser'
import { Metadata } from './types'

export interface ExtractedMetadata {
  title: string
  author: string[]
  publisher?: string
  publicationDate?: Date
  isbn?: string
  language: string
  description?: string
  subjects: string[]
  rights?: string
  format: 'epub' | 'mobi' | 'pdf'
  fileSize: number
  totalPages?: number
  totalSections: number
  coverImage?: string
  series?: string
  volume?: string
  edition?: string
  contributors: Contributor[]
  identifiers: Identifier[]
  customFields: Record<string, unknown>
}

export interface Contributor {
  name: string
  role: string
  type: 'person' | 'organization'
}

export interface Identifier {
  scheme: string
  value: string
}

export interface MetadataExtractionOptions {
  extractCoverImage?: boolean
  extractCustomFields?: boolean
  normalizeAuthors?: boolean
  validateISBN?: boolean
  extractSeriesInfo?: boolean
}

export class MetadataExtractor {
  private options: MetadataExtractionOptions

  constructor(options: MetadataExtractionOptions = {}) {
    this.options = {
      extractCoverImage: true,
      extractCustomFields: true,
      normalizeAuthors: true,
      validateISBN: true,
      extractSeriesInfo: true,
      ...options
    }
  }

  /**
   * Extract unified metadata from a book
   */
  async extractMetadata(book: UnifiedBook): Promise<ExtractedMetadata> {
    const baseMetadata = book.metadata
    const format = book.format

    const extracted: ExtractedMetadata = {
      title: this.extractTitle(baseMetadata),
      author: this.extractAuthors(baseMetadata),
      publisher: this.extractPublisher(baseMetadata),
      publicationDate: this.extractPublicationDate(baseMetadata),
      isbn: this.extractISBN(baseMetadata),
      language: this.extractLanguage(baseMetadata),
      description: this.extractDescription(baseMetadata),
      subjects: this.extractSubjects(baseMetadata),
      rights: this.extractRights(baseMetadata),
      format,
      fileSize: book.fileSize,
      totalPages: book.totalPages,
      totalSections: book.totalSections,
      coverImage: this.options.extractCoverImage ? await this.extractCoverImage(book) : undefined,
      series: this.options.extractSeriesInfo ? this.extractSeries(baseMetadata) : undefined,
      volume: this.options.extractSeriesInfo ? this.extractVolume(baseMetadata) : undefined,
      edition: this.extractEdition(baseMetadata),
      contributors: this.extractContributors(baseMetadata),
      identifiers: this.extractIdentifiers(baseMetadata),
      customFields: this.options.extractCustomFields ? this.extractCustomFields(baseMetadata) : {}
    }

    // Validate and normalize
    if (this.options.validateISBN && extracted.isbn) {
      extracted.isbn = this.validateISBN(extracted.isbn)
    }

    if (this.options.normalizeAuthors) {
      extracted.author = this.normalizeAuthors(extracted.author)
    }

    return extracted
  }

  /**
   * Extract title from metadata
   */
  private extractTitle(metadata: Metadata): string {
    if (typeof metadata.title === 'string') {
      return metadata.title.trim()
    }
    if (metadata.title && typeof metadata.title === 'object') {
      // Handle localized string
      const localized = metadata.title as Record<string, string>
      return Object.values(localized)[0]?.trim() || 'Untitled'
    }
    return 'Untitled'
  }

  /**
   * Extract authors from metadata
   */
  private extractAuthors(metadata: Metadata): string[] {
    const authors: string[] = []

    if (metadata.creator) {
      if (typeof metadata.creator === 'string') {
        authors.push(metadata.creator)
      } else if (Array.isArray(metadata.creator)) {
        authors.push(...metadata.creator.map(c => typeof c === 'string' ? c : Object.values(c)[0]))
      } else if (typeof metadata.creator === 'object') {
        authors.push(Object.values(metadata.creator)[0])
      }
    }

    return authors.filter(author => author && author.trim().length > 0)
  }

  /**
   * Extract publisher from metadata
   */
  private extractPublisher(metadata: Metadata): string | undefined {
    if (typeof metadata.publisher === 'string') {
      return metadata.publisher.trim()
    }
    if (metadata.publisher && typeof metadata.publisher === 'object') {
      return Object.values(metadata.publisher)[0]?.trim()
    }
    return undefined
  }

  /**
   * Extract publication date from metadata
   */
  private extractPublicationDate(metadata: Metadata): Date | undefined {
    let dateString: string | undefined

    if (typeof metadata.date === 'string') {
      dateString = metadata.date
    } else if (metadata.date && typeof metadata.date === 'object' && 'value' in metadata.date) {
      dateString = metadata.date.value
    }

    if (dateString) {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? undefined : date
    }

    return undefined
  }

  /**
   * Extract ISBN from metadata
   */
  private extractISBN(metadata: Metadata): string | undefined {
    if (typeof metadata.identifier === 'string') {
      return this.cleanISBN(metadata.identifier)
    }
    if (metadata.identifier && typeof metadata.identifier === 'object' && 'value' in metadata.identifier) {
      return this.cleanISBN(metadata.identifier.value)
    }
    return undefined
  }

  /**
   * Clean and validate ISBN
   */
  private cleanISBN(isbn: string): string {
    return isbn.replace(/[^0-9X]/g, '').toUpperCase()
  }

  /**
   * Validate ISBN format
   */
  private validateISBN(isbn: string): string | undefined {
    const cleaned = this.cleanISBN(isbn)
    
    if (cleaned.length === 10) {
      return this.validateISBN10(cleaned) ? cleaned : undefined
    } else if (cleaned.length === 13) {
      return this.validateISBN13(cleaned) ? cleaned : undefined
    }
    
    return undefined
  }

  /**
   * Validate ISBN-10
   */
  private validateISBN10(isbn: string): boolean {
    if (isbn.length !== 10) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i)
    }
    
    const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9])
    return (sum + checkDigit) % 11 === 0
  }

  /**
   * Validate ISBN-13
   */
  private validateISBN13(isbn: string): boolean {
    if (isbn.length !== 13) return false
    
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3)
    }
    
    const checkDigit = parseInt(isbn[12])
    return (10 - (sum % 10)) % 10 === checkDigit
  }

  /**
   * Extract language from metadata
   */
  private extractLanguage(metadata: Metadata): string {
    if (typeof metadata.language === 'string') {
      return metadata.language.toLowerCase()
    }
    if (Array.isArray(metadata.language) && metadata.language.length > 0) {
      return metadata.language[0].toLowerCase()
    }
    return 'en' // Default to English
  }

  /**
   * Extract description from metadata
   */
  private extractDescription(metadata: Metadata): string | undefined {
    if (typeof metadata.description === 'string') {
      return metadata.description.trim()
    }
    if (metadata.description && typeof metadata.description === 'object') {
      return Object.values(metadata.description)[0]?.trim()
    }
    return undefined
  }

  /**
   * Extract subjects from metadata
   */
  private extractSubjects(metadata: Metadata): string[] {
    if (Array.isArray(metadata.subject)) {
      return metadata.subject.map(s => s.trim()).filter(s => s.length > 0)
    }
    if (typeof metadata.subject === 'string') {
      return [metadata.subject.trim()]
    }
    return []
  }

  /**
   * Extract rights from metadata
   */
  private extractRights(metadata: Metadata): string | undefined {
    if (typeof metadata.rights === 'string') {
      return metadata.rights.trim()
    }
    return undefined
  }

  /**
   * Extract cover image from book
   */
  private async extractCoverImage(book: UnifiedBook): Promise<string | undefined> {
    // This would need to be implemented based on the book format
    // For now, return undefined
    return undefined
  }

  /**
   * Extract series information from metadata
   */
  private extractSeries(metadata: Metadata): string | undefined {
    // Look for series information in custom fields or meta tags
    if (metadata.meta) {
      for (const meta of metadata.meta) {
        if (meta.name === 'series' || meta.property === 'series') {
          return meta.content.trim()
        }
      }
    }
    return undefined
  }

  /**
   * Extract volume information from metadata
   */
  private extractVolume(metadata: Metadata): string | undefined {
    if (metadata.meta) {
      for (const meta of metadata.meta) {
        if (meta.name === 'volume' || meta.property === 'volume') {
          return meta.content.trim()
        }
      }
    }
    return undefined
  }

  /**
   * Extract edition from metadata
   */
  private extractEdition(metadata: Metadata): string | undefined {
    if (metadata.meta) {
      for (const meta of metadata.meta) {
        if (meta.name === 'edition' || meta.property === 'edition') {
          return meta.content.trim()
        }
      }
    }
    return undefined
  }

  /**
   * Extract contributors from metadata
   */
  private extractContributors(metadata: Metadata): Contributor[] {
    const contributors: Contributor[] = []

    if (metadata.contributor) {
      const contribs = Array.isArray(metadata.contributor) ? metadata.contributor : [metadata.contributor]
      
      for (const contrib of contribs) {
        if (typeof contrib === 'string') {
          contributors.push({
            name: contrib.trim(),
            role: 'contributor',
            type: 'person'
          })
        } else if (typeof contrib === 'object') {
          const name = Object.values(contrib)[0]
          contributors.push({
            name: name.trim(),
            role: 'contributor',
            type: 'person'
          })
        }
      }
    }

    return contributors
  }

  /**
   * Extract identifiers from metadata
   */
  private extractIdentifiers(metadata: Metadata): Identifier[] {
    const identifiers: Identifier[] = []

    if (metadata.identifier) {
      if (typeof metadata.identifier === 'string') {
        identifiers.push({
          scheme: 'unknown',
          value: metadata.identifier
        })
      } else if (typeof metadata.identifier === 'object' && 'value' in metadata.identifier) {
        identifiers.push({
          scheme: metadata.identifier.scheme || 'unknown',
          value: metadata.identifier.value
        })
      }
    }

    return identifiers
  }

  /**
   * Extract custom fields from metadata
   */
  private extractCustomFields(metadata: Metadata): Record<string, unknown> {
    const customFields: Record<string, unknown> = {}

    if (metadata.meta) {
      for (const meta of metadata.meta) {
        if (meta.name && !this.isStandardField(meta.name)) {
          customFields[meta.name] = meta.content
        }
        if (meta.property && !this.isStandardField(meta.property)) {
          customFields[meta.property] = meta.content
        }
      }
    }

    return customFields
  }

  /**
   * Check if field is a standard metadata field
   */
  private isStandardField(fieldName: string): boolean {
    const standardFields = [
      'title', 'author', 'creator', 'publisher', 'date', 'language',
      'subject', 'description', 'rights', 'identifier', 'isbn',
      'series', 'volume', 'edition', 'contributor'
    ]
    return standardFields.includes(fieldName.toLowerCase())
  }

  /**
   * Normalize author names
   */
  private normalizeAuthors(authors: string[]): string[] {
    return authors.map(author => {
      // Basic normalization: trim, remove extra spaces, title case
      return author
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    })
  }
}

/**
 * Create metadata extractor instance
 */
export function createMetadataExtractor(options?: MetadataExtractionOptions): MetadataExtractor {
  return new MetadataExtractor(options)
}
