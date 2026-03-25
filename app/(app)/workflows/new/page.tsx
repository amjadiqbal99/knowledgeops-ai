import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowForm } from "@/features/workflows/components/workflow-form";
import { prisma } from "@/lib/prisma";

export default async function NewWorkflowPage() {
  const documents = await prisma.knowledgeDocument.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Workflow"
        description="Define workflow instructions, guardrails, output format, and eligible source documents."
      />
      <Card>
        <CardContent className="pt-6">
          <WorkflowForm documents={documents} />
        </CardContent>
      </Card>
    </div>
  );
}
