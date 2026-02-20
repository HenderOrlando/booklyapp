"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { httpClient } from "@/infrastructure/http";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Restablecimiento de Contraseña - Bookly
 *
 * Permite al usuario establecer una nueva contraseña
 * usando el token recibido por correo
 */

interface ResetPasswordResponse {
  success: boolean;
  data?: {
    message: string;
  };
  message?: string;
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Validar que existe el token
  React.useEffect(() => {
    if (!token) {
      setError(t("invalid_token_error"));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones
    if (!password || !confirmPassword) {
      setError(t("error_fields_required"));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t("error_password_length"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("error_passwords_mismatch"));
      setLoading(false);
      return;
    }

    if (!token) {
      setError(t("error_invalid_token"));
      setLoading(false);
      return;
    }

    try {
      const response = await httpClient.post<ResetPasswordResponse>(
        "auth/reset-password",
        {
          token,
          newPassword: password,
        }
      );

      if (response.success) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(
          response.message || t("error_reset_failed")
        );
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(
        error?.message || t("error_reset_processing")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("reset_password_title")}
      description={t("reset_password_description")}
    >
      {success ? (
        <div className="space-y-4">
          <Alert variant="success">
            <AlertDescription>
              <strong>{t("reset_success_title")}</strong>
              <br />
              {t("reset_success_desc")}
            </AlertDescription>
          </Alert>

          <Link href="/login" className="block">
            <Button className="w-full">{t("back_to_login")}</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!token && (
            <Alert variant="warning">
              <AlertDescription>
                {t("no_token_warning")}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t("new_password_label")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("new_password_placeholder")}
              required
              disabled={loading || !token}
              className="w-full"
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t("new_password_hint")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {t("confirm_password_label")}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirm_password_placeholder")}
              required
              disabled={loading || !token}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={loading || !token} className="w-full">
            {loading ? t("resetting") : t("reset_password_button")}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-brand-primary-500 hover:text-brand-primary-600 hover:underline block"
            >
              {t("request_new_link")}
            </Link>
            <Link
              href="/login"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline block"
            >
              {t("back_to_login")}
            </Link>
          </div>
        </form>
      )}

      {/* Información de seguridad */}
      <div className="mt-6 p-4 bg-[var(--color-surface-secondary)] rounded-md">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          {t("security_tips_title")}
        </h3>
        <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
          <li>• {t("security_tip_unique")}</li>
          <li>• {t("security_tip_mix")}</li>
          <li>• {t("security_tip_share")}</li>
          <li>• {t("security_tip_change")}</li>
        </ul>
      </div>
    </AuthLayout>
  );
}
