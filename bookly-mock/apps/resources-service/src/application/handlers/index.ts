// Command Handlers
export * from "./create-category.handler";
export * from "./create-resource.handler";
export * from "./delete-resource.handler";
export * from "./import-resources.handler";
export * from "./restore-resource.handler";
export * from "./rollback-import.handler";
export * from "./schedule-maintenance.handler";
export * from "./start-async-import.handler";
export * from "./update-maintenance-status.handlers";
export * from "./update-resource.handler";
export * from "./validate-import.handler";

// Query Handlers
export * from "./generate-import-template.handler";
export * from "./get-categories.handler";
export * from "./get-import-job.handlers";
export * from "./get-maintenances.handler";
export * from "./get-resource-by-id.handler";
export * from "./get-resources.handler";
export * from "./search-resources-advanced.handler";

// Array de todos los handlers para fácil importación en módulos
import { CreateCategoryHandler } from "./create-category.handler";
import { CreateResourceHandler } from "./create-resource.handler";
import { DeleteResourceHandler } from "./delete-resource.handler";
import { GenerateImportTemplateHandler } from "./generate-import-template.handler";
import { GetCategoriesHandler } from "./get-categories.handler";
import {
  GetImportJobHandler,
  GetUserImportJobsHandler,
} from "./get-import-job.handlers";
import { GetMaintenancesHandler } from "./get-maintenances.handler";
import { GetResourceByIdHandler } from "./get-resource-by-id.handler";
import { GetResourcesHandler } from "./get-resources.handler";
import { ImportResourcesHandler } from "./import-resources.handler";
import { RestoreResourceHandler } from "./restore-resource.handler";
import { RollbackImportHandler } from "./rollback-import.handler";
import { ScheduleMaintenanceHandler } from "./schedule-maintenance.handler";
import { SearchResourcesAdvancedHandler } from "./search-resources-advanced.handler";
import { StartAsyncImportHandler } from "./start-async-import.handler";
import {
  CancelMaintenanceHandler,
  CompleteMaintenanceHandler,
  StartMaintenanceHandler,
} from "./update-maintenance-status.handlers";
import { UpdateResourceHandler } from "./update-resource.handler";
import { ValidateImportHandler } from "./validate-import.handler";

export const CommandHandlers = [
  CreateResourceHandler,
  UpdateResourceHandler,
  DeleteResourceHandler,
  RestoreResourceHandler,
  ImportResourcesHandler,
  ValidateImportHandler,
  StartAsyncImportHandler,
  RollbackImportHandler,
  ScheduleMaintenanceHandler,
  StartMaintenanceHandler,
  CompleteMaintenanceHandler,
  CancelMaintenanceHandler,
  CreateCategoryHandler,
];

export const QueryHandlers = [
  GetResourceByIdHandler,
  GetResourcesHandler,
  SearchResourcesAdvancedHandler,
  GetCategoriesHandler,
  GetMaintenancesHandler,
  GetImportJobHandler,
  GetUserImportJobsHandler,
  GenerateImportTemplateHandler,
];

export const AllHandlers = [...CommandHandlers, ...QueryHandlers];
