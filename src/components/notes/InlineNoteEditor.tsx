'use client';

import { useState, useEffect } from 'react';
import CleanMarkdownEditor from '@/components/editor/CleanMarkdownEditor';
import { Button } from '@/components/ui/Button';

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

interface InlineNoteEditorProps {
  note: Note;
  onSave: (noteData: Partial<Note>) => void;
}

export function InlineNoteEditor({ note, onSave }: InlineNoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [type, setType] = useState(note.type);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [tagInput, setTagInput] = useState('');

  // Auto-save when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content || type !== note.type || JSON.stringify(tags) !== JSON.stringify(note.tags)) {
        onSave({ title, content, type, tags });
      }
    }, 500); // Auto-save after 500ms of inactivity

    return () => clearTimeout(timeoutId);
  }, [title, content, type, tags, note.title, note.content, note.type, note.tags, onSave]);

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      setTags(newTags);
      setTagInput('');
      onSave({ tags: newTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onSave({ tags: newTags });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };


  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full text-xl font-semibold bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'highlight' | 'knowledge')}
              className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="knowledge">Knowledge Note</option>
              <option value="highlight">Highlight Note</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center space-x-2">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tag..."
              className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-l-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              onClick={handleAddTag}
              size="sm"
              className="rounded-l-none"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CleanMarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Start writing your note... Use [[note title]] to link to other notes."
          height={600}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <span>✓ Auto-saves as you type</span>
          </div>
          <div>
            {content.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}
