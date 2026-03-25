"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WorkflowRun } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { runWorkflow } from "@/features/workflows/actions";
import { workflowRunSchema } from "@/lib/schemas";

type WorkflowRunValues = z.input<typeof workflowRunSchema>;

export function WorkflowRunForm({
  workflowId,
}: {
  workflowId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [runId, setRunId] = useState<string | null>(null);
  const form = useForm<WorkflowRunValues>({
    resolver: zodResolver(workflowRunSchema),
    defaultValues: {
      workflowId,
      taskContext: "",
      roleContext: "",
      teamContext: "",
      includeLegacy: false,
    },
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const newRunId = await runWorkflow(values);
          setRunId(newRunId);
          router.refresh();
        }),
      )}
    >
      <FormField label="Task context">
        <Textarea className="min-h-[180px]" {...form.register("taskContext")} />
      </FormField>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Role context">
          <Input {...form.register("roleContext")} placeholder="Optional role-specific constraints" />
        </FormField>
        <FormField label="Team context">
          <Input {...form.register("teamContext")} placeholder="Optional team or business unit context" />
        </FormField>
      </div>
      <label className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
        <input type="checkbox" {...form.register("includeLegacy")} />
        Allow legacy documents in the compiled package
      </label>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          The workflow run will save the full prompt package and source ordering for auditability.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? "Compiling..." : "Compile prompt package"}
        </Button>
      </div>
      {runId ? (
        <p className="rounded-md bg-secondary px-3 py-2 text-sm">
          Prompt package saved. Refreshing run history. Latest run ID: {runId}
        </p>
      ) : null}
    </form>
  );
}
