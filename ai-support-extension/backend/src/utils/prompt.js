export function generatePrompt(userMessage, kbDocs, orderData) {
  // 1. Format Knowledge Base Context safely
  const contextSection = kbDocs.length > 0 
    ? kbDocs.join("\n\n") 
    : "No relevant answers available.";

  // 2. Format Order Data safely
  const orderSection = orderData === undefined
    ? "No order data provided."
    : orderData === null
    ? "Order not found. The order number provided does not exist."
    : JSON.stringify(orderData, null, 2);

  // 3. Return a single formatted string
  // We use Markdown headers (#) to help the model separate instructions from data
  return `
    # CONTEXT (Knowledge Base)
    ${contextSection}

    # ORDER DATA
    ${orderSection}

    # CUSTOMER MESSAGE
    ${userMessage}
    `;
}
