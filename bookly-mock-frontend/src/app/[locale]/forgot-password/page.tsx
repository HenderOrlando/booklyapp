"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { httpClient } from "@/infrastructure/http";
import Link from "next/link";
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
      setError("Por favor ingrese su correo electrónico");
      setLoading(false);
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingrese un correo electrónico válido");
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
          response.message || "Error al enviar el correo de recuperación"
        );
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setError(
        error?.message || "Error al procesar la solicitud. Intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      description="Ingrese su correo electrónico para recibir un enlace de recuperación"
    >
      {success ? (
        <div className="space-y-4">
          <Alert variant="success">
            <AlertDescription>
              <strong>¡Correo enviado!</strong>
              <br />
              Hemos enviado un enlace de recuperación a tu correo electrónico.
              Por favor revisa tu bandeja de entrada y sigue las instrucciones.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam
              o intenta nuevamente.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                Enviar otro correo
              </Button>

              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full">
                  Volver al inicio de sesión
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
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Correo Electrónico
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/login"
              className="text-sm text-brand-primary-500 hover:text-brand-primary-600 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-[var(--color-surface-secondary)] rounded-md">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          ¿Necesitas ayuda?
        </h3>
        <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
          <li>• El enlace de recuperación expira en 1 hora</li>
          <li>• Solo puedes solicitar un enlace cada 5 minutos</li>
          <li>• Si tienes problemas, contacta al soporte técnico</li>
        </ul>
      </div>
    </AuthLayout>
  );
}
