import { gemini, createAgent } from "@inngest/agent-kit";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const helloAgent = createAgent({
      name: "hello-agent",
      description: "A simple agent that greets the user.",
      system: "You are a helpful assistant. Always Greet With Enthusiasm.",
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const { output } = await helloAgent.run("say hello");
    const lastMessage = output[output.length - 1];

    const message =
      "content" in lastMessage ? lastMessage.content : "No content available";

    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error("Error invoking agent:", error);
    return NextResponse.json(
      { error: "Failed to invoke agent", success: false },
      { status: 500 }
    );
  }
}
