import { createEmbedding } from "./genai.js";
import { supabase } from "./supabase.js";

export async function getRelevantDocs(
  query,
  topK = 3,
  minScore = 0.4
) {
  const queryEmbedding = await createEmbedding(query);

  const { data, error } = await supabase.rpc("match_kb", {
    query_embedding: queryEmbedding,
    match_threshold: minScore,
    match_count: topK
  });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(d => d.content);
}
