import { Ollama } from "ollama";
import type { GraphStateAnnotation } from "../state.js";

const ollama = new Ollama({ host: "http://localhost:11434" });

export async function classifyUrgency(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Classifying urgency from symptoms");
  const retrievedGuidelines = state.retrievedGuidelines ?? [];
  const guidanceContext =
    retrievedGuidelines.length > 0
      ? retrievedGuidelines
          .map(
            (g) =>
              `${g.id} (similarity=${g.score.toFixed(3)}): ${g.text}`,
          )
          .join("\n")
      : "NONE_RETRIEVED";

  const followupContext =
    state.followupAnswers && state.followupAnswers.length > 0
      ? `\n        Additional information from patient follow-up:\n        ${state.followupAnswers.join("\n        ")}`
      : "";

  const prompt = `You are a medical triage assistant.

        Based only on the provided symptoms, any additional follow-up information, and retrieved synthetic guideline snippets, classify the urgency level.

        Symptoms:
        ${state.symptoms.join(", ")}${followupContext}

        Retrieved synthetic guideline snippets:
        ${guidanceContext}

        Rules:
        - Use only the provided symptoms and additional follow-up information.
        - Use the retrieved guidelines when they are relevant to the symptoms.
        - Do not infer additional symptoms or diagnoses.
        - If guidelines are provided but none are relevant, explicitly say so.
        - If no guidelines are retrieved, explicitly say so.
        - If no guideline is relevant/cited, keep confidence at 60 or lower.
        - Do not provide recommendations.
        - Return only valid JSON.
        - Confidence should be an integer between 0 and 100 representing confidence in the urgency classification.

        Return exactly in this format:

        {
        "urgency": "LOW | MEDIUM | HIGH",
        "confidence": 85,
        "citedGuidelineIds": ["G-01", "G-02"],
        "guidelineUseNote": "used | not_relevant | none_retrieved"
        }`;

  const response = await ollama.generate({
    model: "llama3.2",
    prompt,
  });

  try {
    const jsonMatch = response.response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response.response;
    const parsed = JSON.parse(jsonStr);

    const parsedUrgency =
      parsed.urgency === "LOW" || parsed.urgency === "MEDIUM" || parsed.urgency === "HIGH"
        ? parsed.urgency
        : "MEDIUM";
    const retrievedIds = new Set(retrievedGuidelines.map((g) => g.id));
    const citedGuidelineIds = Array.isArray(parsed.citedGuidelineIds)
      ? parsed.citedGuidelineIds
          .map((id: unknown) => String(id).trim())
          .filter((id: string) => retrievedIds.has(id))
      : [];
    const rawConfidence = Number.isFinite(parsed.confidence)
      ? Number(parsed.confidence)
      : 0;
    const boundedConfidence = Math.max(0, Math.min(100, Math.round(rawConfidence)));
    const shouldCapConfidence = retrievedGuidelines.length === 0 || citedGuidelineIds.length === 0;
    const confidence = shouldCapConfidence
      ? Math.min(boundedConfidence, 60)
      : boundedConfidence;

    console.log("Parsed urgency classification:", parsed);
    return {
      ...state,
      urgency: parsedUrgency,
      confidence,
      citedGuidelineIds,
    };
  } catch (error) {
    console.error(`Error in classifying urgency: ${error}`);
    throw new Error("Failed to classify urgency");
  }
}
