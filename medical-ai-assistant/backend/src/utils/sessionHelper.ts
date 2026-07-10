import { db } from "../db/dbSetup.ts";
import type { GraphStateAnnotation } from "../graph/state.ts";

// interface SessionData {
//   state: typeof GraphStateAnnotation.State;
//   createdAt: Date;
// }

// const sessions = new Map<string, SessionData>();

export function saveSession(sessionId: string, state: any) {
  console.log(`Saving session ${sessionId}`);
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO sessions 
    (id, patientInput, symptoms, requiresFollowup, followupQuestions, followupAnswers, urgency, confidence, summary, symptomRetryCount, maxSymptomRetries, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date();

  const formattedDate = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  stmt.run(
    sessionId,
    state.patientInput,
    JSON.stringify(state.symptoms),
    state.requiresFollowup ? 1 : 0,
    JSON.stringify(state.followupQuestions),
    JSON.stringify(state.followupAnswers),
    state.urgency,
    state.confidence,
    state.summary,
    state.symptomRetryCount,
    state.maxSymptomRetries,
    formattedDate,
  );
  // sessions.set(sessionId, { state, createdAt: new Date() });
}

export function getSession(sessionId: string) {
  console.log(`Retrieving session ${sessionId}`);
  const stmt = db.prepare(`SELECT * FROM sessions WHERE id = ?`);
  const row = stmt.get(sessionId) as any;

  if (!row) return null;

  return {
    sessionId: row.id,
    patientInput: row.patientInput,
    symptoms: JSON.parse(row.symptoms),
    requiresFollowup: row.requiresFollowup === 1,
    followupQuestions: JSON.parse(row.followupQuestions || "[]"),
    followupAnswers: JSON.parse(row.followupAnswers || "[]"),
    urgency: row.urgency,
    confidence: row.confidence,
    summary: row.summary,
    symptomRetryCount: row.symptomRetryCount ?? 0,
    maxSymptomRetries: row.maxSymptomRetries ?? 1,
  };
  // return sessions.get(sessionId)?.state;
}

export function clearSession(sessionId: string) {
  const stmt = db.prepare(`DELETE FROM sessions WHERE id = ?`);
  stmt.run(sessionId);
  // sessions.delete(sessionId);
}

export function cleanupOldSessions(hoursOld: number = 24) {
  const stmt = db.prepare(`
    DELETE FROM sessions 
    WHERE datetime(createdAt) < datetime('now', '-' || ? || ' hours')
  `);
  stmt.run(hoursOld);
}

setInterval(() => cleanupOldSessions(24), 3600000);
