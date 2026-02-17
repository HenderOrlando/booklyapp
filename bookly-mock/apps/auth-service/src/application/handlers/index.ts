// Array de todos los handlers para fácil importación en módulos
import { ChangePasswordHandler } from "./change-password.handler";
import { DeleteUserHandler } from "./delete-user.handler";
import { Disable2FAHandler } from "./disable-2fa.handler";
import { Enable2FAHandler } from "./enable-2fa.handler";
import { ForgotPasswordHandler } from "./forgot-password.handler";
import { GetUserByIdHandler } from "./get-user-by-id.handler";
import { GetUsersHandler } from "./get-users.handler";
import { LoginUserHandler } from "./login-user.handler";
import { LogoutHandler } from "./logout.handler";
import { RefreshTokenHandler } from "./refresh-token.handler";
import { RegenerateBackupCodesHandler } from "./regenerate-backup-codes.handler";
import { RegisterUserHandler } from "./register-user.handler";
import { ResetPasswordHandler } from "./reset-password.handler";
import { Setup2FAHandler } from "./setup-2fa.handler";
import { UpdateUserHandler } from "./update-user.handler";
import { ValidateTokenHandler } from "./validate-token.handler";
import { Verify2FAHandler } from "./verify-2fa.handler";

// Roles Handlers
import { AssignPermissionsHandler } from "./roles/assign-permissions.handler";
import { CreateRoleHandler } from "./roles/create-role.handler";
import { DeleteRoleHandler } from "./roles/delete-role.handler";
import { GetActiveRolesHandler } from "./roles/get-active-roles.handler";
import { GetRoleByIdHandler } from "./roles/get-role-by-id.handler";
import { GetRolesHandler } from "./roles/get-roles.handler";
import { GetSystemRolesHandler } from "./roles/get-system-roles.handler";
import { RemovePermissionsHandler } from "./roles/remove-permissions.handler";
import { UpdateRoleHandler } from "./roles/update-role.handler";

// Permissions Handlers
import { BulkCreatePermissionsHandler } from "./permissions/bulk-create-permissions.handler";
import { CreatePermissionHandler } from "./permissions/create-permission.handler";
import { DeletePermissionHandler } from "./permissions/delete-permission.handler";
import { GetActivePermissionsHandler } from "./permissions/get-active-permissions.handler";
import { GetPermissionByIdHandler } from "./permissions/get-permission-by-id.handler";
import { GetPermissionsByModuleHandler } from "./permissions/get-permissions-by-module.handler";
import { GetPermissionsHandler } from "./permissions/get-permissions.handler";
import { UpdatePermissionHandler } from "./permissions/update-permission.handler";

export const CommandHandlers = [
  // Users & Auth
  RegisterUserHandler,
  LoginUserHandler,
  LogoutHandler,
  ChangePasswordHandler,
  RefreshTokenHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  // Users CRUD
  UpdateUserHandler,
  DeleteUserHandler,
  // Two-Factor Authentication
  Setup2FAHandler,
  Enable2FAHandler,
  Disable2FAHandler,
  Verify2FAHandler,
  RegenerateBackupCodesHandler,
  // Roles
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
  AssignPermissionsHandler,
  RemovePermissionsHandler,
  // Permissions
  CreatePermissionHandler,
  UpdatePermissionHandler,
  DeletePermissionHandler,
  BulkCreatePermissionsHandler,
];

export const QueryHandlers = [
  // Users & Auth
  GetUserByIdHandler,
  GetUsersHandler,
  ValidateTokenHandler,
  // Roles
  GetRolesHandler,
  GetRoleByIdHandler,
  GetActiveRolesHandler,
  GetSystemRolesHandler,
  // Permissions
  GetPermissionsHandler,
  GetPermissionByIdHandler,
  GetPermissionsByModuleHandler,
  GetActivePermissionsHandler,
];

export const AllHandlers = [...CommandHandlers, ...QueryHandlers];
