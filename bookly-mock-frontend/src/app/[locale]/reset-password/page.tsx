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
      setError("Token de recuperación no válido o expirado");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Por favor complete todos los campos");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Token de recuperación no válido");
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
          response.message ||
            "Error al restablecer la contraseña. El token podría estar expirado."
        );
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(
        error?.message ||
          "Error al procesar la solicitud. Por favor intente nuevamente o solicite un nuevo enlace."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Restablecer Contraseña"
      description="Ingrese su nueva contraseña"
    >
      {success ? (
        <div className="space-y-4">
          <Alert variant="success">
            <AlertDescription>
              <strong>¡Contraseña restablecida!</strong>
              <br />
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al
              inicio de sesión...
            </AlertDescription>
          </Alert>

          <Link href="/login" className="block">
            <Button className="w-full">Ir al inicio de sesión</Button>
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
                No se encontró un token válido. Por favor solicita un nuevo
                enlace de recuperación.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Nueva Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              disabled={loading || !token}
              className="w-full"
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Usa al menos 8 caracteres con una mezcla de letras y números
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Confirmar Contraseña
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              disabled={loading || !token}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={loading || !token} className="w-full">
            {loading ? "Restableciendo..." : "Restablecer Contraseña"}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-brand-primary-500 hover:text-brand-primary-600 hover:underline block"
            >
              Solicitar nuevo enlace de recuperación
            </Link>
            <Link
              href="/login"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline block"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      )}

      {/* Información de seguridad */}
      <div className="mt-6 p-4 bg-[var(--color-surface-secondary)] rounded-md">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Consejos de seguridad
        </h3>
        <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
          <li>• Usa una contraseña única que no uses en otros sitios</li>
          <li>• Combina letras mayúsculas, minúsculas y números</li>
          <li>• No compartas tu contraseña con nadie</li>
          <li>• Cambia tu contraseña periódicamente</li>
        </ul>
      </div>
    </AuthLayout>
  );
}
