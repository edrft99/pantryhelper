import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Determine database path based on environment
// Use /data/ for Home Assistant addon, otherwise use local path
let dbPath;
const dataDir = '/data';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && existsSync(dataDir)) {
  // Production mode (Home Assistant addon)
  dbPath = join(dataDir, 'pantryhelper.db');
  console.log(`Using production database path: ${dbPath}`);
} else {
  // Development mode
  dbPath = join(__dirname, 'pantryhelper.db');
  console.log(`Using development database path: ${dbPath}`);
}

const db = new Database(dbPath);

export function initDb() {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pantry_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      category    TEXT,
      quantity    REAL DEFAULT 1,
      unit        TEXT DEFAULT 'item',
      added_at    TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(name COLLATE NOCASE)
    );

    CREATE TABLE IF NOT EXISTS favorite_recipes (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT NOT NULL,
      description  TEXT,
      cook_time    TEXT,
      servings     INTEGER,
      difficulty   TEXT,
      ingredients  TEXT NOT NULL,
      instructions TEXT NOT NULL,
      saved_at     TEXT DEFAULT (datetime('now'))
    );
  `);

  // Add new columns for TheMealDB integration (safe to run multiple times)
  const addColumnIfNotExists = (table, column, definition) => {
    try {
      const columns = db.pragma(`table_info(${table})`);
      const exists = columns.some(col => col.name === column);
      if (!exists) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`Added column ${column} to ${table}`);
      }
    } catch (error) {
      console.error(`Error adding column ${column}:`, error.message);
    }
  };

  // Enhance favorite_recipes table with new metadata fields
  addColumnIfNotExists('favorite_recipes', 'source', "TEXT DEFAULT 'ai'");
  addColumnIfNotExists('favorite_recipes', 'external_id', 'TEXT');
  addColumnIfNotExists('favorite_recipes', 'image_url', 'TEXT');
  addColumnIfNotExists('favorite_recipes', 'category', 'TEXT');
  addColumnIfNotExists('favorite_recipes', 'cuisine', 'TEXT');
  addColumnIfNotExists('favorite_recipes', 'source_url', 'TEXT');
  addColumnIfNotExists('favorite_recipes', 'youtube_url', 'TEXT');

  console.log('Database initialized');
}

export default db;
