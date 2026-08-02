export type GuidelineUrgencyHint = "LOW" | "MEDIUM" | "HIGH";

export interface GuidelineSnippet {
  id: string;
  text: string;
  urgencyHint: GuidelineUrgencyHint;
}

// Synthetic/demo-only triage snippets. These are fabricated examples and are not
// real clinical guidance.
export const SYNTHETIC_GUIDELINES: GuidelineSnippet[] = [
  {
    id: "G-01",
    text: "Chest pain with shortness of breath and sweating should be treated as an emergency and needs immediate care.",
    urgencyHint: "HIGH",
  },
  {
    id: "G-02",
    text: "Severe breathing difficulty at rest, especially with blue lips or inability to speak full sentences, requires urgent emergency evaluation.",
    urgencyHint: "HIGH",
  },
  {
    id: "G-03",
    text: "Sudden weakness on one side of the body, facial droop, or speech difficulty should be considered a high-urgency neurological emergency.",
    urgencyHint: "HIGH",
  },
  {
    id: "G-04",
    text: "High fever above 39°C lasting more than three days without improvement suggests same-day medical review.",
    urgencyHint: "MEDIUM",
  },
  {
    id: "G-05",
    text: "Mild fever with cough and sore throat but normal breathing can usually be monitored with routine follow-up.",
    urgencyHint: "LOW",
  },
  {
    id: "G-06",
    text: "Persistent vomiting with inability to keep fluids down for more than 12 hours raises concern for dehydration and needs urgent assessment.",
    urgencyHint: "MEDIUM",
  },
  {
    id: "G-07",
    text: "Blood in vomit or black tarry stool should be treated as high urgency and needs immediate emergency care.",
    urgencyHint: "HIGH",
  },
  {
    id: "G-08",
    text: "New severe headache described as the worst headache of life should be escalated for emergency evaluation.",
    urgencyHint: "HIGH",
  },
  {
    id: "G-09",
    text: "Mild headache that improves with rest and has no neurological symptoms is generally low urgency.",
    urgencyHint: "LOW",
  },
  {
    id: "G-10",
    text: "Abdominal pain with persistent fever and repeated vomiting should be prioritized for same-day evaluation.",
    urgencyHint: "MEDIUM",
  },
  {
    id: "G-11",
    text: "Minor superficial cuts without ongoing bleeding are usually low urgency and can be managed with basic first aid.",
    urgencyHint: "LOW",
  },
  {
    id: "G-12",
    text: "Deep wounds, uncontrolled bleeding, or suspected fracture with deformity require high-urgency in-person care.",
    urgencyHint: "HIGH",
  },
  {
    id: "G-13",
    text: "Diarrhea lasting more than two days with dizziness or low urine output should be considered medium urgency.",
    urgencyHint: "MEDIUM",
  },
  {
    id: "G-14",
    text: "Brief nausea after a meal without severe pain or dehydration signs is typically low urgency.",
    urgencyHint: "LOW",
  },
  {
    id: "G-15",
    text: "New confusion, fainting, or repeated near-fainting episodes should trigger immediate emergency care.",
    urgencyHint: "HIGH",
  },
  {
    id: "G-16",
    text: "Painful urination with fever and flank pain should be assessed urgently the same day.",
    urgencyHint: "MEDIUM",
  },
  {
    id: "G-17",
    text: "Localized mild rash without breathing issues or facial swelling is generally low urgency with outpatient follow-up.",
    urgencyHint: "LOW",
  },
  {
    id: "G-18",
    text: "Allergic reaction with throat tightness, wheeze, or facial swelling is high urgency and requires emergency care.",
    urgencyHint: "HIGH",
  },
];
