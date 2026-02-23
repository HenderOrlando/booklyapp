"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { httpClient } from "@/infrastructure/http";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Recuperación de Contraseña - Bookly
 *
 * Permite al usuario solicitar un enlace de recuperación
 * que se envía a su correo electrónico
 */

interface ForgotPasswordResponse {
  success: boolean;
  data?: {
    message: string;
    email: string;
  };
  message?: string;
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validación básica
    if (!email) {
      setError(t("error_email_required"));
      setLoading(false);
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("error_invalid_email"));
      setLoading(false);
      return;
    }

    try {
      const response = await httpClient.post<ForgotPasswordResponse>(
        "auth/forgot-password",
        { email }
      );

      if (response.success) {
        setSuccess(true);
        setEmail(""); // Limpiar el campo
      } else {
        setError(
          response.message || t("error_sending_recovery")
        );
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setError(
        error?.message || t("error_processing_request")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("forgot_password_title")}
      description={t("forgot_password_description")}
    >
      {success ? (
        <div className="space-y-4">
          <Alert variant="success">
            <AlertDescription>
              <strong>{t("recovery_email_sent_title")}</strong>
              <br />
              {t("recovery_email_sent_desc")}
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-content-secondary">
              {t("recovery_email_not_received")}
            </p>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                {t("send_another_email")}
              </Button>

              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full">
                  {t("back_to_login")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-content-primary mb-2">
              {t("email_label")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email_placeholder")}
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("sending") : t("send_recovery_link")}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/login"
              className="text-sm text-action-primary hover:text-action-primary-hover hover:underline"
            >
              {t("back_to_login")}
            </Link>
          </div>
        </form>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-app rounded-md border border-line-subtle">
        <h3 className="text-sm font-medium text-content-primary mb-2">
          {t("need_help")}
        </h3>
        <ul className="text-xs text-content-secondary space-y-1">
          <li>• {t("help_recovery_expiry")}</li>
          <li>• {t("help_recovery_limit")}</li>
          <li>• {t("help_contact_support")}</li>
        </ul>
      </div>
    </AuthLayout>
  );
}
