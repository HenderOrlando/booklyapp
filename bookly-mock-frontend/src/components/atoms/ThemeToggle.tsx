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
        "relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ease-in-out",
        isDark 
          ? "bg-slate-700 hover:bg-slate-600 border border-slate-600" 
          : "bg-white hover:bg-slate-50 border border-slate-200 shadow-sm",
        className,
      )}
      data-testid={testId}
      aria-label={`Cambiar a tema ${isDark ? "claro" : "oscuro"}`}
      aria-pressed={isDark ? "true" : "false"}
    >
      {/* Iconos (Fondo) */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5" aria-hidden="true">
        <Sun
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            isDark ? "text-slate-400" : "text-amber-500",
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            isDark ? "text-indigo-400" : "text-slate-400",
          )}
        />
      </span>

      {/* Slider */}
      <span
        className={cn(
          "pointer-events-none z-10 block h-6 w-6 transform rounded-full shadow-md ring-0 transition-transform duration-300 ease-in-out",
          isDark 
            ? "translate-x-8 bg-slate-800 border border-transparent" 
            : "translate-x-0 bg-white border border-slate-200"
        )}
      />
    </Button>
  );
}
