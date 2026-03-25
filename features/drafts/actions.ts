"use server";

import { ActivityType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { draftFormSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function createDraft(input: unknown) {
  const session = await requireSession();
  const parsed = draftFormSchema.parse(input);
  const workflow = await prisma.workflow.findUnique({
    where: { id: parsed.workflowId },
    include: {
      documents: {
        include: { document: true },
      },
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const compiledRequest = [
    `Draft type: ${parsed.draftType}`,
    `Workflow: ${workflow.name}`,
    `Context: ${parsed.context}`,
    `Guardrails: ${workflow.guardrails}`,
    "Reference sources:",
    ...workflow.documents.map((entry) => `- ${entry.document.title} (${entry.document.status})`),
  ].join("\n");

  await prisma.draft.create({
    data: {
      title: parsed.title,
      draftType: parsed.draftType,
      workflowId: parsed.workflowId,
      authorId: session.user.id,
      context: parsed.context,
      compiledRequest,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await logActivity({
    type: ActivityType.DRAFT_CREATED,
    actorId: session.user.id,
    message: `Created draft "${parsed.title}"`,
  });

  revalidatePath("/drafts");
}
