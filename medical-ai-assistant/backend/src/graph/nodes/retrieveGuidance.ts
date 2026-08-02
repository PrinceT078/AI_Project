import type { GraphStateAnnotation } from "../state.ts";
import { retrieveGuidelines } from "../../retrieval/retriever.ts";

export async function retrieveGuidance(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Retrieving guideline context for urgency grounding");
  const retrievedGuidelines = await retrieveGuidelines(state.symptoms, 3);
  return {
    ...state,
    retrievedGuidelines,
  };
}
