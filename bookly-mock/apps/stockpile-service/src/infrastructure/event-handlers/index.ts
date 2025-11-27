export * from "./resource-info.event-handler";
export * from "./user-info.event-handler";

import { ResourceInfoEventHandler } from "./resource-info.event-handler";
import { UserInfoEventHandler } from "./user-info.event-handler";

/**
 * All Event Handlers
 * Exporta array con todos los event handlers para registro en módulo
 */
export const AllEventHandlers = [
  UserInfoEventHandler,
  ResourceInfoEventHandler,
];
