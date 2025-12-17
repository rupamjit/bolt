"use server";

import { inngest } from "@/inngest/client";
import db from "@/lib/db";
import { consumeCredits, getUsageStatus } from "@/lib/usage";
import { getCurrentUser } from "@/modules/auth/actions";

import { MessageRole, MessageType } from "@prisma/client";

 class AppError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}


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

     try {
    await consumeCredits();
  } catch (error) {
  console.error("createProject failed:", error);

  // Type guard for rate limit error with msBeforeNext property
  if (error && typeof error === "object" && "msBeforeNext" in error) {
    throw new AppError(
      "TOO_MANY_REQUESTS",
      "You have no credits left. Please upgrade to Pro."
    );
  }

  // Type guard for Error objects with message property
  if (error instanceof Error && error.message === "Unauthorized") {
    throw new AppError("UNAUTHORIZED", "Please sign in to continue.");
  }

  throw new AppError(
    "BAD_REQUEST",
    error instanceof Error ? error.message : "Unknown error"
  );
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
