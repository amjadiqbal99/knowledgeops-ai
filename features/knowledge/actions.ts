"use server";

import { ActivityType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { slugify } from "transliteration";

import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { knowledgeFormSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function upsertKnowledgeDocument(input: unknown, documentId?: string) {
  const session = await requireSession();
  const parsed = knowledgeFormSchema.parse(input);
  const tags = parsed.tags
    ?.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean) || [];

  const data: Prisma.KnowledgeDocumentUncheckedCreateInput = {
    title: parsed.title,
    slug: `${slugify(parsed.title, { lowercase: true })}-${Math.random().toString(36).slice(2, 7)}`,
    description: parsed.description,
    content: parsed.content,
    sourceType: parsed.sourceType,
    sourceUrl: parsed.sourceUrl || null,
    category: parsed.category,
    authorityLevel: parsed.authorityLevel,
    status: parsed.status,
    ownerId: parsed.ownerId || null,
    department: parsed.department || null,
    businessUnit: parsed.businessUnit || null,
    companyArea: parsed.companyArea || null,
    version: parsed.version,
    effectiveDate: parsed.effectiveDate ? new Date(parsed.effectiveDate) : null,
    reviewDate: parsed.reviewDate ? new Date(parsed.reviewDate) : null,
    internalNotes: parsed.internalNotes || null,
    rationale: parsed.rationale || null,
  };

  if (documentId) {
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        ...data,
        tags: {
          set: [],
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        workflowLinks: {
          deleteMany: {},
          create: parsed.workflowIds.map((workflowId) => ({ workflowId })),
        },
      },
    });

    await logActivity({
      type: ActivityType.DOCUMENT_UPDATED,
      actorId: session.user.id,
      message: `Updated knowledge document "${parsed.title}"`,
      metadata: { documentId },
    });
  } else {
    const created = await prisma.knowledgeDocument.create({
      data: {
        ...data,
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        workflowLinks: {
          create: parsed.workflowIds.map((workflowId) => ({ workflowId })),
        },
      },
    });

    await logActivity({
      type: ActivityType.DOCUMENT_CREATED,
      actorId: session.user.id,
      message: `Created knowledge document "${parsed.title}"`,
      metadata: { documentId: created.id },
    });
  }

  revalidatePath("/knowledge");
  if (documentId) {
    revalidatePath(`/knowledge/${documentId}`);
  }
}
