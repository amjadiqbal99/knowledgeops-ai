import Link from "next/link";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";
import { formatEnumLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Monitor knowledge quality, workflow usage, and QA drift from one operating view."
        action={
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/knowledge/new">Add document</Link>
            </Button>
            <Button asChild>
              <Link href="/workflows/new">Create workflow</Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total documents" value={data.totalDocuments} meta="Across source-of-truth, current, draft, and legacy material" />
        <StatCard label="Gold standard" value={data.goldStandardDocuments} meta="Highest-priority sources for prompt assembly" />
        <StatCard label="Legacy noise" value={data.legacyDocuments} meta="Excluded from prompts unless admins override" />
        <StatCard label="Workflows" value={data.workflowCount} meta="Strategic guidance, execution, drafting, and QA" />
        <StatCard label="Active users" value={data.activeUsers} meta="Seeded team accounts and operating roles" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest system actions with traceable ownership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{item.message}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.actor?.name || "System"} • {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">{formatEnumLabel(item.type)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Common admin workflows for the MVP.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { href: "/knowledge/new", label: "Create a source document" },
                { href: "/hierarchy", label: "Review source authority map" },
                { href: "/workflows/new", label: "Build a workflow template" },
                { href: "/qa", label: "Log a QA issue or trend" },
              ].map((action) => (
                <Button key={action.href} asChild variant="outline" className="justify-between">
                  <Link href={action.href}>
                    {action.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Stale or unreviewed content that can affect prompt quality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.staleDocuments.map((document) => (
                <div key={document.id} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
                  <div>
                    <p className="font-medium">{document.title}</p>
                    <p className="text-sm text-amber-800">
                      Review date {document.reviewDate ? new Date(document.reviewDate).toLocaleDateString() : "missing"}.
                    </p>
                  </div>
                </div>
              ))}
              {!data.staleDocuments.length ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  No stale current or gold-standard documents detected.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent workflow runs</CardTitle>
            <CardDescription>Latest prompt assemblies compiled for operators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentRuns.map((run) => (
              <div key={run.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{run.workflow.name}</p>
                  <Badge variant="secondary">{run.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {run.user.name} • {new Date(run.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>QA pressure points</CardTitle>
            <CardDescription>Recent issues feeding workflow and source improvements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.qaRecords.map((record) => (
              <div key={record.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{record.workflow.name}</p>
                  <Badge variant={record.severity === "HIGH" || record.severity === "CRITICAL" ? "destructive" : "warning"}>
                    {formatEnumLabel(record.issueType)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{record.scenario}</p>
              </div>
            ))}
            {!data.qaRecords.length ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                <Sparkles className="mx-auto mb-3 h-5 w-5" />
                No QA records yet.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
