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
import { Input } from "@/components/atoms/Input";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/Alert";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { httpClient } from "@/infrastructure/http";
import { cn } from "@/lib/utils";
import {
  GitBranch,
  Plus,
  ChevronRight,
  Shield,
  Users,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
  ArrowDown,
  Zap,
} from "lucide-react";
import * as React from "react";

/**
 * Page: Flujos de Aprobación Diferenciados — RF-13 / RF-24
 *
 * Permite al admin configurar flujos de aprobación diferenciados:
 * - Flujo rápido (auto-approve para docentes en sus propios espacios)
 * - Flujo estándar (un aprobador)
 * - Flujo multi-nivel (requiere VoBo docente + jefe de programa)
 * - Condiciones de auto-aprobación
 *
 * Backend: GET/POST /approval-flows (stockpile-service)
 */

interface ApprovalStep {
  order: number;
  approverRole: string;
  description: string;
  timeoutHours: number;
  autoApproveIfTimeout: boolean;
}

interface ApprovalFlow {
  id: string;
  name: string;
  description: string;
  resourceTypes: string[];
  steps: ApprovalStep[];
  autoApproveConditions: {
    roleWhitelist: string[];
    maxDurationMinutes: number;
    maxAdvanceDays: number;
  };
  isActive: boolean;
  createdAt: string;
}

const mockFlows: ApprovalFlow[] = [
  {
    id: "flow-001",
    name: "Flujo Rápido Docente",
    description:
      "Auto-aprobación para docentes reservando aulas de su programa. Sin intervención manual.",
    resourceTypes: ["CLASSROOM", "LAB"],
    steps: [],
    autoApproveConditions: {
      roleWhitelist: ["TEACHER", "PROFESSOR"],
      maxDurationMinutes: 120,
      maxAdvanceDays: 7,
    },
    isActive: true,
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "flow-002",
    name: "Flujo Estándar",
    description:
      "Una sola aprobación por el administrador de programa. Para estudiantes y personal no docente.",
    resourceTypes: ["CLASSROOM", "LAB", "MEETING_ROOM"],
    steps: [
      {
        order: 1,
        approverRole: "PROGRAM_ADMIN",
        description: "Aprobación del administrador de programa",
        timeoutHours: 48,
        autoApproveIfTimeout: false,
      },
    ],
    autoApproveConditions: {
      roleWhitelist: [],
      maxDurationMinutes: 0,
      maxAdvanceDays: 0,
    },
    isActive: true,
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "flow-003",
    name: "Flujo Multi-nivel (Auditorios)",
    description:
      "Requiere VoBo del docente responsable + aprobación del jefe de programa. Para auditorios y espacios de alto impacto.",
    resourceTypes: ["AUDITORIUM", "CONFERENCE_HALL"],
    steps: [
      {
        order: 1,
        approverRole: "TEACHER",
        description: "VoBo del docente responsable del evento",
        timeoutHours: 24,
        autoApproveIfTimeout: false,
      },
      {
        order: 2,
        approverRole: "PROGRAM_DIRECTOR",
        description: "Aprobación del director de programa",
        timeoutHours: 48,
        autoApproveIfTimeout: false,
      },
    ],
    autoApproveConditions: {
      roleWhitelist: [],
      maxDurationMinutes: 0,
      maxAdvanceDays: 0,
    },
    isActive: true,
    createdAt: "2026-01-05T00:00:00Z",
  },
  {
    id: "flow-004",
    name: "Flujo Eventos Institucionales",
    description:
      "Tres niveles de aprobación para eventos que afectan múltiples recursos o duran más de un día.",
    resourceTypes: ["AUDITORIUM", "OUTDOOR_SPACE"],
    steps: [
      {
        order: 1,
        approverRole: "TEACHER",
        description: "VoBo docente organizador",
        timeoutHours: 24,
        autoApproveIfTimeout: false,
      },
      {
        order: 2,
        approverRole: "PROGRAM_DIRECTOR",
        description: "Aprobación del director de programa",
        timeoutHours: 48,
        autoApproveIfTimeout: false,
      },
      {
        order: 3,
        approverRole: "GENERAL_ADMIN",
        description: "Aprobación final de administración general",
        timeoutHours: 72,
        autoApproveIfTimeout: false,
      },
    ],
    autoApproveConditions: {
      roleWhitelist: [],
      maxDurationMinutes: 0,
      maxAdvanceDays: 0,
    },
    isActive: false,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const roleLabels: Record<string, string> = {
  TEACHER: "Docente",
  PROFESSOR: "Profesor",
  PROGRAM_ADMIN: "Admin. de Programa",
  PROGRAM_DIRECTOR: "Director de Programa",
  GENERAL_ADMIN: "Admin. General",
  STUDENT: "Estudiante",
};

const resourceTypeLabels: Record<string, string> = {
  CLASSROOM: "Aula",
  LAB: "Laboratorio",
  MEETING_ROOM: "Sala de reuniones",
  AUDITORIUM: "Auditorio",
  CONFERENCE_HALL: "Sala de conferencias",
  OUTDOOR_SPACE: "Espacio abierto",
};

export default function FlujosAprobacionPage() {
  const [flows, setFlows] = React.useState<ApprovalFlow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedFlow, setExpandedFlow] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFlows = async () => {
      try {
        const res = await httpClient.get("approval-flows");
        if (res?.success && Array.isArray(res.data?.data || res.data)) {
          const data = res.data?.data || res.data;
          setFlows(
            data.map((f: any) => ({
              id: f.id || f._id,
              name: f.name,
              description: f.description || "",
              resourceTypes: f.resourceTypes || [],
              steps: f.steps || [],
              autoApproveConditions: f.autoApproveConditions || {
                roleWhitelist: [],
                maxDurationMinutes: 0,
                maxAdvanceDays: 0,
              },
              isActive: f.isActive ?? true,
              createdAt: f.createdAt,
            }))
          );
        } else {
          setFlows(mockFlows);
        }
      } catch {
        setFlows(mockFlows);
      } finally {
        setLoading(false);
      }
    };
    fetchFlows();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedFlow((prev) => (prev === id ? null : id));
  };

  const activeFlows = flows.filter((f) => f.isActive).length;

  const header = <AppHeader title="Flujos de Aprobación" />;
  const sidebar = <AppSidebar />;

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Flujos de Aprobación
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Configura flujos diferenciados según tipo de recurso y rol del
              solicitante
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo flujo
          </Button>
        </div>

        {/* Info */}
        <Alert>
          <GitBranch className="h-4 w-4" />
          <AlertTitle>Flujos diferenciados por rol</AlertTitle>
          <AlertDescription>
            Los flujos determinan cuántos niveles de aprobación necesita una
            reserva. Los docentes pueden tener auto-aprobación para sus propios
            espacios, mientras que auditorios requieren VoBo del docente +
            aprobación del director.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-brand-primary-500">
                {flows.length}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Flujos configurados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-state-success-500">
                {activeFlows}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Flujos activos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-brand-secondary-500">
                {flows.filter((f) => f.steps.length === 0).length}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Auto-aprobación
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-state-warning-500">
                {flows.filter((f) => f.steps.length >= 2).length}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Multi-nivel
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Flow Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {flows.map((flow) => {
              const isExpanded = expandedFlow === flow.id;
              const hasAutoApprove =
                flow.autoApproveConditions.roleWhitelist.length > 0;

              return (
                <Card key={flow.id} className={cn(!flow.isActive && "opacity-60")}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleExpand(flow.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "rounded-lg p-2",
                            hasAutoApprove && flow.steps.length === 0
                              ? "bg-state-success-100"
                              : flow.steps.length >= 2
                              ? "bg-state-warning-100"
                              : "bg-brand-primary-100"
                          )}
                        >
                          {hasAutoApprove && flow.steps.length === 0 ? (
                            <Zap className="h-5 w-5 text-state-success-600" />
                          ) : (
                            <GitBranch
                              className={cn(
                                "h-5 w-5",
                                flow.steps.length >= 2
                                  ? "text-state-warning-600"
                                  : "text-brand-primary-600"
                              )}
                            />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {flow.name}
                          </CardTitle>
                          <CardDescription>{flow.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={flow.isActive ? "success" : "default"}>
                          {flow.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        <Badge variant="primary">
                          {flow.steps.length === 0
                            ? "Auto"
                            : `${flow.steps.length} paso${flow.steps.length > 1 ? "s" : ""}`}
                        </Badge>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-4 border-t pt-4">
                      {/* Resource Types */}
                      <div>
                        <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
                          Tipos de recurso aplicables:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {flow.resourceTypes.map((rt) => (
                            <Badge key={rt} variant="outline">
                              {resourceTypeLabels[rt] || rt}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Auto-Approve Conditions */}
                      {hasAutoApprove && (
                        <div className="rounded-lg border border-state-success-200 bg-state-success-50/20 p-3">
                          <p className="mb-2 text-sm font-medium text-state-success-700 flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Condiciones de auto-aprobación
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-[var(--color-text-secondary)]">
                            <div>
                              <span className="font-medium">Roles:</span>{" "}
                              {flow.autoApproveConditions.roleWhitelist
                                .map((r) => roleLabels[r] || r)
                                .join(", ")}
                            </div>
                            {flow.autoApproveConditions.maxDurationMinutes > 0 && (
                              <div>
                                <span className="font-medium">Duración máx:</span>{" "}
                                {flow.autoApproveConditions.maxDurationMinutes} min
                              </div>
                            )}
                            {flow.autoApproveConditions.maxAdvanceDays > 0 && (
                              <div>
                                <span className="font-medium">Anticipación máx:</span>{" "}
                                {flow.autoApproveConditions.maxAdvanceDays} días
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Steps Pipeline */}
                      {flow.steps.length > 0 && (
                        <div>
                          <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">
                            Pasos de aprobación:
                          </p>
                          <div className="space-y-2">
                            {flow.steps.map((step, idx) => (
                              <div key={idx}>
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary-500 text-xs font-bold text-white">
                                    {step.order}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                      {step.description}
                                    </p>
                                    <div className="mt-1 flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                                      <span className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        {roleLabels[step.approverRole] ||
                                          step.approverRole}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Timeout: {step.timeoutHours}h
                                      </span>
                                      {step.autoApproveIfTimeout && (
                                        <Badge variant="warning">
                                          Auto-aprueba si timeout
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {idx < flow.steps.length - 1 && (
                                  <div className="flex justify-center py-1">
                                    <ArrowDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end gap-2 border-t pt-3">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
