/**
 * Note Editor Component
 * React component for creating and editing notes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Note, NoteType, NoteTemplate, CreateNoteRequest, UpdateNoteRequest } from './types'

interface NoteEditorProps {
  note?: Note
  noteTypes: NoteType[]
  templates: NoteTemplate[]
  onSave: (request: CreateNoteRequest | UpdateNoteRequest) => Promise<void>
  onCancel: () => void
  onDelete?: (id: string) => Promise<void>
  isFullscreen?: boolean
  showPreview?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
}

interface EditorState {
  title: string
  content: string
  type: string
  tags: string[]
  isPrivate: boolean
  isPinned: boolean
  isDirty: boolean
  isSaving: boolean
  lastSaved?: Date
}

export function NoteEditor({
  note,
  noteTypes,
  templates,
  onSave,
  onCancel,
  onDelete,
  isFullscreen = false,
  showPreview = false,
  autoSave = true,
  autoSaveInterval = 30000
}: NoteEditorProps) {
  const [state, setState] = useState<EditorState>({
    title: note?.title || '',
    content: note?.content || '',
    type: note?.type || noteTypes[0]?.id || '',
    tags: note?.tags || [],
    isPrivate: note?.isPrivate || false,
    isPinned: note?.isPinned || false,
    isDirty: false,
    isSaving: false
  })

  const [newTag, setNewTag] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)

  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save effect
  useEffect(() => {
    if (autoSave && state.isDirty && !state.isSaving) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }

      autoSaveRef.current = setTimeout(() => {
        handleSave()
      }, autoSaveInterval)
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [state.isDirty, autoSave, autoSaveInterval])

  // Focus effect
  useEffect(() => {
    if (!note && titleRef.current) {
      titleRef.current.focus()
    } else if (note && contentRef.current) {
      contentRef.current.focus()
    }
  }, [note])

  // Handle title change
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      title: e.target.value,
      isDirty: true
    }))
  }, [])

  // Handle content change
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({
      ...prev,
      content: e.target.value,
      isDirty: true
    }))
    setCursorPosition(e.target.selectionStart)
  }, [])

  // Handle type change
  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    setState(prev => ({
      ...prev,
      type: newType,
      isDirty: true
    }))

    // Apply template if available
    const template = templates.find(t => t.type === newType)
    if (template && !state.content) {
      setState(prev => ({
        ...prev,
        content: template.content
      }))
    }
  }, [templates, state.content])

  // Handle tag addition
  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !state.tags.includes(newTag.trim())) {
      setState(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
        isDirty: true
      }))
      setNewTag('')
    }
  }, [newTag, state.tags])

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
      isDirty: true
    }))
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: NoteTemplate) => {
    setState(prev => ({
      ...prev,
      content: template.content,
      isDirty: true
    }))
    setShowTemplates(false)
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!state.title.trim() || !state.content.trim()) {
      return
    }

    setState(prev => ({ ...prev, isSaving: true }))

    try {
      if (note) {
        // Update existing note
        await onSave({
          id: note.id,
          title: state.title,
          content: state.content,
          type: state.type,
          tags: state.tags,
          isPrivate: state.isPrivate,
          isPinned: state.isPinned
        })
      } else {
        // Create new note
        await onSave({
          bookId: note?.bookId || '',
          sectionId: note?.sectionId || '',
          highlightId: note?.highlightId,
          title: state.title,
          content: state.content,
          type: state.type,
          tags: state.tags,
          isPrivate: state.isPrivate,
          isPinned: state.isPinned
        })
      }

      setState(prev => ({
        ...prev,
        isDirty: false,
        isSaving: false,
        lastSaved: new Date()
      }))
    } catch (error) {
      console.error('Failed to save note:', error)
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }, [state, note, onSave])

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (note && onDelete) {
      if (window.confirm('Are you sure you want to delete this note?')) {
        await onDelete(note.id)
      }
    }
  }, [note, onDelete])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          handleSave()
          break
        case 'Enter':
          e.preventDefault()
          handleSave()
          break
        case 'Escape':
          e.preventDefault()
          onCancel()
          break
      }
    }
  }, [handleSave, onCancel])

  // Get selected note type
  const selectedType = noteTypes.find(t => t.id === state.type)

  return (
    <div className={`note-editor ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="note-editor-header">
        <div className="note-editor-title">
          <input
            ref={titleRef}
            type="text"
            placeholder="Note title..."
            value={state.title}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            className="note-title-input"
          />
        </div>
        <div className="note-editor-actions">
          {state.isDirty && (
            <span className="unsaved-indicator">Unsaved changes</span>
          )}
          {state.isSaving && (
            <span className="saving-indicator">Saving...</span>
          )}
          {state.lastSaved && (
            <span className="last-saved">
              Last saved: {state.lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!state.title.trim() || !state.content.trim() || state.isSaving}
            className="save-button"
          >
            Save
          </button>
          {note && onDelete && (
            <button
              onClick={handleDelete}
              className="delete-button"
            >
              Delete
            </button>
          )}
          <button
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="note-editor-toolbar">
        <div className="note-type-selector">
          <label htmlFor="note-type">Type:</label>
          <select
            id="note-type"
            value={state.type}
            onChange={handleTypeChange}
            className="note-type-select"
          >
            {noteTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="template-selector">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="template-button"
          >
            Templates
          </button>
          {showTemplates && (
            <div className="template-dropdown">
              {templates
                .filter(t => t.type === state.type)
                .map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="template-option"
                  >
                    {template.name}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="note-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.isPrivate}
              onChange={(e) => setState(prev => ({
                ...prev,
                isPrivate: e.target.checked,
                isDirty: true
              }))}
            />
            Private
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.isPinned}
              onChange={(e) => setState(prev => ({
                ...prev,
                isPinned: e.target.checked,
                isDirty: true
              }))}
            />
            Pinned
          </label>
        </div>
      </div>

      {/* Tags */}
      <div className="note-tags">
        <div className="tags-list">
          {state.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="tag-remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            className="tag-input-field"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="tag-add-button"
          >
            Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="note-content">
        {showPreview ? (
          <div className="note-preview">
            <h2>{state.title}</h2>
            <div className="preview-content">
              {state.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        ) : (
          <textarea
            ref={contentRef}
            placeholder="Start writing your note..."
            value={state.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement
              setSelection({
                start: target.selectionStart,
                end: target.selectionEnd
              })
            }}
            className="note-content-textarea"
          />
        )}
      </div>

      {/* Footer */}
      <div className="note-editor-footer">
        <div className="note-metadata">
          {selectedType && (
            <span className="note-type-info">
              {selectedType.icon} {selectedType.name}
            </span>
          )}
          <span className="note-stats">
            {state.content.length} characters, {state.content.split(/\s+/).length} words
          </span>
        </div>
        <div className="note-shortcuts">
          <span>Ctrl+S to save, Ctrl+Enter to save and close, Esc to cancel</span>
        </div>
      </div>
    </div>
  )
}

export default NoteEditor
