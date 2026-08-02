import type { GraphStateAnnotation } from "../state.js";
import { ollama } from "../../utils/ollamaClient.ts";
import { checkpointer } from "../../db/checkpointer.ts";
import { GENERATE_SUMMARY } from "../../utils/constant.ts";

export async function generateSummary(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Generating summary");

  if (!state.symptoms || state.symptoms.length === 0) {
    const result = {
      ...state,
      urgency: "LOW" as const,
      confidence: 0,
      summary:
        "No medical symptoms were identified from the patient's input. Please provide a clear description of your symptoms for a proper assessment.",
    };
    checkpointer.saveCheckpoint(state.sessionId, GENERATE_SUMMARY, result);
    return result;
  }

  const hasFollowup = state.followupAnswers && state.followupAnswers.length > 0;
  const followupContext = hasFollowup
    ? `Additional information: ${state.followupAnswers.join(", ")}`
    : "";

  const citedGuidelines = (state.retrievedGuidelines ?? []).filter((guideline) =>
    (state.citedGuidelineIds ?? []).includes(guideline.id),
  );
  const groundingContext =
    citedGuidelines.length > 0
      ? citedGuidelines
          .map((guideline) => `${guideline.id}: ${guideline.text}`)
          .join(" | ")
      : "No matching guideline found; clinician review recommended.";

  const prompt = `Generate a concise clinician-friendly summary based only on the provided information.
        Primary Symptoms: ${state.symptoms}
        Follow-up Information: ${followupContext}
        Urgency Classification: ${state.urgency}
        Confidence Score: ${state.confidence}%
        Grounding Context: ${groundingContext}
        Rules:
        - If No primary symptoms are found, put urgency as LOW, cofidence score as 0% and summary stating that no symptom could be found.
        - Use ONLY the information provided above.
        - If Additional info is provided, incorporate it into the summary.
        - If grounding context includes guideline IDs, mention the guideline IDs and relevant text in the summary.
        - If no guideline matched, include this exact sentence: "No matching guideline found; clinician review recommended."
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

  const groundingSentence =
    citedGuidelines.length > 0
      ? `Urgency grounding: ${citedGuidelines
          .map((guideline) => `${guideline.id} (${guideline.text})`)
          .join("; ")}.`
      : "No matching guideline found; clinician review recommended.";

  const result = {
    ...state,
    summary: `${response.response.trim()} ${groundingSentence}`.trim(),
  };
  checkpointer.saveCheckpoint(state.sessionId, GENERATE_SUMMARY, result);
  return result;
}
