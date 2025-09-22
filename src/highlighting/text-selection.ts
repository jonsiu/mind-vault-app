/**
 * Text Selection Utilities
 * Handles text selection, range detection, and CFI generation
 */

import { TextSelection, SelectionContext, HighlightSelection } from './types'
import { CFIParser } from '../parsers'

export class TextSelectionManager {
  private currentSelection: TextSelection | null = null
  private selectionListeners: ((selection: TextSelection | null) => void)[] = []

  constructor() {
    this.setupSelectionListeners()
  }

  /**
   * Setup global selection event listeners
   */
  private setupSelectionListeners(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('selectionchange', this.handleSelectionChange.bind(this))
      document.addEventListener('mouseup', this.handleMouseUp.bind(this))
      document.addEventListener('keyup', this.handleKeyUp.bind(this))
    }
  }

  /**
   * Handle selection change events
   */
  private handleSelectionChange(): void {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      this.currentSelection = null
      this.notifySelectionListeners(null)
      return
    }

    const textSelection = this.createTextSelection(selection)
    if (textSelection) {
      this.currentSelection = textSelection
      this.notifySelectionListeners(textSelection)
    }
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp(event: MouseEvent): void {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      this.handleSelectionChange()
    }, 10)
  }

  /**
   * Handle key up events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Handle keyboard selection (Shift + Arrow keys, etc.)
    if (event.shiftKey || event.key === 'Escape') {
      this.handleSelectionChange()
    }
  }

  /**
   * Create TextSelection from DOM Selection
   */
  private createTextSelection(selection: Selection): TextSelection | null {
    if (selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    const text = selection.toString().trim()

    if (!text) return null

    return {
      text,
      startOffset: this.getOffsetInContainer(range.startContainer, range.startOffset),
      endOffset: this.getOffsetInContainer(range.endContainer, range.endOffset),
      startContainer: range.startContainer,
      endContainer: range.endContainer,
      range
    }
  }

  /**
   * Get offset within container
   */
  private getOffsetInContainer(container: Node, offset: number): number {
    if (container.nodeType === Node.TEXT_NODE) {
      return offset
    }

    let totalOffset = 0
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    )

    let node: Node | null = walker.nextNode()
    while (node) {
      if (node === container) {
        return totalOffset + offset
      }
      totalOffset += node.textContent?.length || 0
      node = walker.nextNode()
    }

    return totalOffset
  }

  /**
   * Get current selection
   */
  getCurrentSelection(): TextSelection | null {
    return this.currentSelection
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    if (typeof window !== 'undefined') {
      window.getSelection()?.removeAllRanges()
    }
    this.currentSelection = null
    this.notifySelectionListeners(null)
  }

  /**
   * Create highlight selection from current selection
   */
  createHighlightSelection(context: SelectionContext): HighlightSelection | null {
    const selection = this.getCurrentSelection()
    if (!selection) return null

    const startCfi = this.generateCFI(selection.startContainer, selection.startOffset)
    const endCfi = this.generateCFI(selection.endContainer, selection.endOffset)

    if (!startCfi || !endCfi) return null

    return {
      startCfi,
      endCfi,
      text: selection.text,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      sectionId: context.sectionId,
      bookId: context.bookId
    }
  }

  /**
   * Generate CFI for a position
   */
  private generateCFI(container: Node, offset: number): string | null {
    try {
      // Find the closest element with an ID or data attribute
      const element = this.findElementWithIdentifier(container)
      if (!element) return null

      // Create a range to the position
      const range = document.createRange()
      range.setStart(container, offset)
      range.setEnd(container, offset)

      // Generate CFI using the CFI parser
      const cfi = CFIParser.generateCFI(range, element)
      return cfi
    } catch (error) {
      console.warn('Failed to generate CFI:', error)
      return null
    }
  }

  /**
   * Find element with identifier (ID or data attribute)
   */
  private findElementWithIdentifier(node: Node): Element | null {
    let current: Node | null = node

    while (current && current !== document.body) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element
        if (element.id || element.getAttribute('data-cfi')) {
          return element
        }
      }
      current = current.parentNode
    }

    return document.body
  }

  /**
   * Restore selection from CFI
   */
  restoreSelection(startCfi: string, endCfi: string): boolean {
    try {
      const startRange = this.parseCFIToRange(startCfi)
      const endRange = this.parseCFIToRange(endCfi)

      if (!startRange || !endRange) return false

      const selection = window.getSelection()
      if (!selection) return false

      selection.removeAllRanges()
      const range = document.createRange()
      range.setStart(startRange.startContainer, startRange.startOffset)
      range.setEnd(endRange.endContainer, endRange.endOffset)
      selection.addRange(range)

      return true
    } catch (error) {
      console.warn('Failed to restore selection:', error)
      return false
    }
  }

  /**
   * Parse CFI to Range
   */
  private parseCFIToRange(cfi: string): { startContainer: Node; startOffset: number; endContainer: Node; endOffset: number } | null {
    try {
      const parsed = CFIParser.parse(cfi)
      if (!parsed || parsed.length === 0) return null

      // This is a simplified implementation
      // In a real implementation, you'd need to traverse the DOM based on the CFI
      const element = document.querySelector(`[data-cfi="${cfi}"]`)
      if (!element) return null

      return {
        startContainer: element.firstChild || element,
        startOffset: 0,
        endContainer: element.firstChild || element,
        endOffset: element.textContent?.length || 0
      }
    } catch (error) {
      console.warn('Failed to parse CFI:', error)
      return null
    }
  }

  /**
   * Get selection context
   */
  getSelectionContext(): SelectionContext | null {
    const selection = this.getCurrentSelection()
    if (!selection) return null

    const element = this.findElementWithIdentifier(selection.startContainer)
    if (!element) return null

    // Get position information
    const rect = selection.range.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Extract book and section IDs from element attributes
    const bookId = element.getAttribute('data-book-id') || ''
    const sectionId = element.getAttribute('data-section-id') || ''

    return {
      bookId,
      sectionId,
      element,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      },
      viewport
    }
  }

  /**
   * Check if selection is valid for highlighting
   */
  isValidSelection(): boolean {
    const selection = this.getCurrentSelection()
    if (!selection) return false

    // Check if selection is within a readable element
    const element = this.findElementWithIdentifier(selection.startContainer)
    if (!element) return false

    // Check if element is highlightable
    const isHighlightable = element.hasAttribute('data-highlightable') || 
                           element.classList.contains('highlightable') ||
                           element.tagName === 'P' ||
                           element.tagName === 'DIV' ||
                           element.tagName === 'SPAN'

    if (!isHighlightable) return false

    // Check selection length
    if (selection.text.length < 2) return false
    if (selection.text.length > 10000) return false

    return true
  }

  /**
   * Add selection listener
   */
  addSelectionListener(listener: (selection: TextSelection | null) => void): void {
    this.selectionListeners.push(listener)
  }

  /**
   * Remove selection listener
   */
  removeSelectionListener(listener: (selection: TextSelection | null) => void): void {
    const index = this.selectionListeners.indexOf(listener)
    if (index > -1) {
      this.selectionListeners.splice(index, 1)
    }
  }

  /**
   * Notify selection listeners
   */
  private notifySelectionListeners(selection: TextSelection | null): void {
    this.selectionListeners.forEach(listener => {
      try {
        listener(selection)
      } catch (error) {
        console.warn('Selection listener error:', error)
      }
    })
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      document.removeEventListener('selectionchange', this.handleSelectionChange.bind(this))
      document.removeEventListener('mouseup', this.handleMouseUp.bind(this))
      document.removeEventListener('keyup', this.handleKeyUp.bind(this))
    }
    this.selectionListeners = []
  }
}

/**
 * Create text selection manager instance
 */
export function createTextSelectionManager(): TextSelectionManager {
  return new TextSelectionManager()
}
