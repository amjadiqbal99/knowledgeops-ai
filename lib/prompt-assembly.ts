import { KnowledgeStatus, Prisma, Workflow } from "@prisma/client";

type WorkflowWithDocuments = Prisma.WorkflowGetPayload<{
  include: {
    documents: {
      include: {
        document: {
          include: {
            tags: true;
          };
        };
      };
    };
  };
}>;

type PromptDocument = WorkflowWithDocuments["documents"][number]["document"];

function statusRank(status: KnowledgeStatus) {
  switch (status) {
    case "GOLD_STANDARD":
      return 5;
    case "CURRENT":
      return 4;
    case "DRAFT":
      return 3;
    case "ARCHIVED":
      return 2;
    case "LEGACY_NOISE":
      return 1;
  }
}

export function orderDocumentsForPrompt(documents: PromptDocument[], includeLegacy: boolean) {
  return documents
    .filter((document) => includeLegacy || document.status !== "LEGACY_NOISE")
    .sort((a, b) => {
      const statusDelta = statusRank(b.status) - statusRank(a.status);
      if (statusDelta !== 0) {
        return statusDelta;
      }
      return a.title.localeCompare(b.title);
    });
}

export function compilePromptPackage(params: {
  workflow: WorkflowWithDocuments;
  taskContext: string;
  roleContext?: string;
  teamContext?: string;
  includeLegacy?: boolean;
}) {
  const orderedDocuments = orderDocumentsForPrompt(
    params.workflow.documents.map((entry) => entry.document),
    params.includeLegacy ?? false,
  );

  const sourceCitations = orderedDocuments.map((document, index) => ({
    rank: index + 1,
    id: document.id,
    title: document.title,
    status: document.status,
    category: document.category,
    authorityLevel: document.authorityLevel,
    rationale: document.rationale,
  }));

  const systemContext = [
    `Workflow: ${params.workflow.name}`,
    `Objective: ${params.workflow.objective}`,
    `Guardrails: ${params.workflow.guardrails}`,
    `Expected output: ${params.workflow.expectedOutputFormat}`,
    `Escalation rules: ${params.workflow.escalationRules}`,
  ].join("\n");

  const businessContext = orderedDocuments
    .map(
      (document, index) =>
        `[${index + 1}] ${document.title} (${document.status}, ${document.category}, ${document.authorityLevel})\n${document.content}`,
    )
    .join("\n\n");

  const promptPreview = [
    "SYSTEM CONTEXT",
    systemContext,
    "",
    "BUSINESS CONTEXT",
    businessContext,
    "",
    "ROLE CONTEXT",
    params.roleContext || "Use the workflow target role defaults.",
    "",
    "TEAM CONTEXT",
    params.teamContext || "No extra team context provided.",
    "",
    "USER TASK",
    params.taskContext,
    "",
    "REVIEW CHECKLIST",
    params.workflow.reviewChecklist,
  ].join("\n");

  return {
    orderedDocuments,
    promptPreview,
    payload: {
      workflowId: params.workflow.id,
      workflowName: params.workflow.name,
      systemContext,
      businessContext,
      sourceCitations,
      userTaskContext: params.taskContext,
      roleContext: params.roleContext || null,
      teamContext: params.teamContext || null,
      outputRequirements: params.workflow.expectedOutputFormat,
      reviewChecklist: params.workflow.reviewChecklist,
    },
  };
}
