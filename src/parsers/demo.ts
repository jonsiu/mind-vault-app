/**
 * EPUB Parser Demo
 * Simple demo to test EPUB parser with real files
 */

import { parseEPUB } from './index'

/**
 * Demo function to test EPUB parser
 */
export async function testEPUBParser(file: File): Promise<void> {
  console.log('Testing EPUB Parser...')
  console.log('File:', file.name, 'Size:', file.size, 'bytes')
  
  const startTime = performance.now()
  
  try {
    const book = await parseEPUB(file)
    const loadTime = performance.now() - startTime
    
    console.log('✅ EPUB parsed successfully!')
    console.log('⏱️  Load time:', loadTime.toFixed(2), 'ms')
    console.log('📚 Book metadata:', book.metadata)
    console.log('📖 Sections:', book.sections.length)
    console.log('📑 TOC items:', book.toc.length)
    console.log('🎨 Rendition:', book.rendition)
    
    // Test performance requirements
    if (loadTime < 2000) {
      console.log('✅ Meets content loading requirement (< 2 seconds)')
    } else {
      console.log('❌ Exceeds content loading requirement (> 2 seconds)')
    }
    
    // Test memory usage
    const memory = (performance as any).memory
    if (memory) {
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      console.log('💾 Memory usage:', usedMB.toFixed(2), 'MB')
      
      if (usedMB < 500) {
        console.log('✅ Meets memory requirement (< 500MB)')
      } else {
        console.log('❌ Exceeds memory requirement (> 500MB)')
      }
    }
    
  } catch (error) {
    const loadTime = performance.now() - startTime
    console.error('❌ EPUB parsing failed:', error)
    console.log('⏱️  Failed after:', loadTime.toFixed(2), 'ms')
  }
}

/**
 * Create file input for testing
 */
export function createFileInput(): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.epub,application/epub+zip'
  input.multiple = false
  
  input.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
      await testEPUBParser(file)
    }
  })
  
  return input
}

/**
 * Initialize demo
 */
export function initDemo(): void {
  console.log('🚀 EPUB Parser Demo Initialized')
  console.log('📁 Select an EPUB file to test the parser')
  
  const fileInput = createFileInput()
  document.body.appendChild(fileInput)
  
  // Add some styling
  fileInput.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    padding: 10px;
    background: #007acc;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  `
}
