import {
  ActivityType,
  AuthorityLevel,
  DraftType,
  IntegrationProvider,
  KnowledgeCategory,
  KnowledgeStatus,
  QAIssueType,
  QAReviewerStatus,
  QASeverity,
  Role,
  WorkflowType,
} from "@prisma/client";
import {
  Activity,
  BookOpen,
  Bot,
  CheckCheck,
  FilePenLine,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
  Waypoints,
} from "lucide-react";

export const roleOptions = Object.values(Role);
export const knowledgeCategoryOptions = Object.values(KnowledgeCategory);
export const knowledgeStatusOptions = Object.values(KnowledgeStatus);
export const authorityLevelOptions = Object.values(AuthorityLevel);
export const workflowTypeOptions = Object.values(WorkflowType);
export const draftTypeOptions = Object.values(DraftType);
export const qaIssueTypeOptions = Object.values(QAIssueType);
export const qaSeverityOptions = Object.values(QASeverity);
export const qaReviewerStatusOptions = Object.values(QAReviewerStatus);
export const activityTypeOptions = Object.values(ActivityType);
export const integrationProviderOptions = Object.values(IntegrationProvider);

export const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/hierarchy", label: "Hierarchy", icon: Waypoints },
  { href: "/workflows", label: "Workflows", icon: FolderKanban },
  { href: "/drafts", label: "Drafts", icon: FilePenLine },
  { href: "/qa", label: "Process QA", icon: CheckCheck },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings/profile", label: "Settings", icon: Settings },
];

export const workspaceOptions = [
  "Operations Core",
  "Member Experience",
  "Leadership Office",
];

export const statusBadgeVariants: Record<KnowledgeStatus, "success" | "secondary" | "warning" | "destructive" | "outline"> = {
  GOLD_STANDARD: "success",
  CURRENT: "secondary",
  DRAFT: "warning",
  LEGACY_NOISE: "destructive",
  ARCHIVED: "outline",
};

export const providerDescriptions: Record<IntegrationProvider, string> = {
  CLAUDE: "Configure the future model provider abstraction for prompt execution.",
  GOOGLE_DRIVE: "Reserve configuration for syncing source documents and folder mappings.",
  CLICKUP: "Define task and workflow handoff settings for execution loops.",
  SLACK: "Prepare notification and review routing settings for feedback loops.",
};

export const systemModules = [
  {
    title: "Strategic guidance",
    description: "Turn top-level direction into role-specific operating context.",
    icon: Bot,
  },
  {
    title: "Team execution",
    description: "Standardize how work is interpreted, scoped, and run.",
    icon: FolderKanban,
  },
  {
    title: "Drafting support",
    description: "Package source-grounded context for internal and member-facing outputs.",
    icon: FilePenLine,
  },
  {
    title: "Process QA",
    description: "Audit outputs, source grounding, and instruction quality over time.",
    icon: CheckCheck,
  },
];
