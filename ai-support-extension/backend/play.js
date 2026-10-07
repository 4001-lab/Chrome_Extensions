// import dotenv from "dotenv";
// import { GoogleGenAI } from "@google/genai";

// dotenv.config();
// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY
// });

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: "Explain how AI works in a few words",
//   });
//   console.log(response.text);
// }

// main();

const message = "What is the return policy?";
const orderId = null;
const BACKEND_URL = "https://ai-support-extension.vercel.app/api/generateReply";

const res = await fetch(BACKEND_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message, orderId })
});

console.log("Status:", res.status);
const text = await res.text();
console.log("Response:", text);

if (res.ok) {
  const data = JSON.parse(text);
  console.log("Data:", data);
}


// curl -X POST https://ai-support-extension.vercel.app/api/generateReply \
//   -H "Content-Type: application/json" \
//   -d '{
//     "message": "Where is my order?",
//     "orderId": null
//   }'

