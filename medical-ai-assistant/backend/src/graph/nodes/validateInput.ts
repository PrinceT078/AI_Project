import { GraphStateAnnotation } from "../state.ts";

export async function validateInput(state: typeof GraphStateAnnotation.State) {
  console.log("Validating Input patientInput");
  const input = state.patientInput.trim();

  if (!input) {
    throw new Error("Patient input cannot be empty.");
  }

  return {
    patientInput: input,
  };
}
