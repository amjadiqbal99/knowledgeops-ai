import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftForm } from "@/features/drafts/components/draft-form";
import { getDraftData } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatEnumLabel } from "@/lib/utils";

export default async function DraftsPage() {
  const [drafts, workflows] = await Promise.all([
    getDraftData(),
    prisma.workflow.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drafting Support"
        description="Create structured draft request packages backed by workflow guidance and trusted sources."
      />
      <Card>
        <CardHeader>
          <CardTitle>Create draft package</CardTitle>
        </CardHeader>
        <CardContent>
          <DraftForm workflows={workflows} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saved drafts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{draft.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {draft.author.name} • {draft.workflow.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{formatEnumLabel(draft.draftType)}</Badge>
                  <Badge variant="secondary">{draft.status}</Badge>
                </div>
              </div>
              <div className="mt-4 whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-sm">
                {draft.compiledRequest}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
