"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { useTheme } from "next-themes";
import * as React from "react";

type ThemeMode = "light" | "dark";
type EditableColorToken = "primary" | "secondary";

interface ThemePalette {
  primary: string;
  secondary: string;
}

interface ThemeEditorState {
  light: ThemePalette;
  dark: ThemePalette;
  persistPreview: boolean;
}

const STORAGE_KEY = "bookly:design-system:theme-color-editor";

const DEFAULT_STATE: ThemeEditorState = {
  light: {
    primary: "#2563eb",
    secondary: "#14b8a6",
  },
  dark: {
    primary: "#3b82f6",
    secondary: "#2dd4bf",
  },
  persistPreview: false,
};

function normalizeHexColor(value: string, fallback: string): string {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (/^#[0-9a-fA-F]{6}$/.test(prefixed)) {
    return prefixed.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{3}$/.test(prefixed)) {
    const expanded = prefixed
      .slice(1)
      .split("")
      .map((char) => `${char}${char}`)
      .join("");

    return `#${expanded}`.toLowerCase();
  }

  return fallback;
}

function hexToRgb(hexColor: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(hexColor, "#000000").slice(1);

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) =>
    Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function shadeHex(hexColor: string, amount: number): string {
  const { r, g, b } = hexToRgb(hexColor);

  return rgbToHex(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount)),
  );
}

function toLinearColor(colorChannel: number): number {
  const normalized = colorChannel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getContrastRatio(hexA: string, hexB: string): number {
  const colorA = hexToRgb(hexA);
  const colorB = hexToRgb(hexB);

  const luminanceA =
    0.2126 * toLinearColor(colorA.r) +
    0.7152 * toLinearColor(colorA.g) +
    0.0722 * toLinearColor(colorA.b);

  const luminanceB =
    0.2126 * toLinearColor(colorB.r) +
    0.7152 * toLinearColor(colorB.g) +
    0.0722 * toLinearColor(colorB.b);

  const brightest = Math.max(luminanceA, luminanceB);
  const darkest = Math.min(luminanceA, luminanceB);

  return (brightest + 0.05) / (darkest + 0.05);
}

function hexToHslToken(hexColor: string): string {
  const { r, g, b } = hexToRgb(hexColor);
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === nr) {
      hue = ((ng - nb) / delta) % 6;
    } else if (max === ng) {
      hue = (nb - nr) / delta + 2;
    } else {
      hue = (nr - ng) / delta + 4;
    }
  }

  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  const normalizedHue = Math.round(((hue * 60 + 360) % 360) * 10) / 10;
  const normalizedSaturation = Math.round(saturation * 1000) / 10;
  const normalizedLightness = Math.round(lightness * 1000) / 10;

  return `${normalizedHue} ${normalizedSaturation}% ${normalizedLightness}%`;
}

function isThemeEditorState(value: unknown): value is ThemeEditorState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const parsed = value as Partial<ThemeEditorState>;

  return (
    !!parsed.light &&
    !!parsed.dark &&
    typeof parsed.light.primary === "string" &&
    typeof parsed.light.secondary === "string" &&
    typeof parsed.dark.primary === "string" &&
    typeof parsed.dark.secondary === "string" &&
    typeof parsed.persistPreview === "boolean"
  );
}

export function ThemeColorEditorPanel() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [themeState, setThemeState] = React.useState<ThemeEditorState>(DEFAULT_STATE);

  React.useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!isThemeEditorState(parsed)) {
        return;
      }

      setThemeState({
        light: {
          primary: normalizeHexColor(parsed.light.primary, DEFAULT_STATE.light.primary),
          secondary: normalizeHexColor(
            parsed.light.secondary,
            DEFAULT_STATE.light.secondary,
          ),
        },
        dark: {
          primary: normalizeHexColor(parsed.dark.primary, DEFAULT_STATE.dark.primary),
          secondary: normalizeHexColor(
            parsed.dark.secondary,
            DEFAULT_STATE.dark.secondary,
          ),
        },
        persistPreview: parsed.persistPreview,
      });
    } catch (error) {
      console.warn("No se pudo cargar el Theme Color Editor desde localStorage", error);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) {
      return;
    }

    if (themeState.persistPreview) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeState));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [mounted, themeState]);

  const activeMode: ThemeMode =
    theme === "dark" || (theme === "system" && resolvedTheme === "dark")
      ? "dark"
      : "light";

  const activePalette = themeState[activeMode];

  const primaryContrast = React.useMemo(
    () => getContrastRatio(activePalette.primary, "#ffffff"),
    [activePalette.primary],
  );

  const secondaryContrast = React.useMemo(
    () => getContrastRatio(activePalette.secondary, "#ffffff"),
    [activePalette.secondary],
  );

  const runtimeStyles = React.useMemo(() => {
    const lightPrimaryHover = shadeHex(themeState.light.primary, 0.14);
    const lightSecondaryHover = shadeHex(themeState.light.secondary, 0.14);
    const darkPrimaryHover = shadeHex(themeState.dark.primary, 0.12);
    const darkSecondaryHover = shadeHex(themeState.dark.secondary, 0.12);

    return `
:root {
  --color-action-primary: ${themeState.light.primary};
  --color-action-primary-hover: ${lightPrimaryHover};
  --color-action-secondary: ${themeState.light.secondary};
  --color-action-secondary-hover: ${lightSecondaryHover};
  --color-border-focus: ${themeState.light.primary};
  --color-text-link: ${themeState.light.primary};
  --primary: ${hexToHslToken(themeState.light.primary)};
  --secondary: ${hexToHslToken(themeState.light.secondary)};
  --ring: ${hexToHslToken(themeState.light.primary)};
}
.dark,
:root[data-theme="dark"] {
  --color-action-primary: ${themeState.dark.primary};
  --color-action-primary-hover: ${darkPrimaryHover};
  --color-action-secondary: ${themeState.dark.secondary};
  --color-action-secondary-hover: ${darkSecondaryHover};
  --color-border-focus: ${themeState.dark.primary};
  --color-text-link: ${themeState.dark.primary};
  --primary: ${hexToHslToken(themeState.dark.primary)};
  --secondary: ${hexToHslToken(themeState.dark.secondary)};
  --ring: ${hexToHslToken(themeState.dark.primary)};
}
`;
  }, [themeState]);

  const updateColor = (
    mode: ThemeMode,
    token: EditableColorToken,
    newValue: string,
  ) => {
    setThemeState((previousState) => ({
      ...previousState,
      [mode]: {
        ...previousState[mode],
        [token]: normalizeHexColor(newValue, previousState[mode][token]),
      },
    }));
  };

  const resetDefaults = () => {
    setThemeState(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <style>{runtimeStyles}</style>

      <Card className="border-[var(--color-border-strong)] bg-[var(--color-bg-surface)]">
        <CardHeader>
          <CardTitle>Theme Color Editor</CardTitle>
          <CardDescription>
            Edita tokens semanticos de accion (primario/secundario), alterna modo
            light/dark y previsualiza componentes en vivo.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={activeMode === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              Light
            </Button>
            <Button
              type="button"
              variant={activeMode === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              Dark
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetDefaults}>
              Reset defaults
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Primario ({activeMode})
              </label>
              <div className="flex items-center gap-3">
                <input
                  aria-label="Color primario"
                  type="color"
                  value={activePalette.primary}
                  onChange={(event) =>
                    updateColor(activeMode, "primary", event.target.value)
                  }
                  className="h-10 w-14 rounded-md border border-[var(--color-border-subtle)] bg-transparent p-1"
                />
                <Input
                  value={activePalette.primary}
                  onChange={(event) =>
                    updateColor(activeMode, "primary", event.target.value)
                  }
                  placeholder="#2563eb"
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Contraste con texto blanco: {primaryContrast.toFixed(2)}:1 {" · "}
                {primaryContrast >= 4.5 ? "AA OK" : "AA bajo"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Secundario ({activeMode})
              </label>
              <div className="flex items-center gap-3">
                <input
                  aria-label="Color secundario"
                  type="color"
                  value={activePalette.secondary}
                  onChange={(event) =>
                    updateColor(activeMode, "secondary", event.target.value)
                  }
                  className="h-10 w-14 rounded-md border border-[var(--color-border-subtle)] bg-transparent p-1"
                />
                <Input
                  value={activePalette.secondary}
                  onChange={(event) =>
                    updateColor(activeMode, "secondary", event.target.value)
                  }
                  placeholder="#14b8a6"
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Contraste con texto blanco: {secondaryContrast.toFixed(2)}:1 {" · "}
                {secondaryContrast >= 4.5 ? "AA OK" : "AA bajo"}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={themeState.persistPreview}
              onChange={(event) =>
                setThemeState((previousState) => ({
                  ...previousState,
                  persistPreview: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border border-[var(--color-border-subtle)] accent-[var(--color-action-primary)]"
            />
            Persistir en localStorage (solo preview)
          </label>

          {!mounted && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              Cargando preferencias del editor de theme...
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
