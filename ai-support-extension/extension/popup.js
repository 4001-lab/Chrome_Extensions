const API_URL = "https://ai-support-extension.vercel.app/api/generateReply";

const messageEl = document.getElementById("message");
const orderIdEl = document.getElementById("orderId");
const generateBtn = document.getElementById("generate");
const outputEl = document.getElementById("output");
const outputContainer = document.getElementById("outputContainer");
const errorEl = document.getElementById("error");
const loader = document.getElementById("loader");
const btnText = document.getElementById("btnText");
const copyBtn = document.getElementById("copyBtn");

generateBtn.addEventListener("click", async () => {
  const message = messageEl.value.trim();
  const orderId = orderIdEl.value.trim() || null;

  errorEl.classList.add("hidden");
  outputContainer.classList.add("hidden");

  if (!message) {
    errorEl.textContent = "Please enter a customer message.";
    errorEl.classList.remove("hidden");
    return;
  }

  loader.classList.remove("hidden");
  btnText.textContent = "Generating...";
  generateBtn.disabled = true;
  outputEl.textContent = "";
  outputContainer.classList.remove("hidden");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, orderId })
    });

    if (!res.ok) throw new Error("Request failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          
          try {
            const parsed = JSON.parse(data);
            fullText += parsed.chunk;
            outputEl.textContent = fullText;
            outputEl.scrollTop = outputEl.scrollHeight;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    if (!fullText) {
      outputEl.textContent = "No response generated.";
    }
  } catch (err) {
    outputContainer.classList.add("hidden");
    errorEl.textContent = "Unable to generate reply. Please try again.";
    errorEl.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
    btnText.textContent = "Generate Reply";
    generateBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(outputEl.textContent);
  copyBtn.textContent = "✅ Copied!";
  setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
});
