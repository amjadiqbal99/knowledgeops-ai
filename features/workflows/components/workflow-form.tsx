"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KnowledgeDocument } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/features/forms/multi-select";
import { createWorkflow } from "@/features/workflows/actions";
import {
  knowledgeCategoryOptions,
  roleOptions,
  workflowTypeOptions,
} from "@/lib/constants";
import { workflowFormSchema } from "@/lib/schemas";
import { formatEnumLabel } from "@/lib/utils";

type WorkflowValues = z.input<typeof workflowFormSchema>;

export function WorkflowForm({
  documents,
}: {
  documents: Pick<KnowledgeDocument, "id" | "title">[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<WorkflowValues>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "TEAM_EXECUTION",
      targetRole: "TEAM_MEMBER",
      objective: "",
      inputFields: JSON.stringify(
        [
          { key: "task_context", label: "Task context", required: true },
          { key: "team_context", label: "Team context", required: false },
        ],
        null,
        2,
      ),
      recommendedCategories: ["SOP", "PROCESS_RULES"],
      instructionTemplate: "",
      guardrails: "",
      expectedOutputFormat: "",
      escalationRules: "",
      reviewChecklist: "",
      documentIds: [],
    },
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          await createWorkflow(values);
          router.push("/workflows");
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Workflow name">
          <Input {...form.register("name")} />
        </FormField>
        <FormField label="Target role">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("targetRole")}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Workflow type">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("type")}>
            {workflowTypeOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Recommended source categories">
          <MultiSelect
            options={knowledgeCategoryOptions.map((option) => ({
              label: formatEnumLabel(option),
              value: option,
            }))}
            value={form.watch("recommendedCategories")}
            onChange={(value) =>
              form.setValue("recommendedCategories", value as WorkflowValues["recommendedCategories"])
            }
          />
        </FormField>
      </div>
      <FormField label="Description">
        <Textarea {...form.register("description")} />
      </FormField>
      <FormField label="Objective">
        <Textarea {...form.register("objective")} />
      </FormField>
      <FormField label="Input fields JSON">
        <Textarea className="min-h-[160px] font-mono text-xs" {...form.register("inputFields")} />
      </FormField>
      <FormField label="Instruction template">
        <Textarea className="min-h-[180px]" {...form.register("instructionTemplate")} />
      </FormField>
      <div className="grid gap-6 lg:grid-cols-3">
        <FormField label="Guardrails">
          <Textarea {...form.register("guardrails")} />
        </FormField>
        <FormField label="Expected output format">
          <Textarea {...form.register("expectedOutputFormat")} />
        </FormField>
        <FormField label="Escalation rules">
          <Textarea {...form.register("escalationRules")} />
        </FormField>
      </div>
      <FormField label="Review checklist">
        <Textarea {...form.register("reviewChecklist")} />
      </FormField>
      <FormField label="Included knowledge sources">
        <MultiSelect
          options={documents.map((document) => ({ label: document.title, value: document.id }))}
          value={form.watch("documentIds")}
          onChange={(value) => form.setValue("documentIds", value)}
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Create workflow"}
        </Button>
      </div>
    </form>
  );
}
