"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
}

/**
 * Página de Registro - Bookly
 *
 * Formulario completo de registro de usuarios
 * Usa AuthLayout del sistema de diseño
 */
export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [formData, setFormData] = React.useState<RegisterFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    documentType: "CC",
    documentNumber: "",
  });

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): string | null => {
    if (
      !formData.email ||
      !formData.username ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      return t("all_fields_required");
    }

    if (formData.password !== formData.confirmPassword) {
      return t("passwords_mismatch");
    }

    if (formData.password.length < 8) {
      return t("password_requirement");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return t("email_invalid");
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { httpClient } = await import("@/infrastructure/http");

      // Registro usando httpClient (maneja Mock/Serve automáticamente)
      const response = await httpClient.post("auth/register", {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
        documentType: formData.documentType || undefined,
        documentNumber: formData.documentNumber || undefined,
      });

      if (response.success) {
        // Redirigir al login con mensaje de éxito
        window.location.href = `/${locale}/login?registered=true`;
      }
    } catch (error: any) {
      console.error("Register error:", error);
      setError(error?.message || t("register_error"));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("create_account")}
      description={t("register_description")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Información Personal */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-content-primary">
            {t("personal_info")}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t("first_name")} <span className="text-state-error-text">*</span>
              </label>
              <Input
                type="text"
                name="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t("last_name")} <span className="text-state-error-text">*</span>
              </label>
              <Input
                type="text"
                name="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>

        {/* Información de Cuenta */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-content-primary">
            {t("account_info")}
          </h3>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t("email")} <span className="text-state-error-text">*</span>
            </label>
            <Input
              type="email"
              name="email"
              placeholder="correo@ufps.edu.co"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t("username")} <span className="text-state-error-text">*</span>
            </label>
            <Input
              type="text"
              name="username"
              placeholder="juanperez"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t("password")} <span className="text-state-error-text">*</span>
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t("confirm_password")} <span className="text-state-error-text">*</span>
              </label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>

        {/* Información Adicional (Opcional) */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-content-primary">
            {t("additional_info")}
          </h3>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              {t("phone")}
            </label>
            <Input
              type="tel"
              name="phoneNumber"
              placeholder="+57 300 123 4567"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t("doc_type")}
              </label>
              <Select
                value={formData.documentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, documentType: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("doc_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">{t("document_types.cc")}</SelectItem>
                  <SelectItem value="TI">{t("document_types.ti")}</SelectItem>
                  <SelectItem value="CE">{t("document_types.ce")}</SelectItem>
                  <SelectItem value="PA">{t("document_types.pa")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-content-primary mb-1">
                {t("doc_number")}
              </label>
              <Input
                type="text"
                name="documentNumber"
                placeholder="1234567890"
                value={formData.documentNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? t("registering") : t("create_account")}
        </Button>

        <div className="text-center text-sm text-content-secondary">
          {t("already_have_account")}{" "}
          <a
            href="/login"
            className="text-action-primary hover:underline font-medium"
          >
            {t("login_link")}
          </a>
        </div>
      </form>

      {/* Información de campos obligatorios */}
      <div className="mt-6 p-3 bg-app rounded-md border border-line-subtle">
        <p className="text-xs text-content-secondary">
          <span className="text-state-error-text">*</span> {t("required_fields")}
        </p>
        <p className="text-xs text-content-secondary mt-1">
          {t("password_requirement")}
        </p>
      </div>
    </AuthLayout>
  );
}
