import type { GraphStateAnnotation } from "../state.ts";

function normalizeSymptoms(symptoms: any): string[] {
  if (Array.isArray(symptoms)) {
    return symptoms.map((symptom) => String(symptom).trim()).filter(Boolean);
  }

  if (typeof symptoms === "string") {
    try {
      const parsed = JSON.parse(symptoms);
      return normalizeSymptoms(parsed);
    } catch {
      return symptoms.trim() ? [symptoms.trim()] : [];
    }
  }

  return [];
}

export async function validateSymptoms(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Validating extracted symptoms");
  const symptoms = normalizeSymptoms(state.symptoms);
  console.log("symp =" + symptoms);
  const retryCount = state.symptomRetryCount ?? 0;
  const maxRetries = state.maxSymptomRetries ?? 1;

  if (symptoms.length > 0) {
    return {
      ...state,
      symptoms,
      symptomRetryCount: retryCount,
    };
  }

  if (retryCount >= maxRetries) {
    return {
      ...state,
      symptoms: [],
      symptomRetryCount: retryCount + 1,
    };
  }

  return {
    ...state,
    symptoms: [],
    symptomRetryCount: retryCount + 1,
  };
}

export function shouldRetrySymptomExtraction(
  state: typeof GraphStateAnnotation.State,
) {
  console.log("Checking if symptom extraction should be retried");
  const symptoms = normalizeSymptoms(state.symptoms);
  const retryCount = state.symptomRetryCount ?? 0;
  const maxRetries = state.maxSymptomRetries ?? 1;
  console.log(
    "retry count = " +
      retryCount +
      ", maxRetries = " +
      maxRetries +
      ", symptoms length = " +
      symptoms.length,
  );
  const val = symptoms.length === 0 && retryCount <= maxRetries;
  console.log("Retry required =" + val);
  return val;
}
