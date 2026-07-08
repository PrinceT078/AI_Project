import type { GraphStateAnnotation } from "../graph/state.ts";

interface SessionData {
  state: typeof GraphStateAnnotation.State;
  createdAt: Date;
}

const sessions = new Map<string, SessionData>();

export function saveSession(sessionId: string, state: any) {
  sessions.set(sessionId, { state, createdAt: new Date() });
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId)?.state;
}

export function clearSession(sessionId: string) {
  sessions.delete(sessionId);
}