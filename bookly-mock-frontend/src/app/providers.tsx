"use client";

import { ToastContainer } from "@/components/organisms/ToastContainer";
import { WebSocketToastBridge } from "@/components/organisms/WebSocketToastBridge/WebSocketToastBridge";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePublicConfig } from "@/hooks/useAppConfig";
import { DEFAULT_PUBLIC_APP_CONFIG } from "@/infrastructure/api/config-client";
import { WebSocketProvider } from "@/infrastructure/websocket/WebSocketProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { store } from "@/store/store";
import { ThemeProvider } from "next-themes";
import * as React from "react";
import { Provider as ReduxProvider } from "react-redux";

interface ProvidersProps {
  children: React.ReactNode;
}

interface AppConfigColorVariablesProps {
  children: React.ReactNode;
}

const DEFAULT_DARK_THEME_COLORS = {
  primary: "#3b82f6",
  secondary: "#2dd4bf",
};

function normalizeHexColor(
  value: string | undefined,
  fallback: string,
): string {
  const rawValue = typeof value === "string" ? value.trim() : "";
  const prefixedValue = rawValue.startsWith("#") ? rawValue : `#${rawValue}`;

  if (/^#[0-9a-fA-F]{6}$/.test(prefixedValue)) {
    return prefixedValue.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{3}$/.test(prefixedValue)) {
    const expanded = prefixedValue
      .slice(1)
      .split("")
      .map((character) => `${character}${character}`)
      .join("");

    return `#${expanded}`.toLowerCase();
  }

  return fallback.toLowerCase();
}

function hexToRgb(hexColor: string): { r: number; g: number; b: number } {
  const normalizedColor = normalizeHexColor(hexColor, "#000000").slice(1);

  return {
    r: parseInt(normalizedColor.slice(0, 2), 16),
    g: parseInt(normalizedColor.slice(2, 4), 16),
    b: parseInt(normalizedColor.slice(4, 6), 16),
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

function tintHex(hexColor: string, amount: number): string {
  const { r, g, b } = hexToRgb(hexColor);

  return rgbToHex(
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount),
  );
}

function hexToHslToken(hexColor: string): string {
  const { r, g, b } = hexToRgb(hexColor);
  const normalizedRed = r / 255;
  const normalizedGreen = g / 255;
  const normalizedBlue = b / 255;

  const maxChannel = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  const minChannel = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
  const delta = maxChannel - minChannel;

  let hue = 0;

  if (delta !== 0) {
    if (maxChannel === normalizedRed) {
      hue = ((normalizedGreen - normalizedBlue) / delta) % 6;
    } else if (maxChannel === normalizedGreen) {
      hue = (normalizedBlue - normalizedRed) / delta + 2;
    } else {
      hue = (normalizedRed - normalizedGreen) / delta + 4;
    }
  }

  const lightness = (maxChannel + minChannel) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  const normalizedHue = Math.round(((hue * 60 + 360) % 360) * 10) / 10;
  const normalizedSaturation = Math.round(saturation * 1000) / 10;
  const normalizedLightness = Math.round(lightness * 1000) / 10;

  return `${normalizedHue} ${normalizedSaturation}% ${normalizedLightness}%`;
}

function ColorBootstrapSplash() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-bg-app)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[var(--color-action-primary)] opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[var(--color-action-secondary)] opacity-20 blur-3xl animate-pulse" />
      </div>

      <div className="relative flex w-[340px] max-w-[90vw] flex-col items-center gap-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-8 py-8 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--color-action-primary)] animate-bounce [animation-delay:-0.2s]" />
          <span className="h-3 w-3 rounded-full bg-[var(--color-action-secondary)] animate-bounce" />
          <span className="h-3 w-3 rounded-full bg-[var(--color-action-primary)] animate-bounce [animation-delay:0.2s]" />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Aplicando tema institucional...
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Cargando colores y preparando la experiencia visual
          </p>
        </div>
      </div>
    </div>
  );
}

function AppConfigColorVariables({ children }: AppConfigColorVariablesProps) {
  const {
    data: publicConfig,
    isLoading: isPublicConfigLoading,
    isFetching: isPublicConfigFetching,
  } = usePublicConfig();

  const runtimeStyles = React.useMemo(() => {
    const lightPrimary = normalizeHexColor(
      publicConfig?.primaryColor,
      DEFAULT_PUBLIC_APP_CONFIG.primaryColor,
    );
    const lightSecondary = normalizeHexColor(
      publicConfig?.secondaryColor,
      DEFAULT_PUBLIC_APP_CONFIG.secondaryColor,
    );

    const hasCustomPrimary =
      lightPrimary !== DEFAULT_PUBLIC_APP_CONFIG.primaryColor;
    const hasCustomSecondary =
      lightSecondary !== DEFAULT_PUBLIC_APP_CONFIG.secondaryColor;

    const darkPrimary = hasCustomPrimary
      ? tintHex(lightPrimary, 0.12)
      : DEFAULT_DARK_THEME_COLORS.primary;
    const darkSecondary = hasCustomSecondary
      ? tintHex(lightSecondary, 0.12)
      : DEFAULT_DARK_THEME_COLORS.secondary;

    const lightPrimaryHover = shadeHex(lightPrimary, 0.14);
    const lightSecondaryHover = shadeHex(lightSecondary, 0.14);
    const darkPrimaryHover = shadeHex(darkPrimary, 0.12);
    const darkSecondaryHover = shadeHex(darkSecondary, 0.12);
    const lightSidebarBackground = shadeHex(lightSecondary, 0.62);
    const lightSidebarHover = shadeHex(lightSecondary, 0.52);
    const darkSidebarBackground = shadeHex(darkSecondary, 0.62);
    const darkSidebarHover = shadeHex(darkSecondary, 0.52);

    return `
:root {
  --color-action-primary: ${lightPrimary};
  --color-action-primary-hover: ${lightPrimaryHover};
  --color-action-secondary: ${lightSecondary};
  --color-action-secondary-hover: ${lightSecondaryHover};
  --color-navigation-header-bg: ${lightPrimary};
  --color-navigation-header-hover: ${lightPrimaryHover};
  --color-navigation-sidebar-bg: ${lightSidebarBackground};
  --color-navigation-sidebar-hover: ${lightSidebarHover};
  --color-border-focus: ${lightPrimary};
  --color-text-link: ${lightPrimary};
  --primary: ${hexToHslToken(lightPrimary)};
  --secondary: ${hexToHslToken(lightSecondary)};
  --ring: ${hexToHslToken(lightPrimary)};
}

.dark,
:root[data-theme="dark"] {
  --color-action-primary: ${darkPrimary};
  --color-action-primary-hover: ${darkPrimaryHover};
  --color-action-secondary: ${darkSecondary};
  --color-action-secondary-hover: ${darkSecondaryHover};
  --color-navigation-header-bg: ${darkPrimary};
  --color-navigation-header-hover: ${darkPrimaryHover};
  --color-navigation-sidebar-bg: ${darkSidebarBackground};
  --color-navigation-sidebar-hover: ${darkSidebarHover};
  --color-border-focus: ${darkPrimary};
  --color-text-link: ${darkPrimary};
  --primary: ${hexToHslToken(darkPrimary)};
  --secondary: ${hexToHslToken(darkSecondary)};
  --ring: ${hexToHslToken(darkPrimary)};
}
`;
  }, [publicConfig?.primaryColor, publicConfig?.secondaryColor]);

  const isBootstrappingColors =
    !publicConfig && (isPublicConfigLoading || isPublicConfigFetching);

  if (isBootstrappingColors) {
    return (
      <>
        <style id="app-config-color-variables">{runtimeStyles}</style>
        <ColorBootstrapSplash />
      </>
    );
  }

  return (
    <>
      <style id="app-config-color-variables">{runtimeStyles}</style>
      {children}
    </>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppConfigColorVariables>
            <AuthProvider>
              <WebSocketProvider>
                <WebSocketToastBridge />
                {children}
                <ToastContainer />
              </WebSocketProvider>
            </AuthProvider>
          </AppConfigColorVariables>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
