"use client";

/**
 * PinInputModal - Modal de verificación PIN (RF-45)
 *
 * Solicita al usuario ingresar su PIN de seguridad
 * antes de ejecutar acciones críticas como:
 * - Eliminar recursos/usuarios
 * - Cambiar permisos/roles
 * - Aprobar/rechazar solicitudes masivas
 */

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { ShieldCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

export interface PinInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  pinLength?: number;
  maxAttempts?: number;
  attemptsLeft?: number;
}

export function PinInputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  actionLabel,
  isLoading = false,
  error = null,
  pinLength = 6,
  maxAttempts: _maxAttempts = 3,
  attemptsLeft,
}: PinInputModalProps) {
  const t = useTranslations("pin");
  const [digits, setDigits] = React.useState<string[]>(
    Array(pinLength).fill(""),
  );
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setDigits(Array(pinLength).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, pinLength]);

  React.useEffect(() => {
    if (error) {
      setDigits(Array(pinLength).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [error, pinLength]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];

    if (value.length > 1) {
      const chars = value.split("").filter((c) => /\d/.test(c));
      for (let i = 0; i < chars.length && index + i < pinLength; i++) {
        newDigits[index + i] = chars[i];
      }
      setDigits(newDigits);
      const nextIndex = Math.min(index + chars.length, pinLength - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newDigits[index] = value;
      setDigits(newDigits);

      if (value && index < pinLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    const filledDigits = value.length > 1
      ? newDigits
      : newDigits.map((d, i) => (i === index ? value : d));

    if (filledDigits.every((d) => d !== "")) {
      const pin = filledDigits.join("");
      setTimeout(() => onSubmit(pin), 50);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, pinLength);
    if (!pasted) return;

    const newDigits = Array(pinLength).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    if (pasted.length === pinLength) {
      setTimeout(() => onSubmit(pasted), 50);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary-100 dark:bg-brand-primary-900/20 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-brand-primary-600 dark:text-brand-primary-400" />
              </div>
              <div>
                <CardTitle>{title || t("title")}</CardTitle>
                <CardDescription>
                  {description || t("description")}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              aria-label={t("close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="flex justify-center gap-3"
            onPaste={handlePaste}
            role="group"
            aria-label={t("pin_input_label")}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={2}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`
                  w-12 h-14 text-center text-2xl font-bold rounded-lg border-2
                  transition-colors outline-none
                  ${
                    error
                      ? "border-state-error-500 bg-state-error-50 dark:bg-state-error-900/10"
                      : digit
                        ? "border-brand-primary-500 bg-brand-primary-50 dark:bg-brand-primary-900/10"
                        : "border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]"
                  }
                  focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200
                  dark:focus:ring-brand-primary-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-[var(--color-text-primary)]
                `}
                aria-label={`${t("digit")} ${index + 1}`}
              />
            ))}
          </div>

          {error && (
            <div className="text-center">
              <p className="text-sm text-state-error-600 dark:text-state-error-400 font-medium">
                {error}
              </p>
              {attemptsLeft !== undefined && attemptsLeft > 0 && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {t("attempts_left", { count: attemptsLeft })}
                </p>
              )}
              {attemptsLeft !== undefined && attemptsLeft <= 0 && (
                <p className="text-xs text-state-error-500 mt-1">
                  {t("account_locked")}
                </p>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-primary-500 border-t-transparent" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t("verifying")}
              </span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => {
                const pin = digits.join("");
                if (pin.length === pinLength) {
                  onSubmit(pin);
                }
              }}
              disabled={
                isLoading || digits.some((d) => d === "")
              }
            >
              {actionLabel || t("confirm")}
            </Button>
          </div>

          <p className="text-xs text-center text-[var(--color-text-tertiary)]">
            {t("forgot_pin")}{" "}
            <button
              type="button"
              className="text-brand-primary-500 hover:underline"
              onClick={() => {
                /* handled by parent */
              }}
            >
              {t("reset_pin")}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
