import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeForm } from "@/features/knowledge/components/knowledge-form";
import { statusBadgeVariants } from "@/lib/constants";
import { getKnowledgeDocument } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatEnumLabel } from "@/lib/utils";

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [document, owners, workflows, legacyPeers] = await Promise.all([
    getKnowledgeDocument(id),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.workflow.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.knowledgeDocument.findMany({
      where: {
        status: "LEGACY_NOISE",
      },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!document) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={document.title}
        description="Review source authority, workflow relevance, and the underlying content."
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge variant={statusBadgeVariants[document.status]}>{formatEnumLabel(document.status)}</Badge>
              <Badge variant="outline">{formatEnumLabel(document.category)}</Badge>
              <Badge variant="outline">{formatEnumLabel(document.authorityLevel)}</Badge>
            </div>
            <CardTitle className="mt-3">Source overview</CardTitle>
            <CardDescription>{document.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-medium">Owner</p>
                <p className="text-muted-foreground">{document.owner?.name || "Unassigned"}</p>
              </div>
              <div>
                <p className="font-medium">Review date</p>
                <p className="text-muted-foreground">
                  {document.reviewDate ? new Date(document.reviewDate).toLocaleDateString() : "Not set"}
                </p>
              </div>
            </div>
            <div>
              <p className="font-medium">Internal notes</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{document.internalNotes || "No notes."}</p>
            </div>
            <div>
              <p className="font-medium">Status rationale</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{document.rationale || "No rationale captured."}</p>
            </div>
            <div>
              <p className="font-medium">Content</p>
              <div className="mt-2 rounded-lg border bg-muted/40 p-4 whitespace-pre-wrap">{document.content}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Document relationships</CardTitle>
            <CardDescription>View trust hierarchy and compare related legacy material.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-2 font-medium">Overrides</p>
              <div className="space-y-2">
                {document.childRelations.map((relation) => (
                  <div key={relation.id} className="rounded-lg border p-3">
                    Overrides <span className="font-medium">{relation.parentDocument.title}</span>
                  </div>
                ))}
                {!document.childRelations.length ? <p className="text-muted-foreground">No downstream override relationships.</p> : null}
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium">Workflow usage</p>
              <div className="flex flex-wrap gap-2">
                {document.workflowLinks.map((link) => (
                  <Badge key={link.workflowId} variant="secondary">
                    {link.workflow.name}
                  </Badge>
                ))}
                {!document.workflowLinks.length ? <p className="text-muted-foreground">Not linked to workflows yet.</p> : null}
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium">Legacy comparison set</p>
              <div className="space-y-2">
                {legacyPeers.map((peer) => (
                  <div key={peer.id} className="rounded-lg border p-3">
                    <p className="font-medium">{peer.title}</p>
                    <p className="text-muted-foreground">{peer.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit metadata</TabsTrigger>
          <TabsTrigger value="tags">Tags and hierarchy</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Card>
            <CardContent className="pt-6">
              <KnowledgeForm owners={owners} workflows={workflows} initial={document} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tags">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
                {!document.tags.length ? <p className="text-sm text-muted-foreground">No tags assigned.</p> : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
