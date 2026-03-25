import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSearchResults } from "@/lib/data";
import { formatEnumLabel } from "@/lib/utils";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const results = query ? await getSearchResults(query) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Search"
        description="Search across knowledge documents, workflows, QA records, and users."
      />
      {!results ? (
        <EmptyState
          title="Start with a search query"
          description="Use the header search to find documents, workflows, QA logs, or users."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.documents.map((document) => (
                <Link key={document.id} href={`/knowledge/${document.id}`} className="block rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{document.title}</p>
                    <Badge variant="outline">{formatEnumLabel(document.status)}</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Workflows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.workflows.map((workflow) => (
                <Link key={workflow.id} href={`/workflows/${workflow.id}`} className="block rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{workflow.name}</p>
                    <Badge variant="outline">{formatEnumLabel(workflow.type)}</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>QA Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.qaRecords.map((record) => (
                <div key={record.id} className="rounded-lg border p-4">
                  <p className="font-medium">{record.workflow.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{record.scenario}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.users.map((user) => (
                <div key={user.id} className="rounded-lg border p-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.email} • {formatEnumLabel(user.role)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
