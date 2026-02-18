import {
  DATA_MODE_STORAGE_KEY,
  USE_DIRECT_STORAGE_KEY,
  dataConfigStore,
} from "@/lib/data-config";

describe("dataConfigStore", () => {
  const originalDataMode = process.env.NEXT_PUBLIC_DATA_MODE;
  const originalDirect = process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES;
  const originalWs = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DATA_MODE = "serve";
    process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES = "false";
    process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET = "true";

    window.localStorage.clear();
    dataConfigStore.resetToEnv();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_DATA_MODE = originalDataMode;
    process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES = originalDirect;
    process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET = originalWs;
  });

  it("derives wsEnabled only for SERVER + GATEWAY", () => {
    dataConfigStore.resetToEnv();
    expect(dataConfigStore.getSnapshot().wsEnabled).toBe(true);

    dataConfigStore.setDataMode("MOCK");
    expect(dataConfigStore.getSnapshot().wsEnabled).toBe(false);

    dataConfigStore.setDataMode("SERVER");
    dataConfigStore.setRoutingMode("DIRECTO");
    expect(dataConfigStore.getSnapshot().wsEnabled).toBe(false);

    dataConfigStore.setRoutingMode("GATEWAY");
    expect(dataConfigStore.getSnapshot().wsEnabled).toBe(true);
  });

  it("persists override values in localStorage", () => {
    dataConfigStore.setDataMode("MOCK");
    dataConfigStore.setUseDirectServices(true);

    expect(window.localStorage.getItem(DATA_MODE_STORAGE_KEY)).toBe("mock");
    expect(window.localStorage.getItem(USE_DIRECT_STORAGE_KEY)).toBe("true");
  });

  it("resets to env defaults and clears overrides", () => {
    dataConfigStore.setDataMode("MOCK");
    dataConfigStore.setUseDirectServices(true);

    process.env.NEXT_PUBLIC_DATA_MODE = "serve";
    process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES = "false";

    dataConfigStore.resetToEnv();

    const snapshot = dataConfigStore.getSnapshot();
    expect(snapshot.dataMode).toBe("SERVER");
    expect(snapshot.routingMode).toBe("GATEWAY");
    expect(snapshot.source).toBe("env");
    expect(window.localStorage.getItem(DATA_MODE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(USE_DIRECT_STORAGE_KEY)).toBeNull();
  });
});
