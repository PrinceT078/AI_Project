import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "medical_sessions.db");
export const dbSetup: any = new Database(dbPath);

// Enable foreign keys
dbSetup.pragma("foreign_keys = ON");

// Create tables
export function initializeDb() {
  dbSetup.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      patientInput TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      requiresFollowup BOOLEAN NOT NULL,
      followupQuestions TEXT,
      followupAnswers TEXT,
      urgency TEXT,
      confidence INTEGER,
      summary TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}