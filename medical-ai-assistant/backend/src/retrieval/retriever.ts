import { pipeline } from "@xenova/transformers";
import { SYNTHETIC_GUIDELINES } from "./guidelines.ts";

export interface RetrievedGuideline {
  id: string;
  text: string;
  score: number;
}

const SIMILARITY_THRESHOLD = 0.35;

let embeddingPipelinePromise: ReturnType<typeof pipeline> | null = null;
let guidelineVectorsPromise: Promise<Array<RetrievedGuideline & { embedding: number[] }>> | null =
  null;

async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }
  return embeddingPipelinePromise;
}

async function embedText(text: string): Promise<number[]> {
  const extractor = (await getEmbeddingPipeline()) as any;
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from((output as { data: Float32Array }).data);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i += 1) {
    const aValue = a[i] ?? 0;
    const bValue = b[i] ?? 0;
    dotProduct += aValue * bValue;
    magnitudeA += aValue * aValue;
    magnitudeB += bValue * bValue;
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

async function getGuidelineVectors() {
  if (!guidelineVectorsPromise) {
    guidelineVectorsPromise = Promise.all(
      SYNTHETIC_GUIDELINES.map(async (guideline) => ({
        id: guideline.id,
        text: guideline.text,
        score: 0,
        embedding: await embedText(
          `${guideline.text} Urgency hint: ${guideline.urgencyHint}`,
        ),
      })),
    );
  }

  return guidelineVectorsPromise;
}

export async function retrieveGuidelines(
  symptoms: string[],
  topK: number = 3,
): Promise<RetrievedGuideline[]> {
  const query = symptoms.join(", ").trim();
  if (!query) {
    return [];
  }

  const [queryEmbedding, indexedGuidelines] = await Promise.all([
    embedText(query),
    getGuidelineVectors(),
  ]);

  return indexedGuidelines
    .map((guideline) => ({
      id: guideline.id,
      text: guideline.text,
      score: cosineSimilarity(queryEmbedding, guideline.embedding),
    }))
    .filter((guideline) => guideline.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
