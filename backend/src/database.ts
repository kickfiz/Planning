import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current file
// Go up one level from backend folder to project root
const dbPath = path.resolve(process.cwd(), '..', 'timetracker.db');
console.log('Database path:', dbPath);
console.log('CWD:', process.cwd());
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initializeDatabase() {
  // Create Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Categories (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Color TEXT NOT NULL DEFAULT '#10b981',
      IsArchived INTEGER NOT NULL DEFAULT 0,
      CreatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create TimeEntries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS TimeEntries (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Date TEXT NOT NULL,
      Hours REAL NOT NULL,
      Description TEXT NOT NULL,
      CategoryId INTEGER,
      FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
    )
  `);

  console.log('Database initialized successfully');
}

export default db;
