const API_BASE_URL = "http://localhost:3000";

export interface ChatResponse {
  sessionId: string;
  requiresFollowup: boolean;
  followupQuestions?: string[];
  urgency?: string;
  confidence?: number;
  summary?: string;
}

export interface FollowupResponse {
  urgency: string;
  confidence: number;
  summary: string;
}

export async function submitSymptoms(patientInput: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientInput }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function submitFollowupAnswers(
  sessionId: string,
  followupAnswers: string[]
): Promise<FollowupResponse> {
  const response = await fetch(`${API_BASE_URL}/followup/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, followupAnswers }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}