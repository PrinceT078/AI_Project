import { ollama } from "../../utils/ollamaClient.js";
import type { GraphStateAnnotation } from "../state.js";

export async function askFollowup(state: typeof GraphStateAnnotation.State) {
  console.log("Generating follow-up questions based on symptoms");
  const prompt = `Based on symptoms: ${state.symptoms}
  Generate 1-3 follow-up questions to better understand the patient's condition.
  Return ONLY a JSON array of questions (strings), no explanations.
  Example: ["How long have you had this?", "Is it getting worse?"]`;

  const response = await ollama.generate({
    model: "llama3.2",
    prompt,
  });

  const jsonMatch = response.response.match(/\[[\s\S]*\]/);
  const jsonStr = jsonMatch ? jsonMatch[0] : response.response;

  try {
    const questions = JSON.parse(jsonStr);
    return {
      ...state,
      followupQuestions: questions,
    };
  } catch {
    console.error(
      "Error while generating follow-up questions. Returning default question.",
    );
    return { ...state, followupQuestions: ["Can you provide more details?"] };
  }
}
