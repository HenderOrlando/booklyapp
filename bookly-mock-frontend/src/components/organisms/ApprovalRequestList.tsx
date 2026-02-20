import { Badge } from "@/components/atoms/Badge";
import { Checkbox } from "@/components/atoms/Checkbox";
import { useApprovalActions } from "@/hooks/useApprovalActions";
import { ApprovalCard } from "@/components/molecules/ApprovalCard";
import type {
  ApprovalFilters,
  ApprovalLevel,
  ApprovalPriority,
  ApprovalRequest,
  ApprovalStatus,
} from "@/types/entities/approval";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import * as React from "react";

/**
 * ApprovalRequestList - Organism Component
 *
 * Lista completa de solicitudes de aprobación con filtros avanzados,
 * búsqueda, paginación y acciones masivas.
 *
 * @example
 * ```tsx
 * <ApprovalRequestList
 *   requests={requests}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   loading={loading}
 * />
 * ```
 */

export interface ApprovalRequestListProps {
  /** Lista de solicitudes */
  requests: ApprovalRequest[];
  /** Handler para aprobar */
  onApprove?: (id: string) => void;
  /** Handler para rechazar */
  onReject?: (id: string) => void;
  /** Handler para ver detalles */
  onViewDetails?: (id: string) => void;
  /** Filtros activos */
  filters?: ApprovalFilters;
  /** Handler para cambio de filtros */
  onFiltersChange?: (filters: ApprovalFilters) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Mostrar acciones en las tarjetas */
  showActions?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_REVIEW", label: "En Revisión" },
  { value: "APPROVED", label: "Aprobada" },
  { value: "REJECTED", label: "Rechazada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "EXPIRED", label: "Expirada" },
];

const LEVEL_OPTIONS: { value: ApprovalLevel; label: string }[] = [
  { value: "FIRST_LEVEL", label: "Primer Nivel" },
  { value: "SECOND_LEVEL", label: "Segundo Nivel" },
  { value: "FINAL_LEVEL", label: "Nivel Final" },
];

const PRIORITY_OPTIONS: { value: ApprovalPriority; label: string }[] = [
  { value: "LOW", label: "Baja" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

export const ApprovalRequestList = React.memo<ApprovalRequestListProps>(
  ({
    requests,
    onApprove,
    onReject,
    onViewDetails,
    filters = {},
    onFiltersChange,
    loading = false,
    showActions = true,
    className = "",
  }) => {
    const [searchQuery, setSearchQuery] = React.useState(filters.search || "");
    const [showFilters, setShowFilters] = React.useState(false);
    const [localFilters, setLocalFilters] =
      React.useState<ApprovalFilters>(filters);

    // Sincronizar filtros locales con prop filters
    React.useEffect(() => {
      setLocalFilters(filters);
      setSearchQuery(filters.search || "");
    }, [filters]);

    // Filtrar localmente por búsqueda
    const filteredRequests = React.useMemo(() => {
      if (!searchQuery) return requests;

      const query = searchQuery.toLowerCase();
      return requests.filter(
        (req) =>
          req.userName.toLowerCase().includes(query) ||
          req.resourceName.toLowerCase().includes(query) ||
          req.purpose?.toLowerCase().includes(query) ||
          req.userEmail.toLowerCase().includes(query),
      );
    }, [requests, searchQuery]);

    const handleSearchChange = (value: string) => {
      setSearchQuery(value);
      onFiltersChange?.({ ...localFilters, search: value });
    };

    const handleFilterChange = (key: keyof ApprovalFilters, value: any) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);
      onFiltersChange?.(newFilters);
    };

    const handleClearFilters = () => {
      const emptyFilters: ApprovalFilters = { search: searchQuery };
      setLocalFilters(emptyFilters);
      onFiltersChange?.(emptyFilters);
    };

    const activeFiltersCount = React.useMemo(() => {
      let count = 0;
      if (localFilters.status) count++;
      if (localFilters.level) count++;
      if (localFilters.priority) count++;
      if (localFilters.resourceId) count++;
      if (localFilters.userId) count++;
      return count;
    }, [localFilters]);

    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(filteredRequests.map((r) => r.id)));
      } else {
        setSelectedIds(new Set());
      }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
      const newSelected = new Set(selectedIds);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      setSelectedIds(newSelected);
    };

    const {
      approve,
      reject,
    } = useApprovalActions();

    const handleBatchApprove = async () => {
      const ids = Array.from(selectedIds);
      let successCount = 0;

      for (const id of ids) {
        const req = filteredRequests.find((r) => r.id === id);
        if (req) {
          try {
            await approve.mutateAsync({
              id: req.id,
              stepName: req.currentLevel || "FIRST_LEVEL",
              comment: "Aprobación masiva",
            });
            successCount++;
          } catch (err) {
            console.error(`Error aprobando ${id}:`, err);
          }
        }
      }

      if (successCount > 0) {
        setSelectedIds(new Set());
      }
    };

    const handleBatchReject = async () => {
      const reason = prompt("Ingrese el motivo del rechazo masivo:");
      if (!reason) return;

      const ids = Array.from(selectedIds);
      let successCount = 0;

      for (const id of ids) {
        const req = filteredRequests.find((r) => r.id === id);
        if (req) {
          try {
            await reject.mutateAsync({
              id: req.id,
              stepName: req.currentLevel || "FIRST_LEVEL",
              comment: reason,
            });
            successCount++;
          } catch (err) {
            console.error(`Error rechazando ${id}:`, err);
          }
        }
      }

      if (successCount > 0) {
        setSelectedIds(new Set());
      }
    };

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Acciones Masivas */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-primary)]/40 rounded-lg border border-[var(--color-action-primary)] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedIds.size} seleccionadas
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-[var(--color-action-primary)] hover:underline"
              >
                Desmarcar todas
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBatchReject}
                className="px-3 py-1 text-xs font-medium text-white bg-state-error-600 hover:bg-state-error-700 rounded-md transition-colors"
              >
                Rechazar Seleccionadas
              </button>
              <button
                onClick={handleBatchApprove}
                className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                Aprobar Seleccionadas
              </button>
            </div>
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar por nombre, recurso, email o propósito..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-strong)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="primary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)]/50 border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                Filtros Avanzados
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-inverse)] flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro de Estado */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
                  Estado
                </label>
                <select
                  value={localFilters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || undefined)
                  }
                  title="Filtrar por estado"
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
                >
                  <option value="">Todos</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Nivel */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
                  Nivel
                </label>
                <select
                  value={localFilters.level || ""}
                  onChange={(e) =>
                    handleFilterChange("level", e.target.value || undefined)
                  }
                  title="Filtrar por nivel"
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
                >
                  <option value="">Todos</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Prioridad */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
                  Prioridad
                </label>
                <select
                  value={localFilters.priority || ""}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value || undefined)
                  }
                  title="Filtrar por prioridad"
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
                >
                  <option value="">Todas</option>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lista de solicitudes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-action-primary)]" />
            <span className="ml-3 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              Cargando solicitudes...
            </span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {/* Selector universal */}
            <div className="flex items-center gap-2 px-2 py-1">
              <Checkbox
                id="select-all"
                checked={
                  filteredRequests.length > 0 &&
                  selectedIds.size === filteredRequests.length
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm text-[var(--color-text-secondary)] cursor-pointer"
              >
                Seleccionar todos los resultados ({filteredRequests.length})
              </label>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="relative group">
                  <div className="absolute top-4 left-4 z-10">
                    <Checkbox
                      checked={selectedIds.has(request.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(request.id, !!checked)
                      }
                    />
                  </div>
                  <ApprovalCard
                    request={request}
                    onApprove={onApprove}
                    onReject={onReject}
                    onViewDetails={onViewDetails}
                    showActions={showActions && request.status === "PENDING"}
                    className={selectedIds.has(request.id) ? "ring-2 ring-[var(--color-action-primary)] ring-offset-2 dark:ring-offset-[var(--color-bg-primary)]" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-bg-secondary)]/30 rounded-xl border-2 border-dashed border-[var(--color-border-subtle)]">
            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-full mb-4">
              <Filter className="h-10 w-10 text-[var(--color-text-tertiary)] opacity-20" />
            </div>
            <p className="text-lg font-medium text-[var(--color-text-primary)]">
              No se encontraron solicitudes
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xs text-center">
              {searchQuery || activeFiltersCount > 0 
                ? "Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas."
                : "No hay solicitudes de aprobación pendientes en este momento."}
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleClearFilters();
                }}
                className="mt-6 px-4 py-2 text-sm font-medium text-[var(--color-action-primary)] border border-[var(--color-action-primary)] rounded-lg hover:bg-[var(--color-action-primary)] hover:text-white transition-colors"
              >
                Limpiar búsqueda y filtros
              </button>
            )}
          </div>
        )}

        {/* Contador de resultados */}
        {!loading && filteredRequests.length > 0 && (
          <div className="text-center text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            Mostrando {filteredRequests.length} de {requests.length} solicitudes
          </div>
        )}
      </div>
    );
  },
);

ApprovalRequestList.displayName = "ApprovalRequestList";
