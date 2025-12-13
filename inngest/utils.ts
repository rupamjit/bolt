import { AgentResult } from "@inngest/agent-kit";

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  const message = result.output[lastAssistantTextMessageIndex];
  if (!message || !("content" in message)) {
    return undefined;
  }

  if (!message.content) {
    return undefined;
  }

  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content.map((c: { text: string }) => c.text).join("");
  }

  return undefined;
}
