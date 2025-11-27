"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Input } from "@/components/atoms/Input";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { ButtonWithLoading } from "../../../components";

/**
 * Página de Login - Bookly
 *
 * Usa AuthLayout del sistema de diseño
 * Incluye: formulario, validaciones, estados de error
 */

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password, rememberMe);
      // AuthContext redirige automáticamente al dashboard
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.message || t("default_error"));
    }
  };

  return (
    <AuthLayout title={t("login")} description={t("description")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            {t("institutional_email")}
          </label>
          <Input
            type="email"
            placeholder="usuario@ufps.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            {t("password")}
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="rounded border-[var(--color-border-subtle)] text-brand-primary-500 focus:ring-brand-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="ml-2 text-[var(--color-text-secondary)]">
              {t("remember")}
            </span>
          </label>
          <a
            href="/forgot-password"
            className="text-brand-primary-500 hover:underline"
          >
            {t("forgot_password")}
          </a>
        </div>

        <ButtonWithLoading
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t("logging_in") : t("login")}
        </ButtonWithLoading>

        <div className="text-center text-sm text-[var(--color-text-secondary)]">
          {t("no_account")}{" "}
          <a
            href="/register"
            className="text-brand-primary-500 hover:underline"
          >
            {t("register_link")}
          </a>
        </div>
      </form>

      {/* Credenciales de prueba */}
      <div className="mt-6 p-4 bg-[var(--color-bg-muted)] rounded-md border border-[var(--color-border-subtle)]">
        <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-3">
          {t("test_credentials")}
        </p>
        <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
          <div>
            <strong>Admin:</strong> admin@ufps.edu.co / admin123
          </div>
          <div>
            <strong>Coordinador:</strong> coordinador@ufps.edu.co / coord123
          </div>
          <div>
            <strong>Profesor:</strong> profesor@ufps.edu.co / prof123
          </div>
          <div>
            <strong>Estudiante:</strong> estudiante@ufps.edu.co / est123
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
