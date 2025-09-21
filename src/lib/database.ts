import Database from 'better-sqlite3';
import path from 'path';

// Database interface for Mind Vault
export interface Ebook {
  id: string;
  title: string;
  author: string;
  filePath: string;
  fileType: 'epub' | 'mobi' | 'pdf';
  coverImage?: string;
  description?: string;
  addedAt: string;
  lastReadAt?: string;
  progress: number; // 0-100 percentage
}

export interface Highlight {
  id: string;
  ebookId: string;
  text: string;
  startPosition: number;
  endPosition: number;
  highlightType: 'important' | 'question' | 'insight' | 'custom';
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  ebookId: string;
  highlightId?: string;
  content: string;
  chapter?: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  ebookId: string;
  currentPosition: number;
  totalLength: number;
  lastReadAt: string;
}

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'mind-vault.db');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Create ebooks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ebooks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileType TEXT NOT NULL CHECK (fileType IN ('epub', 'mobi', 'pdf')),
        coverImage TEXT,
        description TEXT,
        addedAt TEXT NOT NULL,
        lastReadAt TEXT,
        progress REAL DEFAULT 0
      )
    `);

    // Create highlights table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS highlights (
        id TEXT PRIMARY KEY,
        ebookId TEXT NOT NULL,
        text TEXT NOT NULL,
        startPosition INTEGER NOT NULL,
        endPosition INTEGER NOT NULL,
        highlightType TEXT NOT NULL CHECK (highlightType IN ('important', 'question', 'insight', 'custom')),
        color TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (ebookId) REFERENCES ebooks (id) ON DELETE CASCADE
      )
    `);

    // Create notes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        ebookId TEXT NOT NULL,
        highlightId TEXT,
        content TEXT NOT NULL,
        chapter TEXT,
        topic TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (ebookId) REFERENCES ebooks (id) ON DELETE CASCADE,
        FOREIGN KEY (highlightId) REFERENCES highlights (id) ON DELETE CASCADE
      )
    `);

    // Create reading progress table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id TEXT PRIMARY KEY,
        ebookId TEXT NOT NULL,
        currentPosition INTEGER NOT NULL,
        totalLength INTEGER NOT NULL,
        lastReadAt TEXT NOT NULL,
        FOREIGN KEY (ebookId) REFERENCES ebooks (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_highlights_ebookId ON highlights(ebookId);
      CREATE INDEX IF NOT EXISTS idx_notes_ebookId ON notes(ebookId);
      CREATE INDEX IF NOT EXISTS idx_notes_highlightId ON notes(highlightId);
      CREATE INDEX IF NOT EXISTS idx_reading_progress_ebookId ON reading_progress(ebookId);
    `);
  }

  // Ebook operations
  addEbook(ebook: Omit<Ebook, 'id' | 'addedAt' | 'progress'>): string {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO ebooks (id, title, author, filePath, fileType, coverImage, description, addedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      ebook.title,
      ebook.author,
      ebook.filePath,
      ebook.fileType,
      ebook.coverImage || null,
      ebook.description || null,
      new Date().toISOString()
    );
    
    return id;
  }

  getEbooks(): Ebook[] {
    const stmt = this.db.prepare('SELECT * FROM ebooks ORDER BY addedAt DESC');
    return stmt.all() as Ebook[];
  }

  getEbookById(id: string): Ebook | null {
    const stmt = this.db.prepare('SELECT * FROM ebooks WHERE id = ?');
    return stmt.get(id) as Ebook | null;
  }

  updateEbookProgress(id: string, progress: number): void {
    const stmt = this.db.prepare('UPDATE ebooks SET progress = ?, lastReadAt = ? WHERE id = ?');
    stmt.run(progress, new Date().toISOString(), id);
  }

  // Highlight operations
  addHighlight(highlight: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO highlights (id, ebookId, text, startPosition, endPosition, highlightType, color, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      highlight.ebookId,
      highlight.text,
      highlight.startPosition,
      highlight.endPosition,
      highlight.highlightType,
      highlight.color,
      now,
      now
    );
    
    return id;
  }

  getHighlightsByEbook(ebookId: string): Highlight[] {
    const stmt = this.db.prepare('SELECT * FROM highlights WHERE ebookId = ? ORDER BY startPosition');
    return stmt.all(ebookId) as Highlight[];
  }

  updateHighlight(id: string, updates: Partial<Pick<Highlight, 'text' | 'highlightType' | 'color'>>): void {
    const stmt = this.db.prepare(`
      UPDATE highlights 
      SET text = COALESCE(?, text),
          highlightType = COALESCE(?, highlightType),
          color = COALESCE(?, color),
          updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updates.text || null,
      updates.highlightType || null,
      updates.color || null,
      new Date().toISOString(),
      id
    );
  }

  deleteHighlight(id: string): void {
    const stmt = this.db.prepare('DELETE FROM highlights WHERE id = ?');
    stmt.run(id);
  }

  // Note operations
  addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO notes (id, ebookId, highlightId, content, chapter, topic, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      note.ebookId,
      note.highlightId || null,
      note.content,
      note.chapter || null,
      note.topic || null,
      now,
      now
    );
    
    return id;
  }

  getNotesByEbook(ebookId: string): Note[] {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE ebookId = ? ORDER BY createdAt DESC');
    return stmt.all(ebookId) as Note[];
  }

  getNotesByHighlight(highlightId: string): Note[] {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE highlightId = ? ORDER BY createdAt DESC');
    return stmt.all(highlightId) as Note[];
  }

  updateNote(id: string, content: string): void {
    const stmt = this.db.prepare('UPDATE notes SET content = ?, updatedAt = ? WHERE id = ?');
    stmt.run(content, new Date().toISOString(), id);
  }

  deleteNote(id: string): void {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(id);
  }

  // Reading progress operations
  updateReadingProgress(ebookId: string, currentPosition: number, totalLength: number): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO reading_progress (id, ebookId, currentPosition, totalLength, lastReadAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      crypto.randomUUID(),
      ebookId,
      currentPosition,
      totalLength,
      new Date().toISOString()
    );
  }

  getReadingProgress(ebookId: string): ReadingProgress | null {
    const stmt = this.db.prepare('SELECT * FROM reading_progress WHERE ebookId = ?');
    return stmt.get(ebookId) as ReadingProgress | null;
  }

  // Search functionality
  searchHighlights(query: string): Highlight[] {
    const stmt = this.db.prepare(`
      SELECT * FROM highlights 
      WHERE text LIKE ? 
      ORDER BY startPosition
    `);
    return stmt.all(`%${query}%`) as Highlight[];
  }

  searchNotes(query: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes 
      WHERE content LIKE ? 
      ORDER BY createdAt DESC
    `);
    return stmt.all(`%${query}%`) as Note[];
  }

  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const db = new DatabaseManager();
