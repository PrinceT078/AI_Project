import type { GraphStateAnnotation } from "../state.ts";

export async function requiresFollowup(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Determining if follow-up is required based on confidence level");
  return {
    ...state,
    requiresFollowup: state.confidence < 70,
  };
}
