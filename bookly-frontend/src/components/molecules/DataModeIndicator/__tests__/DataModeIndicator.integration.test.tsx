import { DataModeIndicator } from "@/components/molecules/DataModeIndicator/DataModeIndicator";
import { useDataMode } from "@/hooks/useDataMode";
import { fireEvent, render, screen } from "@testing-library/react";

const clearQueryCache = jest.fn();

jest.mock("@/hooks/useDataMode", () => ({
  useDataMode: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    clear: clearQueryCache,
  }),
}));

const baseHookState = {
  mode: "mock" as const,
  dataMode: "MOCK" as const,
  isMock: true,
  isDevelopment: true,
  wsEnabled: false,
  source: "env" as const,
  useDirectServices: false,
  setMode: jest.fn(),
  setRoutingMode: jest.fn(),
  resetOverrides: jest.fn(),
};

describe("DataModeIndicator integration", () => {
  beforeEach(() => {
    clearQueryCache.mockClear();
    baseHookState.setMode.mockClear();
    baseHookState.setRoutingMode.mockClear();
    baseHookState.resetOverrides.mockClear();
    (useDataMode as jest.Mock).mockReturnValue(baseHookState);
  });

  it("clears React Query cache when confirming a mode change", () => {
    render(<DataModeIndicator />);

    fireEvent.click(screen.getByTestId("data-config-toggle"));
    fireEvent.click(screen.getByTestId("data-config-mode-btn"));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar cambio" }));

    expect(baseHookState.setMode).toHaveBeenCalledWith("serve");
    expect(clearQueryCache).toHaveBeenCalledTimes(1);
  });

  it("resets overrides and clears React Query cache", () => {
    render(<DataModeIndicator />);

    fireEvent.click(screen.getByTestId("data-config-toggle"));
    fireEvent.click(screen.getByTestId("data-config-reset-btn"));

    expect(baseHookState.resetOverrides).toHaveBeenCalledTimes(1);
    expect(clearQueryCache).toHaveBeenCalledTimes(1);
  });
});
