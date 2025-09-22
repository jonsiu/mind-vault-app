/**
 * Ebook Parser Exports
 * Main entry point for ebook parsing functionality
 */

export * from './types'
export * from './epub'
export * from './epubcfi'
export * from './loader'
export * from './mobi'
export * from './mobi-loader'

// Re-export main functions for convenience
export { createEPUBParser } from './epub'
export { createEPUBLoader, createDirectoryLoader } from './loader'
export { createMOBIParser } from './mobi'
export { createMOBILoader } from './mobi-loader'
export { CFIParser } from './epubcfi'

// Main parser functions
export async function parseEPUB(file: File | Blob) {
  const { createEPUBLoader } = await import('./loader')
  const { createEPUBParser } = await import('./epub')
  const loader = await createEPUBLoader(file)
  return await createEPUBParser(loader)
}

export async function parseMOBI(file: File | Blob) {
  const { createMOBILoader } = await import('./mobi-loader')
  const { createMOBIParser } = await import('./mobi')
  const loader = await createMOBILoader(file)
  return await createMOBIParser(loader)
}

// Auto-detect format and parse
export async function parseEbook(file: File | Blob) {
  const fileName = file instanceof File ? file.name.toLowerCase() : ''
  
  if (fileName.endsWith('.epub')) {
    return await parseEPUB(file)
  } else if (fileName.endsWith('.mobi') || fileName.endsWith('.azw')) {
    return await parseMOBI(file)
  } else {
    throw new Error(`Unsupported file format: ${fileName}`)
  }
}
