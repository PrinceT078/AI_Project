import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "medical_sessions.db");
export const db: any = new Database(dbPath);

db.pragma("foreign_keys = ON");

export function initializeDb() {
  db.exec(`
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
      symptomRetryCount INTEGER DEFAULT 0,
      maxSymptomRetries INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
