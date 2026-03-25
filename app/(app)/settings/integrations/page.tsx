import { PageHeader } from "@/components/page-header";
import { IntegrationForm } from "@/features/settings/components/integration-form";
import { integrationProviderOptions } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function IntegrationSettingsPage() {
  const configs = await prisma.integrationConfig.findMany();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integration settings"
        description="Placeholder configuration for Claude API, Google Drive, ClickUp, and Slack."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {integrationProviderOptions.map((provider) => (
          <IntegrationForm
            key={provider}
            provider={provider}
            config={configs.find((config) => config.provider === provider)}
          />
        ))}
      </div>
    </div>
  );
}
