"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useAppConfig,
  useStorageConfig,
  useUpdateAppConfig,
  useUpdateStorageConfig,
} from "@/hooks/useAppConfig";
import { DEFAULT_APP_CONFIG } from "@/infrastructure/api/config-client";
import { cn } from "@/lib/utils";
import type {
  AppConfig,
  AppConfigFeatures,
  AppStorageProvider,
  AppThemeMode,
} from "@/types/entities/app-config";
import {
  AlertTriangle,
  Bell,
  Cloud,
  Database,
  HardDrive,
  Loader2,
  Palette,
  Save,
  Settings,
  Shield,
  Undo2,
  X,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

type ConfigTab = "general" | "auth" | "theme" | "features" | "storage";

interface TabDef {
  id: ConfigTab;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "general", label: "General", icon: <Settings className="h-4 w-4" /> },
  { id: "auth", label: "Autenticación", icon: <Shield className="h-4 w-4" /> },
  { id: "theme", label: "Tema y Marca", icon: <Palette className="h-4 w-4" /> },
  {
    id: "features",
    label: "Funcionalidades",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: "storage",
    label: "Almacenamiento",
    icon: <Database className="h-4 w-4" />,
  },
];

function normalizeComparableHexColor(value: string | undefined): string {
  const rawValue = typeof value === "string" ? value.trim() : "";
  if (!rawValue) {
    return "";
  }

  return (rawValue.startsWith("#") ? rawValue : `#${rawValue}`).toLowerCase();
}

function ThemeReloadSplash() {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--color-bg-app)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[var(--color-action-primary)] opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[var(--color-action-secondary)] opacity-20 blur-3xl animate-pulse" />
      </div>

      <div className="relative flex w-[360px] max-w-[92vw] flex-col items-center gap-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-8 py-8 shadow-xl">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-action-primary)]" />
          <span className="absolute h-2.5 w-2.5 rounded-full bg-[var(--color-action-secondary)] animate-ping" />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Aplicando nueva identidad visual...
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Recargando la plataforma para activar los colores guardados
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] p-4">
      <label htmlFor={id} className="flex-1 mr-4 cursor-pointer">
        <p className="font-medium text-[var(--color-text-primary)]">{title}</p>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {description}
          </p>
        )}
      </label>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function ConfiguracionesPage() {
  const { data: serverConfig, isLoading: configLoading } = useAppConfig();
  const { data: storageData, isLoading: storageLoading } = useStorageConfig();
  const updateConfig = useUpdateAppConfig();
  const updateStorage = useUpdateStorageConfig();

  const [activeTab, setActiveTab] = React.useState<ConfigTab>("general");
  const [localConfig, setLocalConfig] =
    React.useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [localStorageProvider, setLocalStorageProvider] =
    React.useState<AppStorageProvider>("local");
  const [hasChanges, setHasChanges] = React.useState(false);
  const [hasStorageChanges, setHasStorageChanges] = React.useState(false);
  const [domainInput, setDomainInput] = React.useState("");
  const [isApplyingTheme, setIsApplyingTheme] = React.useState(false);

  React.useEffect(() => {
    if (serverConfig) {
      setLocalConfig(serverConfig);
    }
  }, [serverConfig]);

  React.useEffect(() => {
    if (storageData?.storageProvider) {
      setLocalStorageProvider(storageData.storageProvider);
    }
  }, [storageData]);

  const updateField = <K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K],
  ) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const shouldReloadAfterThemeSave = React.useMemo(() => {
    if (!serverConfig) {
      return true;
    }

    return (
      localConfig.themeMode !== serverConfig.themeMode ||
      normalizeComparableHexColor(localConfig.primaryColor) !==
        normalizeComparableHexColor(serverConfig.primaryColor) ||
      normalizeComparableHexColor(localConfig.secondaryColor) !==
        normalizeComparableHexColor(serverConfig.secondaryColor)
    );
  }, [
    localConfig.primaryColor,
    localConfig.secondaryColor,
    localConfig.themeMode,
    serverConfig,
  ]);

  const handleSave = () => {
    updateConfig.mutate(
      {
        registrationEnabled: localConfig.registrationEnabled,
        corporateAuthEnabled: localConfig.corporateAuthEnabled,
        allowedDomains: localConfig.allowedDomains,
        autoRegisterOnSSO: localConfig.autoRegisterOnSSO,
        themeMode: localConfig.themeMode,
        primaryColor: localConfig.primaryColor,
        secondaryColor: localConfig.secondaryColor,
        defaultLocale: localConfig.defaultLocale,
        supportedLocales: localConfig.supportedLocales,
        appName: localConfig.appName,
        logoLightUrl: localConfig.logoLightUrl,
        logoDarkUrl: localConfig.logoDarkUrl,
        faviconUrl: localConfig.faviconUrl,
        timezone: localConfig.timezone,
        maintenanceMode: localConfig.maintenanceMode,
        features: localConfig.features,
      },
      {
        onSuccess: () => {
          setHasChanges(false);

          if (shouldReloadAfterThemeSave) {
            setIsApplyingTheme(true);
            window.setTimeout(() => {
              window.location.reload();
            }, 280);
          }
        },
      },
    );
  };

  const handleSaveStorage = () => {
    updateStorage.mutate({ storageProvider: localStorageProvider });
    setHasStorageChanges(false);
  };

  const handleReset = () => {
    if (serverConfig) {
      setLocalConfig(serverConfig);
    } else {
      setLocalConfig(DEFAULT_APP_CONFIG);
    }
    setHasChanges(false);
  };

  const addDomain = () => {
    const trimmed = domainInput.trim().toLowerCase();
    if (!trimmed || localConfig.allowedDomains.includes(trimmed)) {
      return;
    }
    updateField("allowedDomains", [...localConfig.allowedDomains, trimmed]);
    setDomainInput("");
  };

  const removeDomain = (domain: string) => {
    updateField(
      "allowedDomains",
      localConfig.allowedDomains.filter((d) => d !== domain),
    );
  };

  const isLoading = configLoading || storageLoading;
  const isSaving = updateConfig.isPending || updateStorage.isPending;

  const _header = <AppHeader title="Configuraciones" />;
  const _sidebar = <AppSidebar />;

  if (isApplyingTheme) {
    return <ThemeReloadSplash />;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-secondary)]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Configuraciones
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Configura los ajustes globales de la plataforma Bookly
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Descartar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Guardar cambios
              </Button>
            </div>
          )}
        </div>

        {/* Maintenance Mode Warning */}
        {localConfig.maintenanceMode && (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-state-warning-border)] bg-[var(--color-state-warning-bg)] p-4">
            <AlertTriangle className="h-5 w-5 text-[var(--color-state-warning-text)]" />
            <div>
              <p className="font-medium text-[var(--color-state-warning-text)]">
                Modo mantenimiento activo
              </p>
              <p className="text-sm text-[var(--color-state-warning-text)] opacity-80">
                Los usuarios no podrán acceder a la plataforma mientras esté
                habilitado.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border-subtle)] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-[var(--color-action-primary)] text-[var(--color-action-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "general" && (
            <GeneralTab config={localConfig} updateField={updateField} />
          )}

          {activeTab === "auth" && (
            <AuthTab
              config={localConfig}
              updateField={updateField}
              domainInput={domainInput}
              setDomainInput={setDomainInput}
              addDomain={addDomain}
              removeDomain={removeDomain}
            />
          )}

          {activeTab === "theme" && (
            <ThemeTab config={localConfig} updateField={updateField} />
          )}

          {activeTab === "features" && (
            <FeaturesTab config={localConfig} updateField={updateField} />
          )}

          {activeTab === "storage" && (
            <StorageTab
              storageProvider={localStorageProvider}
              setStorageProvider={(val) => {
                setLocalStorageProvider(val);
                setHasStorageChanges(true);
              }}
              hasChanges={hasStorageChanges}
              isSaving={updateStorage.isPending}
              onSave={handleSaveStorage}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

/* ============================================ */
/* Tab: General                                 */
/* ============================================ */

function GeneralTab({
  config,
  updateField,
}: {
  config: AppConfig;
  updateField: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Información de la Plataforma</CardTitle>
          <CardDescription>
            Nombre, idioma predeterminado y zona horaria de la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Nombre de la aplicación
              </label>
              <Input
                value={config.appName}
                onChange={(e) => updateField("appName", e.target.value)}
                placeholder="Bookly UFPS"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Zona horaria
              </label>
              <Input
                value={config.timezone}
                onChange={(e) => updateField("timezone", e.target.value)}
                placeholder="America/Bogota"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Idioma predeterminado
              </label>
              <Select
                value={config.defaultLocale}
                onValueChange={(val) => updateField("defaultLocale", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modo Mantenimiento</CardTitle>
          <CardDescription>
            Cuando está activo, la plataforma no estará disponible para los
            usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow
            id="maintenanceMode"
            title="Activar modo mantenimiento"
            description="Los usuarios verán un mensaje de mantenimiento y no podrán acceder"
          >
            <Checkbox
              id="maintenanceMode"
              checked={config.maintenanceMode}
              onCheckedChange={(val) => updateField("maintenanceMode", !!val)}
            />
          </SettingRow>
        </CardContent>
      </Card>
    </>
  );
}

/* ============================================ */
/* Tab: Auth                                    */
/* ============================================ */

function AuthTab({
  config,
  updateField,
  domainInput,
  setDomainInput,
  addDomain,
  removeDomain,
}: {
  config: AppConfig;
  updateField: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
  domainInput: string;
  setDomainInput: (val: string) => void;
  addDomain: () => void;
  removeDomain: (domain: string) => void;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Registro y Autenticación</CardTitle>
          <CardDescription>
            Controla cómo los usuarios se registran e inician sesión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            id="registrationEnabled"
            title="Registro abierto"
            description="Permite que nuevos usuarios se registren en la plataforma"
          >
            <Checkbox
              id="registrationEnabled"
              checked={config.registrationEnabled}
              onCheckedChange={(val) => updateField("registrationEnabled", !!val)}
            />
          </SettingRow>

          <SettingRow
            id="corporateAuthEnabled"
            title="Autenticación corporativa (SSO)"
            description="Permite inicio de sesión con cuentas institucionales (Google OAuth)"
          >
            <Checkbox
              id="corporateAuthEnabled"
              checked={config.corporateAuthEnabled}
              onCheckedChange={(val) => updateField("corporateAuthEnabled", !!val)}
            />
          </SettingRow>

          <SettingRow
            id="autoRegisterOnSSO"
            title="Auto-registro en SSO"
            description="Crea automáticamente la cuenta al iniciar sesión por primera vez con SSO"
          >
            <Checkbox
              id="autoRegisterOnSSO"
              checked={config.autoRegisterOnSSO}
              onCheckedChange={(val) => updateField("autoRegisterOnSSO", !!val)}
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dominios Permitidos</CardTitle>
          <CardDescription>
            Solo se permitirá registro e inicio de sesión desde estos dominios
            de correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="ejemplo.edu.co"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDomain();
                }
              }}
            />
            <Button
              variant="outline"
              onClick={addDomain}
              disabled={!domainInput.trim()}
            >
              Agregar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {config.allowedDomains.map((domain) => (
              <Badge
                key={domain}
                variant="primary"
                className="gap-1.5 px-3 py-1 text-sm"
              >
                @{domain}
                <button
                  onClick={() => removeDomain(domain)}
                  className="rounded-full hover:bg-white/20 transition-colors p-0.5"
                  aria-label={`Eliminar dominio ${domain}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {config.allowedDomains.length === 0 && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Sin dominios configurados — se permitirán todos los dominios
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ============================================ */
/* Tab: Theme                                   */
/* ============================================ */

function ThemeTab({
  config,
  updateField,
}: {
  config: AppConfig;
  updateField: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
}) {
  const themeModes: { value: AppThemeMode; label: string }[] = [
    { value: "system", label: "Sistema" },
    { value: "light", label: "Claro" },
    { value: "dark", label: "Oscuro" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Colores y Tema</CardTitle>
          <CardDescription>
            Personaliza los colores principales y el modo de tema predeterminado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
              Modo de tema predeterminado
            </label>
            <div className="flex gap-2">
              {themeModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => updateField("themeMode", mode.value)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    config.themeMode === mode.value
                      ? "border-[var(--color-action-primary)] bg-brand-primary-50 text-[var(--color-action-primary)]"
                      : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Color primario
              </label>
              <div className="flex items-center gap-3">
                <input
                  aria-label="Color primario"
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  className="h-10 w-14 rounded-md border border-[var(--color-border-subtle)] bg-transparent p-1 cursor-pointer"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Color secundario
              </label>
              <div className="flex items-center gap-3">
                <input
                  aria-label="Color secundario"
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) =>
                    updateField("secondaryColor", e.target.value)
                  }
                  className="h-10 w-14 rounded-md border border-[var(--color-border-subtle)] bg-transparent p-1 cursor-pointer"
                />
                <Input
                  value={config.secondaryColor}
                  onChange={(e) =>
                    updateField("secondaryColor", e.target.value)
                  }
                  placeholder="#14b8a6"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="rounded-lg border border-[var(--color-border-subtle)] p-4">
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
              Vista previa
            </p>
            <div className="flex items-center gap-4">
              <div
                className="h-10 w-24 rounded-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: config.primaryColor }}
              >
                Primario
              </div>
              <div
                className="h-10 w-24 rounded-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: config.secondaryColor }}
              >
                Secundario
              </div>
              <div className="h-10 flex-1 rounded-md bg-[var(--color-bg-muted)] flex items-center px-3 text-xs text-[var(--color-text-secondary)]">
                Fondo muted
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identidad Visual</CardTitle>
          <CardDescription>Logos y favicon de la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Logo modo claro (URL)
              </label>
              <Input
                value={config.logoLightUrl}
                onChange={(e) => updateField("logoLightUrl", e.target.value)}
                placeholder="/images/logo-light.png"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Logo modo oscuro (URL)
              </label>
              <Input
                value={config.logoDarkUrl}
                onChange={(e) => updateField("logoDarkUrl", e.target.value)}
                placeholder="/images/logo-dark.png"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Favicon (URL)
              </label>
              <Input
                value={config.faviconUrl}
                onChange={(e) => updateField("faviconUrl", e.target.value)}
                placeholder="/favicon.ico"
              />
            </div>
          </div>

          {/* Logo Previews */}
          {(config.logoLightUrl || config.logoDarkUrl) && (
            <div className="flex gap-4 mt-2">
              {config.logoLightUrl && (
                <div className="rounded-lg border border-[var(--color-border-subtle)] p-3 bg-white">
                  <p className="text-[10px] text-gray-400 mb-1">Light</p>
                  <div className="relative h-8 w-32">
                    <Image
                      src={config.logoLightUrl}
                      alt="Logo light"
                      fill
                      className="object-contain"
                      unoptimized={config.logoLightUrl.startsWith("http")}
                    />
                  </div>
                </div>
              )}
              {config.logoDarkUrl && (
                <div className="rounded-lg border border-[var(--color-border-subtle)] p-3 bg-slate-800">
                  <p className="text-[10px] text-slate-400 mb-1">Dark</p>
                  <div className="relative h-8 w-32">
                    <Image
                      src={config.logoDarkUrl}
                      alt="Logo dark"
                      fill
                      className="object-contain"
                      unoptimized={config.logoDarkUrl.startsWith("http")}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ============================================ */
/* Tab: Features                                */
/* ============================================ */

function FeaturesTab({
  config,
  updateField,
}: {
  config: AppConfig;
  updateField: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
}) {
  const updateFeature = (key: string, value: boolean | number) => {
    updateField("features", { ...config.features, [key]: value } as AppConfigFeatures);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Funcionalidades del Sistema</CardTitle>
        <CardDescription>
          Habilita o deshabilita funcionalidades globales de la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <SettingRow
          id="enableNotifications"
          title="Notificaciones"
          description="Habilita el envío de notificaciones por email, push y WhatsApp"
        >
          <Checkbox
            id="enableNotifications"
            checked={config.features.enableNotifications}
            onCheckedChange={(val) => updateFeature("enableNotifications", !!val)}
          />
        </SettingRow>

        <SettingRow
          id="enableRealtime"
          title="Tiempo real (WebSocket)"
          description="Habilita actualizaciones en tiempo real mediante WebSocket"
        >
          <Checkbox
            id="enableRealtime"
            checked={config.features.enableRealtime}
            onCheckedChange={(val) => updateFeature("enableRealtime", !!val)}
          />
        </SettingRow>

        <SettingRow
          id="enablePinVerification"
          title="Verificación PIN (RF-45)"
          description="Requiere PIN de seguridad para acciones críticas (eliminar, cambiar permisos)"
        >
          <Checkbox
            id="enablePinVerification"
            checked={config.features.enablePinVerification ?? false}
            onCheckedChange={(val) => updateFeature("enablePinVerification", !!val)}
          />
        </SettingRow>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Configuración de Reservas (RF-17)</CardTitle>
        <CardDescription>
          Define tiempos mínimos y máximos para las reservas del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="minTimeBetween"
              className="text-sm font-medium text-[var(--color-text-primary)]"
            >
              Tiempo mínimo entre reservas (min)
            </label>
            <Input
              id="minTimeBetween"
              type="number"
              min={0}
              max={120}
              value={config.features.minTimeBetweenReservationsMinutes ?? 15}
              onChange={(e) =>
                updateFeature(
                  "minTimeBetweenReservationsMinutes",
                  Math.max(0, parseInt(e.target.value) || 0),
                )
              }
            />
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Intervalo obligatorio entre el fin de una reserva y el inicio de la siguiente
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="minDuration"
              className="text-sm font-medium text-[var(--color-text-primary)]"
            >
              Duración mínima de reserva (min)
            </label>
            <Input
              id="minDuration"
              type="number"
              min={5}
              max={480}
              value={config.features.minReservationDurationMinutes ?? 30}
              onChange={(e) =>
                updateFeature(
                  "minReservationDurationMinutes",
                  Math.max(5, parseInt(e.target.value) || 30),
                )
              }
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="maxDuration"
              className="text-sm font-medium text-[var(--color-text-primary)]"
            >
              Duración máxima de reserva (min)
            </label>
            <Input
              id="maxDuration"
              type="number"
              min={30}
              max={1440}
              value={config.features.maxReservationDurationMinutes ?? 240}
              onChange={(e) =>
                updateFeature(
                  "maxReservationDurationMinutes",
                  Math.max(30, parseInt(e.target.value) || 240),
                )
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

/* ============================================ */
/* Tab: Storage                                 */
/* ============================================ */

const STORAGE_OPTIONS: {
  value: AppStorageProvider;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "local",
    label: "Local",
    description: "Almacenamiento en el sistema de archivos del servidor",
    icon: <HardDrive className="h-5 w-5" />,
  },
  {
    value: "s3",
    label: "Amazon S3",
    description:
      "Almacenamiento en Amazon S3 o compatible (MinIO, DigitalOcean Spaces)",
    icon: <Cloud className="h-5 w-5" />,
  },
  {
    value: "gcs",
    label: "Google Cloud Storage",
    description: "Almacenamiento en Google Cloud Storage",
    icon: <Cloud className="h-5 w-5" />,
  },
];

function StorageTab({
  storageProvider,
  setStorageProvider,
  hasChanges,
  isSaving,
  onSave,
}: {
  storageProvider: AppStorageProvider;
  setStorageProvider: (val: AppStorageProvider) => void;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proveedor de Almacenamiento</CardTitle>
        <CardDescription>
          Selecciona dónde se almacenarán los archivos subidos (logos,
          documentos, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STORAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setStorageProvider(option.value)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                storageProvider === option.value
                  ? "border-[var(--color-action-primary)] bg-brand-primary-50"
                  : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]",
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <span
                  className={cn(
                    storageProvider === option.value
                      ? "text-[var(--color-action-primary)]"
                      : "text-[var(--color-text-tertiary)]",
                  )}
                >
                  {option.icon}
                </span>
                <span
                  className={cn(
                    "font-medium text-sm",
                    storageProvider === option.value
                      ? "text-[var(--color-action-primary)]"
                      : "text-[var(--color-text-primary)]",
                  )}
                >
                  {option.label}
                </span>
                {storageProvider === option.value && (
                  <Badge variant="success" className="ml-auto">
                    Activo
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {option.description}
              </p>
            </button>
          ))}
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Guardar proveedor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
