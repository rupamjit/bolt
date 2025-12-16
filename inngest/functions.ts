import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import z from "zod";
import { lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/lib/prompt";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@prisma/client";

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run(
      "get-sandbox-id",
      async (): Promise<string> => {
        const sandbox = await Sandbox.create("bolt");
        return sandbox.sandboxId;
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

        // 2. create or update files

        createTool({
          name:"createOrUpdateFiles",
          description:"Create and Update files in the sandbox",
          parameters:z.object({
            files:z.array(
              z.object({
                path:z.string(),
                content:z.string()
              })
            )
          }),
          handler:async ({files},{step,network})=>{
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async()=>{
                try {
                  const updatedFiles = network?.state.data.files || {}

                  const sandbox = await Sandbox.connect(sandboxId)

                  for(const file of files){
                    await sandbox.files.write(file.path,file.content)
                    updatedFiles[file.path] = file.content
                  }
                  return updatedFiles
                } catch (error) {
                  console.log(error)
                  return `Error: ${error}`
                }
              }
            )
            if(typeof newFiles === "object"){
              network.state.data.files = newFiles
            }
          }
        }),
        // 3. readFiles

        createTool({
          name:"readFiles",
          description:"Read files from the sandbox",
          parameters:z.object({
            paths:z.array(z.string())
          }),
          handler:async ({paths},{step})=>{
            const files = await step?.run(
              "readFiles",
              async()=>{
                try {
                  const sandbox = await Sandbox.connect(sandboxId)
                  const contents = [];
                  
                  for(const path of paths){
                    const content = await sandbox.files.read(path)
                    contents.push({
                      path,
                      content
                    })
                  }
                  return JSON.stringify(contents)
                } catch (error) {
                  console.log(error)
                  return `Error: ${error}`
                }
              }
            )
           
          }
        })
      ],
      
      lifecycle:{
        onResponse:async ({result,network})=>{
          const lastSssistanceMessageText = lastAssistantTextMessageContent(result);
          if(lastSssistanceMessageText && network){
            if(lastSssistanceMessageText.includes("<task_summary>")){
              network.state.data.summary = lastSssistanceMessageText
            }
          }
          return result;
        }
      }

    });

    const network = createNetwork({
      name:"code-agent-network",
      agents:[codeAgent],
      maxIter:10,
      
      router:async({network})=>{
        const sumamry = network.state.data.summary;
        if(sumamry){
          return
        }
        return codeAgent
      }
    })

    const result = await network.run(event.data.value);

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await Sandbox.connect(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    await step.run("save-result",async()=>{
      if(isError){
        return await db.message.create({
          data:{
            projectId:event.data.projectId,
            content:"Something Wen Wrong",
            role:MessageRole.ASSISTANT,
            type:MessageType.ERROR
          }
        })
      }
       return await db.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
          fragments: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Untitled",
              files: result.state.data.files,
            },
          },
        },
      });
    })


    return {
      url:sandboxUrl,
      title:"Untitled",
      summary:result.state.data.summary,
      files:result.state.data.files,
    };
  }
);
