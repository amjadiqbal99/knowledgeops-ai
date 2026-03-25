import { IntegrationProvider } from "@prisma/client";

export type IntegrationHealth = {
  provider: IntegrationProvider;
  enabled: boolean;
  status: string;
  lastSyncLabel: string;
};

export function getIntegrationHealth(provider: IntegrationProvider, enabled: boolean, status: string): IntegrationHealth {
  const lastSyncLabel = enabled ? "Ready for configuration" : "Paused until enabled";
  return { provider, enabled, status, lastSyncLabel };
}
