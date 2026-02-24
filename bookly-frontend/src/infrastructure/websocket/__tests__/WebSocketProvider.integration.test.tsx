import { useDataMode } from "@/hooks/useDataMode";
import { useWebSocket as useManagedWebSocket } from "@/hooks/useWebSocket";
import {
  WebSocketProvider,
  useWebSocket,
} from "@/infrastructure/websocket/WebSocketProvider";
import { render } from "@testing-library/react";

jest.mock("@/hooks/useDataMode", () => ({
  useDataMode: jest.fn(),
}));

jest.mock("@/hooks/useWebSocket", () => ({
  useWebSocket: jest.fn(),
}));

const connectMock = jest.fn();
const disconnectMock = jest.fn();
const subscribeMock = jest.fn(() => jest.fn());
const sendMock = jest.fn();

function WebSocketProbe() {
  useWebSocket();
  return <div data-testid="ws-probe" />;
}

describe("WebSocketProvider integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useManagedWebSocket as jest.Mock).mockReturnValue({
      isConnected: false,
      connectionState: "DISCONNECTED",
      connect: connectMock,
      disconnect: disconnectMock,
      subscribe: subscribeMock,
      send: sendMock,
    });
  });

  it("propagates enable/disable state to useWebSocket when wsEnabled toggles", () => {
    (useDataMode as jest.Mock).mockReturnValue({ wsEnabled: false });

    const { rerender } = render(
      <WebSocketProvider>
        <WebSocketProbe />
      </WebSocketProvider>,
    );

    expect(connectMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
    expect(useManagedWebSocket).toHaveBeenLastCalledWith(
      expect.objectContaining({
        enabled: false,
        autoConnect: false,
        reconnect: false,
      }),
    );

    (useDataMode as jest.Mock).mockReturnValue({ wsEnabled: true });
    rerender(
      <WebSocketProvider>
        <WebSocketProbe />
      </WebSocketProvider>,
    );

    expect(connectMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
    expect(useManagedWebSocket).toHaveBeenLastCalledWith(
      expect.objectContaining({
        enabled: true,
        autoConnect: true,
        reconnect: true,
      }),
    );

    (useDataMode as jest.Mock).mockReturnValue({ wsEnabled: false });
    rerender(
      <WebSocketProvider>
        <WebSocketProbe />
      </WebSocketProvider>,
    );

    expect(connectMock).not.toHaveBeenCalled();
    expect(disconnectMock).not.toHaveBeenCalled();
    expect(useManagedWebSocket).toHaveBeenLastCalledWith(
      expect.objectContaining({
        enabled: false,
        autoConnect: false,
        reconnect: false,
      }),
    );
  });
});
