import { Ollama } from "ollama";
import type { GraphStateAnnotation } from "../state.js";

const ollama = new Ollama({ host: "http://localhost:11434" });

export async function classifyUrgency(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Classifying urgency from symptoms");
  //   const prompt = `Classify urgency from symptoms: ${state.symptoms}.
  //     Do not give any explanations, code, or markdown.
  //     Return response in JSON format :
  //     {"urgency": "LOW|MEDIUM|HIGH", "confidence": 0-100}
  //     `;
  const prompt = `You are a medical triage assistant.

        Based only on the provided symptoms, classify the urgency level.

        Symptoms:
        ${state.symptoms.join(", ")}

        Rules:
        - Use only the provided symptoms.
        - Do not infer additional symptoms or diagnoses.
        - Do not provide explanations, reasoning, or recommendations.
        - Return only valid JSON.
        - Confidence should be an integer between 0 and 100 representing confidence in the urgency classification.

        Return exactly in this format:

        {
        "urgency": "LOW | MEDIUM | HIGH",
        "confidence": 85
        }`;

  const response = await ollama.generate({
    model: "llama3.2",
    prompt,
  });

  try {
    const parsed = JSON.parse(response.response);
    console.log("Parsed urgency classification:", parsed);
    return {
      ...state,
      urgency: parsed.urgency,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error(`Error in classifying urgency: ${error}`);
    throw new Error("Failed to classify urgency");
  }
}
