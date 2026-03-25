import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHierarchyData } from "@/lib/data";
import { statusBadgeVariants } from "@/lib/constants";
import { formatEnumLabel } from "@/lib/utils";

export default async function HierarchyPage() {
  const relations = await getHierarchyData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Source-of-Truth Hierarchy"
        description="Visualize which documents override others across business units, workflows, and roles."
      />
      <Card>
        <CardHeader>
          <CardTitle>Priority model</CardTitle>
          <CardDescription>Annual strategy to legacy material, with explicit override paths.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {relations.map((relation) => (
            <div key={relation.id} className="rounded-xl border p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{relation.parentDocument.title}</span>
                    <span className="text-muted-foreground">overrides</span>
                    <span className="font-semibold">{relation.childDocument.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {relation.relationType} • {relation.businessUnit || "All business units"} • {relation.companyArea || "General company area"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusBadgeVariants[relation.parentDocument.status]}>
                    {formatEnumLabel(relation.parentDocument.status)}
                  </Badge>
                  <Badge variant="outline">{relation.workflowRelevance || "All workflows"}</Badge>
                  <Badge variant="outline">{relation.roleRelevance ? formatEnumLabel(relation.roleRelevance) : "All roles"}</Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
