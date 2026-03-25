import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ProfileSettingsPage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      name: true,
      title: true,
      department: true,
      email: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile settings"
        description="Manage your role context and profile details used across workflows."
      />
      <Card>
        <CardContent className="pt-6">
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
