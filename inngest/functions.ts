import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "agent/hello" },
  async () => {
    const helloAgent = createAgent({
      name: "hello-agent",
      description: "A simple agent that greets the user.",
      system: "You are a helpful assistant. Always greet with enthusiasm.",
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const result = await helloAgent.run("say hello to the user!");

    const firstMessage = result.output[0];
console.log("firstMessage",firstMessage)
    const text =
      firstMessage?.content
      // console.log(text)
    return {
      text,
    };
  }
);
