import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 py-10">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        {ctaHref && ctaLabel ? <Button asChild><a href={ctaHref}>{ctaLabel}</a></Button> : null}
      </CardContent>
    </Card>
  );
}
