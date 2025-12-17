"use server";

import { inngest } from "@/inngest/client";
import db from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { getCurrentUser } from "@/modules/auth/actions";
import { MessageRole, MessageType } from "@prisma/client";
import { generateSlug } from "random-word-slugs";


 class AppError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const createProject = async (value: string) => {
  const result = await getCurrentUser();

  if (!result.success || !result.user) throw new Error("UNAUTHORIZED");

   try {
  await consumeCredits();
} catch (error: unknown) {
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


  const newProject = await db.project.create({
    data: {
      name: generateSlug(2, { format: "kebab" }),
      userId: result.user.id,
      messages: {
        create: {
          content: value,
          role: MessageRole.USER,
          type: MessageType.RESULT,
        },
      },
    },
  });

  await inngest.send({
    name: "code-agent/run",
    data: {
      value: value,
      projectId: newProject.id,
    },
  });

  return newProject;
};

export const getProjects = async () => {
  const result = await getCurrentUser();
  if (!result.success || !result.user) throw new Error("Unauthorized");

  const projects = await db.project.findMany({
    where: {
      userId: result.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
};

export const getProjectById = async (projectId: string) => {
  const result = await getCurrentUser();
  if (!result.success || !result.user) throw new Error("Unauthorized");

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      userId: result.user.id,
    },
  });

  if (!project) throw new Error("Project not found");

  return project;
};
