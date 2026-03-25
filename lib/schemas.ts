import {
  AuthorityLevel,
  DraftType,
  IntegrationProvider,
  KnowledgeCategory,
  KnowledgeSourceType,
  KnowledgeStatus,
  QAIssueType,
  QAReviewerStatus,
  QASeverity,
  Role,
  WorkflowType,
} from "@prisma/client";
import { z } from "zod";

export const knowledgeFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(8),
  content: z.string().min(20),
  sourceType: z.nativeEnum(KnowledgeSourceType),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  category: z.nativeEnum(KnowledgeCategory),
  authorityLevel: z.nativeEnum(AuthorityLevel),
  status: z.nativeEnum(KnowledgeStatus),
  ownerId: z.string().optional().or(z.literal("")),
  department: z.string().optional(),
  businessUnit: z.string().optional(),
  companyArea: z.string().optional(),
  tags: z.string().optional(),
  version: z.string().min(1),
  effectiveDate: z.string().optional(),
  reviewDate: z.string().optional(),
  internalNotes: z.string().optional(),
  rationale: z.string().optional(),
  workflowIds: z.array(z.string()),
});

export const workflowFormSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(12),
  type: z.nativeEnum(WorkflowType),
  targetRole: z.nativeEnum(Role),
  objective: z.string().min(10),
  inputFields: z.string().min(5),
  recommendedCategories: z.array(z.nativeEnum(KnowledgeCategory)).min(1),
  instructionTemplate: z.string().min(20),
  guardrails: z.string().min(10),
  expectedOutputFormat: z.string().min(8),
  escalationRules: z.string().min(8),
  reviewChecklist: z.string().min(8),
  documentIds: z.array(z.string()),
});

export const workflowRunSchema = z.object({
  workflowId: z.string().min(1),
  taskContext: z.string().min(10),
  roleContext: z.string().optional(),
  teamContext: z.string().optional(),
  includeLegacy: z.boolean(),
});

export const draftFormSchema = z.object({
  title: z.string().min(3),
  draftType: z.nativeEnum(DraftType),
  workflowId: z.string().min(1),
  context: z.string().min(10),
});

export const qaFormSchema = z.object({
  workflowId: z.string().min(1),
  scenario: z.string().min(8),
  expectedResult: z.string().min(8),
  actualResult: z.string().min(8),
  issueType: z.nativeEnum(QAIssueType),
  severity: z.nativeEnum(QASeverity),
  sourceGroundingIssue: z.boolean(),
  toneIssue: z.boolean(),
  complianceIssue: z.boolean(),
  notes: z.string().optional(),
  reviewerStatus: z.nativeEnum(QAReviewerStatus),
});

export const profileFormSchema = z.object({
  name: z.string().min(2),
  title: z.string().optional(),
  department: z.string().optional(),
});

export const integrationFormSchema = z.object({
  provider: z.nativeEnum(IntegrationProvider),
  enabled: z.boolean(),
  status: z.string().min(2),
  config: z.string().min(2),
});
