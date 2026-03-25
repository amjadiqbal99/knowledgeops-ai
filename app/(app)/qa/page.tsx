import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QaForm } from "@/features/qa/components/qa-form";
import { getQaData } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatEnumLabel } from "@/lib/utils";

export default async function QaPage() {
  const [records, workflows] = await Promise.all([
    getQaData(),
    prisma.workflow.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const highSeverityCount = records.filter((record) => record.severity === "HIGH" || record.severity === "CRITICAL").length;
  const groundingCount = records.filter((record) => record.sourceGroundingIssue).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Process QA"
        description="Track failures, grounding issues, and workflow regressions so prompt packages improve over time."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total tests" value={records.length} meta="All QA records captured in the system" />
        <StatCard label="High severity" value={highSeverityCount} meta="Requires review and workflow/source correction" />
        <StatCard label="Grounding issues" value={groundingCount} meta="Records affected by weak source usage or missing authority" />
        <StatCard label="Open reviews" value={records.filter((record) => record.reviewerStatus !== "RESOLVED").length} meta="Records still in review or unresolved" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Log QA issue</CardTitle>
        </CardHeader>
        <CardContent>
          <QaForm workflows={workflows} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>QA log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="rounded-xl border p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="font-medium">{record.workflow.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {record.user.name} • {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={record.severity === "HIGH" || record.severity === "CRITICAL" ? "destructive" : "warning"}>
                    {formatEnumLabel(record.severity)}
                  </Badge>
                  <Badge variant="outline">{formatEnumLabel(record.issueType)}</Badge>
                  <Badge variant="secondary">{formatEnumLabel(record.reviewerStatus)}</Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <div>
                  <p className="font-medium">Scenario</p>
                  <p className="mt-1 text-sm text-muted-foreground">{record.scenario}</p>
                </div>
                <div>
                  <p className="font-medium">Expected</p>
                  <p className="mt-1 text-sm text-muted-foreground">{record.expectedResult}</p>
                </div>
                <div>
                  <p className="font-medium">Actual</p>
                  <p className="mt-1 text-sm text-muted-foreground">{record.actualResult}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
