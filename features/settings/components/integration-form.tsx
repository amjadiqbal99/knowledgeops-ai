"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IntegrationConfig, IntegrationProvider } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateIntegration } from "@/features/settings/actions";
import { providerDescriptions } from "@/lib/constants";
import { integrationFormSchema } from "@/lib/schemas";

type IntegrationValues = z.input<typeof integrationFormSchema>;

export function IntegrationForm({
  provider,
  config,
}: {
  provider: IntegrationProvider;
  config?: IntegrationConfig | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<IntegrationValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      provider,
      enabled: config?.enabled || false,
      status: config?.status || "Not connected",
      config: JSON.stringify(config?.config || { notes: "" }, null, 2),
    },
  });

  return (
    <form
      className="grid gap-4 rounded-xl border p-5"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          await updateIntegration(values);
          router.refresh();
        }),
      )}
    >
      <div>
        <h3 className="font-semibold">{provider.replaceAll("_", " ")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{providerDescriptions[provider]}</p>
      </div>
      <label className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
        <input type="checkbox" {...form.register("enabled")} />
        Enable placeholder integration
      </label>
      <FormField label="Status">
        <Input {...form.register("status")} />
      </FormField>
      <FormField label="Config JSON">
        <Textarea className="min-h-[140px] font-mono text-xs" {...form.register("config")} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
