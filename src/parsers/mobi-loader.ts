/**
 * MOBI Loader Implementation
 * Handles loading of MOBI/AZW files
 */

import { Loader } from './types'

export class MOBILoader implements Loader {
  public entries: Array<{ filename: string }> = []
  private fileMap: Map<string, Blob> = new Map()
  private fileBuffer: ArrayBuffer
  private pdbHeader: ArrayBuffer
  private mobiHeader: ArrayBuffer
  private recordList: ArrayBuffer
  private records: Map<number, ArrayBuffer> = new Map()

  constructor(file: File | Blob) {
    this.loadFile(file)
  }

  /**
   * Load MOBI file and parse structure
   */
  private async loadFile(file: File | Blob): Promise<void> {
    try {
      this.fileBuffer = await file.arrayBuffer()
      await this.parseMOBIStructure()
    } catch (error) {
      console.error('Failed to load MOBI file:', error)
      throw new Error('Invalid MOBI file')
    }
  }

  /**
   * Parse MOBI file structure
   */
  private async parseMOBIStructure(): Promise<void> {
    const view = new DataView(this.fileBuffer)
    
    // Read PDB header (first 78 bytes)
    this.pdbHeader = this.fileBuffer.slice(0, 78)
    
    // Parse PDB header to get record information
    const name = this.readString(view, 0, 32).replace(/\0/g, '')
    const attributes = view.getUint16(32, false)
    const version = view.getUint16(34, false)
    const creationDate = view.getUint32(36, false)
    const modificationDate = view.getUint32(40, false)
    const backupDate = view.getUint32(44, false)
    const modificationNumber = view.getUint32(48, false)
    const appInfoID = view.getUint32(52, false)
    const sortInfoID = view.getUint32(56, false)
    const type = this.readString(view, 60, 4)
    const creator = this.readString(view, 64, 4)
    const uniqueIDSeed = view.getUint32(68, false)
    const nextRecordListID = view.getUint32(72, false)
    const numberOfRecords = view.getUint16(76, false)

    // Read record list
    const recordListOffset = 78
    const recordListSize = numberOfRecords * 8
    this.recordList = this.fileBuffer.slice(recordListOffset, recordListOffset + recordListSize)

    // Parse records
    const recordListView = new DataView(this.recordList)
    let currentOffset = recordListOffset + recordListSize

    for (let i = 0; i < numberOfRecords; i++) {
      const recordOffset = recordListView.getUint32(i * 8, false)
      const recordAttributes = recordListView.getUint8(i * 8 + 4)
      const recordUniqueID = recordListView.getUint8(i * 8 + 5)
      
      // Calculate record size
      let recordSize: number
      if (i < numberOfRecords - 1) {
        const nextRecordOffset = recordListView.getUint32((i + 1) * 8, false)
        recordSize = nextRecordOffset - recordOffset
      } else {
        recordSize = this.fileBuffer.byteLength - recordOffset
      }

      // Extract record data
      const recordData = this.fileBuffer.slice(recordOffset, recordOffset + recordSize)
      this.records.set(i, recordData)

      // Store special records
      if (i === 0) {
        // First record is usually the MOBI header
        this.mobiHeader = recordData
      }
    }

    // Create virtual file entries for easy access
    this.entries = [
      { filename: 'header' },
      { filename: 'mobi-header' },
      { filename: 'record-list' },
      ...Array.from(this.records.keys()).map(i => ({ filename: `record-${i}` }))
    ]
  }

  /**
   * Load text file (virtual files)
   */
  async loadText(filename: string): Promise<string> {
    const blob = await this.loadBlob(filename)
    return await blob.text()
  }

  /**
   * Load blob file (virtual files)
   */
  async loadBlob(filename: string): Promise<Blob> {
    // Check if already loaded
    const cachedBlob = this.fileMap.get(filename)
    if (cachedBlob) {
      return cachedBlob
    }

    let data: ArrayBuffer

    switch (filename) {
      case 'header':
        data = this.pdbHeader
        break
      case 'mobi-header':
        data = this.mobiHeader
        break
      case 'record-list':
        data = this.recordList
        break
      default:
        if (filename.startsWith('record-')) {
          const recordNumber = parseInt(filename.split('-')[1])
          const recordData = this.records.get(recordNumber)
          if (!recordData) {
            throw new Error(`Record ${recordNumber} not found`)
          }
          data = recordData
        } else {
          throw new Error(`File not found: ${filename}`)
        }
    }

    const blob = new Blob([data])
    this.fileMap.set(filename, blob)
    return blob
  }

  /**
   * Get file size
   */
  async getSize(filename: string): Promise<number> {
    const blob = await this.loadBlob(filename)
    return blob.size
  }

  /**
   * Cleanup resources
   */
  async close(): Promise<void> {
    this.fileMap.clear()
    this.records.clear()
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
 * Create MOBI loader from file
 */
export async function createMOBILoader(file: File | Blob): Promise<MOBILoader> {
  const loader = new MOBILoader(file)
  return loader
}
