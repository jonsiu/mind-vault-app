/**
 * EPUB Parser Exports
 * Main entry point for EPUB parsing functionality
 */

export * from './types'
export * from './epub'
export * from './epubcfi'
export * from './loader'

// Re-export main functions for convenience
export { createEPUBParser } from './epub'
export { createEPUBLoader, createDirectoryLoader } from './loader'
export { CFIParser } from './epubcfi'

// Main EPUB parser function
export async function parseEPUB(file: File | Blob) {
  const loader = await createEPUBLoader(file)
  return await createEPUBParser(loader)
}
