"use client";

import { ButtonWithLoading } from "@/components";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Input } from "@/components/atoms/Input";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/hooks/useDataMode";
import {
  type ErrorTranslator,
  resolveErrorMessage,
} from "@/infrastructure/http/errorMessageResolver";
import { capturePostAuthRedirectFromLocation } from "@/lib/auth/post-auth-redirect";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Login - Bookly
 *
 * Usa AuthLayout del sistema de diseño
 * Incluye: formulario, validaciones, estados de error
 */

export default function LoginPage() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const { login, isLoading } = useAuth();
  const { isMock } = useDataMode();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    capturePostAuthRedirectFromLocation(
      window.location.pathname,
      window.location.search,
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password, rememberMe);
      // Force reload to ensure redirect logic in AuthProvider/AuthContext kicks in fresh
      window.location.reload();
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError(
        resolveErrorMessage(error, tErrors as unknown as ErrorTranslator) ||
          t("default_error"),
      );
    }
  };

  return (
    <AuthLayout title={t("login")} description={t("description")}>
      <div className="mb-4 flex items-center justify-end gap-2">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {t("theme_toggle_label")}
        </span>
        <ThemeToggle testId="login-theme-toggle" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error" data-testid="login-error-message">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
          >
            {t("institutional_email")}
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="usuario@ufps.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isLoading}
            data-testid="login-email-input"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
          >
            {t("password")}
          </label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={isLoading}
            data-testid="login-password-input"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label
            htmlFor="login-remember"
            className="flex cursor-pointer items-center"
          >
            <input
              id="login-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="rounded border-[var(--color-border-subtle)] text-[var(--color-action-primary)] focus:ring-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="ml-2 text-[var(--color-text-secondary)]">
              {t("remember")}
            </span>
          </label>
          <a
            href="/forgot-password"
            className="text-[var(--color-text-link)] hover:underline"
          >
            {t("forgot_password")}
          </a>
        </div>

        <ButtonWithLoading
          type="submit"
          className="w-full"
          disabled={isLoading}
          data-testid="login-submit-btn"
        >
          {isLoading ? t("logging_in") : t("login")}
        </ButtonWithLoading>

        <div className="text-center text-sm text-[var(--color-text-secondary)]">
          {t("no_account")}{" "}
          <a
            href="/register"
            className="text-[var(--color-text-link)] hover:underline"
          >
            {t("register_link")}
          </a>
        </div>
      </form>

      {isMock ? (
        <div
          data-testid="login-mock-credentials"
          className="mt-6 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-muted)] p-4"
        >
          <p className="mb-3 text-xs font-semibold text-[var(--color-text-primary)]">
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
          <p className="mt-3 text-[11px] text-[var(--color-text-tertiary)]">
            {t("mock_mode_disclaimer")}
          </p>
        </div>
      ) : (
        <div
          data-testid="login-server-credentials-hint"
          className="mt-6 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-muted)] p-3 text-xs text-[var(--color-text-secondary)]"
        >
          {t("server_credentials_hint")}
        </div>
      )}
    </AuthLayout>
  );
}
