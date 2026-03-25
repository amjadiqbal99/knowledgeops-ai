"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Workflow } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createQaRecord } from "@/features/qa/actions";
import { qaIssueTypeOptions, qaReviewerStatusOptions, qaSeverityOptions } from "@/lib/constants";
import { qaFormSchema } from "@/lib/schemas";
import { formatEnumLabel } from "@/lib/utils";

type QaValues = z.input<typeof qaFormSchema>;

export function QaForm({ workflows }: { workflows: Pick<Workflow, "id" | "name">[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<QaValues>({
    resolver: zodResolver(qaFormSchema),
    defaultValues: {
      workflowId: workflows[0]?.id || "",
      scenario: "",
      expectedResult: "",
      actualResult: "",
      issueType: "WEAK_GROUNDING",
      severity: "MEDIUM",
      sourceGroundingIssue: true,
      toneIssue: false,
      complianceIssue: false,
      notes: "",
      reviewerStatus: "OPEN",
    },
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          await createQaRecord(values);
          router.refresh();
          form.reset();
        }),
      )}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <FormField label="Workflow">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("workflowId")}>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Issue type">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("issueType")}>
            {qaIssueTypeOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Severity">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("severity")}>
            {qaSeverityOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Scenario">
        <Textarea {...form.register("scenario")} />
      </FormField>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Expected result">
          <Textarea {...form.register("expectedResult")} />
        </FormField>
        <FormField label="Actual result">
          <Textarea {...form.register("actualResult")} />
        </FormField>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
          <input type="checkbox" {...form.register("sourceGroundingIssue")} />
          Source grounding issue
        </label>
        <label className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
          <input type="checkbox" {...form.register("toneIssue")} />
          Tone issue
        </label>
        <label className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
          <input type="checkbox" {...form.register("complianceIssue")} />
          Compliance issue
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Reviewer status">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("reviewerStatus")}>
            {qaReviewerStatusOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Notes">
          <Textarea {...form.register("notes")} />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Log QA issue"}
        </Button>
      </div>
    </form>
  );
}
