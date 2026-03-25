"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KnowledgeDocument, User, Workflow } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/features/forms/multi-select";
import {
  authorityLevelOptions,
  knowledgeCategoryOptions,
  knowledgeStatusOptions,
} from "@/lib/constants";
import { knowledgeFormSchema } from "@/lib/schemas";
import { formatEnumLabel } from "@/lib/utils";
import { upsertKnowledgeDocument } from "@/features/knowledge/actions";

type KnowledgeValues = z.input<typeof knowledgeFormSchema>;

export function KnowledgeForm({
  owners,
  workflows,
  initial,
}: {
  owners: Pick<User, "id" | "name">[];
  workflows: Pick<Workflow, "id" | "name">[];
  initial?: (KnowledgeDocument & {
    tags: { name: string }[];
    workflowLinks: { workflowId: string }[];
  }) | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<KnowledgeValues>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: {
      title: initial?.title || "",
      description: initial?.description || "",
      content: initial?.content || "",
      sourceType: initial?.sourceType || "MANUAL",
      sourceUrl: initial?.sourceUrl || "",
      category: initial?.category || "SOP",
      authorityLevel: initial?.authorityLevel || "MEDIUM",
      status: initial?.status || "CURRENT",
      ownerId: initial?.ownerId || "",
      department: initial?.department || "",
      businessUnit: initial?.businessUnit || "",
      companyArea: initial?.companyArea || "",
      tags: initial?.tags.map((tag) => tag.name).join(", ") || "",
      version: initial?.version || "1.0",
      effectiveDate: initial?.effectiveDate ? new Date(initial.effectiveDate).toISOString().slice(0, 10) : undefined,
      reviewDate: initial?.reviewDate ? new Date(initial.reviewDate).toISOString().slice(0, 10) : undefined,
      internalNotes: initial?.internalNotes || "",
      rationale: initial?.rationale || "",
      workflowIds: initial?.workflowLinks.map((link) => link.workflowId) || [],
    },
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          await upsertKnowledgeDocument(values, initial?.id);
          router.push("/knowledge");
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Title">
          <Input {...form.register("title")} />
        </FormField>
        <FormField label="Version">
          <Input {...form.register("version")} />
        </FormField>
      </div>
      <FormField label="Description">
        <Textarea {...form.register("description")} />
      </FormField>
      <FormField label="Content" hint="Use plain text or markdown-style structure for the MVP.">
        <Textarea className="min-h-[260px]" {...form.register("content")} />
      </FormField>
      <div className="grid gap-6 lg:grid-cols-3">
        <FormField label="Source type">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("sourceType")}>
            {["MANUAL", "MARKDOWN", "PDF", "LINK", "IMPORTED"].map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Category">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("category")}>
            {knowledgeCategoryOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("status")}>
            {knowledgeStatusOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <FormField label="Authority level">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("authorityLevel")}>
            {authorityLevelOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Owner">
          <select className="h-10 rounded-md border bg-background px-3" {...form.register("ownerId")}>
            <option value="">Unassigned</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Source URL">
          <Input {...form.register("sourceUrl")} />
        </FormField>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <FormField label="Department">
          <Input {...form.register("department")} />
        </FormField>
        <FormField label="Business unit">
          <Input {...form.register("businessUnit")} />
        </FormField>
        <FormField label="Company area">
          <Input {...form.register("companyArea")} />
        </FormField>
        <FormField label="Tags">
          <Input {...form.register("tags")} placeholder="ops, onboarding, voice" />
        </FormField>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Effective date">
          <Input type="date" {...form.register("effectiveDate")} />
        </FormField>
        <FormField label="Review date">
          <Input type="date" {...form.register("reviewDate")} />
        </FormField>
      </div>
      <FormField label="Workflow eligibility">
        <MultiSelect
          options={workflows.map((workflow) => ({ label: workflow.name, value: workflow.id }))}
          value={form.watch("workflowIds")}
          onChange={(value) => form.setValue("workflowIds", value)}
        />
      </FormField>
      <FormField label="Internal notes">
        <Textarea {...form.register("internalNotes")} />
      </FormField>
      <FormField label="Status rationale">
        <Textarea {...form.register("rationale")} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : initial ? "Update document" : "Create document"}
        </Button>
      </div>
    </form>
  );
}
