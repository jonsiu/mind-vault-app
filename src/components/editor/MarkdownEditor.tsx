'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import './editor.css';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  onSave?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing your note...',
  height = 400,
  onSave,
  onCancel,
  isEditing = false,
  className = ''
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
    // Cancel on Escape
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  return (
    <div className={`markdown-editor ${className}`} onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              isPreview
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {isPreview ? '✏️ Edit' : '👁️ Preview'}
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {value.length} characters
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              onClick={onSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="markdown-editor-content">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          height={height}
          data-color-mode="light"
          hideToolbar={isPreview}
          preview={isPreview ? 'preview' : 'edit'}
          textareaProps={{
            placeholder,
            style: {
              fontSize: '14px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            },
          }}
          commands={[
            // Bold, italic, strikethrough
            ['bold', 'italic', 'strikethrough'],
            // Headers
            ['title1', 'title2', 'title3', 'title4', 'title5', 'title6'],
            // Lists
            ['unorderedListCommand', 'orderedListCommand', 'checkedListCommand'],
            // Code
            ['code', 'codeBlock'],
            // Links and images
            ['link', 'image'],
            // Quote and divider
            ['quote', 'divider'],
            // Table
            ['table'],
            // Full screen
            ['fullScreen'],
          ]}
        />
      </div>

      {/* Footer with shortcuts */}
      <div className="p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Ctrl+S to save</span>
            <span>Esc to cancel</span>
          </div>
          <div>
            {isEditing ? 'Editing' : 'Creating'} note
          </div>
        </div>
      </div>
    </div>
  );
}
