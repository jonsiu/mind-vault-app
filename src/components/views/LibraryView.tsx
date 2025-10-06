'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  progress: number;
  lastReadAt?: string;
  format: 'epub' | 'mobi' | 'pdf';
}

export function LibraryView() {
  const [books, setBooks] = useState<Book[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'lastRead' | 'progress'>('title');

  const handleUploadBook = () => {
    // TODO: Implement book upload functionality
    console.log('Upload book clicked');
  };

  const handleBookClick = (book: Book) => {
    // TODO: Navigate to reading view
    console.log('Open book:', book.title);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Library</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Your personal ebook collection
            </p>
          </div>
          <Button onClick={handleUploadBook} className="bg-blue-600 hover:bg-blue-700">
            <span className="mr-2">📚</span>
            Add Book
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="lastRead">Last Read</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Books Grid/List */}
        {books.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No books yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Upload your first ebook to get started with your personal library.
            </p>
            <Button onClick={handleUploadBook} className="bg-blue-600 hover:bg-blue-700">
              <span className="mr-2">📚</span>
              Add Your First Book
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                {viewMode === 'grid' ? (
                  <div className="p-4">
                    <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-4xl">📖</span>
                      )}
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-1">
                      {book.author}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{book.format.toUpperCase()}</span>
                      <span>{book.progress}%</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-4">
                    <div className="w-16 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">📖</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        {book.author}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{book.format.toUpperCase()}</span>
                        <span>{book.progress}% complete</span>
                      </div>
                      <div className="mt-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
