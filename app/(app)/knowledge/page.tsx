import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  authorityLevelOptions,
  knowledgeCategoryOptions,
  knowledgeStatusOptions,
} from "@/lib/constants";
import { getKnowledgeList } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { statusBadgeVariants } from "@/lib/constants";
import { formatEnumLabel } from "@/lib/utils";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [documents, users] = await Promise.all([
    getKnowledgeList({
      query: typeof params.query === "string" ? params.query : undefined,
      category: typeof params.category === "string" ? params.category : undefined,
      status: typeof params.status === "string" ? params.status : undefined,
      ownerId: typeof params.ownerId === "string" ? params.ownerId : undefined,
      authorityLevel: typeof params.authority === "string" ? params.authority : undefined,
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Manage trusted operational knowledge, audit rationale, and workflow eligibility."
        action={
          <Button asChild>
            <Link href="/knowledge/new">New document</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-5">
            <input
              name="query"
              defaultValue={typeof params.query === "string" ? params.query : ""}
              placeholder="Search knowledge..."
              className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2"
            />
            <select name="category" defaultValue={typeof params.category === "string" ? params.category : ""} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">All categories</option>
              {knowledgeCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={typeof params.status === "string" ? params.status : ""} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">All statuses</option>
              {knowledgeStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <select name="authority" defaultValue={typeof params.authority === "string" ? params.authority : ""} className="h-10 flex-1 rounded-md border bg-background px-3 text-sm">
                <option value="">All authority</option>
                {authorityLevelOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatEnumLabel(option)}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline">
                Filter
              </Button>
            </div>
            <select name="ownerId" defaultValue={typeof params.ownerId === "string" ? params.ownerId : ""} className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2">
              <option value="">All owners</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </form>
        </CardContent>
      </Card>
      {documents.length ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Workflows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Link href={`/knowledge/${document.id}`} className="font-medium hover:underline">
                        {document.title}
                      </Link>
                      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{document.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariants[document.status]}>{formatEnumLabel(document.status)}</Badge>
                    </TableCell>
                    <TableCell>{formatEnumLabel(document.category)}</TableCell>
                    <TableCell>{formatEnumLabel(document.authorityLevel)}</TableCell>
                    <TableCell>{document.owner?.name || "Unassigned"}</TableCell>
                    <TableCell>{document.workflowLinks.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No knowledge documents matched"
          description="Adjust the filters or create the first source document to start building the authority map."
          ctaHref="/knowledge/new"
          ctaLabel="Create document"
        />
      )}
    </div>
  );
}
