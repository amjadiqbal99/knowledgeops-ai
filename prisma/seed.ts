import bcrypt from "bcryptjs";
import {
  ActivityType,
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
  type KnowledgeDocument,
  type Workflow,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { compilePromptPackage } from "@/lib/prompt-assembly";

async function main() {
  await prisma.workflowRunDocument.deleteMany();
  await prisma.workflowRun.deleteMany();
  await prisma.qARecord.deleteMany();
  await prisma.draft.deleteMany();
  await prisma.workflowDocument.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.knowledgeRelation.deleteMany();
  await prisma.knowledgeDocument.deleteMany();
  await prisma.knowledgeTag.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.integrationConfig.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, member, reviewer] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Amjad Iqbal",
        email: "amjadiqbal@claudeopsos.com",
        passwordHash,
        role: Role.ADMIN,
        title: "Director of Operations",
        department: "Operations",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jordan Lee",
        email: "jordan@claudeopsos.com",
        passwordHash,
        role: Role.TEAM_MEMBER,
        title: "Member Success Lead",
        department: "Member Success",
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Shah",
        email: "priya@claudeopsos.com",
        passwordHash,
        role: Role.REVIEWER,
        title: "Quality Reviewer",
        department: "Quality",
      },
    }),
  ]);

  const tagNames = [
    "strategy",
    "onboarding",
    "support",
    "voice",
    "quality",
    "compliance",
    "execution",
    "curriculum",
  ];

  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.knowledgeTag.create({
        data: { name },
      }),
    ),
  );

  const knowledgeSeeds = [
    {
      title: "2026 Annual Strategy",
      description: "Company-wide strategic priorities, outcome metrics, and execution principles.",
      content: "Top priority is retention through proactive support. Every team initiative should tie back to trust, speed, or measurable member outcomes.",
      sourceType: KnowledgeSourceType.MANUAL,
      category: KnowledgeCategory.STRATEGY,
      authorityLevel: AuthorityLevel.CRITICAL,
      status: KnowledgeStatus.GOLD_STANDARD,
      department: "Leadership",
      businessUnit: "Company",
      companyArea: "Strategy",
      version: "2026.1",
      ownerId: admin.id,
      tagIndexes: [0, 6],
    },
    {
      title: "Member Support SOP",
      description: "Operating procedure for support handling, escalations, and tone expectations.",
      content: "Support agents should resolve within defined SLAs, use approved tone guidance, and escalate policy-sensitive cases before sending.",
      sourceType: KnowledgeSourceType.MARKDOWN,
      category: KnowledgeCategory.SOP,
      authorityLevel: AuthorityLevel.HIGH,
      status: KnowledgeStatus.GOLD_STANDARD,
      department: "Member Success",
      businessUnit: "Support",
      companyArea: "Support",
      version: "3.2",
      ownerId: member.id,
      tagIndexes: [1, 2, 3],
    },
    {
      title: "Brand Voice Guide",
      description: "Approved internal and member-facing voice standards.",
      content: "Write with clarity, warmth, and directness. Avoid overpromising. Use confident but non-defensive language.",
      sourceType: KnowledgeSourceType.MARKDOWN,
      category: KnowledgeCategory.BRAND_VOICE,
      authorityLevel: AuthorityLevel.HIGH,
      status: KnowledgeStatus.GOLD_STANDARD,
      department: "Marketing",
      businessUnit: "Brand",
      companyArea: "Communications",
      version: "2.0",
      ownerId: admin.id,
      tagIndexes: [3],
    },
    {
      title: "Member Escalation Rules",
      description: "Escalation matrix for high-risk support and policy-sensitive requests.",
      content: "Escalate when financial disputes, refunds beyond threshold, legal risk, or churn risk patterns are present.",
      sourceType: KnowledgeSourceType.MANUAL,
      category: KnowledgeCategory.PROCESS_RULES,
      authorityLevel: AuthorityLevel.HIGH,
      status: KnowledgeStatus.CURRENT,
      department: "Operations",
      businessUnit: "Support",
      companyArea: "Risk",
      version: "1.4",
      ownerId: admin.id,
      tagIndexes: [5, 2],
    },
    {
      title: "Team Onboarding Curriculum",
      description: "Training sequence for new operators learning support and QA workflows.",
      content: "Week 1 covers voice, SOPs, and shadowing. Week 2 covers escalation and QA calibration.",
      sourceType: KnowledgeSourceType.MARKDOWN,
      category: KnowledgeCategory.TRAINING,
      authorityLevel: AuthorityLevel.MEDIUM,
      status: KnowledgeStatus.CURRENT,
      department: "People Ops",
      businessUnit: "Training",
      companyArea: "Enablement",
      version: "1.0",
      ownerId: reviewer.id,
      tagIndexes: [1, 7],
    },
    {
      title: "Leadership Weekly Notes",
      description: "Internal leadership notes summarizing key experiments and operational risks.",
      content: "Prioritize documenting source conflicts. Reduce duplicate docs in shared drives. Tighten SLA exception handling.",
      sourceType: KnowledgeSourceType.MANUAL,
      category: KnowledgeCategory.LEADERSHIP_NOTES,
      authorityLevel: AuthorityLevel.MEDIUM,
      status: KnowledgeStatus.CURRENT,
      department: "Leadership",
      businessUnit: "Company",
      companyArea: "Operations",
      version: "2026-W11",
      ownerId: admin.id,
      tagIndexes: [0, 4],
    },
    {
      title: "Curriculum Update Checklist",
      description: "Checklist for revising training programs when SOPs change.",
      content: "When SOP or policy changes, update curriculum slides, practice scenarios, and reviewer calibration notes within five business days.",
      sourceType: KnowledgeSourceType.MANUAL,
      category: KnowledgeCategory.CURRICULUM,
      authorityLevel: AuthorityLevel.MEDIUM,
      status: KnowledgeStatus.CURRENT,
      department: "Training",
      businessUnit: "Enablement",
      companyArea: "Curriculum",
      version: "1.3",
      ownerId: reviewer.id,
      tagIndexes: [7, 4],
    },
    {
      title: "SOP Rewrite Draft",
      description: "Draft revision of the support SOP awaiting approval.",
      content: "Proposed revision introduces more explicit triage definitions and reviewer checkpoints before escalation.",
      sourceType: KnowledgeSourceType.MARKDOWN,
      category: KnowledgeCategory.SOP,
      authorityLevel: AuthorityLevel.MEDIUM,
      status: KnowledgeStatus.DRAFT,
      department: "Member Success",
      businessUnit: "Support",
      companyArea: "Support",
      version: "4.0-draft",
      ownerId: member.id,
      tagIndexes: [1, 4],
    },
    {
      title: "Archived Sprint Playbook",
      description: "Retired tactical guide from an earlier operating model.",
      content: "Historical playbook retained for context only. Not valid for current operations.",
      sourceType: KnowledgeSourceType.PDF,
      category: KnowledgeCategory.SOP,
      authorityLevel: AuthorityLevel.LOW,
      status: KnowledgeStatus.ARCHIVED,
      department: "Operations",
      businessUnit: "Ops",
      companyArea: "Execution",
      version: "2024.4",
      ownerId: admin.id,
      tagIndexes: [6],
    },
    {
      title: "Legacy Canned Responses",
      description: "Old response templates from the previous support structure.",
      content: "Contains outdated language and no longer reflects approved support positioning.",
      sourceType: KnowledgeSourceType.LINK,
      category: KnowledgeCategory.MEMBER_SUPPORT,
      authorityLevel: AuthorityLevel.LOW,
      status: KnowledgeStatus.LEGACY_NOISE,
      department: "Member Success",
      businessUnit: "Support",
      companyArea: "Support",
      version: "legacy",
      ownerId: member.id,
      tagIndexes: [2, 3],
    },
    {
      title: "Legacy QA Rubric",
      description: "Old QA checklist before source-grounding requirements were introduced.",
      content: "Previous rubric scored formatting and tone but did not require citation or source hierarchy review.",
      sourceType: KnowledgeSourceType.PDF,
      category: KnowledgeCategory.PROCESS_RULES,
      authorityLevel: AuthorityLevel.LOW,
      status: KnowledgeStatus.LEGACY_NOISE,
      department: "Quality",
      businessUnit: "QA",
      companyArea: "Quality",
      version: "legacy",
      ownerId: reviewer.id,
      tagIndexes: [4],
    },
    {
      title: "Department SOP Checklist",
      description: "Department-level checklist to convert strategy into repeatable execution behaviors.",
      content: "Translate strategy into weekly targets, defined owners, and reviewer-approved exception logic.",
      sourceType: KnowledgeSourceType.MANUAL,
      category: KnowledgeCategory.SOP,
      authorityLevel: AuthorityLevel.HIGH,
      status: KnowledgeStatus.CURRENT,
      department: "Operations",
      businessUnit: "Ops",
      companyArea: "Execution",
      version: "2.2",
      ownerId: admin.id,
      tagIndexes: [6, 0],
    },
  ];

  const documents: KnowledgeDocument[] = [];
  for (const seed of knowledgeSeeds) {
    const doc = await prisma.knowledgeDocument.create({
      data: {
        title: seed.title,
        slug: seed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description: seed.description,
        content: seed.content,
        sourceType: seed.sourceType,
        category: seed.category,
        authorityLevel: seed.authorityLevel,
        status: seed.status,
        department: seed.department,
        businessUnit: seed.businessUnit,
        companyArea: seed.companyArea,
        version: seed.version,
        ownerId: seed.ownerId,
        effectiveDate: new Date("2026-01-01"),
        reviewDate: new Date("2026-06-30"),
        internalNotes: "Seeded example record for MVP validation.",
        rationale: seed.status === KnowledgeStatus.LEGACY_NOISE
          ? "Excluded from prompt assembly because it conflicts with approved operating guidance."
          : "Approved for use based on current ownership and review cycle.",
        tags: {
          connect: seed.tagIndexes.map((index) => ({ id: tags[index].id })),
        },
      },
    });
    documents.push(doc);
  }

  const workflowSeeds = [
    {
      name: "Strategic Guidance Pack",
      slug: "strategic-guidance-pack",
      description: "Translate strategic direction into decision-ready guidance for leaders and operators.",
      type: WorkflowType.STRATEGIC_GUIDANCE,
      targetRole: Role.ADMIN,
      objective: "Interpret strategy through approved hierarchy and output a concrete recommendation.",
      inputFields: [{ key: "initiative", label: "Initiative", required: true }],
      recommendedCategories: [KnowledgeCategory.STRATEGY, KnowledgeCategory.LEADERSHIP_NOTES, KnowledgeCategory.SOP],
      instructionTemplate: "Review strategic sources first, then connect them to role-specific operational action.",
      guardrails: "Do not invent priorities. Cite the authority order and flag conflicts.",
      expectedOutputFormat: "Decision summary, implications, recommended next steps, escalation points.",
      escalationRules: "Escalate when strategy conflicts with department SOPs or missing ownership.",
      reviewChecklist: "Confirmed strategy sources, checked current SOP alignment, noted open risks.",
      documentIndexes: [0, 5, 11],
    },
    {
      name: "Team Execution Brief",
      slug: "team-execution-brief",
      description: "Convert task requests into clear execution steps using SOPs and process rules.",
      type: WorkflowType.TEAM_EXECUTION,
      targetRole: Role.TEAM_MEMBER,
      objective: "Produce a grounded execution brief for operational work.",
      inputFields: [{ key: "task", label: "Task", required: true }],
      recommendedCategories: [KnowledgeCategory.SOP, KnowledgeCategory.PROCESS_RULES, KnowledgeCategory.TRAINING],
      instructionTemplate: "Assemble current SOPs, rules, and team notes into a step-by-step execution brief.",
      guardrails: "Prefer gold-standard or current documents. Never rely on legacy docs by default.",
      expectedOutputFormat: "Summary, execution steps, guardrails, escalation triggers, checklist.",
      escalationRules: "Escalate if required information is missing or sources disagree.",
      reviewChecklist: "Source order is correct, workflow is role-appropriate, no outdated instructions included.",
      documentIndexes: [1, 3, 4, 11],
    },
    {
      name: "Drafting Support Builder",
      slug: "drafting-support-builder",
      description: "Create a structured request package for drafting internal or member-facing outputs.",
      type: WorkflowType.DRAFTING_SUPPORT,
      targetRole: Role.TEAM_MEMBER,
      objective: "Package the right source context and output constraints for draft generation.",
      inputFields: [{ key: "deliverable", label: "Deliverable", required: true }],
      recommendedCategories: [KnowledgeCategory.BRAND_VOICE, KnowledgeCategory.SOP, KnowledgeCategory.MEMBER_SUPPORT],
      instructionTemplate: "Use trusted source guidance to compile a concise drafting packet with source citations.",
      guardrails: "Match brand voice and approved escalation guidance. Mark assumptions clearly.",
      expectedOutputFormat: "Audience, objective, draft guidance, source citations, requested deliverable.",
      escalationRules: "Escalate if brand or policy guidance is ambiguous.",
      reviewChecklist: "Tone aligned, grounding present, sources rank correctly, open questions isolated.",
      documentIndexes: [1, 2, 3],
    },
    {
      name: "Process QA Audit",
      slug: "process-qa-audit",
      description: "Evaluate workflow outputs for grounding, formatting, tone, and compliance gaps.",
      type: WorkflowType.PROCESS_QA,
      targetRole: Role.REVIEWER,
      objective: "Assess whether workflow outputs followed approved instructions and source hierarchy.",
      inputFields: [{ key: "output", label: "Output", required: true }],
      recommendedCategories: [KnowledgeCategory.PROCESS_RULES, KnowledgeCategory.TRAINING, KnowledgeCategory.SOP],
      instructionTemplate: "Review the output against source hierarchy, workflow rules, and reviewer checklist.",
      guardrails: "Flag outdated source usage, weak grounding, and missing escalation behavior.",
      expectedOutputFormat: "Pass/fail judgment, issue list, severity, recommendations.",
      escalationRules: "Escalate critical compliance or grounding failures immediately.",
      reviewChecklist: "Checked instructions, source package, authority order, and issue classification.",
      documentIndexes: [1, 3, 4, 6],
    },
  ];

  const workflows: Workflow[] = [];
  for (const seed of workflowSeeds) {
    const workflow = await prisma.workflow.create({
      data: {
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        type: seed.type,
        targetRole: seed.targetRole,
        objective: seed.objective,
        inputFields: seed.inputFields,
        recommendedCategories: seed.recommendedCategories,
        instructionTemplate: seed.instructionTemplate,
        guardrails: seed.guardrails,
        expectedOutputFormat: seed.expectedOutputFormat,
        escalationRules: seed.escalationRules,
        reviewChecklist: seed.reviewChecklist,
        documents: {
          create: seed.documentIndexes.map((index) => ({
            documentId: documents[index].id,
          })),
        },
      },
    });
    workflows.push(workflow);
  }

  await prisma.knowledgeRelation.createMany({
    data: [
      {
        parentDocumentId: documents[0].id,
        childDocumentId: documents[11].id,
        relationType: "strategy_overrides_department_sop",
        businessUnit: "Operations",
        workflowRelevance: "Strategic Guidance, Team Execution",
        roleRelevance: Role.ADMIN,
        companyArea: "Execution",
      },
      {
        parentDocumentId: documents[11].id,
        childDocumentId: documents[9].id,
        relationType: "current_overrides_legacy",
        businessUnit: "Support",
        workflowRelevance: "Team Execution, Drafting Support",
        roleRelevance: Role.TEAM_MEMBER,
        companyArea: "Support",
      },
      {
        parentDocumentId: documents[1].id,
        childDocumentId: documents[7].id,
        relationType: "approved_sop_overrides_draft",
        businessUnit: "Support",
        workflowRelevance: "Team Execution",
        roleRelevance: Role.TEAM_MEMBER,
        companyArea: "Support",
      },
      {
        parentDocumentId: documents[3].id,
        childDocumentId: documents[10].id,
        relationType: "current_rules_overrides_legacy_qa",
        businessUnit: "QA",
        workflowRelevance: "Process QA",
        roleRelevance: Role.REVIEWER,
        companyArea: "Quality",
      },
    ],
  });

  for (const workflow of workflows) {
    const fullWorkflow = await prisma.workflow.findUniqueOrThrow({
      where: { id: workflow.id },
      include: {
        documents: {
          include: {
            document: {
              include: { tags: true },
            },
          },
        },
      },
    });

    const compiled = compilePromptPackage({
      workflow: fullWorkflow,
      taskContext: `Seeded prompt package for ${workflow.name}.`,
      roleContext: "Use seeded role defaults for MVP verification.",
      teamContext: "Cross-functional operations environment.",
      includeLegacy: false,
    });

    await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        userId: workflow.targetRole === Role.REVIEWER ? reviewer.id : workflow.targetRole === Role.ADMIN ? admin.id : member.id,
        taskContext: `Seeded prompt package for ${workflow.name}.`,
        compiledPrompt: compiled.promptPreview,
        compiledPayload: compiled.payload,
        status: "READY",
        usedDocuments: {
          create: compiled.orderedDocuments.map((document, index) => ({
            documentId: document.id,
            authorityRank: index + 1,
          })),
        },
      },
    });
  }

  const draftSeeds = [
    {
      title: "Weekly support escalation memo",
      draftType: DraftType.INTERNAL_MEMO,
      context: "Summarize escalation patterns and next-step recommendations for leadership.",
      workflowId: workflows[2].id,
      authorId: member.id,
      compiledRequest: "Audience: leadership\nNeed: weekly escalation memo\nInclude source citations and risks.",
    },
    {
      title: "SOP handoff rewrite request",
      draftType: DraftType.SOP_REWRITE,
      context: "Rewrite onboarding SOP to remove outdated steps and align with current escalation logic.",
      workflowId: workflows[2].id,
      authorId: admin.id,
      compiledRequest: "Audience: operations enablement\nNeed: updated SOP rewrite package.",
    },
  ];

  await prisma.draft.createMany({
    data: draftSeeds.map((seed) => ({
      ...seed,
      status: "SUBMITTED",
      submittedAt: new Date(),
    })),
  });

  const qaSeeds = [
    ["Missed escalation for refund threshold", QAIssueType.MISSING_INSTRUCTION, QASeverity.HIGH, true, false, true],
    ["Response used outdated legacy phrasing", QAIssueType.OUTDATED_SOURCE_USAGE, QASeverity.HIGH, true, true, false],
    ["Checklist output skipped formatting section", QAIssueType.POOR_FORMATTING, QASeverity.MEDIUM, false, false, false],
    ["Draft summary omitted approval guardrail", QAIssueType.INCOMPLETE_ANSWER, QASeverity.MEDIUM, true, false, false],
    ["Support tone sounded defensive", QAIssueType.WRONG_TONE, QASeverity.MEDIUM, false, true, false],
    ["Workflow fabricated training guidance", QAIssueType.HALLUCINATION, QASeverity.CRITICAL, true, false, true],
    ["Prompt package missed top strategy source", QAIssueType.WEAK_GROUNDING, QASeverity.HIGH, true, false, false],
    ["QA review failed to cite source conflict", QAIssueType.WEAK_GROUNDING, QASeverity.MEDIUM, true, false, false],
    ["Escalation rule was present but not applied", QAIssueType.INCOMPLETE_ANSWER, QASeverity.HIGH, true, false, true],
    ["Output reused retired support macro", QAIssueType.OUTDATED_SOURCE_USAGE, QASeverity.HIGH, true, true, false],
  ] as const;

  for (let index = 0; index < qaSeeds.length; index += 1) {
    const [scenario, issueType, severity, sourceGroundingIssue, toneIssue, complianceIssue] = qaSeeds[index];
    await prisma.qARecord.create({
      data: {
        workflowId: workflows[index % workflows.length].id,
        userId: member.id,
        reviewerId: reviewer.id,
        scenario,
        expectedResult: "Output should follow the workflow, cite approved sources, and escalate when required.",
        actualResult: "Seeded QA case showing a realistic failure mode for the MVP dashboard.",
        issueType,
        severity,
        sourceGroundingIssue,
        toneIssue,
        complianceIssue,
        notes: "Seeded QA note for trend analysis and dashboard charts.",
        reviewerStatus: index % 3 === 0 ? QAReviewerStatus.RESOLVED : QAReviewerStatus.OPEN,
      },
    });
  }

  const activityMessages = [
    [ActivityType.DOCUMENT_CREATED, `Created knowledge document "${documents[0].title}"`, admin.id],
    [ActivityType.DOCUMENT_STATUS_CHANGED, `Marked "${documents[1].title}" as Gold Standard`, admin.id],
    [ActivityType.WORKFLOW_CREATED, `Created workflow "${workflows[0].name}"`, admin.id],
    [ActivityType.WORKFLOW_RUN, `Ran workflow "${workflows[1].name}"`, member.id],
    [ActivityType.DRAFT_CREATED, 'Submitted draft "Weekly support escalation memo"', member.id],
    [ActivityType.QA_ISSUE_LOGGED, "Logged QA issue for outdated source usage", reviewer.id],
    [ActivityType.REVIEW_COMPLETED, "Resolved critical hallucination issue", reviewer.id],
    [ActivityType.INTEGRATION_UPDATED, "Updated Claude integration placeholder settings", admin.id],
    [ActivityType.USER_UPDATED, "Updated reviewer profile metadata", reviewer.id],
    [ActivityType.DOCUMENT_UPDATED, `Updated knowledge document "${documents[3].title}"`, admin.id],
  ] as const;

  await prisma.activityLog.createMany({
    data: activityMessages.map(([type, message, actorId]) => ({
      type,
      message,
      actorId,
      metadata: {},
    })),
  });

  await prisma.integrationConfig.createMany({
    data: [
      {
        provider: IntegrationProvider.CLAUDE,
        enabled: false,
        status: "Awaiting API credentials",
        config: { model: "stubbed" },
      },
      {
        provider: IntegrationProvider.GOOGLE_DRIVE,
        enabled: false,
        status: "Not connected",
        config: { folderId: "" },
      },
      {
        provider: IntegrationProvider.CLICKUP,
        enabled: false,
        status: "Not connected",
        config: { workspaceId: "" },
      },
      {
        provider: IntegrationProvider.SLACK,
        enabled: true,
        status: "Ready for channel mapping",
        config: { channel: "#ops-reviews" },
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin: alex@claudeopsos.com / Password123!");
  console.log("Team Member: jordan@claudeopsos.com / Password123!");
  console.log("Reviewer: priya@claudeopsos.com / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
