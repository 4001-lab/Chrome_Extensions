import { getRelevantDocs } from "../src/services/rag.js";
import { getOrderById } from "../src/services/orders.js";
import { generatePrompt } from "../src/utils/prompt.js";
import { generateTextStream } from "../src/services/genai.js";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, orderId } = req.body;

    const kbDocs = await getRelevantDocs(message);
    // If orderId is provided, fetch order details; otherwise, set to null
    const orderData = orderId ? await getOrderById(orderId) : undefined;

    const prompt = generatePrompt(message, kbDocs, orderData);

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream the response
    for await (const chunk of generateTextStream(prompt)) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate reply" });
  }
}
