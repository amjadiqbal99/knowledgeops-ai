import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getWorkflowList } from "@/lib/data";
import { formatEnumLabel } from "@/lib/utils";

export default async function WorkflowsPage() {
  const workflows = await getWorkflowList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        description="Operational templates that compile trusted knowledge into Claude-ready prompt packages."
        action={
          <Button asChild>
            <Link href="/workflows/new">New workflow</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target role</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead>Runs</TableHead>
                <TableHead>QA issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <Link href={`/workflows/${workflow.id}`} className="font-medium hover:underline">
                      {workflow.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{workflow.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatEnumLabel(workflow.type)}</Badge>
                  </TableCell>
                  <TableCell>{formatEnumLabel(workflow.targetRole)}</TableCell>
                  <TableCell>{workflow.documents.length}</TableCell>
                  <TableCell>{workflow.runs.length}</TableCell>
                  <TableCell>{workflow.qaRecords.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
