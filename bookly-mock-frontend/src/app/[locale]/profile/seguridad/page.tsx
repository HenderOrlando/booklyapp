"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/atoms/Alert/Alert";
import { Badge } from "@/components/atoms/Badge/Badge";
import { Button } from "@/components/atoms/Button/Button";
import { Card } from "@/components/atoms/Card/Card";
import { Input } from "@/components/atoms/Input/Input";
import { MainLayout } from "@/components/templates/MainLayout";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Key,
  Shield,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Page: Seguridad del Perfil — RF-45: Verificación 2FA
 *
 * Permite al usuario:
 * - Configurar 2FA con código QR
 * - Verificar código TOTP
 * - Ver y gestionar backup codes
 * - Deshabilitar 2FA
 */

type TwoFactorStep = "disabled" | "setup" | "verify" | "enabled";

const MOCK_QR_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij5RUiBDb2RlIDJGQTwvdGV4dD48L3N2Zz4=";
const MOCK_SECRET = "JBSWY3DPEHPK3PXP";
const MOCK_BACKUP_CODES = [
  "A1B2-C3D4",
  "E5F6-G7H8",
  "I9J0-K1L2",
  "M3N4-O5P6",
  "Q7R8-S9T0",
];

export default function SeguridadPage() {
  const t = useTranslations("profile");
  const [step, setStep] = React.useState<TwoFactorStep>("disabled");
  const [verifyCode, setVerifyCode] = React.useState("");
  const [verifyError, setVerifyError] = React.useState("");
  const [copiedSecret, setCopiedSecret] = React.useState(false);
  const [copiedCodes, setCopiedCodes] = React.useState(false);

  const handleStartSetup = () => {
    setStep("setup");
  };

  const handleVerify = () => {
    if (verifyCode.length !== 6 || !/^\d+$/.test(verifyCode)) {
      setVerifyError("Ingresa un código de 6 dígitos");
      return;
    }
    setVerifyError("");
    setStep("enabled");
  };

  const handleDisable = () => {
    setStep("disabled");
    setVerifyCode("");
  };

  const copyToClipboard = (text: string, type: "secret" | "codes") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Seguridad de la Cuenta
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Configura la autenticación de dos factores para proteger tu cuenta.
          </p>
        </div>

        {/* 2FA Status Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "rounded-lg p-2",
                  step === "enabled"
                    ? "bg-state-success-100"
                    : "bg-[var(--color-bg-tertiary)]",
                )}
              >
                <Shield
                  className={cn(
                    "h-6 w-6",
                    step === "enabled"
                      ? "text-state-success-600"
                      : "text-[var(--color-text-tertiary)]",
                  )}
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">
                  Autenticación de Dos Factores (2FA)
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Agrega una capa extra de seguridad a tu cuenta
                </p>
              </div>
            </div>
            <Badge variant={step === "enabled" ? "success" : "default"}>
              {step === "enabled" ? "Activado" : "Desactivado"}
            </Badge>
          </div>

          {/* Step: Disabled */}
          {step === "disabled" && (
            <div className="mt-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Recomendación de seguridad</AlertTitle>
                <AlertDescription>
                  Activar 2FA protege tu cuenta incluso si tu contraseña es
                  comprometida.
                </AlertDescription>
              </Alert>
              <Button className="mt-4 gap-2" onClick={handleStartSetup}>
                <Smartphone className="h-4 w-4" />
                Configurar 2FA
              </Button>
            </div>
          )}

          {/* Step: Setup */}
          {step === "setup" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                1. Descarga una app de autenticación (Google Authenticator,
                Authy)
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                2. Escanea el código QR o ingresa la clave manualmente:
              </p>

              <div className="flex items-start gap-6">
                {/* QR Code */}
                <div className="shrink-0 rounded-lg border p-3 bg-[var(--color-bg-primary)]">
                  <img
                    src={MOCK_QR_URL}
                    alt="QR Code 2FA"
                    className="h-40 w-40"
                  />
                </div>

                {/* Manual Key */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-tertiary)]">
                      Clave manual:
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded bg-[var(--color-bg-muted)] px-3 py-1.5 text-sm font-mono">
                        {MOCK_SECRET}
                      </code>
                      <button
                        onClick={() => copyToClipboard(MOCK_SECRET, "secret")}
                        className="rounded p-1.5 hover:bg-[var(--color-bg-muted)]"
                        aria-label="Copiar clave"
                      >
                        {copiedSecret ? (
                          <CheckCircle2 className="h-4 w-4 text-state-success-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)]">
                3. Ingresa el código de 6 dígitos de tu app:
              </p>

              <div className="flex items-end gap-3">
                <div className="w-48">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) =>
                      setVerifyCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    error={verifyError}
                    className="text-center text-lg font-mono tracking-widest"
                  />
                </div>
                <Button onClick={handleVerify}>Verificar</Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("disabled")}
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Step: Enabled */}
          {step === "enabled" && (
            <div className="mt-4 space-y-4">
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>2FA Activado</AlertTitle>
                <AlertDescription>
                  Tu cuenta está protegida con autenticación de dos factores.
                </AlertDescription>
              </Alert>

              {/* Backup Codes */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Códigos de respaldo
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(MOCK_BACKUP_CODES.join("\n"), "codes")
                    }
                    className="flex items-center gap-1 text-xs text-brand-primary-500 hover:text-brand-primary-600"
                  >
                    {copiedCodes ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedCodes ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Guarda estos códigos en un lugar seguro. Cada uno solo se
                  puede usar una vez.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {MOCK_BACKUP_CODES.map((code) => (
                    <code
                      key={code}
                      className="rounded bg-[var(--color-bg-muted)] px-3 py-1.5 text-center text-sm font-mono"
                    >
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <Button variant="destructive" size="sm" onClick={handleDisable}>
                Desactivar 2FA
              </Button>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
