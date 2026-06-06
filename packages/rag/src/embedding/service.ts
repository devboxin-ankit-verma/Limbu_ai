import OpenAI from "openai";
import { RagConfigError } from "../errors";
import { RAG_CONFIG } from "../config";

let client: OpenAI | null = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new RagConfigError("OPENAI_API_KEY is required for embeddings");
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const openai = getClient();
  const response = await openai.embeddings.create({
    model: RAG_CONFIG.embeddingModel,
    input: texts,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embedTexts([query]);
  return vector;
}
