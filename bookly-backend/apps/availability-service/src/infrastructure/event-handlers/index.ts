/**
 * Event Handlers para Availability Service
 * 
 * Estos handlers consumen eventos de otros servicios
 */

export * from './resource-deleted.handler';
export * from './resource-availability-changed.handler';
export * from './maintenance-scheduled.handler';
export * from './approval-granted.handler';
export * from './approval-rejected.handler';
export * from './role-assigned.handler';
