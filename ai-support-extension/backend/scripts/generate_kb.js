import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const kbDir = path.join(__dirname, "../knowledge-base");
const kbFile = path.join(kbDir, "kb.json");
const MAX_CHUNK_SIZE = 2000; // characters per chunk

function chunkText(text, maxSize) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > maxSize && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function generateKB() {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".txt"));
  const kb = [];
  let idCounter = 1;

  files.forEach(file => {
    const text = fs.readFileSync(path.join(dataDir, file), "utf-8").trim();
    const chunks = text.length > MAX_CHUNK_SIZE ? chunkText(text, MAX_CHUNK_SIZE) : [text];
    
    chunks.forEach(chunk => {
      kb.push({ id: `kb${idCounter++}`, text: chunk });
    });
  });

  if (!fs.existsSync(kbDir)) fs.mkdirSync(kbDir, { recursive: true });
  fs.writeFileSync(kbFile, JSON.stringify(kb, null, 2));
  console.log(`✅ Generated ${kb.length} KB entries from ${files.length} files in ${kbFile}`);
}

generateKB();

// Run this script once with `node backend/scripts/generate_kb.js` to create the knowledge base JSON file from text files in the data directory.