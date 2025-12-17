"use server";

import { inngest } from "@/inngest/client";
import db from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/actions";
import { MessageRole, MessageType } from "@prisma/client";

export const createMessage = async (value: string, projectId: string) => {
  const result = await getCurrentUser();

  if (!result.user) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
      userId: result.user.id,
    },
  });

  if (!project) {
    return {
      success: false,
      error: "Project not found",
    };
  }

  const newMessage = await db.message.create({
    data: {
      content: value,
      projectId,
      type: MessageType.RESULT,
      role: MessageRole.USER,
    },
  });

  await inngest.send({
    name: "code-agent/run",
    data: {
      value: value,
      projectId: projectId,
    },
  });

  return {
    success: true,
    message: newMessage,
  };
};

export const getMessages = async (projectId: string) => {
  const result = await getCurrentUser();
  if (!result.user) throw new Error("Unauthorized");

  const project = await db.project.findUnique({
    where: {
      id: projectId,
      userId: result.user.id,
    },
  });

  if (!project) throw new Error("Project not found or unauthorized");

  const messages = await db.message.findMany({
    where: {
      projectId,
    },
    orderBy: {
      updatedAt: "asc",
    },
    include: {
      fragments: true,
    },
  });

  return messages;
};
