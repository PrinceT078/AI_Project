import { Ollama } from "ollama";
import type { GraphStateAnnotation } from "../state.js";
import { ollama } from "../../utils/ollamaClient.ts";

export async function generateSummary(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Generating summary");
  const hasFollowup = state.followupAnswers && state.followupAnswers.length > 0;
  const followupContext = hasFollowup
    ? `Additional information: ${state.followupAnswers.join(", ")}`
    : "";
  const prompt = `Generate a concise clinician-friendly summary based only on the provided information.
        Primary Symptoms: ${state.symptoms}
        Follow-up Information: ${followupContext}
        Urgency Classification: ${state.urgency}
        Confidence Score: ${state.confidence}%
        Rules:
        - Use ONLY the information provided above.
        - If Additional info is provided, incorporate it into the summary.
        - Do NOT infer or mention possible diagnoses, causes, or treatments.
        - Do NOT provide medical advice or recommendations.
        - Do NOT use markdown, bullet points, headings, or special formatting.
        - Keep the summary to 2-3 sentences.
        - Write in a neutral clinical tone.
        Example (without follow-up/additional info):
        Symptoms: severe chest pain
        urgency: HIGH
        confidence: 90
        summary:
        Patient reports severe chest pain. Based on the reported symptoms, the case has been classified as HIGH urgency with a confidence score of 90%. 
        Example (with follow-up answers/additional info):
        Symptoms: fever, fatigue
        followupAnswers: Pain started 3 days ago, no other symptoms, temperature 38.5°C
        urgency: MEDIUM
        confidence: 75
        summary:
        Patient reports fever and fatigue that began 3 days ago with a recorded temperature of 38.5°C and no other associated symptoms. 
        Based on the reported symptoms and follow-up information, the case has been classified as MEDIUM 
        urgency with a confidence score of 75%.`;
  const response = await ollama.generate({
    model: "llama3.2",
    prompt,
  });

  return {
    ...state,
    summary: response.response,
  };
}
