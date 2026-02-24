import { selectDataProvider } from "@/infrastructure/data-providers/select-data-provider";
import type { DataProvider } from "@/infrastructure/data-providers/types";
import type { DataConfigSnapshot } from "@/lib/data-config";

function makeProvider(id: DataProvider["id"]): DataProvider {
  return {
    id,
    buildUrl: (endpoint: string) => endpoint,
    request: async <T>() => ({
      success: true,
      data: {} as T,
      timestamp: new Date().toISOString(),
    }),
  };
}

const providers = {
  mock: makeProvider("mock"),
  serverGateway: makeProvider("server-gateway"),
  serverDirect: makeProvider("server-direct"),
};

function snapshot(overrides: Partial<DataConfigSnapshot>): DataConfigSnapshot {
  return {
    dataMode: "SERVER",
    routingMode: "GATEWAY",
    wsEnabled: true,
    source: "env",
    legacyDataMode: "serve",
    useDirectServices: false,
    ...overrides,
  };
}

describe("selectDataProvider", () => {
  it("selects mock provider for MOCK mode", () => {
    const selected = selectDataProvider(
      snapshot({
        dataMode: "MOCK",
        routingMode: "DIRECTO",
        wsEnabled: false,
        legacyDataMode: "mock",
        useDirectServices: true,
      }),
      providers,
    );

    expect(selected.id).toBe("mock");
  });

  it("selects direct provider for SERVER + DIRECTO", () => {
    const selected = selectDataProvider(
      snapshot({
        dataMode: "SERVER",
        routingMode: "DIRECTO",
        wsEnabled: false,
        useDirectServices: true,
      }),
      providers,
    );

    expect(selected.id).toBe("server-direct");
  });

  it("selects gateway provider for SERVER + GATEWAY", () => {
    const selected = selectDataProvider(
      snapshot({
        dataMode: "SERVER",
        routingMode: "GATEWAY",
        wsEnabled: true,
        useDirectServices: false,
      }),
      providers,
    );

    expect(selected.id).toBe("server-gateway");
  });
});
