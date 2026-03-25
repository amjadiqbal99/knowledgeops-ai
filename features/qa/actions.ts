"use server";

import { ActivityType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { qaFormSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function createQaRecord(input: unknown) {
  const session = await requireSession();
  const parsed = qaFormSchema.parse(input);

  await prisma.qARecord.create({
    data: {
      workflowId: parsed.workflowId,
      userId: session.user.id,
      scenario: parsed.scenario,
      expectedResult: parsed.expectedResult,
      actualResult: parsed.actualResult,
      issueType: parsed.issueType,
      severity: parsed.severity,
      sourceGroundingIssue: parsed.sourceGroundingIssue,
      toneIssue: parsed.toneIssue,
      complianceIssue: parsed.complianceIssue,
      notes: parsed.notes || null,
      reviewerStatus: parsed.reviewerStatus,
    },
  });

  await logActivity({
    type: ActivityType.QA_ISSUE_LOGGED,
    actorId: session.user.id,
    message: `Logged a QA issue for workflow ${parsed.workflowId}`,
  });

  revalidatePath("/qa");
}
