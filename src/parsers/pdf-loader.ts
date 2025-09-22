/**
 * PDF Loader Implementation
 * Handles loading of PDF files
 */

import { Loader } from './types'

export class PDFLoader implements Loader {
  public entries: Array<{ filename: string }> = []
  private fileMap: Map<string, Blob> = new Map()
  private pdfFile: Blob

  constructor(file: File | Blob) {
    this.pdfFile = file
    this.initializeEntries()
  }

  /**
   * Initialize virtual file entries
   */
  private initializeEntries(): void {
    this.entries = [
      { filename: 'pdf' }
    ]
  }

  /**
   * Load text file (virtual files)
   */
  async loadText(filename: string): Promise<string> {
    if (filename === 'pdf') {
      // PDF files are binary, not text
      throw new Error('PDF files are binary and cannot be loaded as text')
    }
    throw new Error(`File not found: ${filename}`)
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

    if (filename === 'pdf') {
      this.fileMap.set(filename, this.pdfFile)
      return this.pdfFile
    }

    throw new Error(`File not found: ${filename}`)
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
  }
}

/**
 * Create PDF loader from file
 */
export async function createPDFLoader(file: File | Blob): Promise<PDFLoader> {
  const loader = new PDFLoader(file)
  return loader
}
