import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkflowById } from "@/lib/data";
import { formatEnumLabel } from "@/lib/utils";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = await getWorkflowById(id);

  if (!workflow) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={workflow.name}
        description={workflow.description}
        action={
          <Button asChild>
            <Link href={`/workflows/${workflow.id}/run`}>Run workflow</Link>
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workflow configuration</CardTitle>
            <CardDescription>AI-ready structure with role targeting and review controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{formatEnumLabel(workflow.type)}</Badge>
              <Badge variant="secondary">{formatEnumLabel(workflow.targetRole)}</Badge>
              <Badge variant="outline">{workflow.active ? "Active" : "Inactive"}</Badge>
            </div>
            <section>
              <p className="font-medium">Objective</p>
              <p className="mt-1 text-muted-foreground">{workflow.objective}</p>
            </section>
            <section>
              <p className="font-medium">Instruction template</p>
              <div className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/40 p-4">{workflow.instructionTemplate}</div>
            </section>
            <div className="grid gap-4 lg:grid-cols-3">
              <section>
                <p className="font-medium">Guardrails</p>
                <p className="mt-1 text-muted-foreground">{workflow.guardrails}</p>
              </section>
              <section>
                <p className="font-medium">Output format</p>
                <p className="mt-1 text-muted-foreground">{workflow.expectedOutputFormat}</p>
              </section>
              <section>
                <p className="font-medium">Escalation rules</p>
                <p className="mt-1 text-muted-foreground">{workflow.escalationRules}</p>
              </section>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Source package</CardTitle>
            <CardDescription>Knowledge sources available to this workflow before prompt assembly ordering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflow.documents.map((entry) => (
              <div key={entry.documentId} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{entry.document.title}</p>
                  <Badge variant="outline">{formatEnumLabel(entry.document.status)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{entry.document.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Run history</TabsTrigger>
          <TabsTrigger value="qa">QA feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="runs">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {workflow.runs.map((run) => (
                <div key={run.id} className="rounded-xl border p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{run.user.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge variant="secondary">{run.status}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{run.taskContext}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {run.usedDocuments.map((used) => (
                      <Badge key={used.documentId} variant="outline">
                        #{used.authorityRank} {used.document.title}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
                    {run.compiledPrompt}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="qa">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {workflow.qaRecords.map((record) => (
                <div key={record.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatEnumLabel(record.issueType)}</p>
                    <Badge variant={record.severity === "HIGH" || record.severity === "CRITICAL" ? "destructive" : "warning"}>
                      {formatEnumLabel(record.severity)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{record.scenario}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
