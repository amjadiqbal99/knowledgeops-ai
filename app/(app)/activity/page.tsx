import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { activityTypeOptions } from "@/lib/constants";
import { getActivityData } from "@/lib/data";
import { formatEnumLabel } from "@/lib/utils";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedType = typeof params.type === "string" ? params.type : undefined;
  const records = await getActivityData(selectedType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Audit key actions across document updates, workflow runs, QA logging, and review work."
      />
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-3">
            <select
              name="type"
              defaultValue={selectedType || ""}
              className="h-10 min-w-64 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All activity</option>
              {activityTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {formatEnumLabel(option)}
                </option>
              ))}
            </select>
            <button className="h-10 rounded-md border px-4 text-sm font-medium">Filter</button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 pt-6">
          {records.map((record) => (
            <div key={record.id} className="flex items-start justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{record.message}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {record.actor?.name || "System"} • {new Date(record.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline">{formatEnumLabel(record.type)}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
