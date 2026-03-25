import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [
    totalDocuments,
    goldStandardDocuments,
    legacyDocuments,
    workflowCount,
    activeUsers,
    recentActivity,
    staleDocuments,
    recentRuns,
    qaRecords,
  ] = await Promise.all([
    prisma.knowledgeDocument.count(),
    prisma.knowledgeDocument.count({ where: { status: "GOLD_STANDARD" } }),
    prisma.knowledgeDocument.count({ where: { status: "LEGACY_NOISE" } }),
    prisma.workflow.count(),
    prisma.user.count(),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: true },
    }),
    prisma.knowledgeDocument.findMany({
      where: {
        OR: [{ reviewDate: { lt: new Date() } }, { reviewDate: null }],
        status: { in: ["GOLD_STANDARD", "CURRENT"] },
      },
      take: 5,
      orderBy: { updatedAt: "asc" },
    }),
    prisma.workflowRun.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { workflow: true, user: true },
    }),
    prisma.qARecord.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { workflow: true },
    }),
  ]);

  return {
    totalDocuments,
    goldStandardDocuments,
    legacyDocuments,
    workflowCount,
    activeUsers,
    recentActivity,
    staleDocuments,
    recentRuns,
    qaRecords,
  };
}

export async function getKnowledgeList(filters: {
  query?: string;
  category?: string;
  status?: string;
  ownerId?: string;
  authorityLevel?: string;
}) {
  const where: Prisma.KnowledgeDocumentWhereInput = {
    AND: [
      filters.query
        ? {
            OR: [
              { title: { contains: filters.query, mode: "insensitive" } },
              { description: { contains: filters.query, mode: "insensitive" } },
              { content: { contains: filters.query, mode: "insensitive" } },
            ],
          }
        : {},
      filters.category ? { category: filters.category as never } : {},
      filters.status ? { status: filters.status as never } : {},
      filters.ownerId ? { ownerId: filters.ownerId } : {},
      filters.authorityLevel ? { authorityLevel: filters.authorityLevel as never } : {},
    ],
  };

  return prisma.knowledgeDocument.findMany({
    where,
    include: {
      owner: true,
      tags: true,
      workflowLinks: { include: { workflow: true } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getKnowledgeDocument(id: string) {
  return prisma.knowledgeDocument.findUnique({
    where: { id },
    include: {
      owner: true,
      tags: true,
      workflowLinks: {
        include: {
          workflow: true,
        },
      },
      parentRelations: {
        include: {
          childDocument: true,
        },
      },
      childRelations: {
        include: {
          parentDocument: true,
        },
      },
    },
  });
}

export async function getHierarchyData() {
  return prisma.knowledgeRelation.findMany({
    include: {
      parentDocument: true,
      childDocument: true,
    },
    orderBy: {
      parentDocument: {
        title: "asc",
      },
    },
  });
}

export async function getWorkflowList() {
  return prisma.workflow.findMany({
    include: {
      documents: {
        include: {
          document: true,
        },
      },
      runs: true,
      qaRecords: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getWorkflowById(id: string) {
  return prisma.workflow.findUnique({
    where: { id },
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
      runs: {
        include: {
          user: true,
          usedDocuments: {
            include: {
              document: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      qaRecords: true,
    },
  });
}

export async function getDraftData() {
  return prisma.draft.findMany({
    include: {
      workflow: true,
      author: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getQaData() {
  return prisma.qARecord.findMany({
    include: {
      workflow: true,
      user: true,
      reviewer: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActivityData(type?: string) {
  return prisma.activityLog.findMany({
    where: type ? { type: type as never } : undefined,
    include: { actor: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSearchResults(query: string) {
  const [documents, workflows, qaRecords, users] = await Promise.all([
    prisma.knowledgeDocument.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      take: 8,
    }),
    prisma.workflow.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 8,
    }),
    prisma.qARecord.findMany({
      where: { scenario: { contains: query, mode: "insensitive" } },
      include: { workflow: true },
      take: 8,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
    }),
  ]);

  return { documents, workflows, qaRecords, users };
}
