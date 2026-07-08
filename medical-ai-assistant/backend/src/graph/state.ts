import { Annotation } from "@langchain/langgraph";

export const GraphStateAnnotation = Annotation.Root({
  patientInput: Annotation<string>,
  sessionId: Annotation<string>,
  symptoms: Annotation<string[]>,
  followupQuestions: Annotation<string[]>,
  followupAnswers: Annotation<string[]>,
  requiresFollowup: Annotation<boolean>,
  urgency: Annotation<"LOW" | "MEDIUM" | "HIGH">,
  confidence: Annotation<number>,
  summary: Annotation<string>,
});