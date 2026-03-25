"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Workflow } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDraft } from "@/features/drafts/actions";
import { draftTypeOptions } from "@/lib/constants";
import { draftFormSchema } from "@/lib/schemas";
import { formatEnumLabel } from "@/lib/utils";

type DraftValues = z.input<typeof draftFormSchema>;

export function DraftForm({ workflows }: { workflows: Pick<Workflow, "id" | "name">[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<DraftValues>({
    resolver: zodResolver(draftFormSchema),
    defaultValues: {
      title: "",
      draftType: "TEAM_BRIEF",
      workflowId: workflows[0]?.id || "",
      context: "",
    },
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          await createDraft(values);
          router.refresh();
          form.reset();
        }),
      )}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <FormField label="Title">
          <Input {...form.register("title")} />
        </FormField>
        <FormField label="Draft type">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("draftType")}>
            {draftTypeOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Workflow">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("workflowId")}>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Draft context">
        <Textarea className="min-h-[180px]" {...form.register("context")} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Create draft package"}
        </Button>
      </div>
    </form>
  );
}
