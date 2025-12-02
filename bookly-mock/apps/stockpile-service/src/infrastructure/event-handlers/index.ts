export * from "./resource-info.event-handler";
export * from "./user-info.event-handler";
export * from "./reservation-created.handler";
export * from "./reservation-confirmed.handler";
export * from "./role-assigned.handler";
export * from "./permission-granted.handler";

import { ResourceInfoEventHandler } from "./resource-info.event-handler";
import { UserInfoEventHandler } from "./user-info.event-handler";
import { ReservationCreatedHandler } from "./reservation-created.handler";
import { ReservationConfirmedHandler } from "./reservation-confirmed.handler";
import { RoleAssignedHandler } from "./role-assigned.handler";
import { PermissionGrantedHandler } from "./permission-granted.handler";

/**
 * All Event Handlers
 * Exporta array con todos los event handlers para registro en módulo
 */
export const AllEventHandlers = [
  UserInfoEventHandler,
  ResourceInfoEventHandler,
  ReservationCreatedHandler,
  ReservationConfirmedHandler,
  RoleAssignedHandler,
  PermissionGrantedHandler,
];
