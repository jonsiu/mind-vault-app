/**
 * PDF Parser Implementation
 * Handles PDF ebook formats using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist'
import { 
  Book, 
  Section, 
  TOCItem, 
  Destination, 
  Metadata, 
  Rendition,
  Loader
} from './types'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface PDFSection extends Section {
  pageNumber: number
  textContent: string
  renderedText: string
}

export interface PDFBook extends Book {
  pdfDocument: pdfjsLib.PDFDocumentProxy
  sections: PDFSection[]
  loader: Loader
  totalPages: number
}

export interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
  [key: string]: unknown
}

export class PDFParser {
  private pdfDocument!: pdfjsLib.PDFDocumentProxy
  private sections: PDFSection[] = []
  private loader: Loader
  private toc: TOCItem[] = []
  private metadata: PDFMetadata = {}
  private rendition: Rendition = {}
  private totalPages: number = 0

  constructor(loader: Loader) {
    this.loader = loader
  }

  /**
   * Parse PDF file from loader
   */
  async parse(): Promise<PDFBook> {
    // Load PDF document
    const pdfData = await this.loader.loadBlob('pdf')
    const arrayBuffer = await pdfData.arrayBuffer()
    
    // Load PDF document with PDF.js
    this.pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    this.totalPages = this.pdfDocument.numPages

    // Extract metadata
    await this.extractMetadata()

    // Build sections from pages
    await this.buildSections()

    // Parse TOC if available
    await this.parseTOC()

    return {
      sections: this.sections,
      dir: 'ltr', // PDF doesn't specify direction
      toc: this.toc,
      pageList: this.toc, // Use TOC as page list for PDF
      metadata: this.metadata,
      rendition: this.rendition,
      pdfDocument: this.pdfDocument,
      loader: this.loader,
      totalPages: this.totalPages,
      resolveHref: this.resolveHref.bind(this),
      resolveCFI: this.resolveCFI.bind(this),
      isExternal: this.isExternal.bind(this),
      splitTOCHref: this.splitTOCHref.bind(this),
      getTOCFragment: this.getTOCFragment.bind(this),
    }
  }

  /**
   * Extract PDF metadata
   */
  private async extractMetadata(): Promise<void> {
    try {
      const info = await this.pdfDocument.getMetadata()
      
      if (info.info) {
        this.metadata.title = info.info.Title
        this.metadata.author = info.info.Author
        this.metadata.subject = info.info.Subject
        this.metadata.keywords = info.info.Keywords
        this.metadata.creator = info.info.Creator
        this.metadata.producer = info.info.Producer
        this.metadata.creationDate = info.info.CreationDate
        this.metadata.modificationDate = info.info.ModDate
      }

      // Set rendition properties
      this.rendition.layout = 'pre-paginated' // PDFs are pre-paginated
      this.rendition.orientation = 'auto'
      this.rendition.spread = 'auto'
    } catch (error) {
      console.warn('Failed to extract PDF metadata:', error)
    }
  }

  /**
   * Build sections from PDF pages
   */
  private async buildSections(): Promise<void> {
    this.sections = []

    for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
      try {
        const page = await this.pdfDocument.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Extract text content
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim()

        // Render text for display
        const viewport = page.getViewport({ scale: 1.0 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        if (context) {
          canvas.height = viewport.height
          canvas.width = viewport.width
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          }
          
          await page.render(renderContext).promise
        }

        const section: PDFSection = {
          id: `page-${pageNum}`,
          pageNumber: pageNum,
          textContent: text,
          renderedText: text,
          linear: 'yes',
          cfi: `/6/${pageNum - 1}`,
          size: text.length,
          load: () => this.loadSection(pageNum),
          unload: () => {},
          createDocument: () => this.createSectionDocument(pageNum),
        }

        this.sections.push(section)
      } catch (error) {
        console.warn(`Failed to process page ${pageNum}:`, error)
      }
    }
  }

  /**
   * Load section content (page)
   */
  private async loadSection(pageNumber: number): Promise<string> {
    const section = this.sections.find(s => s.pageNumber === pageNumber)
    if (!section) {
      throw new Error(`Page ${pageNumber} not found`)
    }
    return section.textContent
  }

  /**
   * Create section document
   */
  private async createSectionDocument(pageNumber: number): Promise<Document> {
    const text = await this.loadSection(pageNumber)
    
    // Create HTML document for the page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Page ${pageNumber}</title>
        </head>
        <body>
          <div class="page" data-page="${pageNumber}">
            <p>${text}</p>
          </div>
        </body>
      </html>
    `
    
    const parser = new DOMParser()
    return parser.parseFromString(html, 'text/html')
  }

  /**
   * Parse TOC from PDF bookmarks
   */
  private async parseTOC(): Promise<void> {
    try {
      const outline = await this.pdfDocument.getOutline()
      this.toc = this.parseOutline(outline)
    } catch (error) {
      console.warn('Failed to parse PDF outline:', error)
      // Create simple TOC based on pages
      this.toc = this.sections.map((section, index) => ({
        label: `Page ${section.pageNumber}`,
        href: `#page-${section.pageNumber}`,
        subitems: []
      }))
    }
  }

  /**
   * Parse PDF outline to TOC
   */
  private parseOutline(outline: any[]): TOCItem[] {
    return outline.map((item: any) => ({
      label: item.title || 'Untitled',
      href: item.dest ? `#${item.dest}` : '#',
      subitems: item.items ? this.parseOutline(item.items) : []
    }))
  }

  /**
   * Render PDF page to canvas
   */
  async renderPage(pageNumber: number, canvas: HTMLCanvasElement, scale: number = 1.0): Promise<void> {
    try {
      const page = await this.pdfDocument.getPage(pageNumber)
      const viewport = page.getViewport({ scale })
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Could not get canvas context')
      }
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
    } catch (error) {
      console.error(`Failed to render page ${pageNumber}:`, error)
      throw error
    }
  }

  /**
   * Get page text content
   */
  async getPageText(pageNumber: number): Promise<string> {
    try {
      const page = await this.pdfDocument.getPage(pageNumber)
      const textContent = await page.getTextContent()
      
      return textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim()
    } catch (error) {
      console.error(`Failed to get text for page ${pageNumber}:`, error)
      throw error
    }
  }

  /**
   * Search text in PDF
   */
  async searchText(query: string): Promise<Array<{ page: number; text: string; index: number }>> {
    const results: Array<{ page: number; text: string; index: number }> = []
    
    for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
      try {
        const text = await this.getPageText(pageNum)
        const index = text.toLowerCase().indexOf(query.toLowerCase())
        
        if (index !== -1) {
          results.push({
            page: pageNum,
            text: text.substring(Math.max(0, index - 50), index + query.length + 50),
            index
          })
        }
      } catch (error) {
        console.warn(`Failed to search page ${pageNum}:`, error)
      }
    }
    
    return results
  }

  /**
   * Resolve href to destination
   */
  private async resolveHref(href: string): Promise<Destination> {
    const sectionIndex = this.sections.findIndex(section => section.id === href)
    if (sectionIndex === -1) {
      throw new Error(`Section not found: ${href}`)
    }

    return {
      index: sectionIndex,
      anchor: (doc: Document) => {
        const anchor = href.includes('#') ? href.split('#')[1] : null
        if (anchor) {
          return doc.getElementById(anchor) || doc.querySelector(`[id="${anchor}"]`)
        }
        return doc.body || doc.documentElement
      }
    }
  }

  /**
   * Resolve CFI to destination
   */
  private async resolveCFI(cfi: string): Promise<Destination> {
    // PDF CFI resolution (simplified)
    const cfiParts = cfi.replace(/^epubcfi\(/, '').replace(/\)$/, '').split('/')
    const sectionIndex = parseInt(cfiParts[1]) - 1

    if (sectionIndex < 0 || sectionIndex >= this.sections.length) {
      throw new Error(`Invalid CFI: ${cfi}`)
    }

    return {
      index: sectionIndex,
      anchor: (doc: Document) => {
        return doc.body || doc.documentElement
      }
    }
  }

  /**
   * Check if href is external
   */
  private isExternal(href: string): boolean {
    return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
  }

  /**
   * Split TOC href
   */
  private async splitTOCHref(href: string): Promise<[string, string | null]> {
    const [sectionHref, fragment] = href.split('#')
    const sectionIndex = this.sections.findIndex(section => section.id === sectionHref)
    return [this.sections[sectionIndex]?.id || '', fragment || null]
  }

  /**
   * Get TOC fragment
   */
  private getTOCFragment(doc: Document, id: string): Node | null {
    return doc.getElementById(id) || doc.querySelector(`[id="${id}"]`)
  }

  /**
   * Cleanup resources
   */
  async close(): Promise<void> {
    if (this.pdfDocument) {
      this.pdfDocument.destroy()
    }
  }
}

/**
 * Create PDF parser instance
 */
export async function createPDFParser(loader: Loader): Promise<PDFBook> {
  const parser = new PDFParser(loader)
  return await parser.parse()
}
