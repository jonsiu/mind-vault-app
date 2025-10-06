'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { InlineNoteEditor } from '@/components/notes/InlineNoteEditor';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'highlight' | 'knowledge';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  linkedNotes: string[];
}

export function KnowledgeHubView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'highlight' | 'knowledge'>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      type: 'knowledge',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedNotes: []
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditingNote(newNote);
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (!editingNote) return;
    
    const now = new Date().toISOString();
    const updatedNote: Note = {
      ...editingNote,
      ...noteData,
      updatedAt: now
    };
    
    setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
    setSelectedNote(updatedNote);
    setEditingNote(updatedNote);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote(null);
    // If it was a new note with no content, remove it
    if (selectedNote && !selectedNote.title && !selectedNote.content) {
      setNotes(notes.filter(note => note.id !== selectedNote.id));
      setSelectedNote(null);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || note.type === filterType;
    const matchesTags = filterTags.length === 0 || filterTags.some(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesType && matchesTags;
  });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  return (
    <div className="flex h-full">
      {/* Sidebar - Notes List */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notes</h2>
            <Button onClick={handleCreateNote} size="sm" className="bg-green-600 hover:bg-green-700">
              <span className="mr-1">+</span>
              New Note
            </Button>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Types</option>
                <option value="highlight">Highlights</option>
                <option value="knowledge">Knowledge Notes</option>
              </select>
            </div>

            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (filterTags.includes(tag)) {
                          setFilterTags(filterTags.filter(t => t !== tag));
                        } else {
                          setFilterTags([...filterTags, tag]);
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-full ${
                        filterTags.includes(tag)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                {searchQuery ? 'No notes match your search' : 'No notes yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote?.id === note.id
                      ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => handleNoteClick(note)}
                    >
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm line-clamp-2">
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        note.type === 'highlight'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {note.type}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <InlineNoteEditor
            note={editingNote || selectedNote}
            onSave={handleSaveNote}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Select a note to view
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Choose a note from the sidebar to view its content, or create a new note to get started.
              </p>
              <Button onClick={handleCreateNote} className="bg-green-600 hover:bg-green-700">
                <span className="mr-2">+</span>
                Create New Note
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
