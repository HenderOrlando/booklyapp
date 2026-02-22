import type {
  DataConfigSnapshot,
  DataConfigStore,
  LegacyDataMode,
  RuntimeDataMode,
  RuntimeRoutingMode,
} from "@/lib/data-config/types";

export const DATA_MODE_STORAGE_KEY = "bookly_data_mode_override";
export const USE_DIRECT_STORAGE_KEY = "bookly_use_direct_services";

const listeners = new Set<() => void>();

let isInitialized = false;
let storageListenerBound = false;

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

function isWebSocketFeatureEnabled(): boolean {
  const envValue = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET;
  return envValue === undefined ? true : envValue === "true";
}

export function toRuntimeDataMode(mode: string): RuntimeDataMode {
  const normalized = mode.trim().toLowerCase();
  return normalized === "mock" ? "MOCK" : "SERVER";
}

export function toLegacyDataMode(mode: RuntimeDataMode): LegacyDataMode {
  return mode === "MOCK" ? "mock" : "serve";
}

export function toRuntimeRoutingMode(mode: string): RuntimeRoutingMode {
  const normalized = mode.trim().toLowerCase();
  return normalized === "directo" || normalized === "direct" ? "DIRECTO" : "GATEWAY";
}

function buildSnapshot(
  dataMode: RuntimeDataMode,
  routingMode: RuntimeRoutingMode,
  source: "env" | "override",
): DataConfigSnapshot {
  const useDirectServices = routingMode === "DIRECTO";

  return {
    dataMode,
    routingMode,
    wsEnabled:
      isWebSocketFeatureEnabled() &&
      dataMode === "SERVER" &&
      routingMode === "GATEWAY",
    source,
    legacyDataMode: toLegacyDataMode(dataMode),
    useDirectServices,
  };
}

function readEnvDefaults(): DataConfigSnapshot {
  const envDataMode = toRuntimeDataMode(process.env.NEXT_PUBLIC_DATA_MODE || "mock");
  const envRoutingMode =
    process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES === "true"
      ? "DIRECTO"
      : "GATEWAY";

  return buildSnapshot(envDataMode, envRoutingMode, "env");
}

function readOverridesFromStorage(
  envSnapshot: DataConfigSnapshot,
): DataConfigSnapshot {
  if (!canUseBrowserStorage()) {
    return envSnapshot;
  }

  const modeOverride = window.localStorage.getItem(DATA_MODE_STORAGE_KEY);
  const directOverride = window.localStorage.getItem(USE_DIRECT_STORAGE_KEY);

  if (modeOverride === null && directOverride === null) {
    return envSnapshot;
  }

  const dataMode = modeOverride
    ? toRuntimeDataMode(modeOverride)
    : envSnapshot.dataMode;
  const routingMode = directOverride
    ? directOverride === "true"
      ? "DIRECTO"
      : "GATEWAY"
    : envSnapshot.routingMode;

  return buildSnapshot(dataMode, routingMode, "override");
}

let snapshot = readEnvDefaults();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function ensureInitialized() {
  if (!canUseBrowserStorage() || isInitialized) {
    return;
  }

  snapshot = readOverridesFromStorage(readEnvDefaults());
  isInitialized = true;

  if (!storageListenerBound) {
    window.addEventListener("storage", handleStorageSync);
    storageListenerBound = true;
  }
}

function handleStorageSync(event: StorageEvent) {
  if (
    event.key !== DATA_MODE_STORAGE_KEY &&
    event.key !== USE_DIRECT_STORAGE_KEY &&
    event.key !== null
  ) {
    return;
  }

  const nextSnapshot = readOverridesFromStorage(readEnvDefaults());
  if (
    nextSnapshot.dataMode !== snapshot.dataMode ||
    nextSnapshot.routingMode !== snapshot.routingMode ||
    nextSnapshot.source !== snapshot.source
  ) {
    snapshot = nextSnapshot;
    emitChange();
  }
}

function persistOverrides(current: DataConfigSnapshot) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(DATA_MODE_STORAGE_KEY, current.legacyDataMode);
  window.localStorage.setItem(
    USE_DIRECT_STORAGE_KEY,
    String(current.useDirectServices),
  );
}

export const dataConfigStore: DataConfigStore = {
  getSnapshot: () => {
    ensureInitialized();
    return snapshot;
  },

  subscribe: (listener) => {
    ensureInitialized();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setDataMode: (mode) => {
    ensureInitialized();

    snapshot = buildSnapshot(mode, snapshot.routingMode, "override");
    persistOverrides(snapshot);
    emitChange();
  },

  setRoutingMode: (mode) => {
    ensureInitialized();

    snapshot = buildSnapshot(snapshot.dataMode, mode, "override");
    persistOverrides(snapshot);
    emitChange();
  },

  setUseDirectServices: (direct) => {
    ensureInitialized();

    snapshot = buildSnapshot(
      snapshot.dataMode,
      direct ? "DIRECTO" : "GATEWAY",
      "override",
    );
    persistOverrides(snapshot);
    emitChange();
  },

  resetToEnv: () => {
    ensureInitialized();

    if (canUseBrowserStorage()) {
      window.localStorage.removeItem(DATA_MODE_STORAGE_KEY);
      window.localStorage.removeItem(USE_DIRECT_STORAGE_KEY);
    }

    snapshot = readEnvDefaults();
    emitChange();
  },
};

export function getDataConfigSnapshot(): DataConfigSnapshot {
  return dataConfigStore.getSnapshot();
}

export function subscribeToDataConfig(listener: () => void): () => void {
  return dataConfigStore.subscribe(listener);
}
