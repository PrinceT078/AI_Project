import { Annotation } from "@langchain/langgraph";

export interface RetrievedGuidelineState {
  id: string;
  text: string;
  score: number;
}

export const GraphStateAnnotation = Annotation.Root({
  patientInput: Annotation<string>,
  sessionId: Annotation<string>,
  symptoms: Annotation<string[]>,
  // Top guideline matches retrieved for grounding urgency classification.
  retrievedGuidelines: Annotation<RetrievedGuidelineState[]>,
  // Guideline IDs cited by the classifier as supporting the urgency result.
  citedGuidelineIds: Annotation<string[]>,
  followupQuestions: Annotation<string[]>,
  followupAnswers: Annotation<string[]>,
  requiresFollowup: Annotation<boolean>,
  urgency: Annotation<"LOW" | "MEDIUM" | "HIGH">,
  confidence: Annotation<number>,
  summary: Annotation<string>,
  symptomRetryCount: Annotation<number>,
  maxSymptomRetries: Annotation<number>,
});