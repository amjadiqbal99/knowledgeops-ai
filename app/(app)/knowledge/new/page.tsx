import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { KnowledgeForm } from "@/features/knowledge/components/knowledge-form";
import { prisma } from "@/lib/prisma";

export default async function NewKnowledgePage() {
  const [owners, workflows] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.workflow.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Knowledge Document"
        description="Add a source document, classify authority, and define workflow relevance."
      />
      <Card>
        <CardContent className="pt-6">
          <KnowledgeForm owners={owners} workflows={workflows} />
        </CardContent>
      </Card>
    </div>
  );
}
