/**
 * EPUB CFI (Canonical Fragment Identifier) Parser
 * Ported from Foliate.js to TypeScript
 */

import { CFI, CFIRange, CFIPart } from './types'

export class CFIParser {
  /**
   * Parse CFI string to CFI object
   */
  static parse(cfi: string): CFI | CFIRange {
    if (!cfi.startsWith('epubcfi(') || !cfi.endsWith(')')) {
      throw new Error('Invalid CFI format')
    }

    const content = cfi.slice(8, -1) // Remove 'epubcfi(' and ')'
    
    if (content.includes(',')) {
      return this.parseRange(content)
    } else {
      return this.parseCollapsed(content)
    }
  }

  /**
   * Parse collapsed CFI
   */
  private static parseCollapsed(content: string): CFI {
    const paths = content.split('!')
    return paths.map(path => this.parsePath(path))
  }

  /**
   * Parse range CFI
   */
  private static parseRange(content: string): CFIRange {
    const parts = content.split(',')
    if (parts.length !== 3) {
      throw new Error('Invalid range CFI format')
    }

    const [parent, start, end] = parts

    return {
      parent: this.parseCollapsed(parent),
      start: this.parseCollapsed(start),
      end: this.parseCollapsed(end)
    }
  }

  /**
   * Parse CFI path
   */
  private static parsePath(path: string): CFIPart[] {
    if (!path) return []

    const parts: CFIPart[] = []
    let i = 0

    while (i < path.length) {
      if (path[i] === '/') {
        i++
        const part = this.parseStep(path, i)
        parts.push(part)
        i += part.length
      } else {
        throw new Error(`Invalid CFI path at position ${i}`)
      }
    }

    return parts
  }

  /**
   * Parse CFI step
   */
  private static parseStep(path: string, start: number): CFIPart & { length: number } {
    let i = start
    let length = 0

    // Parse index
    while (i < path.length && /[0-9]/.test(path[i])) {
      i++
    }
    
    if (i === start) {
      throw new Error(`Invalid CFI step at position ${start}`)
    }

    const index = parseInt(path.slice(start, i))
    const part: CFIPart = { index }
    length = i - start

    // Parse optional components
    while (i < path.length) {
      switch (path[i]) {
        case '[':
          // Parse text assertion
          i++
          const textStart = i
          while (i < path.length && path[i] !== ']') {
            if (path[i] === '\\' && i + 1 < path.length) {
              i += 2 // Skip escaped character
            } else {
              i++
            }
          }
          if (i >= path.length) {
            throw new Error('Unterminated text assertion')
          }
          part.text = path.slice(textStart, i).replace(/\\(.)/g, '$1')
          i++ // Skip ']'
          length = i - start
          break

        case '(':
          // Parse spatial offset
          i++
          const spatialStart = i
          while (i < path.length && path[i] !== ')') {
            i++
          }
          if (i >= path.length) {
            throw new Error('Unterminated spatial offset')
          }
          part.spatial = parseFloat(path.slice(spatialStart, i))
          i++ // Skip ')'
          length = i - start
          break

        case ':':
          // Parse temporal offset
          i++
          const temporalStart = i
          while (i < path.length && /[0-9.]/.test(path[i])) {
            i++
          }
          part.temporal = parseFloat(path.slice(temporalStart, i))
          length = i - start
          break

        case '@':
          // Parse side bias
          i++
          if (i < path.length) {
            part.side = path[i] === 'b' ? 'before' : 'after'
            i++
            length = i - start
          }
          break

        case '~':
          // Parse offset
          i++
          const offsetStart = i
          while (i < path.length && /[0-9]/.test(path[i])) {
            i++
          }
          part.offset = parseInt(path.slice(offsetStart, i))
          length = i - start
          break

        default:
          return { ...part, length }
      }
    }

    return { ...part, length }
  }

  /**
   * Convert CFI to string
   */
  static stringify(cfi: CFI | CFIRange): string {
    if (this.isRange(cfi)) {
      return `epubcfi(${this.stringifyPath(cfi.parent)}!${this.stringifyPath(cfi.start)},${this.stringifyPath(cfi.end)})`
    } else {
      return `epubcfi(${cfi.map(path => this.stringifyPath(path)).join('!')})`
    }
  }

  /**
   * Check if CFI is a range
   */
  private static isRange(cfi: CFI | CFIRange): cfi is CFIRange {
    return 'parent' in cfi
  }

  /**
   * Stringify CFI path
   */
  private static stringifyPath(path: CFIPart[]): string {
    return path.map(part => this.stringifyStep(part)).join('')
  }

  /**
   * Stringify CFI step
   */
  private static stringifyStep(part: CFIPart): string {
    let result = `/${part.index}`

    if (part.text !== undefined) {
      result += `[${part.text.replace(/[\\[\]]/g, '\\$&')}]`
    }

    if (part.spatial !== undefined) {
      result += `(${part.spatial})`
    }

    if (part.temporal !== undefined) {
      result += `:${part.temporal}`
    }

    if (part.side !== undefined) {
      result += `@${part.side === 'before' ? 'b' : 'a'}`
    }

    if (part.offset !== undefined) {
      result += `~${part.offset}`
    }

    return result
  }

  /**
   * Convert CFI to Range
   */
  static toRange(doc: Document, cfi: string, filter?: (node: Node) => number): Range | null {
    try {
      const parsed = this.parse(cfi)
      if (this.isRange(parsed)) {
        return this.rangeFromRangeCFI(doc, parsed, filter)
      } else {
        return this.rangeFromCollapsedCFI(doc, parsed, filter)
      }
    } catch (error) {
      console.error('CFI parsing error:', error)
      return null
    }
  }

  /**
   * Convert Range to CFI
   */
  static fromRange(range: Range, filter?: (node: Node) => number): string {
    try {
      const startPath = this.pathFromNode(range.startContainer, range.startOffset, filter)
      const endPath = this.pathFromNode(range.endContainer, range.endOffset, filter)

      if (this.pathsEqual(startPath, endPath)) {
        return this.stringify([startPath])
      } else {
        return this.stringify({
          parent: [],
          start: [startPath],
          end: [endPath]
        })
      }
    } catch (error) {
      console.error('CFI generation error:', error)
      return ''
    }
  }

  /**
   * Create range from collapsed CFI
   */
  private static rangeFromCollapsedCFI(doc: Document, cfi: CFI, filter?: (node: Node) => number): Range | null {
    if (cfi.length === 0) return null

    const path = cfi[cfi.length - 1]
    const node = this.nodeFromPath(doc, path, filter)
    
    if (!node) return null

    const range = doc.createRange()
    range.setStart(node, 0)
    range.setEnd(node, 0)
    return range
  }

  /**
   * Create range from range CFI
   */
  private static rangeFromRangeCFI(doc: Document, cfi: CFIRange, filter?: (node: Node) => number): Range | null {
    const startNode = this.nodeFromPath(doc, cfi.start[0], filter)
    const endNode = this.nodeFromPath(doc, cfi.end[0], filter)

    if (!startNode || !endNode) return null

    const range = doc.createRange()
    range.setStart(startNode, 0)
    range.setEnd(endNode, 0)
    return range
  }

  /**
   * Get node from CFI path
   */
  private static nodeFromPath(doc: Document, path: CFIPart[], filter?: (node: Node) => number): Node | null {
    let node: Node = doc.documentElement

    for (const part of path) {
      if (node.nodeType === Node.DOCUMENT_NODE) {
        node = (node as Document).documentElement
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null
      }

      const children = Array.from(node.childNodes).filter(child => {
        if (filter) {
          const result = filter(child)
          return result === NodeFilter.FILTER_ACCEPT
        }
        return true
      })

      if (part.index < 1 || part.index > children.length) {
        return null
      }

      node = children[part.index - 1]

      if (part.offset !== undefined && node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text
        const offset = Math.min(part.offset, textNode.length)
        return textNode.splitText(offset)
      }
    }

    return node
  }

  /**
   * Get CFI path from node
   */
  private static pathFromNode(node: Node, offset: number, filter?: (node: Node) => number): CFIPart[] {
    const path: CFIPart[] = []
    let current: Node | null = node

    while (current && current !== current.ownerDocument) {
      const parent = current.parentNode
      if (!parent) break

      const siblings = Array.from(parent.childNodes).filter(sibling => {
        if (filter) {
          const result = filter(sibling)
          return result === NodeFilter.FILTER_ACCEPT
        }
        return true
      })

      const index = siblings.indexOf(current) + 1
      if (index === 0) break

      path.unshift({ index })

      if (current.nodeType === Node.TEXT_NODE && offset > 0) {
        path[path.length - 1].offset = offset
      }

      current = parent
    }

    return path
  }

  /**
   * Check if two paths are equal
   */
  private static pathsEqual(path1: CFIPart[], path2: CFIPart[]): boolean {
    if (path1.length !== path2.length) return false

    for (let i = 0; i < path1.length; i++) {
      if (path1[i].index !== path2[i].index) return false
      if (path1[i].offset !== path2[i].offset) return false
    }

    return true
  }
}

export default CFIParser
