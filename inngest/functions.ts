import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "e2b";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "agent/hello" },
  async ({event,step}) => {

    const sandboxId = await step.run("get-sandbox-id", async (): Promise<string> => {
      const sandbox = await Sandbox.create("bolt")
      return sandbox.sandboxId
    })


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

      const sandboxUrl = await step.run("get-sandbox-url",async()=>{
        const sandbox = await Sandbox.connect(sandboxId)
        const host = sandbox.getHost(3000)
        return `http://${host}`
      }) 
    return {
      text,
    };
  }
);
