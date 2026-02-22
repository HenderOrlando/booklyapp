import type { DataConfigSnapshot } from "@/lib/data-config";
import type { DataProvider } from "@/infrastructure/data-providers/types";

export interface DataProviderRegistry {
  mock: DataProvider;
  serverGateway: DataProvider;
  serverDirect: DataProvider;
}

export function selectDataProvider(
  snapshot: DataConfigSnapshot,
  providers: DataProviderRegistry,
): DataProvider {
  if (snapshot.dataMode === "MOCK") {
    return providers.mock;
  }

  return snapshot.routingMode === "DIRECTO"
    ? providers.serverDirect
    : providers.serverGateway;
}
