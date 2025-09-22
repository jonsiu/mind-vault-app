/**
 * Highlight Renderer
 * Handles rendering and visual display of highlights
 */

import { Highlight, HighlightRenderer as IHighlightRenderer } from './types'

export class HighlightRenderer implements IHighlightRenderer {
  private highlightElements: Map<string, HTMLElement> = new Map()
  private highlightStyles: Map<string, string> = new Map()

  constructor() {
    this.setupHighlightStyles()
  }

  /**
   * Setup CSS styles for highlights
   */
  private setupHighlightStyles(): void {
    if (typeof document === 'undefined') return

    const styleId = 'highlight-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .highlight {
        position: relative;
        display: inline;
        padding: 2px 4px;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }

      .highlight:hover {
        opacity: 0.8;
        transform: scale(1.02);
      }

      .highlight.selected {
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
      }

      .highlight-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.2s ease;
      }

      .highlight-tooltip.show {
        opacity: 1;
        transform: translateY(-5px);
      }

      .highlight-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
      }

      .highlight-type-icon {
        margin-right: 4px;
        font-size: 14px;
      }

      .highlight-note-indicator {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        background: #2196f3;
        border-radius: 50%;
        border: 2px solid white;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Render highlight in element
   */
  renderHighlight(highlight: Highlight, element: Element): void {
    try {
      // Remove existing highlight if present
      this.removeHighlight(highlight.id, element)

      // Find text nodes that match the highlight
      const textNodes = this.findTextNodes(element, highlight.text)
      if (textNodes.length === 0) return

      // Create highlight element
      const highlightElement = this.createHighlightElement(highlight)
      this.highlightElements.set(highlight.id, highlightElement)

      // Wrap text nodes with highlight element
      this.wrapTextNodes(textNodes, highlightElement, highlight)

      // Add event listeners
      this.addHighlightEventListeners(highlightElement, highlight)
    } catch (error) {
      console.warn(`Failed to render highlight ${highlight.id}:`, error)
    }
  }

  /**
   * Remove highlight from element
   */
  removeHighlight(highlightId: string, element: Element): void {
    const highlightElement = this.highlightElements.get(highlightId)
    if (!highlightElement) return

    try {
      // Unwrap the highlight element
      this.unwrapHighlightElement(highlightElement)
      
      // Remove from map
      this.highlightElements.delete(highlightId)
    } catch (error) {
      console.warn(`Failed to remove highlight ${highlightId}:`, error)
    }
  }

  /**
   * Clear all highlights from element
   */
  clearHighlights(element: Element): void {
    const highlights = element.querySelectorAll('.highlight')
    highlights.forEach(highlight => {
      this.unwrapHighlightElement(highlight as HTMLElement)
    })
    this.highlightElements.clear()
  }

  /**
   * Get highlight at position
   */
  getHighlightAtPosition(x: number, y: number, element: Element): Highlight | null {
    const elementAtPoint = document.elementFromPoint(x, y)
    if (!elementAtPoint) return null

    const highlightElement = elementAtPoint.closest('.highlight')
    if (!highlightElement) return null

    const highlightId = highlightElement.getAttribute('data-highlight-id')
    if (!highlightId) return null

    // This would need to be connected to a highlight store
    // For now, return null
    return null
  }

  /**
   * Get highlights in range
   */
  getHighlightsInRange(range: Range, element: Element): Highlight[] {
    const highlights: Highlight[] = []
    const highlightElements = element.querySelectorAll('.highlight')

    highlightElements.forEach(highlightEl => {
      const highlightRange = document.createRange()
      highlightRange.selectNodeContents(highlightEl)

      if (range.intersectsNode(highlightEl)) {
        const highlightId = highlightEl.getAttribute('data-highlight-id')
        if (highlightId) {
          // This would need to be connected to a highlight store
          // For now, skip
        }
      }
    })

    return highlights
  }

  /**
   * Create highlight element
   */
  private createHighlightElement(highlight: Highlight): HTMLElement {
    const element = document.createElement('span')
    element.className = 'highlight'
    element.setAttribute('data-highlight-id', highlight.id)
    element.setAttribute('data-highlight-type', highlight.type)
    element.style.backgroundColor = highlight.color
    element.style.opacity = '0.3'

    // Add type icon if available
    if (highlight.type) {
      const icon = this.getHighlightTypeIcon(highlight.type)
      if (icon) {
        const iconElement = document.createElement('span')
        iconElement.className = 'highlight-type-icon'
        iconElement.textContent = icon
        element.appendChild(iconElement)
      }
    }

    // Add note indicator if highlight has a note
    if (highlight.note) {
      const noteIndicator = document.createElement('span')
      noteIndicator.className = 'highlight-note-indicator'
      element.appendChild(noteIndicator)
    }

    return element
  }

  /**
   * Find text nodes that match highlight text
   */
  private findTextNodes(element: Element, text: string): Text[] {
    const textNodes: Text[] = []
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    )

    let node: Node | null = walker.nextNode()
    while (node) {
      const textContent = node.textContent || ''
      if (textContent.includes(text)) {
        textNodes.push(node as Text)
      }
      node = walker.nextNode()
    }

    return textNodes
  }

  /**
   * Wrap text nodes with highlight element
   */
  private wrapTextNodes(textNodes: Text[], highlightElement: HTMLElement, highlight: Highlight): void {
    textNodes.forEach(textNode => {
      const text = textNode.textContent || ''
      const index = text.indexOf(highlight.text)
      
      if (index === -1) return

      // Split the text node
      const beforeText = text.substring(0, index)
      const highlightText = text.substring(index, index + highlight.text.length)
      const afterText = text.substring(index + highlight.text.length)

      // Create new text nodes
      const beforeNode = beforeText ? document.createTextNode(beforeText) : null
      const afterNode = afterText ? document.createTextNode(afterText) : null
      const highlightTextNode = document.createTextNode(highlightText)

      // Insert highlight element
      highlightElement.appendChild(highlightTextNode)

      // Replace original text node
      const parent = textNode.parentNode
      if (!parent) return

      if (beforeNode) parent.insertBefore(beforeNode, textNode)
      parent.insertBefore(highlightElement, textNode)
      if (afterNode) parent.insertBefore(afterNode, textNode)
      parent.removeChild(textNode)
    })
  }

  /**
   * Unwrap highlight element
   */
  private unwrapHighlightElement(highlightElement: HTMLElement): void {
    const parent = highlightElement.parentNode
    if (!parent) return

    // Move all child nodes out of the highlight element
    while (highlightElement.firstChild) {
      parent.insertBefore(highlightElement.firstChild, highlightElement)
    }

    // Remove the highlight element
    parent.removeChild(highlightElement)
  }

  /**
   * Add event listeners to highlight element
   */
  private addHighlightEventListeners(highlightElement: HTMLElement, highlight: Highlight): void {
    // Click event
    highlightElement.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.handleHighlightClick(highlight, event)
    })

    // Hover events for tooltip
    highlightElement.addEventListener('mouseenter', (event) => {
      this.showHighlightTooltip(highlight, event)
    })

    highlightElement.addEventListener('mouseleave', () => {
      this.hideHighlightTooltip()
    })

    // Context menu
    highlightElement.addEventListener('contextmenu', (event) => {
      event.preventDefault()
      this.handleHighlightContextMenu(highlight, event)
    })
  }

  /**
   * Handle highlight click
   */
  private handleHighlightClick(highlight: Highlight, event: MouseEvent): void {
    // Dispatch custom event
    const customEvent = new CustomEvent('highlight-click', {
      detail: { highlight, event },
      bubbles: true
    })
    event.target?.dispatchEvent(customEvent)
  }

  /**
   * Show highlight tooltip
   */
  private showHighlightTooltip(highlight: Highlight, event: MouseEvent): void {
    this.hideHighlightTooltip()

    const tooltip = document.createElement('div')
    tooltip.className = 'highlight-tooltip'
    tooltip.setAttribute('data-highlight-id', highlight.id)

    // Build tooltip content
    let content = highlight.text
    if (highlight.note) {
      content += `\nNote: ${highlight.note}`
    }
    if (highlight.tags.length > 0) {
      content += `\nTags: ${highlight.tags.join(', ')}`
    }

    tooltip.textContent = content
    document.body.appendChild(tooltip)

    // Position tooltip
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    tooltip.style.left = `${rect.left + rect.width / 2}px`
    tooltip.style.top = `${rect.top - 10}px`

    // Show tooltip
    setTimeout(() => {
      tooltip.classList.add('show')
    }, 10)
  }

  /**
   * Hide highlight tooltip
   */
  private hideHighlightTooltip(): void {
    const tooltip = document.querySelector('.highlight-tooltip')
    if (tooltip) {
      tooltip.remove()
    }
  }

  /**
   * Handle highlight context menu
   */
  private handleHighlightContextMenu(highlight: Highlight, event: MouseEvent): void {
    // Dispatch custom event for context menu
    const customEvent = new CustomEvent('highlight-context-menu', {
      detail: { highlight, event },
      bubbles: true
    })
    event.target?.dispatchEvent(customEvent)
  }

  /**
   * Get highlight type icon
   */
  private getHighlightTypeIcon(type: string): string | null {
    const typeIcons: Record<string, string> = {
      'important': '⭐',
      'question': '❓',
      'insight': '💡',
      'confusion': '🤔',
      'action': '📝'
    }
    return typeIcons[type] || null
  }

  /**
   * Update highlight appearance
   */
  updateHighlightAppearance(highlight: Highlight): void {
    const highlightElement = this.highlightElements.get(highlight.id)
    if (!highlightElement) return

    // Update color
    highlightElement.style.backgroundColor = highlight.color

    // Update type icon
    const iconElement = highlightElement.querySelector('.highlight-type-icon')
    if (iconElement) {
      const newIcon = this.getHighlightTypeIcon(highlight.type)
      iconElement.textContent = newIcon || ''
    }

    // Update note indicator
    const noteIndicator = highlightElement.querySelector('.highlight-note-indicator')
    if (highlight.note && !noteIndicator) {
      const indicator = document.createElement('span')
      indicator.className = 'highlight-note-indicator'
      highlightElement.appendChild(indicator)
    } else if (!highlight.note && noteIndicator) {
      noteIndicator.remove()
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearHighlights(document.body)
    this.highlightElements.clear()
    this.highlightStyles.clear()
  }
}

/**
 * Create highlight renderer instance
 */
export function createHighlightRenderer(): HighlightRenderer {
  return new HighlightRenderer()
}
