/**
 * Note-Taking System Types
 * Core types for note creation, organization, and management
 */

export interface Note {
  id: string
  bookId: string
  sectionId: string
  highlightId?: string
  title: string
  content: string
  type: NoteType
  tags: string[]
  isPrivate: boolean
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
  userId?: string
  position?: NotePosition
  attachments?: NoteAttachment[]
  linkedNotes?: string[] // IDs of linked notes
}

export interface NoteType {
  id: string
  name: string
  icon?: string
  color?: string
  description?: string
  isDefault: boolean
  template?: string
  createdAt: Date
}

export interface NotePosition {
  cfi?: string
  pageNumber?: number
  sectionIndex?: number
  coordinates?: {
    x: number
    y: number
  }
}

export interface NoteAttachment {
  id: string
  type: 'image' | 'file' | 'link'
  name: string
  url: string
  size?: number
  mimeType?: string
  thumbnail?: string
  createdAt: Date
}

export interface NoteTemplate {
  id: string
  name: string
  description: string
  content: string
  type: string
  isDefault: boolean
  variables?: string[]
  createdAt: Date
}

export interface NoteSearchResult {
  note: Note
  relevanceScore: number
  matchedFields: string[]
  context?: {
    bookTitle?: string
    sectionTitle?: string
    highlightText?: string
  }
}

export interface NoteFilter {
  types?: string[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  bookIds?: string[]
  sectionIds?: string[]
  highlightIds?: string[]
  isPrivate?: boolean
  isPinned?: boolean
  hasAttachments?: boolean
  hasLinkedNotes?: boolean
  searchText?: string
}

export interface NoteStats {
  totalNotes: number
  notesByType: Record<string, number>
  notesByBook: Record<string, number>
  notesByTag: Record<string, number>
  recentNotes: Note[]
  mostUsedTypes: NoteType[]
  mostUsedTags: Array<{ tag: string; count: number }>
  averageNoteLength: number
  totalAttachments: number
}

export interface NoteExport {
  format: 'json' | 'csv' | 'markdown' | 'html' | 'pdf'
  includeAttachments: boolean
  includeContext: boolean
  groupBy: 'book' | 'type' | 'date' | 'tag' | 'none'
  dateRange?: {
    start: Date
    end: Date
  }
  template?: string
}

export interface NoteImport {
  format: 'json' | 'csv' | 'markdown'
  data: string
  mergeStrategy: 'replace' | 'merge' | 'skip'
  importAttachments: boolean
}

// Note creation/update interfaces
export interface CreateNoteRequest {
  bookId: string
  sectionId: string
  highlightId?: string
  title: string
  content: string
  type: string
  tags?: string[]
  isPrivate?: boolean
  isPinned?: boolean
  position?: NotePosition
  attachments?: Omit<NoteAttachment, 'id' | 'createdAt'>[]
}

export interface UpdateNoteRequest {
  id: string
  title?: string
  content?: string
  type?: string
  tags?: string[]
  isPrivate?: boolean
  isPinned?: boolean
  position?: NotePosition
}

export interface DeleteNoteRequest {
  id: string
}

// Note service interfaces
export interface NoteService {
  createNote(request: CreateNoteRequest): Promise<Note>
  updateNote(request: UpdateNoteRequest): Promise<Note>
  deleteNote(request: DeleteNoteRequest): Promise<void>
  getNote(id: string): Promise<Note | null>
  getNotesByBook(bookId: string): Promise<Note[]>
  getNotesBySection(sectionId: string): Promise<Note[]>
  getNotesByHighlight(highlightId: string): Promise<Note[]>
  searchNotes(filter: NoteFilter): Promise<NoteSearchResult[]>
  getNoteStats(): Promise<NoteStats>
  exportNotes(options: NoteExport): Promise<string>
  importNotes(options: NoteImport): Promise<Note[]>
  linkNotes(noteId1: string, noteId2: string): Promise<void>
  unlinkNotes(noteId1: string, noteId2: string): Promise<void>
}

// Note type management
export interface NoteTypeService {
  getNoteTypes(): Promise<NoteType[]>
  createNoteType(type: Omit<NoteType, 'id' | 'createdAt'>): Promise<NoteType>
  updateNoteType(id: string, updates: Partial<NoteType>): Promise<NoteType>
  deleteNoteType(id: string): Promise<void>
  getDefaultNoteTypes(): NoteType[]
  getNoteTypeTemplates(): NoteTemplate[]
}

// Note organization
export interface NoteOrganization {
  id: string
  name: string
  description?: string
  type: 'folder' | 'tag' | 'smart'
  parentId?: string
  children: string[]
  rules?: OrganizationRule[]
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationRule {
  field: 'type' | 'tag' | 'book' | 'date' | 'content'
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches'
  value: string
}

// Note editor interfaces
export interface NoteEditor {
  note: Note
  isEditing: boolean
  isDirty: boolean
  cursorPosition: number
  selection?: {
    start: number
    end: number
  }
}

export interface NoteEditorState {
  currentNote?: Note
  editor: NoteEditor
  isFullscreen: boolean
  showPreview: boolean
  showOutline: boolean
  showAttachments: boolean
}

// Note collaboration
export interface NoteCollaboration {
  noteId: string
  collaborators: NoteCollaborator[]
  permissions: CollaborationPermissions
  lastModified: Date
  version: number
}

export interface NoteCollaborator {
  userId: string
  name: string
  email: string
  role: 'viewer' | 'editor' | 'admin'
  joinedAt: Date
  lastActive: Date
}

export interface CollaborationPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
  canManageCollaborators: boolean
}

// Default note types
export const DEFAULT_NOTE_TYPES: NoteType[] = [
  {
    id: 'summary',
    name: 'Summary',
    icon: '📝',
    color: '#2196f3',
    description: 'Summarize key points and concepts',
    isDefault: true,
    template: '## Summary\n\n**Key Points:**\n- \n- \n- \n\n**Main Ideas:**\n\n\n**Questions:**\n- \n- ',
    createdAt: new Date()
  },
  {
    id: 'reflection',
    name: 'Reflection',
    icon: '🤔',
    color: '#4caf50',
    description: 'Personal thoughts and reflections',
    isDefault: true,
    template: '## Reflection\n\n**What I learned:**\n\n\n**How this connects to:**\n\n\n**Questions for further exploration:**\n- \n- ',
    createdAt: new Date()
  },
  {
    id: 'question',
    name: 'Question',
    icon: '❓',
    color: '#ff9800',
    description: 'Questions and areas for research',
    isDefault: true,
    template: '## Question\n\n**Question:**\n\n\n**Context:**\n\n\n**Research needed:**\n- \n- ',
    createdAt: new Date()
  },
  {
    id: 'connection',
    name: 'Connection',
    icon: '🔗',
    color: '#9c27b0',
    description: 'Connections to other ideas or concepts',
    isDefault: true,
    template: '## Connection\n\n**Related to:**\n\n\n**How they connect:**\n\n\n**Implications:**\n\n',
    createdAt: new Date()
  },
  {
    id: 'action',
    name: 'Action Item',
    icon: '✅',
    color: '#e91e63',
    description: 'Action items and tasks',
    isDefault: true,
    template: '## Action Item\n\n**Task:**\n\n\n**Priority:** High/Medium/Low\n\n**Deadline:**\n\n**Next Steps:**\n- \n- ',
    createdAt: new Date()
  }
]

// Default note templates
export const DEFAULT_NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'book-summary',
    name: 'Book Summary',
    description: 'Comprehensive book summary template',
    content: `# {{bookTitle}} - Summary

## Overview
**Author:** {{author}}
**Main Topic:** 
**Key Themes:** 

## Chapter Summaries
{{#each chapters}}
### {{title}}
- **Main Points:**
- **Key Insights:**
- **Questions:**

{{/each}}

## Overall Assessment
**Rating:** /5
**Key Takeaways:**
1. 
2. 
3. 

**Would Recommend:** Yes/No
**Why:**`,
    type: 'summary',
    isDefault: true,
    variables: ['bookTitle', 'author', 'chapters'],
    createdAt: new Date()
  },
  {
    id: 'learning-log',
    name: 'Learning Log',
    description: 'Daily learning reflection template',
    content: `# Learning Log - {{date}}

## What I Learned Today
- 
- 
- 

## How I Applied It
- 
- 

## Questions for Tomorrow
- 
- 

## Connections Made
- 
- 

## Next Steps
- [ ] 
- [ ] 
- [ ]`,
    type: 'reflection',
    isDefault: true,
    variables: ['date'],
    createdAt: new Date()
  }
]

// Note colors
export const NOTE_COLORS = [
  '#2196f3', // Blue
  '#4caf50', // Green
  '#ff9800', // Orange
  '#e91e63', // Pink
  '#9c27b0', // Purple
  '#f44336', // Red
  '#607d8b', // Blue Grey
  '#795548', // Brown
  '#009688', // Teal
  '#ffeb3b'  // Yellow
] as const

export type NoteColor = typeof NOTE_COLORS[number]
