import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowRunForm } from "@/features/workflows/components/workflow-run-form";
import { compilePromptPackage } from "@/lib/prompt-assembly";
import { prisma } from "@/lib/prisma";

export default async function WorkflowRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      documents: {
        include: {
          document: {
            include: { tags: true },
          },
        },
      },
    },
  });

  if (!workflow) {
    notFound();
  }

  const preview = compilePromptPackage({
    workflow,
    taskContext: "Preview a team-facing execution package for a cross-functional handoff.",
    roleContext: "Act as a team member coordinating deliverables.",
    teamContext: "Member Success ops with weekly SLA reporting.",
    includeLegacy: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Run ${workflow.name}`}
        description="Compile a deterministic prompt package with ordered source citations."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Run inputs</CardTitle>
            <CardDescription>Task context plus optional role and team guidance.</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowRunForm workflowId={workflow.id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prompt assembly preview</CardTitle>
            <CardDescription>Server-side compilation logic for the currently linked source package.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <section>
              <p className="font-medium">Included sources</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {preview.payload.sourceCitations.map((source) => (
                  <div key={source.id} className="rounded-full border px-3 py-1">
                    #{source.rank} {source.title}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <p className="font-medium">Prompt preview</p>
              <div className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/40 p-4">
                {preview.promptPreview}
              </div>
            </section>
            <section>
              <p className="font-medium">JSON payload preview</p>
              <pre className="mt-2 overflow-auto rounded-lg border bg-card p-4 text-xs">
                {JSON.stringify(preview.payload, null, 2)}
              </pre>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
