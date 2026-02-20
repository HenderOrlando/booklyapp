/**
 * UserFormModal - Modal para crear/editar usuarios
 *
 * Formulario completo con datos personales y asignación de roles
 */

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import type { Role, User } from "@/types/entities/user";
import { UserStatus } from "@/types/entities/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
} from "./user-schema";

interface UserFormModalProps {
  show: boolean;
  selectedUser: User | null;
  allRoles: Role[];
  isLoading?: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function UserFormModal({
  show,
  selectedUser,
  allRoles,
  isLoading = false,
  onClose,
  onSave,
}: UserFormModalProps) {
  const t = useTranslations("admin.users");
  const [filterRoles, setFilterRoles] = useState("");

  const schema = selectedUser ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      phoneNumber: "",
      documentType: "",
      documentNumber: "",
      roles: [],
    },
  });

  const selectedRoles = watch("roles") || [];

  useEffect(() => {
    if (show) {
      if (selectedUser) {
        reset({
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          phoneNumber: selectedUser.phoneNumber || "",
          documentType: selectedUser.documentType || "",
          documentNumber: selectedUser.documentNumber || "",
          roles: selectedUser.roles.map((r) => r.id),
          // Email and username are read-only in edit
          email: selectedUser.email,
          username: selectedUser.username,
        });
      } else {
        reset({
          email: "",
          username: "",
          firstName: "",
          lastName: "",
          password: "",
          phoneNumber: "",
          documentType: "",
          documentNumber: "",
          roles: [],
        });
      }
    }
  }, [show, selectedUser, reset]);

  if (!show) return null;

  const filteredRoles = allRoles.filter(
    (r: Role) =>
      r.name.toLowerCase().includes(filterRoles.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(filterRoles.toLowerCase()),
  );

  const onRoleToggle = (roleId: string) => {
    const currentRoles = [...selectedRoles];
    const index = currentRoles.indexOf(roleId);
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(roleId);
    }
    setValue("roles", currentRoles, { shouldValidate: true });
  };

  const onSubmit = (data: CreateUserFormValues) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedUser ? t("edit_user_title") : t("create_user_title")}
              </CardTitle>
              <CardDescription>
                {selectedUser ? t("edit_user_desc") : t("create_user_desc")}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Sección: Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("basic_info")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("first_name")}{" "}
                    <span className="text-state-error-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder={t("first_name_placeholder")}
                    {...register("firstName")}
                    disabled={isLoading}
                    className={errors.firstName ? "border-state-error-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-state-error-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("last_name")}{" "}
                    <span className="text-state-error-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder={t("last_name_placeholder")}
                    {...register("lastName")}
                    disabled={isLoading}
                    className={errors.lastName ? "border-state-error-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-state-error-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Credenciales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("credentials")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("email")} <span className="text-state-error-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("email_placeholder")}
                    {...register("email")}
                    disabled={isLoading || !!selectedUser}
                    className={errors.email ? "border-state-error-500" : ""}
                  />
                  {selectedUser ? (
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {t("email_readonly")}
                    </p>
                  ) : (
                    errors.email && (
                      <p className="text-xs text-state-error-500">
                        {errors.email.message}
                      </p>
                    )
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">
                    {t("username")}{" "}
                    <span className="text-state-error-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    placeholder={t("username_placeholder")}
                    {...register("username")}
                    disabled={isLoading || !!selectedUser}
                    className={errors.username ? "border-state-error-500" : ""}
                  />
                  {selectedUser ? (
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {t("username_readonly")}
                    </p>
                  ) : (
                    errors.username && (
                      <p className="text-xs text-state-error-500">
                        {errors.username.message}
                      </p>
                    )
                  )}
                </div>
              </div>
              {!selectedUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t("password")}{" "}
                    <span className="text-state-error-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("password_placeholder")}
                    {...register("password")}
                    disabled={isLoading}
                    className={errors.password ? "border-state-error-500" : ""}
                  />
                  {errors.password ? (
                    <p className="text-xs text-state-error-500">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {t("password_hint")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sección: Información adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("additional_info")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t("phone_number")}</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t("phone_placeholder")}
                    {...register("phoneNumber")}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">{t("document_type")}</Label>
                  <Select
                    value={watch("documentType")}
                    onValueChange={(value) => setValue("documentType", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="documentType" aria-label={t("document_type")}>
                      <SelectValue placeholder={t("select_document_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                      <SelectItem value="OTHER">{t("other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentNumber">{t("document_number")}</Label>
                <Input
                  id="documentNumber"
                  placeholder={t("document_number_placeholder")}
                  {...register("documentNumber")}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Sección: Estado */}
            {selectedUser && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("account_status")}
                </h3>
                <div className="space-y-2">
                  <Select
                    value={watch("status")}
                    onValueChange={(value) =>
                      setValue("status", value as UserStatus)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger aria-label={t("account_status")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserStatus.ACTIVE}>
                        {t("status_active")}
                      </SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>
                        {t("status_inactive")}
                      </SelectItem>
                      <SelectItem value={UserStatus.SUSPENDED}>
                        {t("status_suspended")}
                      </SelectItem>
                      <SelectItem value={UserStatus.PENDING_VERIFICATION}>
                        {t("status_pending")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Sección: Roles */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("assign_roles")} ({selectedRoles.length} {t("selected")})
                </h3>
                <Input
                  placeholder={t("filter_roles")}
                  value={filterRoles}
                  onChange={(e) => setFilterRoles(e.target.value)}
                  className="max-w-xs"
                  disabled={isLoading}
                />
              </div>
              {errors.roles && (
                <p className="text-xs text-state-error-500">
                  {errors.roles.message}
                </p>
              )}
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                {filteredRoles.map((role: Role) => (
                  <label
                    key={role.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                      selectedRoles.includes(role.id)
                        ? "bg-brand-primary-500/10 border-brand-primary-500"
                        : "bg-[var(--color-bg-primary)] border-[var(--color-border-strong)] hover:bg-[var(--color-bg-secondary)]"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => onRoleToggle(role.id)}
                      disabled={isLoading}
                      className="rounded w-4 h-4 text-brand-primary-600 focus:ring-brand-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <Badge variant="warning" className="text-xs">
                            {t("system_role")}
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 justify-end pt-6 border-t border-[var(--color-border-strong)]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t("saving")}
                  </div>
                ) : (
                  <>{selectedUser ? t("save_changes") : t("create_user")}</>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

