/**
 * Highlighting System Types
 * Core types for text highlighting and annotation functionality
 */

export interface Highlight {
  id: string
  bookId: string
  sectionId: string
  cfi: string
  text: string
  type: HighlightType
  color: string
  note?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  userId?: string
}

export interface HighlightType {
  id: string
  name: string
  color: string
  icon?: string
  description?: string
  isDefault: boolean
  createdAt: Date
}

export interface HighlightSelection {
  startCfi: string
  endCfi: string
  text: string
  startOffset: number
  endOffset: number
  sectionId: string
  bookId: string
}

export interface HighlightRange {
  start: number
  end: number
  text: string
  cfi?: string
}

export interface HighlightContext {
  bookId: string
  sectionId: string
  sectionTitle?: string
  chapterTitle?: string
  pageNumber?: number
  surroundingText?: string
}

export interface HighlightSearchResult {
  highlight: Highlight
  context: HighlightContext
  relevanceScore: number
}

export interface HighlightFilter {
  types?: string[]
  colors?: string[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  bookIds?: string[]
  hasNotes?: boolean
  searchText?: string
}

export interface HighlightStats {
  totalHighlights: number
  highlightsByType: Record<string, number>
  highlightsByColor: Record<string, number>
  highlightsByBook: Record<string, number>
  recentHighlights: Highlight[]
  mostUsedTypes: HighlightType[]
}

export interface HighlightExport {
  format: 'json' | 'csv' | 'markdown' | 'html'
  includeContext: boolean
  includeNotes: boolean
  groupBy: 'book' | 'type' | 'date' | 'none'
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface HighlightImport {
  format: 'json' | 'csv'
  data: string
  mergeStrategy: 'replace' | 'merge' | 'skip'
}

// Highlight creation/update interfaces
export interface CreateHighlightRequest {
  bookId: string
  sectionId: string
  cfi: string
  text: string
  type: string
  color?: string
  note?: string
  tags?: string[]
}

export interface UpdateHighlightRequest {
  id: string
  type?: string
  color?: string
  note?: string
  tags?: string[]
}

export interface DeleteHighlightRequest {
  id: string
}

// Highlight service interfaces
export interface HighlightService {
  createHighlight(request: CreateHighlightRequest): Promise<Highlight>
  updateHighlight(request: UpdateHighlightRequest): Promise<Highlight>
  deleteHighlight(request: DeleteHighlightRequest): Promise<void>
  getHighlight(id: string): Promise<Highlight | null>
  getHighlightsByBook(bookId: string): Promise<Highlight[]>
  getHighlightsBySection(sectionId: string): Promise<Highlight[]>
  searchHighlights(filter: HighlightFilter): Promise<HighlightSearchResult[]>
  getHighlightStats(): Promise<HighlightStats>
  exportHighlights(options: HighlightExport): Promise<string>
  importHighlights(options: HighlightImport): Promise<Highlight[]>
}

// Highlight type management
export interface HighlightTypeService {
  getHighlightTypes(): Promise<HighlightType[]>
  createHighlightType(type: Omit<HighlightType, 'id' | 'createdAt'>): Promise<HighlightType>
  updateHighlightType(id: string, updates: Partial<HighlightType>): Promise<HighlightType>
  deleteHighlightType(id: string): Promise<void>
  getDefaultHighlightTypes(): HighlightType[]
}

// Text selection utilities
export interface TextSelection {
  text: string
  startOffset: number
  endOffset: number
  startContainer: Node
  endContainer: Node
  range: Range
}

export interface SelectionContext {
  bookId: string
  sectionId: string
  element: Element
  position: {
    x: number
    y: number
  }
  viewport: {
    width: number
    height: number
  }
}

// Highlight rendering
export interface HighlightRenderer {
  renderHighlight(highlight: Highlight, element: Element): void
  removeHighlight(highlightId: string, element: Element): void
  clearHighlights(element: Element): void
  getHighlightAtPosition(x: number, y: number, element: Element): Highlight | null
  getHighlightsInRange(range: Range, element: Element): Highlight[]
}

// Highlight persistence
export interface HighlightStorage {
  saveHighlight(highlight: Highlight): Promise<void>
  loadHighlight(id: string): Promise<Highlight | null>
  loadHighlightsByBook(bookId: string): Promise<Highlight[]>
  loadHighlightsBySection(sectionId: string): Promise<Highlight[]>
  deleteHighlight(id: string): Promise<void>
  updateHighlight(highlight: Highlight): Promise<void>
  searchHighlights(query: string): Promise<Highlight[]>
}

// Default highlight types
export const DEFAULT_HIGHLIGHT_TYPES: HighlightType[] = [
  {
    id: 'important',
    name: 'Important',
    color: '#ffeb3b',
    icon: '⭐',
    description: 'Important information',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'question',
    name: 'Question',
    color: '#2196f3',
    icon: '❓',
    description: 'Something to research or ask about',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'insight',
    name: 'Insight',
    color: '#4caf50',
    icon: '💡',
    description: 'Key insights or realizations',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'confusion',
    name: 'Confusion',
    color: '#ff9800',
    icon: '🤔',
    description: 'Confusing or unclear content',
    isDefault: true,
    createdAt: new Date()
  },
  {
    id: 'action',
    name: 'Action Item',
    color: '#e91e63',
    icon: '📝',
    description: 'Action items or tasks',
    isDefault: true,
    createdAt: new Date()
  }
]

// Highlight colors
export const HIGHLIGHT_COLORS = [
  '#ffeb3b', // Yellow
  '#2196f3', // Blue
  '#4caf50', // Green
  '#ff9800', // Orange
  '#e91e63', // Pink
  '#9c27b0', // Purple
  '#f44336', // Red
  '#607d8b', // Blue Grey
  '#795548', // Brown
  '#009688'  // Teal
] as const

export type HighlightColor = typeof HIGHLIGHT_COLORS[number]
