"use client";

/**
 * WebSocketToastBridge — RF-30
 *
 * Component that bridges WebSocket events to Toast notifications.
 * Must be rendered inside WebSocketProvider and ReduxProvider.
 * Renders nothing visible — only activates the hook.
 */

import { useWebSocketToasts } from "@/hooks/useWebSocketToasts";

export function WebSocketToastBridge() {
  useWebSocketToasts({
    enabled: true,
    showReservationEvents: true,
    showResourceEvents: true,
    showSystemMessages: true,
  });

  return null;
}
