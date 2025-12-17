import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork, createState } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import z from "zod";
import { lastAssistantTextMessageContent } from "./utils";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/lib/prompt";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@prisma/client";
import { generateText } from "ai"

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run(
      "get-sandbox-id",
      async (): Promise<string> => {
        const sandbox = await Sandbox.create("bolt", {
          apiKey: process.env.E2B_API_KEY,
          timeoutMs: 1000 * 60 * 60,
        });
        return sandbox.sandboxId;
      }
    );

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages = [];

        const messages = await db.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }

        return formattedMessages;
      }
    );

    const state = createState(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    );

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An agent that can generate code.",
      system: PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }), 
      
      tools: [
        // 1. Terminal
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string().describe("The command to run in the terminal"),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await Sandbox.connect(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.log(
                  `Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`
                );
                return `Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        // 2. Create or update files
        createTool({
          name: "createOrUpdateFiles",
          description: "Create and update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network?.state.data.files || {};

                  const sandbox = await Sandbox.connect(sandboxId);

                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (error) {
                  console.log(error);
                  return `Error: ${error}`;
                }
              }
            );
            if (typeof newFiles === "object" && network) {
              network.state.data.files = newFiles;
            }
          },
        }),

        // 3. Read files
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            paths: z.array(z.string()),
          }),
          handler: async ({ paths }, { step }) => {
            const files = await step?.run("readFiles", async () => {
              try {
                const sandbox = await Sandbox.connect(sandboxId);
                const contents = [];

                for (const path of paths) {
                  const content = await sandbox.files.read(path);
                  contents.push({
                    path,
                    content,
                  });
                }
                return JSON.stringify(contents);
              } catch (error) {
                console.log(error);
                return `Error: ${error}`;
              }
            });
            return files;
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistanceMessageText = lastAssistantTextMessageContent(result);
          if (lastAssistanceMessageText && network) {
            if (lastAssistanceMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistanceMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 10,

      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value,{state});

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "Generate a title for the fragment",
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({model:"gemini-2.5-flash"}),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "Generate a response for the user",
      system: RESPONSE_PROMPT,
      model: gemini({model:"gemini-2.5-flash"}),
    });


    const {output:fragmentTitleOutput} = await fragmentTitleGenerator.run(result.state.data.summary);
    const {output:responseOutput} = await responseGenerator.run(result.state.data.summary);

    const generateFragmentTitle = () => {
      if(fragmentTitleOutput[0].type !== "text"){
        return "Untitled"
      }
      if(Array.isArray(fragmentTitleOutput[0].content)){
        return fragmentTitleOutput[0].content.map((c)=>c).join("");
      }
      return fragmentTitleOutput[0].content;
    }

    const generateResponse = () => {
      if(responseOutput[0].type !== "text"){
        return ""
      }
      if(Array.isArray(responseOutput[0].content)){
        return responseOutput[0].content.map((c)=>c).join("");
      }
      return responseOutput[0].content;
    }

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await Sandbox.connect(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`; 
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await db.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something Went Wrong",
            role: MessageRole.ASSISTANT,
            type: MessageType.ERROR,
          },
        });
      }
      return await db.message.create({
        data: {
          projectId: event.data.projectId,
          content:generateResponse(),
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
          fragments: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Untitled",
      summary: result.state.data.summary,
      files: result.state.data.files,
    };
  }
);

