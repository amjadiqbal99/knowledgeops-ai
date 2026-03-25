"use server";

import { ActivityType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { slugify } from "transliteration";

import { logActivity } from "@/lib/activity";
import { compilePromptPackage } from "@/lib/prompt-assembly";
import { prisma } from "@/lib/prisma";
import { workflowFormSchema, workflowRunSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function createWorkflow(input: unknown) {
  const session = await requireSession();
  const parsed = workflowFormSchema.parse(input);

  const workflow = await prisma.workflow.create({
    data: {
      name: parsed.name,
      slug: `${slugify(parsed.name, { lowercase: true })}-${Math.random().toString(36).slice(2, 7)}`,
      description: parsed.description,
      type: parsed.type,
      targetRole: parsed.targetRole,
      objective: parsed.objective,
      inputFields: JSON.parse(parsed.inputFields),
      recommendedCategories: parsed.recommendedCategories,
      instructionTemplate: parsed.instructionTemplate,
      guardrails: parsed.guardrails,
      expectedOutputFormat: parsed.expectedOutputFormat,
      escalationRules: parsed.escalationRules,
      reviewChecklist: parsed.reviewChecklist,
      documents: {
        create: parsed.documentIds.map((documentId) => ({ documentId })),
      },
    },
  });

  await logActivity({
    type: ActivityType.WORKFLOW_CREATED,
    actorId: session.user.id,
    message: `Created workflow "${parsed.name}"`,
    metadata: { workflowId: workflow.id },
  });

  revalidatePath("/workflows");
}

export async function runWorkflow(input: unknown) {
  const session = await requireSession();
  const parsed = workflowRunSchema.parse(input);

  const workflow = await prisma.workflow.findUnique({
    where: { id: parsed.workflowId },
    include: {
      documents: {
        include: {
          document: {
            include: {
              tags: true,
            },
          },
        },
      },
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const compiled = compilePromptPackage({
    workflow,
    taskContext: parsed.taskContext,
    roleContext: parsed.roleContext,
    teamContext: parsed.teamContext,
    includeLegacy: parsed.includeLegacy,
  });

  const run = await prisma.workflowRun.create({
    data: {
      workflowId: parsed.workflowId,
      userId: session.user.id,
      taskContext: parsed.taskContext,
      compiledPrompt: compiled.promptPreview,
      compiledPayload: compiled.payload,
      usedDocuments: {
        create: compiled.orderedDocuments.map((document, index) => ({
          documentId: document.id,
          authorityRank: index + 1,
        })),
      },
    },
  });

  await logActivity({
    type: ActivityType.WORKFLOW_RUN,
    actorId: session.user.id,
    message: `Ran workflow "${workflow.name}"`,
    metadata: { workflowRunId: run.id },
  });

  revalidatePath(`/workflows/${parsed.workflowId}`);
  revalidatePath(`/workflows/${parsed.workflowId}/run`);

  return run.id;
}
