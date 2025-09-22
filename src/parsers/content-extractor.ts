/**
 * Content Extractor
 * Handles cross-format content extraction and media processing
 */

import { UnifiedBook, UnifiedSection } from './unified-parser'
import { Book, Section } from './types'

export interface ExtractedContent {
  text: string
  html: string
  images: ExtractedImage[]
  links: ExtractedLink[]
  tables: ExtractedTable[]
  metadata: ContentMetadata
}

export interface ExtractedImage {
  src: string
  alt?: string
  title?: string
  width?: number
  height?: number
  format: string
  size: number
  data?: ArrayBuffer
}

export interface ExtractedLink {
  href: string
  text: string
  title?: string
  isExternal: boolean
  target?: string
}

export interface ExtractedTable {
  html: string
  rows: number
  columns: number
  headers?: string[]
  data: string[][]
}

export interface ContentMetadata {
  wordCount: number
  characterCount: number
  paragraphCount: number
  imageCount: number
  linkCount: number
  tableCount: number
  readingTime: number // in minutes
  complexity: 'low' | 'medium' | 'high'
}

export interface ExtractionOptions {
  extractImages?: boolean
  extractLinks?: boolean
  extractTables?: boolean
  maxImageSize?: number // in bytes
  imageFormats?: string[]
  preserveFormatting?: boolean
  generateSummary?: boolean
}

export class ContentExtractor {
  private options: ExtractionOptions

  constructor(options: ExtractionOptions = {}) {
    this.options = {
      extractImages: true,
      extractLinks: true,
      extractTables: true,
      maxImageSize: 10 * 1024 * 1024, // 10MB
      imageFormats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
      preserveFormatting: true,
      generateSummary: false,
      ...options
    }
  }

  /**
   * Extract content from a unified book
   */
  async extractContent(book: UnifiedBook): Promise<ExtractedContent> {
    const sections = await Promise.all(
      book.sections.map(section => this.extractSectionContent(section, book))
    )

    return this.combineSectionContents(sections, book)
  }

  /**
   * Extract content from a single section
   */
  async extractSectionContent(section: UnifiedSection, book: UnifiedBook): Promise<ExtractedContent> {
    try {
      const doc = await section.createDocument()
      const text = await section.load()

      const content: ExtractedContent = {
        text: this.cleanText(text),
        html: this.extractHTML(doc),
        images: await this.extractImages(doc, book),
        links: this.extractLinks(doc),
        tables: this.extractTables(doc),
        metadata: this.calculateMetadata(text, doc)
      }

      return content
    } catch (error) {
      console.warn(`Failed to extract content from section ${section.id}:`, error)
      return this.createEmptyContent()
    }
  }

  /**
   * Extract text content with formatting preserved
   */
  private cleanText(text: string): string {
    if (!this.options.preserveFormatting) {
      return text.replace(/\s+/g, ' ').trim()
    }

    // Preserve basic formatting
    return text
      .replace(/\n\s*\n/g, '\n\n') // Preserve paragraph breaks
      .replace(/\s+/g, ' ') // Normalize whitespace within lines
      .trim()
  }

  /**
   * Extract HTML content
   */
  private extractHTML(doc: Document): string {
    const body = doc.body || doc.documentElement
    return body.innerHTML
  }

  /**
   * Extract images from document
   */
  private async extractImages(doc: Document, book: UnifiedBook): Promise<ExtractedImage[]> {
    if (!this.options.extractImages) {
      return []
    }

    const images: ExtractedImage[] = []
    const imgElements = doc.querySelectorAll('img')

    for (const img of imgElements) {
      try {
        const src = img.getAttribute('src')
        if (!src) continue

        const image: ExtractedImage = {
          src,
          alt: img.getAttribute('alt') || undefined,
          title: img.getAttribute('title') || undefined,
          width: img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : undefined,
          height: img.getAttribute('height') ? parseInt(img.getAttribute('height')!) : undefined,
          format: this.getImageFormat(src),
          size: 0
        }

        // Try to load image data if it's a local resource
        if (this.isLocalImage(src)) {
          try {
            const imageData = await this.loadImageData(src, book)
            if (imageData) {
              image.data = imageData
              image.size = imageData.byteLength
            }
          } catch (error) {
            console.warn(`Failed to load image data for ${src}:`, error)
          }
        }

        // Check size limit
        if (image.size <= this.options.maxImageSize!) {
          images.push(image)
        }
      } catch (error) {
        console.warn('Failed to process image:', error)
      }
    }

    return images
  }

  /**
   * Extract links from document
   */
  private extractLinks(doc: Document): ExtractedLink[] {
    if (!this.options.extractLinks) {
      return []
    }

    const links: ExtractedLink[] = []
    const linkElements = doc.querySelectorAll('a[href]')

    for (const link of linkElements) {
      const href = link.getAttribute('href')!
      const text = link.textContent?.trim() || ''
      const title = link.getAttribute('title') || undefined
      const target = link.getAttribute('target') || undefined

      links.push({
        href,
        text,
        title,
        isExternal: this.isExternalLink(href),
        target
      })
    }

    return links
  }

  /**
   * Extract tables from document
   */
  private extractTables(doc: Document): ExtractedTable[] {
    if (!this.options.extractTables) {
      return []
    }

    const tables: ExtractedTable[] = []
    const tableElements = doc.querySelectorAll('table')

    for (const table of tableElements) {
      try {
        const rows = table.querySelectorAll('tr')
        const data: string[][] = []
        let headers: string[] | undefined

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          const cells = row.querySelectorAll('td, th')
          const rowData: string[] = []

          for (const cell of cells) {
            rowData.push(cell.textContent?.trim() || '')
          }

          if (i === 0 && row.querySelector('th')) {
            headers = rowData
          } else {
            data.push(rowData)
          }
        }

        tables.push({
          html: table.outerHTML,
          rows: data.length,
          columns: data.length > 0 ? data[0].length : 0,
          headers,
          data
        })
      } catch (error) {
        console.warn('Failed to process table:', error)
      }
    }

    return tables
  }

  /**
   * Calculate content metadata
   */
  private calculateMetadata(text: string, doc: Document): ContentMetadata {
    const wordCount = this.countWords(text)
    const characterCount = text.length
    const paragraphCount = doc.querySelectorAll('p').length || 1
    const imageCount = doc.querySelectorAll('img').length
    const linkCount = doc.querySelectorAll('a').length
    const tableCount = doc.querySelectorAll('table').length
    const readingTime = Math.ceil(wordCount / 200) // 200 words per minute

    return {
      wordCount,
      characterCount,
      paragraphCount,
      imageCount,
      linkCount,
      tableCount,
      readingTime,
      complexity: this.calculateComplexity(wordCount, imageCount, tableCount)
    }
  }

  /**
   * Combine content from multiple sections
   */
  private combineSectionContents(sections: ExtractedContent[], book: UnifiedBook): ExtractedContent {
    const combined: ExtractedContent = {
      text: sections.map(s => s.text).join('\n\n'),
      html: sections.map(s => s.html).join('\n'),
      images: sections.flatMap(s => s.images),
      links: sections.flatMap(s => s.links),
      tables: sections.flatMap(s => s.tables),
      metadata: this.combineMetadata(sections.map(s => s.metadata))
    }

    return combined
  }

  /**
   * Combine metadata from multiple sections
   */
  private combineMetadata(metadataList: ContentMetadata[]): ContentMetadata {
    return {
      wordCount: metadataList.reduce((sum, m) => sum + m.wordCount, 0),
      characterCount: metadataList.reduce((sum, m) => sum + m.characterCount, 0),
      paragraphCount: metadataList.reduce((sum, m) => sum + m.paragraphCount, 0),
      imageCount: metadataList.reduce((sum, m) => sum + m.imageCount, 0),
      linkCount: metadataList.reduce((sum, m) => sum + m.linkCount, 0),
      tableCount: metadataList.reduce((sum, m) => sum + m.tableCount, 0),
      readingTime: metadataList.reduce((sum, m) => sum + m.readingTime, 0),
      complexity: this.calculateOverallComplexity(metadataList)
    }
  }

  /**
   * Calculate content complexity
   */
  private calculateComplexity(wordCount: number, imageCount: number, tableCount: number): 'low' | 'medium' | 'high' {
    const score = wordCount / 1000 + imageCount * 2 + tableCount * 5

    if (score < 5) return 'low'
    if (score < 15) return 'medium'
    return 'high'
  }

  /**
   * Calculate overall complexity
   */
  private calculateOverallComplexity(metadataList: ContentMetadata[]): 'low' | 'medium' | 'high' {
    const avgComplexity = metadataList.reduce((sum, m) => {
      const score = m.complexity === 'low' ? 1 : m.complexity === 'medium' ? 2 : 3
      return sum + score
    }, 0) / metadataList.length

    if (avgComplexity < 1.5) return 'low'
    if (avgComplexity < 2.5) return 'medium'
    return 'high'
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Get image format from URL
   */
  private getImageFormat(src: string): string {
    const match = src.match(/\.([^.]+)$/)
    return match ? match[1].toLowerCase() : 'unknown'
  }

  /**
   * Check if image is local
   */
  private isLocalImage(src: string): boolean {
    return !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')
  }

  /**
   * Check if link is external
   */
  private isExternalLink(href: string): boolean {
    return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
  }

  /**
   * Load image data from book resources
   */
  private async loadImageData(src: string, book: UnifiedBook): Promise<ArrayBuffer | null> {
    try {
      // This would need to be implemented based on the book format
      // For now, return null
      return null
    } catch (error) {
      console.warn(`Failed to load image data for ${src}:`, error)
      return null
    }
  }

  /**
   * Create empty content for error cases
   */
  private createEmptyContent(): ExtractedContent {
    return {
      text: '',
      html: '',
      images: [],
      links: [],
      tables: [],
      metadata: {
        wordCount: 0,
        characterCount: 0,
        paragraphCount: 0,
        imageCount: 0,
        linkCount: 0,
        tableCount: 0,
        readingTime: 0,
        complexity: 'low'
      }
    }
  }
}

/**
 * Create content extractor instance
 */
export function createContentExtractor(options?: ExtractionOptions): ContentExtractor {
  return new ContentExtractor(options)
}
