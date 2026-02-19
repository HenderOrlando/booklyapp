"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { AppHeader } from "@/components/organisms/AppHeader";
import { MainLayout } from "@/components/templates/MainLayout";
import { cn } from "@/lib/utils";
import { Calendar, Link2, Mail, RefreshCw, Shield, Unlink } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Page: Integraciones con Google — RF-08
 *
 * Permite conectar y configurar integraciones externas:
 * - Google Calendar (sincronización bidireccional de reservas)
 * - Google OAuth (SSO — ya implementado en auth-service)
 * - Gmail / Google Email (notificaciones)
 *
 * Los datos de estado se obtienen del backend cuando esté disponible.
 * Mientras tanto se usa mock data.
 */

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  provider: "google";
  type: "calendar" | "auth" | "email";
  connected: boolean;
  lastSyncAt?: string;
  accountEmail?: string;
  scopes: string[];
  status: "active" | "inactive" | "error";
  errorMessage?: string;
}

const mockIntegrations: IntegrationConfig[] = [
  {
    id: "int-gcal",
    name: "Google Calendar",
    description:
      "Sincroniza reservas con Google Calendar. Las reservas confirmadas se crean automáticamente como eventos.",
    provider: "google",
    type: "calendar",
    connected: false,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    status: "inactive",
  },
  {
    id: "int-goauth",
    name: "Google SSO",
    description:
      "Autenticación institucional mediante cuentas Google (@ufps.edu.co). Permite inicio de sesión único.",
    provider: "google",
    type: "auth",
    connected: true,
    accountEmail: "admin@ufps.edu.co",
    lastSyncAt: "2026-02-16T10:30:00Z",
    scopes: ["openid", "email", "profile"],
    status: "active",
  },
  {
    id: "int-gmail",
    name: "Google Email (Gmail API)",
    description:
      "Envío de notificaciones y confirmaciones vía Gmail API institucional.",
    provider: "google",
    type: "email",
    connected: false,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    status: "inactive",
  },
];

const typeIcons = {
  calendar: Calendar,
  auth: Shield,
  email: Mail,
};

export default function IntegracionesPage() {
  const t = useTranslations("admin");
  const [integrations, setIntegrations] =
    React.useState<IntegrationConfig[]>(mockIntegrations);
  const [connecting, setConnecting] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState<string | null>(null);

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    try {
      // TODO: Llamar al backend para iniciar flujo OAuth con Google
      // const response = await httpClient.post(`integrations/${integrationId}/connect`);
      // window.location.href = response.data.authUrl;

      // Mock: simular conexión exitosa
      await new Promise((r) => setTimeout(r, 1500));
      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === integrationId
            ? {
                ...int,
                connected: true,
                status: "active" as const,
                accountEmail: "usuario@ufps.edu.co",
                lastSyncAt: new Date().toISOString(),
              }
            : int,
        ),
      );
    } catch (err) {
      console.error("Error connecting integration:", err);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setConnecting(integrationId);
    try {
      // TODO: Llamar al backend para revocar tokens
      // await httpClient.post(`integrations/${integrationId}/disconnect`);
      await new Promise((r) => setTimeout(r, 800));
      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === integrationId
            ? {
                ...int,
                connected: false,
                status: "inactive" as const,
                accountEmail: undefined,
                lastSyncAt: undefined,
              }
            : int,
        ),
      );
    } catch (err) {
      console.error("Error disconnecting:", err);
    } finally {
      setConnecting(null);
    }
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      // TODO: Llamar al backend para sincronizar
      // await httpClient.post(`integrations/${integrationId}/sync`);
      await new Promise((r) => setTimeout(r, 2000));
      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === integrationId
            ? { ...int, lastSyncAt: new Date().toISOString() }
            : int,
        ),
      );
    } catch (err) {
      console.error("Error syncing:", err);
    } finally {
      setSyncing(null);
    }
  };

  const header = <AppHeader title="Integraciones" />;
  return (
    <MainLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Integraciones
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Conecta servicios de Google para sincronizar calendarios,
            autenticación y notificaciones.
          </p>
        </div>

        {/* Google Workspace Info */}
        <Alert>
          <Link2 className="h-4 w-4" />
          <AlertTitle>Integración con Google Workspace</AlertTitle>
          <AlertDescription>
            Bookly se integra con servicios de Google para autenticación (SSO),
            sincronización de calendario y envío de notificaciones. Todas las
            integraciones usan OAuth 2.0 con scopes mínimos requeridos.
          </AlertDescription>
        </Alert>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = typeIcons[integration.type];
            const isConnecting = connecting === integration.id;
            const isSyncing = syncing === integration.id;

            return (
              <Card key={integration.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-lg p-2.5",
                          integration.connected
                            ? "bg-state-success-100"
                            : "bg-[var(--color-bg-muted)]",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            integration.connected
                              ? "text-state-success-600"
                              : "text-[var(--color-text-tertiary)]",
                          )}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {integration.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              integration.status === "active"
                                ? "success"
                                : integration.status === "error"
                                  ? "error"
                                  : "default"
                            }
                          >
                            {integration.status === "active"
                              ? "Conectado"
                              : integration.status === "error"
                                ? "Error"
                                : "Desconectado"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {integration.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between">
                  {/* Connection Details */}
                  {integration.connected && (
                    <div className="space-y-2 mb-4">
                      {integration.accountEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                          <span className="text-[var(--color-text-secondary)]">
                            {integration.accountEmail}
                          </span>
                        </div>
                      )}
                      {integration.lastSyncAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <RefreshCw className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                          <span className="text-[var(--color-text-secondary)]">
                            Última sincronización:{" "}
                            {new Date(integration.lastSyncAt).toLocaleString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      )}
                      {integration.errorMessage && (
                        <Alert variant="error">
                          <AlertDescription>
                            {integration.errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Scopes */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                      Permisos requeridos:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {integration.scopes.map((scope) => {
                        const shortScope = scope
                          .replace("https://www.googleapis.com/auth/", "")
                          .replace(".", " ");
                        return (
                          <span
                            key={scope}
                            className="rounded bg-[var(--color-bg-muted)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-tertiary)]"
                          >
                            {shortScope}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        {integration.type === "calendar" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            disabled={isSyncing}
                            onClick={() => handleSync(integration.id)}
                          >
                            <RefreshCw
                              className={cn(
                                "h-3.5 w-3.5",
                                isSyncing && "animate-spin",
                              )}
                            />
                            {isSyncing ? "Sincronizando..." : "Sincronizar"}
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          disabled={isConnecting}
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          <Unlink className="h-3.5 w-3.5" />
                          {isConnecting ? "..." : "Desconectar"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        disabled={isConnecting}
                        onClick={() => handleConnect(integration.id)}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {isConnecting ? "Conectando..." : `Conectar con Google`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Calendar Sync Settings (only visible when Google Calendar is connected) */}
        {integrations.find((i) => i.id === "int-gcal" && i.connected) && (
          <Card>
            <CardHeader>
              <CardTitle>
                Configuración de Sincronización de Calendario
              </CardTitle>
              <CardDescription>
                Configura cómo se sincronizan las reservas con Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      Crear eventos automáticamente
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Al confirmar una reserva, se crea un evento en Google
                      Calendar
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>

                <label className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      Eliminar eventos al cancelar
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Al cancelar una reserva, se elimina el evento
                      correspondiente
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>

                <label className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      Incluir ubicación del recurso
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Agrega la ubicación del recurso como ubicación del evento
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>

                <label className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      Invitar asistentes
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Enviar invitaciones de calendario a los participantes
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </label>
              </div>

              <div className="flex justify-end">
                <Button>Guardar configuración</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
