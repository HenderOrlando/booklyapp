"use client";

import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

/**
 * ThemeToggle - Atom Component
 *
 * Toggle para cambiar entre tema dark/light
 * Usa next-themes para persistencia
 */

interface ThemeToggleProps {
  className?: string;
  testId?: string;
}

export function ThemeToggle({
  className,
  testId = "theme-toggle-btn",
}: ThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitar hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-7 w-14 animate-pulse rounded-full bg-[var(--color-bg-elevated)]",
          className,
        )}
      />
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-7 w-14 items-center rounded-full border border-[var(--color-border-subtle)] transition-colors p-0",
        isDark 
          ? "bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-primary)]" 
          : "bg-[var(--color-border-strong)] hover:bg-[var(--color-border-strong)]",
        className,
      )}
      data-testid={testId}
      aria-label={`Cambiar a tema ${isDark ? "claro" : "oscuro"}`}
      aria-pressed={isDark}
    >
      {/* Slider */}
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-[var(--color-bg-surface)] shadow-lg transition-transform ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      />

      {/* Iconos */}
      <span className="absolute left-1.5 flex items-center" aria-hidden="true">
        <Sun
          className={cn(
            "h-3 w-3",
            isDark ? "text-[var(--color-text-secondary)]" : "text-[var(--color-action-primary)]",
          )}
        />
      </span>

      <span className="absolute right-1.5 flex items-center" aria-hidden="true">
        <Moon
          className={cn(
            "h-3 w-3",
            isDark ? "text-[var(--color-action-primary)]" : "text-[var(--color-text-secondary)]",
          )}
        />
      </span>
    </Button>
  );
}
