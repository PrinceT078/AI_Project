import type { GraphStateAnnotation } from "../state.ts";

export async function requiresFollowup(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Determining if follow-up is required based on confidence level");
  const noGroundingForNonLowUrgency =
    (state.retrievedGuidelines?.length ?? 0) === 0 && state.urgency !== "LOW";
  return {
    ...state,
    requiresFollowup: state.confidence < 70 || noGroundingForNonLowUrgency,
  };
}
