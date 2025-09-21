/**
 * EPUB Loader Implementation
 * Handles loading of EPUB files from various sources
 */

import { Loader } from './types'
import { ZipReader, BlobReader, TextWriter, BlobWriter, Entry } from '@zip.js/zip.js'

export class EPUBLoader implements Loader {
  public entries: Array<{ filename: string }> = []
  private fileMap: Map<string, Blob> = new Map()
  private zipReader: ZipReader<Blob> | null = null
  private loadPromise: Promise<void>

  constructor(file: File | Blob) {
    this.loadPromise = this.loadFile(file)
  }

  /**
   * Load EPUB file and extract entries
   */
  private async loadFile(file: File | Blob): Promise<void> {
    try {
      // Use zip.js for proper ZIP handling
      this.zipReader = new ZipReader(new BlobReader(file))
      const entries = await this.zipReader.getEntries()
      
      this.entries = entries.map(entry => ({ filename: entry.filename }))
      
      // Pre-load critical files for performance
      await this.preloadCriticalFiles(entries)
    } catch (error) {
      console.error('Failed to load EPUB file:', error)
      throw new Error('Invalid EPUB file')
    }
  }

  /**
   * Pre-load critical files for better performance
   */
  private async preloadCriticalFiles(entries: Entry[]): Promise<void> {
    const criticalFiles = [
      'META-INF/container.xml',
      'META-INF/encryption.xml',
      'META-INF/manifest.xml',
      'META-INF/metadata.xml',
      'META-INF/rights.xml',
      'META-INF/signatures.xml'
    ]

    for (const entry of entries) {
      if (criticalFiles.includes(entry.filename) || 
          entry.filename.endsWith('.opf') ||
          entry.filename.endsWith('.ncx') ||
          entry.filename.endsWith('.xhtml') ||
          entry.filename.endsWith('.html')) {
        try {
          if ('getData' in entry) {
            const blob = await entry.getData(new BlobWriter())
            this.fileMap.set(entry.filename, blob)
          }
        } catch (error) {
          console.warn(`Failed to preload ${entry.filename}:`, error)
        }
      }
    }
  }

  /**
   * Load text file
   */
  async loadText(filename: string): Promise<string> {
    // Wait for initialization
    await this.loadPromise

    // Check if already loaded
    const cachedBlob = this.fileMap.get(filename)
    if (cachedBlob) {
      return await cachedBlob.text()
    }

    // Load from ZIP
    if (!this.zipReader) {
      throw new Error('ZIP reader not initialized')
    }

    try {
      const entries = await this.zipReader.getEntries()
      const entry = entries.find(e => e.filename === filename)
      if (!entry) {
        throw new Error(`File not found: ${filename}`)
      }

      if ('getData' in entry) {
        const text = await entry.getData(new TextWriter())
        return text
      } else {
        throw new Error(`Entry ${filename} is a directory`)
      }
    } catch (error) {
      throw new Error(`Failed to load text file ${filename}: ${error}`)
    }
  }

  /**
   * Load blob file
   */
  async loadBlob(filename: string): Promise<Blob> {
    // Wait for initialization
    await this.loadPromise

    // Check if already loaded
    const cachedBlob = this.fileMap.get(filename)
    if (cachedBlob) {
      return cachedBlob
    }

    // Load from ZIP
    if (!this.zipReader) {
      throw new Error('ZIP reader not initialized')
    }

    try {
      const entries = await this.zipReader.getEntries()
      const entry = entries.find(e => e.filename === filename)
      if (!entry) {
        throw new Error(`File not found: ${filename}`)
      }

      if ('getData' in entry) {
        const blob = await entry.getData(new BlobWriter())
        // Cache for future use
        this.fileMap.set(filename, blob)
        return blob
      } else {
        throw new Error(`Entry ${filename} is a directory`)
      }
    } catch (error) {
      throw new Error(`Failed to load blob file ${filename}: ${error}`)
    }
  }

  /**
   * Get file size
   */
  async getSize(filename: string): Promise<number> {
    // Wait for initialization
    await this.loadPromise

    // Check if already loaded
    const cachedBlob = this.fileMap.get(filename)
    if (cachedBlob) {
      return cachedBlob.size
    }

    // Get from ZIP entry
    if (!this.zipReader) {
      throw new Error('ZIP reader not initialized')
    }

    try {
      const entries = await this.zipReader.getEntries()
      const entry = entries.find(e => e.filename === filename)
      if (!entry) {
        throw new Error(`File not found: ${filename}`)
      }

      return entry.uncompressedSize
    } catch (error) {
      throw new Error(`Failed to get size for ${filename}: ${error}`)
    }
  }

  /**
   * Cleanup resources
   */
  async close(): Promise<void> {
    if (this.zipReader) {
      await this.zipReader.close()
      this.zipReader = null
    }
    this.fileMap.clear()
  }
}

/**
 * Create EPUB loader from file
 */
export async function createEPUBLoader(file: File | Blob): Promise<EPUBLoader> {
  const loader = new EPUBLoader(file)
  return loader
}

/**
 * Directory-based loader for unpacked EPUBs
 */
export class DirectoryLoader implements Loader {
  private basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
  }

  async loadText(filename: string): Promise<string> {
    const response = await fetch(`${this.basePath}/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load: ${filename}`)
    }
    return await response.text()
  }

  async loadBlob(filename: string): Promise<Blob> {
    const response = await fetch(`${this.basePath}/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load: ${filename}`)
    }
    return await response.blob()
  }

  async getSize(filename: string): Promise<number> {
    const response = await fetch(`${this.basePath}/${filename}`, { method: 'HEAD' })
    if (!response.ok) {
      throw new Error(`Failed to get size: ${filename}`)
    }
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength) : 0
  }
}

/**
 * Create directory loader
 */
export function createDirectoryLoader(basePath: string): DirectoryLoader {
  return new DirectoryLoader(basePath)
}
