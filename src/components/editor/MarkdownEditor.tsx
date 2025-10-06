'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import './editor.css';

// Import markdown editor CSS
import '@uiw/react-md-editor/markdown-editor.css';

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

  // Force synchronization between textarea and pre element
  useEffect(() => {
    const syncText = () => {
      const textarea = document.querySelector('.w-md-editor-text-input');
      const pre = document.querySelector('.w-md-editor-text-pre');
      if (textarea && pre) {
        // Force the pre element to show the textarea content
        pre.textContent = textarea.value;
        // Force visibility with inline styles
        pre.style.color = '#1e293b !important';
        pre.style.backgroundColor = 'white !important';
        pre.style.opacity = '1 !important';
        pre.style.visibility = 'visible !important';
        pre.style.display = 'block !important';
        pre.style.position = 'relative !important';
        pre.style.zIndex = '1 !important';
      }
    };

    // Sync immediately
    syncText();

    // Set up interval to sync more frequently
    const interval = setInterval(syncText, 50);

    return () => clearInterval(interval);
  }, [value]);

  // Additional synchronization on input events
  useEffect(() => {
    const handleInput = (e) => {
      const textarea = document.querySelector('.w-md-editor-text-input');
      const pre = document.querySelector('.w-md-editor-text-pre');
      if (textarea && pre) {
        // Force synchronization
        pre.textContent = textarea.value;
        // Force visibility with inline styles
        pre.style.color = '#1e293b !important';
        pre.style.backgroundColor = 'white !important';
        pre.style.opacity = '1 !important';
        pre.style.visibility = 'visible !important';
        pre.style.display = 'block !important';
        pre.style.position = 'relative !important';
        pre.style.zIndex = '1 !important';
        
        // Also trigger the onChange to update the component state
        if (onChange) {
          onChange(textarea.value);
        }
      }
    };

    // Wait for the editor to be fully rendered
    const timeout = setTimeout(() => {
      const textarea = document.querySelector('.w-md-editor-text-input');
      if (textarea) {
        textarea.addEventListener('input', handleInput);
        textarea.addEventListener('keyup', handleInput);
        textarea.addEventListener('keydown', handleInput);
        textarea.addEventListener('change', handleInput);
        textarea.addEventListener('paste', handleInput);
        textarea.addEventListener('cut', handleInput);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      const textarea = document.querySelector('.w-md-editor-text-input');
      if (textarea) {
        textarea.removeEventListener('input', handleInput);
        textarea.removeEventListener('keyup', handleInput);
        textarea.removeEventListener('keydown', handleInput);
        textarea.removeEventListener('change', handleInput);
        textarea.removeEventListener('paste', handleInput);
        textarea.removeEventListener('cut', handleInput);
      }
    };
  }, [onChange]);

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
              color: '#1e293b',
              backgroundColor: 'white',
              opacity: 1,
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
