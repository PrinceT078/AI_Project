import { db } from "./dbSetup.ts";
import type { GraphStateAnnotation } from "../graph/state.ts";

interface Checkpoint {
  sessionId: string;
  nodeId: string;
  state: typeof GraphStateAnnotation.State;
  timestamp: string;
}

export class SqliteCheckpointer {
  constructor() {
    this.initializeTable();
  }

  private initializeTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS checkpoints (
        sessionId TEXT NOT NULL,
        nodeId TEXT NOT NULL,
        state TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (sessionId, nodeId)
      );
    `);
  }

  saveCheckpoint(sessionId: string, nodeId: string, state: typeof GraphStateAnnotation.State) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO checkpoints (sessionId, nodeId, state, timestamp)
      VALUES (?, ?, ?, datetime('now'))
    `);
    
    stmt.run(sessionId, nodeId, JSON.stringify(state));
    console.log(`✓ Checkpoint saved: ${nodeId}`);
  }

  getCheckpoint(sessionId: string, nodeId: string): typeof GraphStateAnnotation.State | null {
    const stmt = db.prepare(`
      SELECT state FROM checkpoints 
      WHERE sessionId = ? AND nodeId = ?
    `);
    
    const row = stmt.get(sessionId, nodeId) as any;
    if (!row) return null;
    
    return JSON.parse(row.state);
  }

  getLatestCheckpoint(sessionId: string) {
    const stmt = db.prepare(`
      SELECT nodeId, state FROM checkpoints 
      WHERE sessionId = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    
    const row = stmt.get(sessionId) as any;
    if (!row) return null;
    
    return {
      nodeId: row.nodeId,
      state: JSON.parse(row.state),
    };
  }

  clearCheckpoints(sessionId: string) {
    const stmt = db.prepare(`DELETE FROM checkpoints WHERE sessionId = ?`);
    stmt.run(sessionId);
  }
}

export const checkpointer = new SqliteCheckpointer();