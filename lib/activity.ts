import { ActivityType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function logActivity(params: {
  type: ActivityType;
  message: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.activityLog.create({
    data: {
      type: params.type,
      message: params.message,
      actorId: params.actorId,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
