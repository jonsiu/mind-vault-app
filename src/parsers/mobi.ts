/**
 * MOBI Parser Implementation
 * Handles MOBI and AZW ebook formats
 * Based on PalmDOC format with compression support
 */

import { 
  Book, 
  Section, 
  TOCItem, 
  Destination, 
  Metadata, 
  Rendition,
  Loader
} from './types'

// MOBI Format Constants
const MOBI_HEADER_SIZE = 16
const PALMDOC_HEADER_SIZE = 16
const MOBI_HEADER_LENGTH = 232

// MOBI Record Types
const MOBI_RECORD_TYPES = {
  PALMDOC_HEADER: 0,
  MOBI_HEADER: 1,
  EXTH_HEADER: 2,
  COMPRESSED_DATA: 3,
  UNCOMPRESSED_DATA: 4,
  DRM_RECORD: 5,
  UNKNOWN: 6
} as const

// Compression Types
const COMPRESSION_TYPES = {
  NONE: 1,
  PALMDOC: 2,
  HUFF_CDIC: 17480
} as const

export interface MOBIHeader {
  identifier: string
  headerLength: number
  type: number
  creator: number
  version: number
  uniqueIDSeed: number
  nextRecordListID: number
  numberOfRecords: number
  recordSize: number
  compression: number
  unused: number
  mobiType: number
  textEncoding: number
  uniqueID: number
  fileVersion: number
  orthographicIndex: number
  inflectionIndex: number
  indexNames: number
  indexKeys: number
  extraIndex0: number
  extraIndex1: number
  extraIndex2: number
  extraIndex3: number
  extraIndex4: number
  extraIndex5: number
  firstNonBookIndex: number
  fullNameOffset: number
  fullNameLength: number
  locale: number
  inputLanguage: number
  outputLanguage: number
  minVersion: number
  firstImageIndex: number
  huffmanRecordOffset: number
  huffmanRecordCount: number
  huffmanTableOffset: number
  huffmanTableLength: number
  exthFlags: number
  unknown: number
  drmOffset: number
  drmCount: number
  drmSize: number
  drmFlags: number
  firstContentRecordNumber: number
  lastContentRecordNumber: number
  fcisRecordNumber: number
  flisRecordNumber: number
  unknown2: number
  unknown3: number
  unknown4: number
  extraRecordDataFlags: number
  indxRecordOffset: number
}

export interface MOBIRecord {
  offset: number
  attributes: number
  uniqueID: number
}

export interface MOBISection extends Section {
  recordNumber: number
  compressed: boolean
  compressionType: number
}

export interface MOBIBook extends Book {
  header: MOBIHeader
  records: MOBIRecord[]
  sections: MOBISection[]
  loader: Loader
}

export class MOBIParser {
  private header!: MOBIHeader
  private records: MOBIRecord[] = []
  private sections: MOBISection[] = []
  private loader: Loader
  private toc: TOCItem[] = []
  private metadata: Metadata = {}
  private rendition: Rendition = {}

  constructor(loader: Loader) {
    this.loader = loader
  }

  /**
   * Parse MOBI file from loader
   */
  async parse(): Promise<MOBIBook> {
    // Read PDB header
    const pdbHeader = await this.readPDBHeader()
    
    // Read MOBI header
    this.header = await this.readMOBIHeader()
    
    // Read record list
    this.records = await this.readRecordList()
    
    // Parse EXTH header for metadata
    await this.parseEXTHHeader()
    
    // Build sections from records
    this.buildSections()
    
    // Parse TOC if available
    await this.parseTOC()

    return {
      sections: this.sections,
      dir: 'ltr', // MOBI doesn't specify direction
      toc: this.toc,
      pageList: [], // MOBI doesn't have page list
      metadata: this.metadata,
      rendition: this.rendition,
      header: this.header,
      records: this.records,
      loader: this.loader,
      resolveHref: this.resolveHref.bind(this),
      resolveCFI: this.resolveCFI.bind(this),
      isExternal: this.isExternal.bind(this),
      splitTOCHref: this.splitTOCHref.bind(this),
      getTOCFragment: this.getTOCFragment.bind(this),
    }
  }

  /**
   * Read PDB (Palm Database) header
   */
  private async readPDBHeader(): Promise<ArrayBuffer> {
    const headerData = await this.loader.loadBlob('header')
    return await headerData.arrayBuffer()
  }

  /**
   * Read MOBI header from the file
   */
  private async readMOBIHeader(): Promise<MOBIHeader> {
    const headerData = await this.loader.loadBlob('mobi-header')
    const view = new DataView(await headerData.arrayBuffer())
    
    return {
      identifier: this.readString(view, 0, 4),
      headerLength: view.getUint32(4, false),
      type: view.getUint32(8, false),
      creator: view.getUint32(12, false),
      version: view.getUint32(16, false),
      uniqueIDSeed: view.getUint32(20, false),
      nextRecordListID: view.getUint32(24, false),
      numberOfRecords: view.getUint16(28, false),
      recordSize: view.getUint16(30, false),
      compression: view.getUint16(32, false),
      unused: view.getUint16(34, false),
      mobiType: view.getUint32(36, false),
      textEncoding: view.getUint32(40, false),
      uniqueID: view.getUint32(44, false),
      fileVersion: view.getUint32(48, false),
      orthographicIndex: view.getUint32(52, false),
      inflectionIndex: view.getUint32(56, false),
      indexNames: view.getUint32(60, false),
      indexKeys: view.getUint32(64, false),
      extraIndex0: view.getUint32(68, false),
      extraIndex1: view.getUint32(72, false),
      extraIndex2: view.getUint32(76, false),
      extraIndex3: view.getUint32(80, false),
      extraIndex4: view.getUint32(84, false),
      extraIndex5: view.getUint32(88, false),
      firstNonBookIndex: view.getUint32(92, false),
      fullNameOffset: view.getUint32(96, false),
      fullNameLength: view.getUint32(100, false),
      locale: view.getUint32(104, false),
      inputLanguage: view.getUint32(108, false),
      outputLanguage: view.getUint32(112, false),
      minVersion: view.getUint32(116, false),
      firstImageIndex: view.getUint32(120, false),
      huffmanRecordOffset: view.getUint32(124, false),
      huffmanRecordCount: view.getUint32(128, false),
      huffmanTableOffset: view.getUint32(132, false),
      huffmanTableLength: view.getUint32(136, false),
      exthFlags: view.getUint32(140, false),
      unknown: view.getUint32(144, false),
      drmOffset: view.getUint32(148, false),
      drmCount: view.getUint32(152, false),
      drmSize: view.getUint32(156, false),
      drmFlags: view.getUint32(160, false),
      firstContentRecordNumber: view.getUint16(164, false),
      lastContentRecordNumber: view.getUint16(166, false),
      fcisRecordNumber: view.getUint32(168, false),
      flisRecordNumber: view.getUint32(172, false),
      unknown2: view.getUint32(176, false),
      unknown3: view.getUint32(180, false),
      unknown4: view.getUint32(184, false),
      extraRecordDataFlags: view.getUint32(188, false),
      indxRecordOffset: view.getUint32(192, false)
    }
  }

  /**
   * Read record list from MOBI file
   */
  private async readRecordList(): Promise<MOBIRecord[]> {
    const records: MOBIRecord[] = []
    const recordListData = await this.loader.loadBlob('record-list')
    const view = new DataView(await recordListData.arrayBuffer())
    
    for (let i = 0; i < this.header.numberOfRecords; i++) {
      const offset = i * 8
      records.push({
        offset: view.getUint32(offset, false),
        attributes: view.getUint8(offset + 4),
        uniqueID: view.getUint8(offset + 5)
      })
    }
    
    return records
  }

  /**
   * Parse EXTH header for metadata
   */
  private async parseEXTHHeader(): Promise<void> {
    if (!(this.header.exthFlags & 0x40)) {
      return // No EXTH header
    }

    try {
      const exthData = await this.loader.loadBlob('exth-header')
      const view = new DataView(await exthData.arrayBuffer())
      
      const identifier = this.readString(view, 0, 4)
      if (identifier !== 'EXTH') {
        return
      }

      const headerLength = view.getUint32(4, false)
      const recordCount = view.getUint32(8, false)
      
      let offset = 12
      for (let i = 0; i < recordCount; i++) {
        const type = view.getUint32(offset, false)
        const length = view.getUint32(offset + 4, false)
        const data = this.readString(view, offset + 8, length - 8)
        
        this.parseEXTHRecord(type, data)
        offset += length
      }
    } catch (error) {
      console.warn('Failed to parse EXTH header:', error)
    }
  }

  /**
   * Parse individual EXTH record
   */
  private parseEXTHRecord(type: number, data: string): void {
    switch (type) {
      case 100: // Title
        this.metadata.title = data
        break
      case 101: // Author
        this.metadata.creator = data
        break
      case 102: // Subject
        this.metadata.subject = data
        break
      case 103: // Description
        this.metadata.description = data
        break
      case 104: // Publisher
        this.metadata.publisher = data
        break
      case 105: // Contributor
        this.metadata.contributor = data
        break
      case 106: // Date
        this.metadata.date = data
        break
      case 107: // Type
        this.metadata.type = data
        break
      case 108: // Format
        this.metadata.format = data
        break
      case 109: // Identifier
        this.metadata.identifier = data
        break
      case 110: // Source
        this.metadata.source = data
        break
      case 111: // Language
        this.metadata.language = data
        break
      case 112: // Relation
        this.metadata.relation = data
        break
      case 113: // Coverage
        this.metadata.coverage = data
        break
      case 114: // Rights
        this.metadata.rights = data
        break
    }
  }

  /**
   * Build sections from MOBI records
   */
  private buildSections(): void {
    for (let i = this.header.firstContentRecordNumber; i <= this.header.lastContentRecordNumber; i++) {
      const record = this.records[i]
      if (!record) continue

      const section: MOBISection = {
        id: `section-${i}`,
        recordNumber: i,
        compressed: (record.attributes & 0x10) !== 0,
        compressionType: this.header.compression,
        linear: 'yes',
        cfi: `/6/${i - this.header.firstContentRecordNumber}`,
        size: 0, // Will be set when loaded
        load: () => this.loadSection(i),
        unload: () => {},
        createDocument: () => this.createSectionDocument(i),
      }

      this.sections.push(section)
    }
  }

  /**
   * Load section content
   */
  private async loadSection(recordNumber: number): Promise<string> {
    const record = this.records[recordNumber]
    if (!record) {
      throw new Error(`Record ${recordNumber} not found`)
    }

    const recordData = await this.loader.loadBlob(`record-${recordNumber}`)
    const data = await recordData.arrayBuffer()
    
    // Decompress if necessary
    if (record.attributes & 0x10) {
      return this.decompressData(data, this.header.compression)
    } else {
      return new TextDecoder('utf-8').decode(data)
    }
  }

  /**
   * Create section document
   */
  private async createSectionDocument(recordNumber: number): Promise<Document> {
    const content = await this.loadSection(recordNumber)
    const parser = new DOMParser()
    return parser.parseFromString(content, 'text/html')
  }

  /**
   * Decompress MOBI data
   */
  private decompressData(data: ArrayBuffer, compressionType: number): string {
    switch (compressionType) {
      case COMPRESSION_TYPES.NONE:
        return new TextDecoder('utf-8').decode(data)
      
      case COMPRESSION_TYPES.PALMDOC:
        return this.decompressPalmDOC(data)
      
      case COMPRESSION_TYPES.HUFF_CDIC:
        return this.decompressHuffCDIC(data)
      
      default:
        throw new Error(`Unsupported compression type: ${compressionType}`)
    }
  }

  /**
   * Decompress PalmDOC data
   */
  private decompressPalmDOC(data: ArrayBuffer): string {
    // PalmDOC uses a simple LZ77-like compression
    // This is a simplified implementation
    const view = new Uint8Array(data)
    const decompressed: number[] = []
    
    let i = 0
    while (i < view.length) {
      const byte = view[i]
      
      if (byte === 0) {
        // Literal null byte
        decompressed.push(0)
        i++
      } else if (byte < 0x09) {
        // Literal bytes
        for (let j = 0; j < byte; j++) {
          decompressed.push(view[i + 1 + j])
        }
        i += byte + 1
      } else {
        // Compressed sequence
        const length = (byte >> 3) + 3
        const distance = ((byte & 0x07) << 8) | view[i + 1]
        
        for (let j = 0; j < length; j++) {
          const sourceIndex = decompressed.length - distance
          if (sourceIndex >= 0) {
            decompressed.push(decompressed[sourceIndex])
          }
        }
        i += 2
      }
    }
    
    return new TextDecoder('utf-8').decode(new Uint8Array(decompressed))
  }

  /**
   * Decompress Huffman CDIC data
   */
  private decompressHuffCDIC(data: ArrayBuffer): string {
    // Huffman CDIC decompression is complex
    // For now, return a placeholder
    throw new Error('Huffman CDIC decompression not yet implemented')
  }

  /**
   * Parse TOC from MOBI file
   */
  private async parseTOC(): Promise<void> {
    // MOBI TOC parsing is complex and format-specific
    // For now, create a simple TOC based on sections
    this.toc = this.sections.map((section, index) => ({
      label: `Chapter ${index + 1}`,
      href: `#section-${section.recordNumber}`,
      subitems: []
    }))
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
    // MOBI CFI resolution (simplified)
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
   * Read string from DataView
   */
  private readString(view: DataView, offset: number, length: number): string {
    const bytes = new Uint8Array(view.buffer, offset, length)
    return new TextDecoder('utf-8').decode(bytes)
  }
}

/**
 * Create MOBI parser instance
 */
export async function createMOBIParser(loader: Loader): Promise<MOBIBook> {
  const parser = new MOBIParser(loader)
  return await parser.parse()
}
