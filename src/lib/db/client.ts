import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Define the database path in the project root
const dbPath = path.resolve(process.cwd(), 'review_shield.db');

// Initialize the SQLite database connection
const sqlite = new Database(dbPath);

// Enable WAL mode for performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Export the Drizzle db instance
export const db = drizzle(sqlite, { schema });

// Auto-initialize tables
export function initDb() {
  // Create User table
  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL,
      image TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `).run();

  // Create Session table
  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expiresAt INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      userId TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )
  `).run();

  // Create Account table
  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      idToken TEXT,
      expiresAt INTEGER,
      password TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )
  `).run();

  // Create Verification table
  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      createdAt INTEGER,
      updatedAt INTEGER
    )
  `).run();

  // Create Dataset table
  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS dataset (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      rowCount INTEGER NOT NULL,
      suspiciousCount INTEGER NOT NULL,
      averageScore REAL NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )
  `).run();

  // Create Analysis table
  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS analysis (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      datasetId TEXT,
      reviewContent TEXT NOT NULL,
      productCategory TEXT,
      starRating INTEGER,
      reviewerName TEXT,
      reviewDate TEXT,
      productUrl TEXT,
      classification TEXT NOT NULL,
      authenticityScore REAL NOT NULL,
      confidence REAL NOT NULL,
      summary TEXT NOT NULL,
      signals TEXT NOT NULL,
      highlightedPhrases TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      isDemo INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (datasetId) REFERENCES dataset(id) ON DELETE CASCADE
    )
  `).run();

  // Create Feedback table
  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      analysisId TEXT NOT NULL,
      userId TEXT NOT NULL,
      label TEXT NOT NULL,
      notes TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (analysisId) REFERENCES analysis(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )
  `).run();
}

// Call initialization immediately
initDb();
