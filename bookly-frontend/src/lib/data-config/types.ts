export type RuntimeDataMode = "MOCK" | "SERVER";

export type RuntimeRoutingMode = "DIRECTO" | "GATEWAY";

export type RuntimeConfigSource = "env" | "override";

export type LegacyDataMode = "mock" | "serve";

export interface DataConfigSnapshot {
  dataMode: RuntimeDataMode;
  routingMode: RuntimeRoutingMode;
  wsEnabled: boolean;
  source: RuntimeConfigSource;
  legacyDataMode: LegacyDataMode;
  useDirectServices: boolean;
}

export interface DataConfigStore {
  getSnapshot: () => DataConfigSnapshot;
  subscribe: (listener: () => void) => () => void;
  setDataMode: (mode: RuntimeDataMode) => void;
  setRoutingMode: (mode: RuntimeRoutingMode) => void;
  setUseDirectServices: (direct: boolean) => void;
  resetToEnv: () => void;
}
