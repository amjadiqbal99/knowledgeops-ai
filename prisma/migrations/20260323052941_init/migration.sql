-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEAM_MEMBER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('MANUAL', 'MARKDOWN', 'PDF', 'LINK', 'IMPORTED');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('STRATEGY', 'SOP', 'TRAINING', 'BRAND_VOICE', 'PROCESS_RULES', 'MEMBER_SUPPORT', 'CURRICULUM', 'LEADERSHIP_NOTES');

-- CreateEnum
CREATE TYPE "KnowledgeStatus" AS ENUM ('GOLD_STANDARD', 'CURRENT', 'DRAFT', 'LEGACY_NOISE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuthorityLevel" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('STRATEGIC_GUIDANCE', 'TEAM_EXECUTION', 'DRAFTING_SUPPORT', 'PROCESS_QA');

-- CreateEnum
CREATE TYPE "DraftType" AS ENUM ('INTERNAL_MEMO', 'SOP_REWRITE', 'TEAM_BRIEF', 'MEMBER_RESPONSE', 'STRATEGY_SUMMARY', 'CHECKLIST', 'QA_REVIEW_NOTES');

-- CreateEnum
CREATE TYPE "QAIssueType" AS ENUM ('HALLUCINATION', 'WEAK_GROUNDING', 'MISSING_INSTRUCTION', 'POOR_FORMATTING', 'WRONG_TONE', 'INCOMPLETE_ANSWER', 'OUTDATED_SOURCE_USAGE');

-- CreateEnum
CREATE TYPE "QASeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "QAReviewerStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_STATUS_CHANGED', 'WORKFLOW_CREATED', 'WORKFLOW_RUN', 'QA_ISSUE_LOGGED', 'REVIEW_COMPLETED', 'DRAFT_CREATED', 'INTEGRATION_UPDATED', 'USER_UPDATED');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('CLAUDE', 'GOOGLE_DRIVE', 'CLICKUP', 'SLACK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "title" TEXT,
    "department" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "sourceType" "KnowledgeSourceType" NOT NULL,
    "sourceUrl" TEXT,
    "category" "KnowledgeCategory" NOT NULL,
    "authorityLevel" "AuthorityLevel" NOT NULL,
    "status" "KnowledgeStatus" NOT NULL,
    "ownerId" TEXT,
    "department" TEXT,
    "businessUnit" TEXT,
    "companyArea" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effectiveDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "internalNotes" TEXT,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "KnowledgeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeRelation" (
    "id" TEXT NOT NULL,
    "parentDocumentId" TEXT NOT NULL,
    "childDocumentId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "businessUnit" TEXT,
    "workflowRelevance" TEXT,
    "roleRelevance" "Role",
    "companyArea" TEXT,

    CONSTRAINT "KnowledgeRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "WorkflowType" NOT NULL,
    "targetRole" "Role" NOT NULL,
    "objective" TEXT NOT NULL,
    "inputFields" JSONB NOT NULL,
    "recommendedCategories" "KnowledgeCategory"[],
    "instructionTemplate" TEXT NOT NULL,
    "guardrails" TEXT NOT NULL,
    "expectedOutputFormat" TEXT NOT NULL,
    "escalationRules" TEXT NOT NULL,
    "reviewChecklist" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDocument" (
    "workflowId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "WorkflowDocument_pkey" PRIMARY KEY ("workflowId","documentId")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskContext" TEXT NOT NULL,
    "compiledPrompt" TEXT NOT NULL,
    "compiledPayload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRunDocument" (
    "workflowRunId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "authorityRank" INTEGER NOT NULL,

    CONSTRAINT "WorkflowRunDocument_pkey" PRIMARY KEY ("workflowRunId","documentId")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "draftType" "DraftType" NOT NULL,
    "context" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "compiledRequest" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QARecord" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "scenario" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "actualResult" TEXT NOT NULL,
    "issueType" "QAIssueType" NOT NULL,
    "severity" "QASeverity" NOT NULL,
    "sourceGroundingIssue" BOOLEAN NOT NULL DEFAULT false,
    "toneIssue" BOOLEAN NOT NULL DEFAULT false,
    "complianceIssue" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "reviewerStatus" "QAReviewerStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QARecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConfig" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not connected',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeDocument_slug_key" ON "KnowledgeDocument"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_status_category_authorityLevel_idx" ON "KnowledgeDocument"("status", "category", "authorityLevel");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeTag_name_key" ON "KnowledgeTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeRelation_parentDocumentId_childDocumentId_key" ON "KnowledgeRelation"("parentDocumentId", "childDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_slug_key" ON "Workflow"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfig_provider_key" ON "IntegrationConfig"("provider");

-- CreateIndex
CREATE INDEX "_DocumentTags_B_index" ON "_DocumentTags"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRelation" ADD CONSTRAINT "KnowledgeRelation_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRelation" ADD CONSTRAINT "KnowledgeRelation_childDocumentId_fkey" FOREIGN KEY ("childDocumentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDocument" ADD CONSTRAINT "WorkflowDocument_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDocument" ADD CONSTRAINT "WorkflowDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRunDocument" ADD CONSTRAINT "WorkflowRunDocument_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRunDocument" ADD CONSTRAINT "WorkflowRunDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QARecord" ADD CONSTRAINT "QARecord_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QARecord" ADD CONSTRAINT "QARecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QARecord" ADD CONSTRAINT "QARecord_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTags" ADD CONSTRAINT "_DocumentTags_A_fkey" FOREIGN KEY ("A") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTags" ADD CONSTRAINT "_DocumentTags_B_fkey" FOREIGN KEY ("B") REFERENCES "KnowledgeTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
