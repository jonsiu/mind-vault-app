'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface CleanMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function CleanMarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  height = 400
}: CleanMarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  // Enhanced markdown renderer
  const renderMarkdown = (text: string) => {
    let html = text;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^(\*|\-|\+)\s+(.*$)/gim, '<li>$2</li>');
    html = html.replace(/^(\d+\.)\s+(.*$)/gim, '<li>$2</li>');
    
    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li>.*<\/li>)/gim, (match, p1, offset, string) => {
      const before = string.substring(0, offset);
      const after = string.substring(offset + match.length);
      const isNumbered = /^\d+\./.test(match);
      
      // Check if this is the start of a list
      if (!before.match(/<li>.*<\/li>$/m)) {
        const tag = isNumbered ? 'ol' : 'ul';
        return `<${tag}>${match}`;
      }
      return match;
    });
    
    // Close list tags
    html = html.replace(/(<li>.*<\/li>)(?!<li>)/gim, '$1</ul>');
    html = html.replace(/(<li>.*<\/li>)(?!<li>)/gim, '$1</ol>');
    
    // Blockquotes
    html = html.replace(/^>\s*(.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    html = html.replace(/^\*\*\*$/gim, '<hr>');
    
    // Line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    if (html && !html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden" style={{ height: `${height}px` }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsPreview(false)}
            variant={!isPreview ? 'default' : 'outline'}
            size="sm"
          >
            ✏️ Edit
          </Button>
          <Button
            onClick={() => setIsPreview(true)}
            variant={isPreview ? 'default' : 'outline'}
            size="sm"
          >
            👁️ Preview
          </Button>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {value.length} characters
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative" style={{ height: `${height - 60}px` }}>
        {!isPreview ? (
          // Edit Mode - Simple Textarea
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 border-0 outline-none resize-none font-mono text-sm leading-relaxed bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            }}
          />
        ) : (
          // Preview Mode - Rendered HTML
          <div
            className="w-full h-full p-4 overflow-auto prose prose-sm max-w-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        )}
      </div>
    </div>
  );
}
