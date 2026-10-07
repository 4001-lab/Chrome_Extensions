import kb from "../knowledge-base/kb.json" with { type: "json" };
import { createEmbedding } from "../src/services/genai.js";
import { supabase } from "../src/services/supabase.js";

async function run() {
  for (const doc of kb) {
    console.log(`Embedding ${doc.id}`);

    const embedding = await createEmbedding(doc.text);

    const { data, error } = await supabase.from("kb_embeddings").upsert({
      id: doc.id,
      content: doc.text,
      embedding
    });

    if (error) {
      console.error(`Error inserting ${doc.id}:`, error);
    } else {
      console.log(`✅ Inserted ${doc.id}`);
    }
  }

  console.log("✅ KB embedded & uploaded to Supabase");
}

run();

// Run this script once with `node backend/scripts/embed_kb.js` after generating the kb.json to create embeddings and upload them to Supabase.