import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../..', 'timetracker.db');
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
