"use server";

import { ActivityType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { integrationFormSchema, profileFormSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function updateProfile(input: unknown) {
  const session = await requireSession();
  const parsed = profileFormSchema.parse(input);

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed,
  });

  await logActivity({
    type: ActivityType.USER_UPDATED,
    actorId: session.user.id,
    message: "Updated user profile",
  });

  revalidatePath("/settings/profile");
}

export async function updateIntegration(input: unknown) {
  const session = await requireSession();
  const parsed = integrationFormSchema.parse(input);

  await prisma.integrationConfig.upsert({
    where: { provider: parsed.provider },
    create: {
      provider: parsed.provider,
      enabled: parsed.enabled,
      status: parsed.status,
      config: JSON.parse(parsed.config),
    },
    update: {
      enabled: parsed.enabled,
      status: parsed.status,
      config: JSON.parse(parsed.config),
    },
  });

  await logActivity({
    type: ActivityType.INTEGRATION_UPDATED,
    actorId: session.user.id,
    message: `Updated integration ${parsed.provider}`,
  });

  revalidatePath("/settings/integrations");
}
