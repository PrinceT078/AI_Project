import { Ollama } from "ollama";
import type { GraphStateAnnotation } from "../state.js";

const ollama = new Ollama({ host: "http://localhost:11434" });

export async function extractSymptoms(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Extracting symptoms from patient input");
  const prompt = `Extract symptoms from this patient input: "${state.patientInput}"
  
  Return ONLY valid JSON. Do NOT include explanations, code, or markdown.
  
  format:
  ["symptom1", "symptom2"]
  
  Example input: "I have fever and chest pain."
  Example output: ["fever", "chest pain"]

  Now extract symptoms:`;
  const response = await ollama.generate({
    model: "llama3.2",
    prompt,
  });

  const jsonMatch = response.response.match(/\{[\s\S]*\}/); //regex to extract JSON from noisy responses.
  const jsonStr = jsonMatch ? jsonMatch[0] : response.response;

  try {
    const parsed = JSON.parse(jsonStr);
    console.log("Extracted symptoms JSON:", parsed);
    return {
      ...state,
      symptoms: parsed,
    };
  } catch {
    return {
      ...state,
      symptoms: JSON.stringify({
        symptoms: [state.patientInput]
      }),
    };
  }
}
