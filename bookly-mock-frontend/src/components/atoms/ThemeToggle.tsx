"use client";

import { useTheme } from "next-themes";
import * as React from "react";

/**
 * ThemeToggle - Atom Component
 *
 * Toggle para cambiar entre tema dark/light
 * Usa next-themes para persistencia
 */

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitar hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-7 bg-[var(--color-bg-elevated)] rounded-full animate-pulse"></div>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-14 items-center rounded-full border border-[var(--color-border-subtle)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2"
      style={{
        backgroundColor: isDark
          ? "var(--color-bg-primary)"
          : "var(--color-border-strong)",
      }}
      aria-label={`Cambiar a tema ${isDark ? "claro" : "oscuro"}`}
    >
      {/* Slider */}
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-[var(--color-bg-surface)] shadow-lg transition-transform ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      />

      {/* Iconos */}
      <span className="absolute left-1.5 flex items-center">
        {/* Sol (light) */}
        <svg
          className={`h-3 w-3 ${isDark ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-link)]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      <span className="absolute right-1.5 flex items-center">
        {/* Luna (dark) */}
        <svg
          className={`h-3 w-3 ${isDark ? "text-[var(--color-text-link)]" : "text-[var(--color-text-secondary)]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>
    </button>
  );
}
